// public/js/agentChat.js
// Handles live rendering and animation for the Agent-to-Agent Negotiation Room

class AgentChatUI {
  constructor() {
    this.container = document.getElementById("negotiation-chat-box");
    this.showThoughts = true;
    this.activeInvoiceId = "INV-2026-081";
  }

  init() {
    const toggleBtn = document.getElementById("btn-toggle-thoughts");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        this.showThoughts = !this.showThoughts;
        toggleBtn.innerHTML = `
          <i data-lucide="${this.showThoughts ? 'eye' : 'eye-off'}" class="w-3.5 h-3.5"></i>
          <span>${this.showThoughts ? 'Hide' : 'Show'} AI Chain-of-Thought</span>
        `;
        document.querySelectorAll(".thought-box").forEach(el => {
          el.style.display = this.showThoughts ? "block" : "none";
        });
        if (window.lucide) window.lucide.createIcons();
      });
    }
  }

  renderHistory(history, invoice) {
    if (!this.container) return;
    this.container.innerHTML = "";

    if (!history || history.length === 0) {
      this.container.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
          <i data-lucide="message-square" class="w-8 h-8 text-slate-700 mb-2"></i>
          <span>No active negotiation rounds yet. Trigger round 1 below!</span>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    history.forEach((msg, idx) => {
      const isSettlr = msg.sender.includes("Settlr");
      const div = document.createElement("div");
      div.className = `flex flex-col space-y-2 ${isSettlr ? 'items-end' : 'items-start'} animate-fade-in`;

      let thoughtHtml = "";
      if (msg.chainOfThought) {
        thoughtHtml = `
          <div class="thought-box thought-card p-3 rounded-lg text-[11px] text-cyan-200/90 font-mono space-y-1 my-1 max-w-xl ${this.showThoughts ? '' : 'hidden'}">
            <div class="flex items-center space-x-1.5 text-cyan-400 font-bold uppercase text-[10px]">
              <i data-lucide="cpu" class="w-3 h-3"></i>
              <span>Gemini Agent Reasoning Trace</span>
            </div>
            <p>${msg.chainOfThought}</p>
          </div>
        `;
      }

      let termsHtml = "";
      if (msg.settlementTerms) {
        termsHtml = `
          <div class="mt-2 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-[11px] font-mono text-emerald-300 space-y-1">
            <div class="font-bold flex items-center space-x-1">
              <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-400"></i>
              <span>Proposed Agreement Terms:</span>
            </div>
            <div class="flex justify-between text-slate-300">
              <span>Total with Late Fee:</span>
              <span class="font-bold text-white">$${msg.settlementTerms.totalAmountDue}</span>
            </div>
            <div class="flex justify-between text-slate-300">
              <span>Immediate Milestone #1:</span>
              <span class="font-bold text-emerald-400">$${msg.settlementTerms.immediatePaymentAmount}</span>
            </div>
            <div class="flex justify-between text-slate-300">
              <span>Remaining Milestone #2:</span>
              <span class="text-slate-400">$${msg.settlementTerms.remainingBalance} (Net 14)</span>
            </div>
          </div>
        `;
      }

      div.innerHTML = `
        <div class="flex items-center space-x-2 text-[11px] text-slate-400 mb-0.5">
          <span class="font-bold ${isSettlr ? 'text-paypal-light' : 'text-amber-400'}">${msg.sender}</span>
          <span>•</span>
          <span class="font-mono text-[10px] text-slate-500">${new Date(msg.timestamp || Date.now()).toLocaleTimeString()}</span>
        </div>
        
        ${thoughtHtml}

        <div class="max-w-xl p-3.5 rounded-2xl text-xs text-slate-100 ${isSettlr ? 'bubble-settlr' : 'bubble-client'} shadow-md">
          <p class="leading-relaxed">${msg.content}</p>
          ${termsHtml}
        </div>
      `;

      this.container.appendChild(div);
    });

    // Check if consensus was reached
    const hasConsensus = history.some(m => m.termsAgreed || (m.decision === "ACCEPT"));
    const settlementAction = document.getElementById("settlement-action-container");
    if (settlementAction) {
      if (hasConsensus && invoice.status !== "SETTLED") {
        settlementAction.classList.remove("hidden");
      } else {
        settlementAction.classList.add("hidden");
      }
    }

    if (window.lucide) window.lucide.createIcons();
    this.container.scrollTop = this.container.scrollHeight;
  }
}

window.agentChatUI = new AgentChatUI();
