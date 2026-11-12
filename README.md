# Settlr AI — Invoice-to-Cash Workspace for Freelancers
> **Built for the PayPal Global Hackathon | Category: Agentic Commerce & Autonomous Finance**

![Settlr AI Banner](https://img.shields.io/badge/PayPal-Invoicing%20%26%20Checkout%20v2-0070BA?style=for-the-badge&logo=paypal&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini-1.5%20Agentic%20Core-blueviolet?style=for-the-badge)
![NodeJS](https://img.shields.io/badge/Node.js-v20%2B-green?style=for-the-badge)

---

## The problem
Freelancers spend time creating invoices, following up on late payments, and deciding how to respond to requests for more time. Most invoicing tools help send a bill but leave the follow-up work to the freelancer.

## The solution
**Settlr AI** is a financial workflow prototype for freelancers. It demonstrates how natural language, policy guardrails, and PayPal APIs could work together:
1. **Draft from a milestone note:** A freelancer types or dictates a project update. Gemini can structure it into invoice line items when configured; the demo has a local fallback parser.
2. **Review and issue:** The freelancer reviews a draft. With PayPal credentials configured, the server can create and send a PayPal Invoicing v2 invoice.
3. **Negotiate within policy:** A simulated client AP bot requests a delay. Settlr drafts a response against the freelancer's guardrails; the client bot is part of the demo, not a live external agent.
4. **Record a demo settlement:** The demo writes a settlement entry and calculates a tax reserve allocation. It does not initiate a checkout payment or transfer funds.

The public Vercel deployment runs in **demo simulation mode**. Invoice and ledger state is held in memory and is not durable across serverless instances or cold starts.

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
The **"3-Min Hackathon Demo"** button walks through a five-stage simulation:
1. **Chat-to-invoice:** Convert a sample milestone note into a reviewable invoice draft.
2. **Past-due scenario:** Mark a sample invoice overdue.
3. **Negotiation:** A simulated client AP bot makes a request; Settlr drafts a response using the current guardrails.
4. **Agreement:** The simulated client accepts the proposed terms.
5. **Demo settlement:** Record a settlement in the in-memory ledger and calculate a tax reserve allocation. No payment is initiated and no funds are moved.

---

## 🎁 Hackathon Sponsor Prize Integrations
This project incorporates 3 official sponsor tools from the hackathon guidelines to maximize prize eligibility:
1. **AG Grid (Enterprise Data Grid Sponsor):**
   - The **Settlement Ledger** is rendered using **AG Grid Community** (`ag-theme-quartz-dark`), with sorting, filtering, and CSV export.
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
                                       ▼ (Demo ledger update)
                         [ Settlement + reserve allocation ]
```

- **Frontend:** Responsive dark workspace UI, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Audio & Voice Layer:** Web Speech API for zero-friction voice dictation; Web Audio API Synthesizer for instant payment confirmation chimes.
- **Client & Document Experience:** Simulated client inbox and invoice preview template.
- **Enterprise Grid:** AG Grid Community (`ag-theme-quartz-dark`) with real-time multi-column sorting, live filtering, and CSV export.
- **Backend:** Node.js, Express, REST APIs.
- **Agent Intelligence:** Gemini API integration with structured JSON responses and a rule-based fallback in demo mode.
- **Payment Infrastructure:** PayPal Invoicing v2 API support when credentials are configured. Orders v2 checkout and webhook settlement are not wired into the demo UI.

---

## 📜 Pitch Guide
See [`PITCH_AND_DEMO_GUIDE.md`](./PITCH_AND_DEMO_GUIDE.md) for the verbatim 3-minute pitch script to impress hackathon judges.
