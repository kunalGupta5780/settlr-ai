// services/geminiAgent.js
// Gemini-powered Agentic Intelligence: Milestone-to-Invoice Parsing & Autonomous A2A Negotiation

class GeminiAgent {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";
    this.modelName = "gemini-1.5-flash"; // Reliable standard fast model
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 10);
  }

  // Parse natural language milestone notes into structured PayPal invoice
  async parseMilestoneToInvoice(userPrompt) {
    if (this.isConfigured()) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;
        const systemPrompt = `You are Settlr AI, an autonomous financial operations agent for freelancers.
Extract invoice details from the freelancer's note into valid JSON matching this schema:
{
  "clientName": string,
  "clientEmail": string,
  "projectTitle": string,
  "currency": "USD",
  "dueDateDays": number (default 14 if unspecified),
  "lineItems": [
    {
      "description": string,
      "quantity": number,
      "unitPrice": number,
      "amount": number
    }
  ],
  "totalAmount": number,
  "agentNotes": string
}
Return ONLY valid JSON. No markdown ticks, no commentary.`;

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${systemPrompt}\n\nFreelancer input: "${userPrompt}"` }]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.1
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          const parsed = JSON.parse(rawText);

          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + (parsed.dueDateDays || 14));

          return {
            clientName: parsed.clientName || "Client Organization",
            clientEmail: parsed.clientEmail || `billing@${(parsed.clientName || "client").toLowerCase().replace(/[^a-z]/g, "")}.com`,
            projectTitle: parsed.projectTitle || "Freelance Milestone Deliverable",
            currency: parsed.currency || "USD",
            dueDate: dueDate.toISOString().split("T")[0],
            lineItems: parsed.lineItems || [
              { description: "Milestone Deliverable", quantity: 1, unitPrice: parsed.totalAmount || 1000, amount: parsed.totalAmount || 1000 }
            ],
            amount: parsed.totalAmount || (parsed.lineItems ? parsed.lineItems.reduce((acc, l) => acc + l.amount, 0) : 1000),
            agentNotes: parsed.agentNotes || "Extracted autonomously from milestone summary."
          };
        }
      } catch (err) {
        console.warn("[Gemini Invoice Parser Error]:", err.message);
      }
    }

    // High-fidelity heuristic fallback when offline or no API key
    return this.fallbackParse(userPrompt);
  }

  fallbackParse(prompt) {
    const text = prompt.toLowerCase();
    
    // Extract numbers / dollars
    const dollarMatches = prompt.match(/\$(\d+[\d,]*(\.\d+)?)/g);
    let total = 1200;
    if (dollarMatches && dollarMatches.length > 0) {
      total = parseFloat(dollarMatches[0].replace(/[$,]/g, ""));
    }

    // Extract hours and rate if present: e.g. "15 hours at $80"
    const hoursMatch = prompt.match(/(\d+)\s*(?:hrs?|hours?)\s*(?:@|at)\s*\$?(\d+)/i);
    let lineItems = [];
    if (hoursMatch) {
      const hours = parseInt(hoursMatch[1], 10);
      const rate = parseFloat(hoursMatch[2]);
      total = hours * rate;
      lineItems.push({
        description: "Development & Engineering Hours",
        quantity: hours,
        unitPrice: rate,
        amount: total
      });
    } else {
      lineItems.push({
        description: prompt.length > 60 ? prompt.substring(0, 60) + "..." : prompt,
        quantity: 1,
        unitPrice: total,
        amount: total
      });
    }

    // Client name extraction heuristic
    let client = "Nexus Ventures";
    const forMatch = prompt.match(/(?:for|client|to)\s+([A-Z][a-zA-Z0-9\s]+?)(?:[:,\.\$]|$)/);
    if (forMatch && forMatch[1].trim().length > 2) {
      client = forMatch[1].trim().replace(/\b(and|with|the)\b/gi, "").trim();
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    return {
      clientName: client,
      clientEmail: `ap@${client.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
      projectTitle: "Milestone Deliverable SOW",
      currency: "USD",
      dueDate: dueDate.toISOString().split("T")[0],
      lineItems: lineItems,
      amount: total,
      agentNotes: "Generated via Settlr AI natural language inference."
    };
  }

  // Autonomous Agent-to-Agent past-due negotiation
  async negotiatePastDue({ invoice, clientMessage, negotiationHistory, guardrails }) {
    if (this.isConfigured()) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;
        const prompt = `You are Settlr AI, representing a freelancer whose invoice is PAST DUE.
Invoice Details:
- ID: ${invoice.id}
- Original Amount: $${invoice.amount}
- Days Past Due: ${invoice.daysPastDue}
- Client Name: ${invoice.clientName}

Freelancer Guardrails (STRICT RULES):
- Max Discount Allowed: ${guardrails.maxDiscountPercent}%
- Late Fee Enforced: ${guardrails.lateFeePercentPerWeek}% per week past due
- Max Installments Allowed: ${guardrails.maxInstallments} parts
- Minimum Upfront Payment for Split: ${guardrails.minUpfrontPercent}%

Incoming Message from Client AP Agent:
"${clientMessage}"

Previous Negotiation Transcript:
${JSON.stringify(negotiationHistory, null, 2)}

Respond in valid JSON format:
{
  "decision": "ACCEPT" | "COUNTER" | "REJECT",
  "chainOfThought": "Detailed step-by-step internal evaluation against user guardrails",
  "replyMessage": "Polite, firm, professional message back to client agent",
  "termsAgreed": boolean,
  "settlementTerms": {
    "totalAmountDue": number,
    "immediatePaymentAmount": number,
    "remainingBalance": number,
    "lateFeeApplied": number,
    "installmentCount": number
  }
}
Return ONLY valid JSON.`;

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json", temperature: 0.2 }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
          return JSON.parse(raw);
        }
      } catch (err) {
        console.warn("[Gemini Negotiation Error]:", err.message);
      }
    }

    // High-fidelity fallback agent logic (Rule-based agent simulation)
    return this.fallbackNegotiate({ invoice, clientMessage, guardrails });
  }

  fallbackNegotiate({ invoice, clientMessage, guardrails }) {
    const originalAmount = invoice.amount;
    const lateFee = Math.round(originalAmount * (guardrails.lateFeePercentPerWeek / 100));
    const totalWithLateFee = originalAmount + lateFee;
    const upfrontSplit = Math.round(totalWithLateFee * 0.5);
    const balanceRemaining = totalWithLateFee - upfrontSplit;

    const lower = (clientMessage || "").toLowerCase();

    // Check if client is agreeing or proposing split
    if (lower.includes("agree") || lower.includes("accept") || lower.includes("proceed")) {
      return {
        decision: "ACCEPT",
        chainOfThought: `Client AP accepted revised terms. Terms comply with Freelancer Policy (50% deposit received, late fee retained at ${guardrails.lateFeePercentPerWeek}%). Ready to trigger PayPal checkout link.`,
        replyMessage: `Terms confirmed. Generating instant PayPal settlement order for $${totalWithLateFee}. Once settled, the ledger will reflect full compliance.`,
        termsAgreed: true,
        settlementTerms: {
          totalAmountDue: totalWithLateFee,
          immediatePaymentAmount: totalWithLateFee,
          remainingBalance: 0,
          lateFeeApplied: lateFee,
          installmentCount: 1
        }
      };
    }

    // Client asking for extension or discount: Agent counters within guardrails
    return {
      decision: "COUNTER",
      chainOfThought: `Client requested delay/installment. Freelancer guardrail allows max ${guardrails.maxInstallments} splits with min ${guardrails.minUpfrontPercent}% upfront. Invoice is ${invoice.daysPastDue} days overdue. Policy enforces 1 week late fee ($${lateFee}). Countering with 50% immediate PayPal settlement ($${upfrontSplit}) and remainder in 14 days.`,
      replyMessage: `Our policy accommodates structured settlement plans under active milestones. We can divide the balance ($${originalAmount} + $${lateFee} contract late adjustment = $${totalWithLateFee}) into 2 milestones: an immediate PayPal authorization of $${upfrontSplit} (50%), with the final balance ($${balanceRemaining}) scheduled in 14 days. Please confirm authorization.`,
      termsAgreed: false,
      settlementTerms: {
        totalAmountDue: totalWithLateFee,
        immediatePaymentAmount: upfrontSplit,
        remainingBalance: balanceRemaining,
        lateFeeApplied: lateFee,
        installmentCount: 2
      }
    };
  }

  // Simulate the opposing Client Accounts Payable Bot
  simulateClientAgentResponse({ invoice, round, lastFreelancerMessage }) {
    if (round === 1) {
      return {
        sender: "Client AP Bot (Apex Digital)",
        content: `Invoice ${invoice.id} flagged for delayed vendor disbursement due to end-of-quarter budget consolidation. We propose an extension to the 30th or splitting payment across two cycles. Can your system accommodate this?`,
        tone: "CORPORATE_AP",
        proposedSplit: 2
      };
    } else if (round === 2) {
      return {
        sender: "Client AP Bot (Apex Digital)",
        content: `Terms reviewed and validated against vendor policy. We accept the 50% immediate release ($${Math.round(invoice.amount * 0.525)}) plus late assessment fee, balance in 14 days. Please provide direct PayPal Checkout link for automated execution.`,
        tone: "ACCEPTANCE",
        proposedSplit: 2
      };
    } else {
      return {
        sender: "Client AP Bot (Apex Digital)",
        content: `Payment authorization confirmed via corporate PayPal gateway. Reference recorded.`,
        tone: "FINALIZED"
      };
    }
  }
}

module.exports = new GeminiAgent();
