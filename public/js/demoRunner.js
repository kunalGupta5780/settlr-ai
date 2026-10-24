// public/js/demoRunner.js
// 3-Minute Live Hackathon Demo Walkthrough Controller for Judges

class DemoRunner {
  constructor() {
    this.currentStep = 0;
    this.totalSteps = 5;
    this.isRunning = false;

    this.steps = [
      {
        stepNum: 1,
        title: "Step 1: Chat-to-Invoice (Gemini + PayPal Invoicing v2)",
        guide: "Watch how natural language turns into an itemized PayPal invoice automatically without manual spreadsheet entry.",
        action: async () => {
          // Switch to chat invoicing tab
          window.app.switchTab("chat-invoicing");
          
          // Fill sample prompt
          const textarea = document.getElementById("input-milestone-text");
          textarea.value = "Full-Stack Design System & React 19 Migration: 28 hrs @ $100/hr for Apex Digital Labs, net 14";
          
          // Trigger parse
          await window.app.handleParseMilestone();
        }
      },
      {
        stepNum: 2,
        title: "Step 2: Time Fast-Forward (Invoice Past Due Trigger)",
        guide: "Fast-forwarding 7 days: Invoice INV-2026-081 passes due date. Settlr's autonomous escalation engine triggers.",
        action: async () => {
          window.app.switchTab("pipeline");
          await window.app.simulatePastDue("INV-2026-081", 7);
        }
      },
      {
        stepNum: 3,
        title: "Step 3: A2A Autonomous Bot Duel (Apex AP Bot vs. Settlr)",
        guide: "The client's AP bot proposes a payment delay. Settlr checks freelancer guardrails, enforces late fees, and counters.",
        action: async () => {
          window.app.switchTab("war-room");
          await window.app.triggerA2ARound();
        }
      },
      {
        stepNum: 4,
        title: "Step 4: Consensus & PayPal Checkout Link Generated",
        guide: "Client AP Bot agrees to terms (50% upfront + late fee). Instant PayPal settlement order is generated.",
        action: async () => {
          window.app.switchTab("war-room");
          await window.app.triggerA2ARound(); // Round 2 consensus
        }
      },
      {
        stepNum: 5,
        title: "Step 5: Instant Settlement, Tax Sweep & Ledger Reconciliation",
        guide: "Payment captured via PayPal! Webhook fires, funds logged, 25% tax reserve auto-swept, and confetti celebration!",
        action: async () => {
          await window.app.openCheckoutModal("INV-2026-081");
          setTimeout(async () => {
            await window.app.confirmPayment();
            window.app.switchTab("ledger");
          }, 1200);
        }
      }
    ];
  }

  init() {
    const quickDemoBtn = document.getElementById("btn-quick-demo");
    const nextStepBtn = document.getElementById("btn-demo-next-step");

    if (quickDemoBtn) {
      quickDemoBtn.addEventListener("click", () => this.startDemo());
    }

    if (nextStepBtn) {
      nextStepBtn.addEventListener("click", () => this.runNextStep());
    }
  }

  startDemo() {
    this.currentStep = 0;
    this.isRunning = true;
    const nextStepBtn = document.getElementById("btn-demo-next-step");
    if (nextStepBtn) nextStepBtn.classList.remove("hidden");
    this.runNextStep();
  }

  async runNextStep() {
    if (this.currentStep >= this.totalSteps) {
      // Completed demo
      this.updateBanner("🎉 Demo Complete! The entire invoice-to-cash lifecycle was autonomously resolved with PayPal & Gemini.", 5);
      const nextStepBtn = document.getElementById("btn-demo-next-step");
      if (nextStepBtn) nextStepBtn.classList.add("hidden");
      this.isRunning = false;
      return;
    }

    const step = this.steps[this.currentStep];
    this.currentStep++;

    this.updateBanner(`<b>${step.title}:</b> ${step.guide}`, this.currentStep);
    await step.action();
  }

  updateBanner(text, stepNum) {
    const guideText = document.getElementById("demo-guide-text");
    const indicator = document.getElementById("demo-step-indicator");
    if (guideText) guideText.innerHTML = text;
    if (indicator) indicator.textContent = `Step ${stepNum} of ${this.totalSteps}`;
  }
}

window.demoRunner = new DemoRunner();
