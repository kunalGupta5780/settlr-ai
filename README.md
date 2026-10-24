# 🚀 Settlr AI — Autonomous Invoice-to-Cash & Agent-to-Agent Settlement Engine
> **Built for the PayPal Global Hackathon | Category: Agentic Commerce & Autonomous Finance**

![Settlr AI Banner](https://img.shields.io/badge/PayPal-Invoicing%20%26%20Checkout%20v2-0070BA?style=for-the-badge&logo=paypal&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini-1.5%20Agentic%20Core-blueviolet?style=for-the-badge)
![NodeJS](https://img.shields.io/badge/Node.js-v20%2B-green?style=for-the-badge)

---

## 💡 The Problem
Freelancers and independent knowledge workers lose over **20 days per year** chasing past-due invoices, negotiating awkward payment delays, and worrying about late cash flow. Standard invoicing software is passive—it sends an email and hopes for the best. 

## 🤖 The Solution: Settlr AI
**Settlr AI** is an autonomous financial operations manager for freelancers. It handles the **entire payment lifecycle without human intervention**:
1. **Conversational Milestone Invoicing:** Freelancer drops a voice memo or Slack-style update $\rightarrow$ Gemini extracts line items and calls the **PayPal Invoicing API** to issue an official bill.
2. **Autonomous Tone Escalation:** If unpaid past the due date, the agent escalates from gentle reminders to formal contractual notices.
3. **Agent-to-Agent (A2A) Negotiation:** When the client's automated accounting bot requests an extension or installment split, Settlr evaluates the request against strict freelancer guardrails, enforces late fees, counters, and autonomously settles terms.
4. **Instant PayPal Settlement:** Generates a direct **PayPal Checkout** order. Once paid, the ledger reconciles instantly, and **25% is automatically swept into a tax reserve pool**.

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
cd "C:\Users\Kunal Gupta\OneDrive\Desktop\KUNAL\settlr-ai"
npm install
```

### 2. Configure Environment (Optional)
Settlr AI includes a **high-fidelity sandbox simulation engine** that runs smoothly right out of the box even without API keys!

To connect live keys, open `.env`:
```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_client_secret
PAYPAL_ENVIRONMENT=sandbox
```

### 3. Launch the Application
```bash
npm start
```
Open **`http://localhost:3000`** in your browser.

---

## 🏆 The 3-Minute Hackathon Demo
We built a dedicated **"3-Min Hackathon Demo"** button directly in the header! Click it to step through the complete 5-stage story:
1. **Chat-to-Invoice:** Prompt converts into an itemized PayPal invoice draft.
2. **Fast-Forward Clock:** An invoice crosses the due date and triggers the autonomous agent.
3. **A2A Bot Negotiation:** Watch the Client AP Bot and Settlr Agent debate installment milestones and late fees with transparent AI Chain-of-Thought logs.
4. **Consensus Reached:** The bots agree on 50% immediate deposit + 5% late fee.
5. **Instant PayPal Settlement:** Settle via PayPal, confetti pops, tax reserve is swept, and the ledger reconciles.

---

## 🎁 Hackathon Sponsor Prize Integrations
This project incorporates 3 official sponsor tools from the hackathon guidelines to maximize prize eligibility:
1. **AG Grid (Enterprise Data Grid Sponsor):**
   - The **Autonomous Settlement Ledger** is rendered using **AG Grid Community** (`ag-theme-quartz-dark`), with real-time multi-column sorting, live search filtering, custom currency chips, and 1-click CSV data export.
2. **Postman (API Platform Sponsor):**
   - A production-ready Postman collection is included at [`settlr-ai.postman_collection.json`](./settlr-ai.postman_collection.json), covering all 10 PayPal Invoicing, Orders Checkout, and Gemini Agent endpoints.
3. **Render (Cloud Deployment Sponsor):**
   - Includes a native [`render.yaml`](./render.yaml) blueprint for instant, 1-click zero-downtime deployment.

---

## 🛠️ Architecture & Tech Stack

```
[ Freelancer Voice / Chat ]
            │
            ▼
┌───────────────────────────┐
│     Settlr AI Agent       │◄────── Financial Guardrails
│  (Gemini 1.5 Structured)  │        (Discounts, Late Fees, Splits)
└─────────────┬─────────────┘
              │
     ┌────────┴────────┐
     ▼                 ▼
[ PayPal Invoicing ]   [ Agent-to-Agent Negotiation Engine ]
[     v2 API       ]                   │
                                       ▼
                         [ Client Accounts Payable Bot ]
                                       │
                                       ▼ (Consensus)
                         [ PayPal Orders Checkout v2 ]
                                       │
                                       ▼ (Webhook Settlement)
                         [ Autonomous Ledger & Tax Sweep ]
```

- **Frontend:** Glassmorphism Dark UI, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Audio & Voice Layer:** Web Speech API for zero-friction voice dictation; Web Audio API Synthesizer for instant payment confirmation chimes.
- **Client & Document Experience:** Built-in Client AP Email Inbox Simulator and Official PayPal Invoicing v2 PDF/Document Drawer.
- **Enterprise Grid:** AG Grid Community (`ag-theme-quartz-dark`) with real-time multi-column sorting, live filtering, and CSV export.
- **Backend:** Node.js, Express, REST APIs.
- **Agent Intelligence:** Google Gemini 1.5 with Structured JSON Schema & Chain-of-Thought validation.
- **Payment Infrastructure:** PayPal Invoicing v2, PayPal Checkout Orders v2, Sandbox webhooks.

---

## 📜 Pitch Guide
See [`PITCH_AND_DEMO_GUIDE.md`](./PITCH_AND_DEMO_GUIDE.md) for the verbatim 3-minute pitch script to impress hackathon judges.
