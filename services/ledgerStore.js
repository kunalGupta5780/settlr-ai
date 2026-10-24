// services/ledgerStore.js
// In-memory persistent state store for Settlr AI with realistic default demo data

class LedgerStore {
  constructor() {
    this.resetToDefaults();
  }

  resetToDefaults() {
    this.guardrails = {
      maxDiscountPercent: 5,         // Max discount the agent can autonomously offer
      lateFeePercentPerWeek: 3,      // Late fee to enforce per week past due
      maxInstallments: 3,            // Max payment split milestones allowed
      minUpfrontPercent: 40,         // Minimum upfront payment required for installment plan
      gracePeriodDays: 3,            // Grace period before escalating tone
      autoSettleThreshold: 5000,     // Max USD amount agent can settle without human signoff
      taxReservePercent: 25          // Automatic tax allocation to sweep into reserve
    };

    this.invoices = [
      {
        id: "INV-2026-081",
        clientName: "Apex Digital Labs",
        clientEmail: "ap@apexdigital.io",
        projectTitle: "Full-Stack Design System & React Migration",
        amount: 2800,
        currency: "USD",
        status: "PAST_DUE", // DRAFT, ISSUED, PAST_DUE, NEGOTIATING, SETTLED
        createdAt: "2026-10-10",
        dueDate: "2026-10-17",
        daysPastDue: 7,
        lineItems: [
          { description: "Design Token Architecture & Figma Sync", quantity: 16, unitPrice: 100, amount: 1600 },
          { description: "React 19 Component Library Build", quantity: 12, unitPrice: 100, amount: 1200 }
        ],
        paypalInvoiceId: "PAYPAL-INV-99824X",
        paypalPaymentLink: "https://www.sandbox.paypal.com/invoice/p/#99824X",
        escalationLevel: "AGENT_NEGOTIATION", // GENTLE, FORMAL, AGENT_NEGOTIATION, ESCALATED
        negotiationHistory: [
          {
            sender: "Settlr Agent (Freelancer)",
            timestamp: "2026-10-18T09:00:00Z",
            type: "CHASER_NOTICE",
            content: "Friendly reminder: Invoice INV-2026-081 for $2,800 is 1 day overdue. Please settle via the PayPal link."
          },
          {
            sender: "Settlr Agent (Freelancer)",
            timestamp: "2026-10-22T09:00:00Z",
            type: "CHASER_NOTICE",
            content: "Notice: Invoice INV-2026-081 is now 5 days past due. Per contract terms, a standard late fee applies if unresolved."
          }
        ],
        settlementDetails: null
      },
      {
        id: "INV-2026-082",
        clientName: "Starlight Interactive",
        clientEmail: "billing@starlight.co",
        projectTitle: "Three.js 3D Interactive Hero Page",
        amount: 1450,
        currency: "USD",
        status: "ISSUED",
        createdAt: "2026-10-20",
        dueDate: "2026-10-30",
        daysPastDue: 0,
        lineItems: [
          { description: "WebGL Shader Prototyping", quantity: 10, unitPrice: 95, amount: 950 },
          { description: "Mobile Touch Optimization & Asset Compression", quantity: 5, unitPrice: 100, amount: 500 }
        ],
        paypalInvoiceId: "PAYPAL-INV-77312A",
        paypalPaymentLink: "https://www.sandbox.paypal.com/invoice/p/#77312A",
        escalationLevel: "NONE",
        negotiationHistory: [],
        settlementDetails: null
      },
      {
        id: "INV-2026-079",
        clientName: "CyberPulse Security",
        clientEmail: "accounts@cyberpulse.net",
        projectTitle: "Security Audit & OAuth2 Integration",
        amount: 3200,
        currency: "USD",
        status: "SETTLED",
        createdAt: "2026-10-01",
        dueDate: "2026-10-15",
        daysPastDue: 0,
        lineItems: [
          { description: "Penetration Testing & Vulnerability Assessment", quantity: 20, unitPrice: 120, amount: 2400 },
          { description: "PayPal Webhook & Signature Verification Module", quantity: 8, unitPrice: 100, amount: 800 }
        ],
        paypalInvoiceId: "PAYPAL-INV-55109B",
        paypalPaymentLink: "https://www.sandbox.paypal.com/invoice/p/#55109B",
        escalationLevel: "SETTLED",
        negotiationHistory: [],
        settlementDetails: {
          settledAt: "2026-10-14T14:32:00Z",
          method: "PayPal Checkout",
          transactionId: "PP-TX-9844201389",
          grossAmount: 3200,
          fee: 96,
          netReceived: 3104,
          taxReserveHeld: 776
        }
      }
    ];

    this.ledger = [
      {
        id: "TX-1001",
        date: "2026-10-14",
        invoiceId: "INV-2026-079",
        client: "CyberPulse Security",
        description: "PayPal Settlement - Security Audit",
        gross: 3200,
        net: 3104,
        taxAllocated: 776,
        type: "CREDIT"
      }
    ];

    this.activityLogs = [
      {
        id: "LOG-01",
        time: "Just now",
        event: "System initialized with PayPal Sandbox & Gemini Agent integration",
        category: "SYSTEM"
      }
    ];
  }

  getMetrics() {
    const totalInvoiced = this.invoices.reduce((sum, i) => sum + i.amount, 0);
    const totalCollected = this.invoices
      .filter(i => i.status === "SETTLED")
      .reduce((sum, i) => sum + i.amount, 0);
    const totalPastDue = this.invoices
      .filter(i => i.status === "PAST_DUE" || i.status === "NEGOTIATING")
      .reduce((sum, i) => sum + i.amount, 0);
    const activeNegotiations = this.invoices.filter(i => i.status === "NEGOTIATING").length;
    const taxReserve = this.ledger.reduce((sum, tx) => sum + (tx.taxAllocated || 0), 0);

    return {
      totalInvoiced,
      totalCollected,
      totalPastDue,
      activeNegotiations,
      taxReserve,
      totalInvoicesCount: this.invoices.length,
      settlementRatePercent: totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0
    };
  }

  getInvoices() {
    return this.invoices;
  }

  getInvoiceById(id) {
    return this.invoices.find(i => i.id === id);
  }

  addInvoice(invoiceData) {
    const nextNum = 80 + this.invoices.length + 1;
    const newInvoice = {
      id: `INV-2026-0${nextNum}`,
      status: "DRAFT",
      createdAt: new Date().toISOString().split("T")[0],
      daysPastDue: 0,
      escalationLevel: "NONE",
      negotiationHistory: [],
      settlementDetails: null,
      ...invoiceData
    };

    // Calculate total from line items if not provided
    if (!newInvoice.amount && newInvoice.lineItems) {
      newInvoice.amount = newInvoice.lineItems.reduce((acc, item) => acc + (item.amount || (item.quantity * item.unitPrice)), 0);
    }

    this.invoices.unshift(newInvoice);
    this.logActivity(`Generated draft invoice ${newInvoice.id} for ${newInvoice.clientName} ($${newInvoice.amount})`, "INVOICE");
    return newInvoice;
  }

  updateInvoice(id, updates) {
    const index = this.invoices.findIndex(i => i.id === id);
    if (index !== -1) {
      this.invoices[index] = { ...this.invoices[index], ...updates };
      return this.invoices[index];
    }
    return null;
  }

  addNegotiationStep(invoiceId, step) {
    const invoice = this.getInvoiceById(invoiceId);
    if (invoice) {
      invoice.negotiationHistory.push({
        timestamp: new Date().toISOString(),
        ...step
      });
      return invoice;
    }
    return null;
  }

  settleInvoice(invoiceId, settlementMeta = {}) {
    const invoice = this.getInvoiceById(invoiceId);
    if (!invoice) return null;

    const gross = invoice.amount;
    const paypalFee = Math.round((gross * 0.0349 + 0.49) * 100) / 100;
    const netReceived = Math.round((gross - paypalFee) * 100) / 100;
    const taxAllocated = Math.round((netReceived * (this.guardrails.taxReservePercent / 100)) * 100) / 100;

    const settlementDetails = {
      settledAt: new Date().toISOString(),
      method: settlementMeta.method || "PayPal Agent Settlement Protocol",
      transactionId: settlementMeta.transactionId || `PP-TX-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      grossAmount: gross,
      fee: paypalFee,
      netReceived: netReceived,
      taxReserveHeld: taxAllocated
    };

    invoice.status = "SETTLED";
    invoice.settlementDetails = settlementDetails;
    invoice.daysPastDue = 0;

    // Add to ledger
    this.ledger.unshift({
      id: `TX-${1000 + this.ledger.length + 1}`,
      date: new Date().toISOString().split("T")[0],
      invoiceId: invoice.id,
      client: invoice.clientName,
      description: `PayPal Autonomous Settlement - ${invoice.projectTitle}`,
      gross: gross,
      net: netReceived,
      taxAllocated: taxAllocated,
      type: "CREDIT"
    });

    this.logActivity(`Invoice ${invoice.id} settled ($${gross}). Tax reserve automatically credited $${taxAllocated}.`, "SETTLEMENT");
    return invoice;
  }

  logActivity(event, category = "INFO") {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.activityLogs.unshift({
      id: `LOG-${Date.now()}`,
      time: timeStr,
      event,
      category
    });
    if (this.activityLogs.length > 30) this.activityLogs.pop();
  }

  getGuardrails() {
    return this.guardrails;
  }

  updateGuardrails(newGuardrails) {
    this.guardrails = { ...this.guardrails, ...newGuardrails };
    this.logActivity("Agent financial guardrails updated by freelancer", "CONFIG");
    return this.guardrails;
  }
}

module.exports = new LedgerStore();
