// server.js
// Settlr AI - Autonomous Invoice-to-Cash & Agentic Negotiation Protocol for Freelancers

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const ledgerStore = require("./services/ledgerStore");
const paypalService = require("./services/paypalService");
const geminiAgent = require("./services/geminiAgent");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --- Health & Config Status ---
app.get("/api/status", (req, res) => {
  const geminiLive = geminiAgent.isConfigured();
  const paypalLive = paypalService.isConfigured();
  res.json({
    appName: "Settlr AI",
    status: "online",
    geminiLive,
    paypalLive,
    paypalEnvironment: process.env.PAYPAL_ENVIRONMENT || "sandbox",
    mode: (geminiLive && paypalLive) ? "CONNECTED" : "DEMO_SIMULATION",
    timestamp: new Date().toISOString()
  });
});

// --- Invoices & Metrics ---
app.get("/api/invoices", (req, res) => {
  res.json({
    metrics: ledgerStore.getMetrics(),
    invoices: ledgerStore.getInvoices(),
    activityLogs: ledgerStore.activityLogs
  });
});

app.get("/api/invoices/:id", (req, res) => {
  const invoice = ledgerStore.getInvoiceById(req.params.id);
  if (!invoice) return res.status(404).json({ error: "Invoice not found" });
  res.json(invoice);
});

// --- Natural Language Chat-to-Invoice (Gemini) ---
app.post("/api/invoices/parse-chat", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Milestone description is required" });

    const parsedData = await geminiAgent.parseMilestoneToInvoice(prompt);
    const newInvoice = ledgerStore.addInvoice(parsedData);

    res.json({
      success: true,
      invoice: newInvoice,
      extractedData: parsedData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Issue PayPal Invoice ---
app.post("/api/invoices/:id/issue-paypal", async (req, res) => {
  try {
    const invoice = ledgerStore.getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    const paypalResult = await paypalService.createAndSendInvoice(invoice);

    const updated = ledgerStore.updateInvoice(invoice.id, {
      status: "ISSUED",
      paypalInvoiceId: paypalResult.paypalInvoiceId,
      paypalPaymentLink: paypalResult.paypalPaymentLink,
      issuedAt: new Date().toISOString()
    });

    ledgerStore.logActivity(`Issued PayPal Invoice #${paypalResult.paypalInvoiceId} to ${invoice.clientName}`, "PAYPAL");

    res.json({
      success: true,
      invoice: updated,
      paypalResult
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Fast-Forward Demo: Simulate Past Due ---
app.post("/api/invoices/:id/simulate-past-due", (req, res) => {
  const { days = 7 } = req.body;
  const invoice = ledgerStore.getInvoiceById(req.params.id);
  if (!invoice) return res.status(404).json({ error: "Invoice not found" });

  const updated = ledgerStore.updateInvoice(invoice.id, {
    status: "PAST_DUE",
    daysPastDue: days,
    escalationLevel: "AGENT_NEGOTIATION"
  });

  ledgerStore.logActivity(`Triggered Autonomous Agent: Invoice ${invoice.id} marked ${days} days past due!`, "ALERT");

  res.json({
    success: true,
    invoice: updated,
    message: `Invoice marked ${days} days past due. Autonomous Agent escalation triggered.`
  });
});

// --- Agent-to-Agent Autonomous Negotiation Round ---
app.post("/api/invoices/:id/agent-negotiate", async (req, res) => {
  try {
    const invoice = ledgerStore.getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    const guardrails = ledgerStore.getGuardrails();
    const roundNumber = Math.floor(invoice.negotiationHistory.length / 2) + 1;

    // Step 1: Simulate Client AP Bot message if client prompt not provided
    let clientMessage = req.body.clientMessage;
    if (!clientMessage) {
      const clientBotResponse = geminiAgent.simulateClientAgentResponse({
        invoice,
        round: roundNumber
      });
      clientMessage = clientBotResponse.content;

      // Add client bot message to history
      ledgerStore.addNegotiationStep(invoice.id, {
        sender: clientBotResponse.sender,
        type: "CLIENT_AP_MESSAGE",
        content: clientMessage,
        tone: clientBotResponse.tone
      });
    }

    // Step 2: Freelancer Settlr Agent evaluates against strict guardrails & responds
    const agentAnalysis = await geminiAgent.negotiatePastDue({
      invoice,
      clientMessage,
      negotiationHistory: invoice.negotiationHistory,
      guardrails
    });

    // Step 3: Record Settlr Agent response
    ledgerStore.addNegotiationStep(invoice.id, {
      sender: "Settlr Agent (Freelancer)",
      type: "AGENT_COUNTER",
      content: agentAnalysis.replyMessage,
      chainOfThought: agentAnalysis.chainOfThought,
      decision: agentAnalysis.decision,
      termsAgreed: agentAnalysis.termsAgreed,
      settlementTerms: agentAnalysis.settlementTerms
    });

    // Update invoice state
    if (agentAnalysis.termsAgreed) {
      ledgerStore.updateInvoice(invoice.id, {
        status: "NEGOTIATING",
        agreedTerms: agentAnalysis.settlementTerms
      });
      ledgerStore.logActivity(`A2A Consensus Reached! Client accepted revised PayPal settlement terms for ${invoice.id}`, "NEGOTIATION");
    } else {
      ledgerStore.updateInvoice(invoice.id, {
        status: "NEGOTIATING"
      });
      ledgerStore.logActivity(`Settlr Agent countered Client AP terms with policy guardrails for ${invoice.id}`, "NEGOTIATION");
    }

    res.json({
      success: true,
      invoice: ledgerStore.getInvoiceById(invoice.id),
      latestRound: {
        clientMessage,
        agentAnalysis
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Generate PayPal Checkout Order ---
app.post("/api/invoices/:id/checkout-order", async (req, res) => {
  try {
    const invoice = ledgerStore.getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    const orderResult = await paypalService.createCheckoutOrder(invoice);
    res.json({ success: true, order: orderResult });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Record a simulated settlement in the demo ledger ---
app.post("/api/invoices/:id/settle", async (req, res) => {
  try {
    const invoice = ledgerStore.getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    const transaction = {
      transactionId: `SIM-TX-${Date.now().toString(36).toUpperCase()}`,
      status: "RECORDED",
      mode: "DEMO_SIMULATION"
    };

    const settled = ledgerStore.settleInvoice(invoice.id, {
      method: "Settlr demo ledger",
      transactionId: transaction.transactionId
    });

    res.json({
      success: true,
      invoice: settled,
      transaction,
      metrics: ledgerStore.getMetrics()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Guardrails ---
app.get("/api/guardrails", (req, res) => {
  res.json(ledgerStore.getGuardrails());
});

app.put("/api/guardrails", (req, res) => {
  const updated = ledgerStore.updateGuardrails(req.body);
  res.json({ success: true, guardrails: updated });
});

// --- Ledger Transactions ---
app.get("/api/ledger", (req, res) => {
  res.json({
    metrics: ledgerStore.getMetrics(),
    ledger: ledgerStore.ledger
  });
});

// --- Demo Controller: Reset State ---
app.post("/api/demo/reset", (req, res) => {
  ledgerStore.resetToDefaults();
  res.json({
    success: true,
    message: "Demo state reset to clean initial state.",
    metrics: ledgerStore.getMetrics(),
    invoices: ledgerStore.getInvoices()
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Settlr AI is running at http://localhost:${PORT}`);
    console.log(`🤖 Mode: ${geminiAgent.isConfigured() ? "Live Gemini AI" : "Simulation Agent"} | ${paypalService.isConfigured() ? "Live PayPal Sandbox" : "PayPal Simulation"}`);
    console.log(`✨ Open http://localhost:${PORT} in your browser`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
