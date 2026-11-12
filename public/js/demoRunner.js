// public/js/demoRunner.js
// 3-Minute demo walkthrough controller

class DemoRunner {
  constructor() {
    this.currentStep = 0;
    this.totalSteps = 5;
    this.isRunning = false;

    this.steps = [
      {
        stepNum: 1,
        title: "Step 1: Chat-to-Invoice (Gemini + PayPal Invoicing v2)",
        guide: "Describe a milestone and review the invoice draft. Gemini is used when configured; this deployment uses the demo parser.",
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
        guide: "Fast-forwarding 7 days marks the sample invoice past due and opens its negotiation workflow.",
        action: async () => {
          window.app.switchTab("pipeline");
          await window.app.simulatePastDue("INV-2026-081", 7);
        }
      },
      {
        stepNum: 3,
        title: "Step 3: A2A Autonomous Bot Duel (Apex AP Bot vs. Settlr)",
        guide: "The simulated client AP bot proposes a delay. Settlr checks the configured guardrails and drafts a counter.",
        action: async () => {
          window.app.switchTab("war-room");
          await window.app.triggerA2ARound();
        }
      },
      {
        stepNum: 4,
        title: "Step 4: Consensus & PayPal Checkout Link Generated",
        guide: "The simulated client accepts the proposed terms. Review the settlement preview before recording it.",
        action: async () => {
          window.app.switchTab("war-room");
          await window.app.triggerA2ARound(); // Round 2 consensus
        }
      },
      {
        stepNum: 5,
        title: "Step 5: Demo Settlement & Ledger Update",
        guide: "Record a simulated settlement. The ledger calculates a 25% tax reserve allocation; no payment or transfer occurs.",
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
      this.updateBanner("🎉 Demo complete. You reviewed an invoice, simulated a negotiation, and recorded a demo settlement.", 5);
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
