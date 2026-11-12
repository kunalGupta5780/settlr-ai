# 🎤 Settlr AI — 3-Minute Hackathon Pitch Script & Judge Q&A Guide

Use this presentation script to pitch **Settlr AI** to PayPal hackathon judges. Keep the demo dashboard open while speaking.

---

## ⏱️ Pitch Timeline (Total: 3 Minutes)

### 0:00 - 0:40 | The Hook & The Problem
> **Spoken Script:**
> *"Hi judges. Freelancers spend time creating invoices, following up on late payments, and negotiating extensions. Those are hours they could spend on the work they were hired to do.*
> 
> *Most invoicing tools stop after sending the bill. Settlr explores what happens when the follow-up process understands the project, the payment terms, and the freelancer's own boundaries.*
> 
> *Today, we’re presenting **Settlr AI**, a prototype for a policy-aware invoice-to-cash assistant. It combines natural-language invoice drafting, guardrailed negotiation, and PayPal integration points in one workflow."*

---

### 0:40 - 1:20 | Step 1: Conversational Invoice Drafting
*(Click the **"3-Min Hackathon Demo"** button on screen)*

> **Spoken Script:**
> *"First, invoicing shouldn't require filling out 15 spreadsheet boxes. In Settlr AI, a freelancer simply types or voice-memos: 'Finished Design System for Apex Digital, 28 hours at $100/hr, net 14.'*
> 
> *Settlr turns that note into an invoice draft the freelancer can review. Gemini can power the extraction when configured; this public demo uses its fallback parser. With PayPal credentials, the server can create and send an invoice through Invoicing v2.*

---

### 1:20 - 2:10 | Step 2 & 3: Policy Guardrails & Simulated A2A Negotiation
*(Dashboard moves to the **Agent-to-Agent War Room** tab)*

> **Spoken Script:**
> *"Now here is the core agentic innovation. An invoice crosses the due date. Most freelancers hesitate to follow up.*
> 
> *For this demo, we fast-forward the sample invoice into a past-due state. The client AP bot is simulated and asks for a delay.*
> 
> *Instead of waking up the freelancer, Settlr AI checks the freelancer's pre-configured financial guardrails:
> - Max allowed splits: 3 parts
> - Minimum upfront deposit: 40%
> - Enforced late fee: 3% per week overdue
> 
> *Settlr checks the configured limits and drafts a counter. The simulated client accepts, showing how agent-to-agent agreement could fit into the workflow. This is a demo negotiation, not a connection to a client accounting system."*

---

### 2:10 - 2:45 | Step 4 & 5: Settlement Preview & Ledger
*(Click **"Record demo settlement"**)*

> **Spoken Script:**
> *"The settlement preview records a simulated entry in the ledger. It does not open PayPal checkout or move money. We calculate a 25% tax reserve allocation to show how a freelancer policy could appear in settlement records:*
> 1. *The sample invoice is marked settled in the demo ledger.*
> 2. *Estimated payment fees are recorded.*
> 3. *A reserve allocation is calculated, but no funds are transferred.*
> 
> *This prototype shows how a reviewable, policy-aware workflow could reduce repetitive follow-up."*

---

### 2:45 - 3:00 | Conclusion & Vision
> **Spoken Script:**
> *"Settlr AI prototypes how natural-language invoicing and policy-aware follow-up could fit around PayPal's payment infrastructure. Thank you, and we're ready for your questions!"*

---

## 🎯 Anticipated Judge Questions & Winning Answers

### Q1: *"Why PayPal? What PayPal APIs did you use?"*
> **Answer:**
> *"PayPal provides the payment infrastructure for the invoice flow. The project includes:
> 1. **PayPal Invoicing v2 API** (`/v2/invoicing/invoices` and `/send`) to issue official compliant bills.
> 2. **PayPal Checkout Orders v2 helper** (`/v2/checkout/orders` and `/capture`), which is not connected to the demo settlement button.
> 3. The demo only calculates reserve allocations in its ledger; it does not call PayPal Payouts or transfer funds."*

### Q2: *"How do you prevent the AI agent from giving away too many discounts or making bad agreements?"*
> **Answer:**
> *"Through deterministic **Financial Guardrails**! You can see our Guardrails tab: the freelancer sets strict bounding parameters (e.g., maximum 5% discount, mandatory 40% upfront deposit, late fees). The Gemini agent uses these as invariant rules in its system instructions. If a client's offer violates the guardrails, the agent either counters within policy or escalates to human sign-off."*

### Q3: *"Can this work if the client doesn't have an AI bot?"*
> **Answer:**
> *"Yes! The current demo uses a simulated client AP bot. A production version could connect to a client accounting system or parse an authorized email reply, but those integrations are not implemented here."*

### Q4: *"Did you integrate any of the Hackathon Sponsor Tools?"*
> **Answer:**
> *"Yes, we integrated 3 official sponsor tools:
> 1. **AG Grid:** Powers the demo settlement ledger with sorting, filtering, and CSV export.
> 2. **Postman:** We built a complete Postman Collection (`settlr-ai.postman_collection.json`) covering all 10 PayPal Invoicing, Orders Checkout, and Gemini Agent APIs.
> 3. **Render:** We included a native `render.yaml` infrastructure-as-code file for one-click deployment."*