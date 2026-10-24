// public/js/app.js
// Main client application logic for Settlr AI

class App {
  constructor() {
    this.invoices = [];
    this.metrics = {};
    this.activeInvoice = null;
    this.activeTab = "pipeline";
    this.soundEnabled = true;
    this.isListening = false;
    this.recognition = null;
  }

  async init() {
    this.setupTabs();
    this.setupEventListeners();
    this.setupVoiceInput();
    await this.fetchData();
    await this.loadGuardrails();

    window.agentChatUI.init();
    window.demoRunner.init();

    // Select default past-due invoice for the war room
    const pastDueInv = this.invoices.find(i => i.id === "INV-2026-081") || this.invoices[0];
    if (pastDueInv) {
      this.activeInvoice = pastDueInv;
      window.agentChatUI.renderHistory(pastDueInv.negotiationHistory, pastDueInv);
    }
  }

  setupTabs() {
    const tabs = document.querySelectorAll(".nav-tab");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const targetTab = tab.getAttribute("data-tab");
        this.switchTab(targetTab);
      });
    });
  }

  switchTab(targetTab) {
    this.activeTab = targetTab;
    
    // Update tab buttons
    document.querySelectorAll(".nav-tab").forEach(tab => {
      if (tab.getAttribute("data-tab") === targetTab) {
        tab.className = "nav-tab px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 bg-slate-800 text-white border border-slate-700";
      } else {
        tab.className = "nav-tab px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 text-slate-400 hover:text-white hover:bg-slate-800/60";
      }
    });

    // Update tab panes
    document.querySelectorAll(".tab-pane").forEach(pane => {
      if (pane.id === `tab-content-${targetTab}`) {
        pane.classList.remove("hidden");
      } else {
        pane.classList.add("hidden");
      }
    });

    if (window.lucide) window.lucide.createIcons();
  }

  setupEventListeners() {
    // Sound Toggle Button
    document.getElementById("btn-toggle-sound")?.addEventListener("click", () => this.toggleSound());

    // Client Email Simulator Buttons
    document.getElementById("btn-open-email-sim")?.addEventListener("click", () => this.openEmailSimulator());
    document.getElementById("btn-close-email-sim")?.addEventListener("click", () => this.closeEmailSimulator());

    // Document Preview Drawer Buttons
    document.getElementById("btn-preview-doc-modal")?.addEventListener("click", () => {
      this.openDocPreview(this.draftInvoice ? this.draftInvoice.id : "INV-2026-081");
    });
    document.getElementById("btn-close-doc-modal")?.addEventListener("click", () => this.closeDocPreview());
    document.getElementById("btn-print-doc")?.addEventListener("click", () => window.print());

    // Reset Demo Button
    document.getElementById("btn-reset-demo")?.addEventListener("click", () => this.resetDemo());

    // Chat preset pills
    document.querySelectorAll(".chat-preset-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        const text = pill.getAttribute("data-text");
        const textarea = document.getElementById("input-milestone-text");
        if (textarea) textarea.value = text;
      });
    });

    // Email Simulator Tabs
    document.querySelectorAll(".email-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const type = btn.getAttribute("data-email");
        this.switchEmailTab(type, btn);
      });
    });

    // Parse milestone button
    document.getElementById("btn-parse-milestone")?.addEventListener("click", () => this.handleParseMilestone());

    // Issue invoice button
    document.getElementById("btn-issue-now-paypal")?.addEventListener("click", () => this.handleIssueDraftToPaypal());

    // War room buttons
    document.getElementById("btn-trigger-client-message")?.addEventListener("click", () => this.triggerA2ARound());
    document.getElementById("btn-trigger-settlr-counter")?.addEventListener("click", () => this.triggerA2ARound());
    document.getElementById("btn-auto-consensus")?.addEventListener("click", () => this.triggerAutoConsensus());

    // PayPal Modal buttons
    document.getElementById("btn-open-paypal-checkout")?.addEventListener("click", () => {
      this.openCheckoutModal(this.activeInvoice?.id || "INV-2026-081");
    });
    document.getElementById("btn-close-modal")?.addEventListener("click", () => this.closeCheckoutModal());
    document.getElementById("btn-confirm-paypal-payment")?.addEventListener("click", () => this.confirmPayment());

    // Guardrails Form
    const guardrailsForm = document.getElementById("guardrails-form");
    if (guardrailsForm) {
      guardrailsForm.addEventListener("submit", (e) => this.handleSaveGuardrails(e));
      
      // Sliders label updates
      const setupSlider = (id, labelId, suffix = "%") => {
        const input = document.getElementById(id);
        const label = document.getElementById(labelId);
        if (input && label) {
          input.addEventListener("input", () => {
            label.textContent = `${input.value}${suffix}`;
          });
        }
      };

      setupSlider("input-max-discount", "label-max-discount", "%");
      setupSlider("input-late-fee", "label-late-fee", "%");
      setupSlider("input-max-installments", "label-max-installments", " parts");
      setupSlider("input-min-upfront", "label-min-upfront", "%");
      setupSlider("input-tax-reserve", "label-tax-reserve", "%");
    }
  }

  async fetchData() {
    try {
      const res = await fetch("/api/invoices");
      const data = await res.json();
      this.invoices = data.invoices;
      this.metrics = data.metrics;

      this.renderMetrics();
      this.renderInvoices();
      await this.renderLedger();
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  }

  renderMetrics() {
    const elInvoiced = document.getElementById("stat-total-invoiced");
    const elCollected = document.getElementById("stat-total-collected");
    const elPastDue = document.getElementById("stat-total-past-due");
    const elTaxReserve = document.getElementById("stat-tax-reserve");
    const elNegotiations = document.getElementById("stat-active-negotiations");

    if (elInvoiced) elInvoiced.textContent = `$${this.metrics.totalInvoiced?.toLocaleString() || 0}`;
    if (elCollected) elCollected.textContent = `$${this.metrics.totalCollected?.toLocaleString() || 0}`;
    if (elPastDue) elPastDue.textContent = `$${this.metrics.totalPastDue?.toLocaleString() || 0}`;
    if (elTaxReserve) elTaxReserve.textContent = `$${this.metrics.taxReserve?.toLocaleString() || 0}`;
    if (elNegotiations) elNegotiations.textContent = `${this.metrics.activeNegotiations || 0} Active`;
  }

  renderInvoices() {
    const container = document.getElementById("invoices-list");
    const countLabel = document.getElementById("invoice-count-label");
    if (!container) return;

    if (countLabel) countLabel.textContent = `${this.invoices.length} Total`;
    container.innerHTML = "";

    this.invoices.forEach(inv => {
      const card = document.createElement("div");
      card.className = "glass-panel p-4 rounded-xl border border-slate-800 glass-panel-hover transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4";

      let statusBadge = "";
      if (inv.status === "SETTLED") {
        statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 flex items-center space-x-1">
          <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
          <span>Settled (PayPal)</span>
        </span>`;
      } else if (inv.status === "PAST_DUE") {
        statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-950/60 text-rose-400 border border-rose-800/40 flex items-center space-x-1">
          <i data-lucide="alert-octagon" class="w-3.5 h-3.5"></i>
          <span>${inv.daysPastDue} Days Past Due</span>
        </span>`;
      } else if (inv.status === "NEGOTIATING") {
        statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-violet-950/60 text-violet-300 border border-violet-800/40 flex items-center space-x-1 animate-pulse">
          <i data-lucide="cpu" class="w-3.5 h-3.5"></i>
          <span>A2A Negotiating</span>
        </span>`;
      } else if (inv.status === "ISSUED") {
        statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-paypal-blue/20 text-paypal-light border border-paypal-blue/40 flex items-center space-x-1">
          <i data-lucide="send" class="w-3.5 h-3.5"></i>
          <span>Issued via PayPal</span>
        </span>`;
      } else {
        statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
          Draft
        </span>`;
      }

      // Actions
      let actionButtons = "";
      if (inv.status === "ISSUED") {
        actionButtons = `
          <button onclick="window.app.simulatePastDue('${inv.id}', 7)" class="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-300 hover:bg-rose-950/40 border border-rose-800/40 transition">
            + Fast-Forward (Past Due)
          </button>
        `;
      } else if (inv.status === "PAST_DUE" || inv.status === "NEGOTIATING") {
        actionButtons = `
          <button onclick="window.app.openWarRoomFor('${inv.id}')" class="px-3 py-1.5 rounded-lg text-xs font-bold text-violet-300 bg-violet-950/40 hover:bg-violet-900/60 border border-violet-800/50 transition flex items-center space-x-1">
            <i data-lucide="message-square-code" class="w-3.5 h-3.5"></i>
            <span>Open War Room</span>
          </button>
          <button onclick="window.app.openCheckoutModal('${inv.id}')" class="px-3 py-1.5 rounded-lg text-xs font-bold text-[#003087] bg-[#FFC439] hover:bg-[#F2BA36] transition flex items-center space-x-1">
            <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" class="h-3.5 rounded" alt="PP">
            <span>PayPal Pay</span>
          </button>
        `;
      } else if (inv.status === "DRAFT") {
        actionButtons = `
          <button onclick="window.app.issueInvoiceToPaypal('${inv.id}')" class="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-paypal-blue hover:bg-paypal-light transition">
            Issue via PayPal
          </button>
        `;
      } else if (inv.status === "SETTLED") {
        actionButtons = `
          <div class="text-right">
            <span class="text-[11px] text-emerald-400 font-mono">Tx: ${inv.settlementDetails?.transactionId || 'PP-TX-8821'}</span>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="flex items-start space-x-3.5">
          <div class="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0">
            <i data-lucide="file-text" class="w-5 h-5 text-paypal-light"></i>
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <span class="font-bold text-white text-sm">${inv.projectTitle}</span>
              <span class="text-xs font-mono text-slate-500">${inv.id}</span>
            </div>
            <div class="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Client: <b class="text-slate-300">${inv.clientName}</b></span>
              <span>Due: <b class="text-slate-300 font-mono">${inv.dueDate}</b></span>
              ${inv.paypalInvoiceId ? `<a href="${inv.paypalPaymentLink}" target="_blank" class="text-paypal-light hover:underline font-mono text-[11px] flex items-center space-x-1"><i data-lucide="external-link" class="w-3 h-3"></i><span>PayPal Link</span></a>` : ''}
            </div>
          </div>
        </div>

        <div class="flex items-center space-x-4 self-end md:self-center">
          <div class="text-right">
            <div class="text-lg font-bold font-mono text-white">$${inv.amount.toLocaleString()}</div>
            <div class="mt-0.5">${statusBadge}</div>
          </div>
          <div class="flex items-center space-x-2">
            <button onclick="window.app.openDocPreview('${inv.id}')" title="Preview Official PayPal Document" class="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center space-x-1">
              <i data-lucide="file-text" class="w-3.5 h-3.5 text-paypal-light"></i>
              <span class="hidden sm:inline">Doc</span>
            </button>
            ${actionButtons}
          </div>
        </div>
      `;

      container.appendChild(card);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  async handleParseMilestone() {
    const textarea = document.getElementById("input-milestone-text");
    const prompt = textarea?.value?.trim();
    if (!prompt) return alert("Please enter a milestone note or click a preset above!");

    const btn = document.getElementById("btn-parse-milestone");
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i data-lucide="loader" class="w-4 h-4 animate-spin"></i><span>Gemini Parsing...</span>`;
    if (window.lucide) window.lucide.createIcons();

    try {
      const res = await fetch("/api/invoices/parse-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (data.success) {
        this.draftInvoice = data.invoice;
        this.renderParsedPreview(data.invoice);
        await this.fetchData();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to parse milestone.");
    } finally {
      btn.innerHTML = originalText;
      if (window.lucide) window.lucide.createIcons();
    }
  }

  renderParsedPreview(inv) {
    const preview = document.getElementById("parsed-invoice-preview");
    if (!preview) return;

    document.getElementById("preview-invoice-id").textContent = inv.id;
    document.getElementById("preview-client").textContent = inv.clientName;
    document.getElementById("preview-email").textContent = inv.clientEmail;
    document.getElementById("preview-amount").textContent = `$${inv.amount.toLocaleString()}.00`;
    document.getElementById("preview-due").textContent = `Due: ${inv.dueDate}`;

    const itemsContainer = document.getElementById("preview-line-items");
    itemsContainer.innerHTML = (inv.lineItems || []).map(item => `
      <div class="flex justify-between text-slate-300 py-1 border-b border-slate-800/40">
        <span>${item.description} (x${item.quantity})</span>
        <span class="font-mono text-white">$${item.amount || (item.quantity * item.unitPrice)}</span>
      </div>
    `).join("");

    preview.classList.remove("hidden");
  }

  async handleIssueDraftToPaypal() {
    if (!this.draftInvoice) return;
    await this.issueInvoiceToPaypal(this.draftInvoice.id);
    document.getElementById("parsed-invoice-preview").classList.add("hidden");
    document.getElementById("input-milestone-text").value = "";
    this.switchTab("pipeline");
  }

  async issueInvoiceToPaypal(id) {
    try {
      const res = await fetch(`/api/invoices/${id}/issue-paypal`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        await this.fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async simulatePastDue(id, days = 7) {
    try {
      const res = await fetch(`/api/invoices/${id}/simulate-past-due`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days })
      });
      const data = await res.json();
      if (data.success) {
        await this.fetchData();
        this.openWarRoomFor(id);
      }
    } catch (err) {
      console.error(err);
    }
  }

  openWarRoomFor(id) {
    const inv = this.invoices.find(i => i.id === id);
    if (inv) {
      this.activeInvoice = inv;
      window.agentChatUI.renderHistory(inv.negotiationHistory, inv);
      this.switchTab("war-room");
    }
  }

  async triggerA2ARound() {
    if (!this.activeInvoice) return;
    try {
      const res = await fetch(`/api/invoices/${this.activeInvoice.id}/agent-negotiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.success) {
        this.activeInvoice = data.invoice;
        window.agentChatUI.renderHistory(data.invoice.negotiationHistory, data.invoice);
        await this.fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async triggerAutoConsensus() {
    await this.triggerA2ARound();
    setTimeout(async () => {
      await this.triggerA2ARound();
    }, 1000);
  }

  async openCheckoutModal(id) {
    const inv = this.invoices.find(i => i.id === id);
    if (!inv) return;
    this.activeInvoice = inv;

    document.getElementById("modal-invoice-id").textContent = inv.id;
    
    let payAmount = inv.amount;
    let label = "Full Contract Settlement";
    if (inv.agreedTerms?.immediatePaymentAmount) {
      payAmount = inv.agreedTerms.immediatePaymentAmount;
      label = `A2A Negotiated Installment #1 (50% + late fee)`;
    }

    document.getElementById("modal-terms-label").textContent = label;
    document.getElementById("modal-amount").textContent = `$${payAmount.toLocaleString()}.00 USD`;

    document.getElementById("paypal-modal").classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  }

  closeCheckoutModal() {
    document.getElementById("paypal-modal").classList.add("hidden");
  }

  async confirmPayment() {
    if (!this.activeInvoice) return;
    this.closeCheckoutModal();

    try {
      const res = await fetch(`/api/invoices/${this.activeInvoice.id}/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.success) {
        this.celebrateSettlement();
        await this.fetchData();
        if (this.activeTab === "war-room") {
          window.agentChatUI.renderHistory(data.invoice.negotiationHistory, data.invoice);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  celebrateSettlement() {
    this.playSettlementChime();
    // Canvas confetti burst
    if (window.confetti) {
      window.confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }

  async loadGuardrails() {
    try {
      const res = await fetch("/api/guardrails");
      const g = await res.json();
      
      const setVal = (id, labelId, val, suffix = "%") => {
        const inp = document.getElementById(id);
        const lbl = document.getElementById(labelId);
        if (inp) inp.value = val;
        if (lbl) lbl.textContent = `${val}${suffix}`;
      };

      setVal("input-max-discount", "label-max-discount", g.maxDiscountPercent, "%");
      setVal("input-late-fee", "label-late-fee", g.lateFeePercentPerWeek, "%");
      setVal("input-max-installments", "label-max-installments", g.maxInstallments, " parts");
      setVal("input-min-upfront", "label-min-upfront", g.minUpfrontPercent, "%");
      setVal("input-tax-reserve", "label-tax-reserve", g.taxReservePercent, "%");
    } catch (err) {
      console.error("Error loading guardrails:", err);
    }
  }

  async handleSaveGuardrails(e) {
    e.preventDefault();
    const payload = {
      maxDiscountPercent: parseFloat(document.getElementById("input-max-discount").value),
      lateFeePercentPerWeek: parseFloat(document.getElementById("input-late-fee").value),
      maxInstallments: parseInt(document.getElementById("input-max-installments").value, 10),
      minUpfrontPercent: parseFloat(document.getElementById("input-min-upfront").value),
      taxReservePercent: parseFloat(document.getElementById("input-tax-reserve").value)
    };

    try {
      const res = await fetch("/api/guardrails", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert("Guardrails saved successfully! Autonomous agent updated.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async renderLedger() {
    try {
      const res = await fetch("/api/ledger");
      const data = await res.json();
      
      const elTaxTotal = document.getElementById("ledger-tax-reserve-total");
      if (elTaxTotal) elTaxTotal.textContent = `$${data.metrics.taxReserve?.toLocaleString() || 0}.00`;

      const gridDiv = document.getElementById("ledger-ag-grid");
      if (!gridDiv || !window.agGrid) return;

      if (!this.ledgerGridApi) {
        const gridOptions = {
          theme: "legacy",
          rowData: data.ledger || [],
          columnDefs: [
            { field: "id", headerName: "Tx ID", width: 120, cellClass: "font-mono font-bold text-white" },
            { field: "date", headerName: "Date", width: 110, cellClass: "font-mono text-slate-400" },
            { field: "client", headerName: "Client", width: 170, cellClass: "font-semibold text-slate-200" },
            { field: "description", headerName: "Deliverable / Reason", flex: 1, minWidth: 200, cellClass: "text-slate-300" },
            { 
              field: "gross", 
              headerName: "Gross ($)", 
              width: 115, 
              valueFormatter: p => `$${p.value?.toLocaleString()}`,
              cellClass: "font-mono font-bold text-slate-200 text-right"
            },
            { 
              field: "net", 
              headerName: "Net PayPal ($)", 
              width: 125, 
              valueFormatter: p => `$${p.value?.toLocaleString()}`,
              cellClass: "font-mono font-bold text-emerald-400 text-right"
            },
            { 
              field: "taxAllocated", 
              headerName: "Tax Swept (25%)", 
              width: 135, 
              valueFormatter: p => `$${p.value?.toLocaleString()}`,
              cellClass: "font-mono font-bold text-indigo-400 text-right"
            },
            {
              field: "type",
              headerName: "Status",
              width: 140,
              cellRenderer: () => `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">PayPal Settled</span>`
            }
          ],
          defaultColDef: {
            sortable: true,
            filter: true,
            resizable: true
          },
          pagination: true,
          paginationPageSize: 10
        };

        this.ledgerGridApi = window.agGrid.createGrid(gridDiv, gridOptions);

        // Connect quick filter search
        const searchInput = document.getElementById("ledger-search-input");
        if (searchInput) {
          searchInput.addEventListener("input", (e) => {
            if (this.ledgerGridApi.setGridOption) {
              this.ledgerGridApi.setGridOption("quickFilterText", e.target.value);
            } else if (this.ledgerGridApi.setQuickFilter) {
              this.ledgerGridApi.setQuickFilter(e.target.value);
            }
          });
        }

        // Connect CSV Export
        const exportBtn = document.getElementById("btn-export-csv");
        if (exportBtn) {
          exportBtn.addEventListener("click", () => {
            this.ledgerGridApi.exportDataAsCsv({ fileName: `settlr-ledger-${Date.now()}.csv` });
          });
        }
      } else {
        if (this.ledgerGridApi.setGridOption) {
          this.ledgerGridApi.setGridOption("rowData", data.ledger || []);
        } else if (this.ledgerGridApi.setRowData) {
          this.ledgerGridApi.setRowData(data.ledger || []);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  // --- Audio Settlement Chime System (Web Audio API Synthesizer) ---
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    const icon = document.getElementById("icon-sound");
    if (icon) {
      icon.setAttribute("data-lucide", this.soundEnabled ? "volume-2" : "volume-x");
      icon.className = `w-3.5 h-3.5 ${this.soundEnabled ? 'text-emerald-400' : 'text-slate-500'}`;
      if (window.lucide) window.lucide.createIcons();
    }
  }

  playSettlementChime() {
    if (!this.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playTone = (freq, start, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // Two-tone bell chime (D5 -> A5 -> D6)
      playTone(587.33, 0.0, 0.22);
      playTone(880.00, 0.12, 0.32);
      playTone(1174.66, 0.24, 0.55);
    } catch (e) {
      console.warn("Audio chime failed or was blocked:", e);
    }
  }

  // --- Voice-to-Text Input (Web Speech API - Click Only!) ---
  setupVoiceInput() {
    const micBtn = document.getElementById("btn-voice-input");
    const voiceStatus = document.getElementById("voice-status");
    const textarea = document.getElementById("input-milestone-text");
    if (!micBtn) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      micBtn.addEventListener("click", () => {
        alert("Speech dictation is supported in Google Chrome & Microsoft Edge browsers. You can also type directly!");
      });
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = "en-US";

      this.recognition.onstart = () => {
        this.isListening = true;
        micBtn.classList.add("mic-active");
        if (voiceStatus) voiceStatus.classList.remove("hidden");
      };

      this.recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (textarea && transcript.trim().length > 0) {
          textarea.value = transcript;
        }
      };

      this.recognition.onerror = (err) => {
        console.warn("Speech recognition error:", err);
        this.stopVoiceInput();
      };

      this.recognition.onend = () => {
        this.stopVoiceInput();
      };

      micBtn.addEventListener("click", () => {
        if (this.isListening) {
          this.stopVoiceInput();
        } else {
          try {
            this.recognition.start();
          } catch (err) {
            console.warn(err);
          }
        }
      });
    } catch (err) {
      console.warn("Speech recognition init error:", err);
    }
  }

  stopVoiceInput() {
    this.isListening = false;
    const micBtn = document.getElementById("btn-voice-input");
    const voiceStatus = document.getElementById("voice-status");
    if (micBtn) micBtn.classList.remove("mic-active");
    if (voiceStatus) voiceStatus.classList.add("hidden");
    if (this.recognition) {
      try { this.recognition.stop(); } catch (e) {}
    }
  }

  // --- Official PayPal Invoice Document Preview Drawer ---
  openDocPreview(invoiceId) {
    let inv = this.invoices.find(i => i.id === invoiceId);
    if (!inv && this.draftInvoice && this.draftInvoice.id === invoiceId) {
      inv = this.draftInvoice;
    }
    if (!inv) inv = this.invoices[0];
    if (!inv) return;

    document.getElementById("doc-inv-number").textContent = inv.id;
    document.getElementById("doc-client-name").textContent = inv.clientName || "Valued Client";
    document.getElementById("doc-client-email").textContent = inv.clientEmail || "ap@client.io";
    document.getElementById("doc-issue-date").textContent = inv.createdAt || new Date().toISOString().split("T")[0];
    document.getElementById("doc-due-date").textContent = inv.dueDate || "Net 14";

    const tbody = document.getElementById("doc-items-tbody");
    if (tbody) {
      tbody.innerHTML = (inv.lineItems || []).map(item => `
        <tr class="hover:bg-slate-50 transition">
          <td class="py-2.5 px-3 font-semibold text-slate-800">${item.description}</td>
          <td class="py-2.5 px-3 text-center text-slate-600">${item.quantity || 1}</td>
          <td class="py-2.5 px-3 text-right text-slate-600">$${(item.unitPrice || item.amount)?.toLocaleString()}</td>
          <td class="py-2.5 px-3 text-right font-bold text-slate-900">$${(item.amount || (item.quantity * item.unitPrice))?.toLocaleString()}</td>
        </tr>
      `).join("");
    }

    const subtotal = inv.amount || 1000;
    const lateFee = (inv.status === "PAST_DUE" || inv.status === "NEGOTIATING") ? Math.round(subtotal * 0.05) : 0;
    const total = subtotal + lateFee;

    document.getElementById("doc-subtotal").textContent = `$${subtotal.toLocaleString()}.00`;
    document.getElementById("doc-late-fee").textContent = `$${lateFee.toLocaleString()}.00`;
    document.getElementById("doc-total-amount").textContent = `$${total.toLocaleString()}.00 USD`;

    document.getElementById("doc-preview-modal")?.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  }

  closeDocPreview() {
    document.getElementById("doc-preview-modal")?.classList.add("hidden");
  }

  // --- Client Perspective Email Inbox Simulator ---
  openEmailSimulator() {
    document.getElementById("client-email-modal")?.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  }

  closeEmailSimulator() {
    document.getElementById("client-email-modal")?.classList.add("hidden");
  }

  switchEmailTab(type, activeBtn) {
    document.querySelectorAll(".email-tab-btn").forEach(b => {
      b.className = "email-tab-btn w-full p-3 text-left hover:bg-slate-900 transition flex flex-col space-y-1";
    });
    activeBtn.className = "email-tab-btn w-full p-3 text-left hover:bg-slate-900 transition flex flex-col space-y-1 bg-slate-900/80 border-l-2 border-paypal-blue";

    const subjectEl = document.getElementById("sim-email-subject");
    const amountEl = document.getElementById("sim-email-amount");
    const statusChipEl = document.getElementById("sim-email-status-chip");

    if (type === "new-invoice") {
      if (subjectEl) subjectEl.textContent = "Kunal Gupta sent you an invoice for $2,800.00 USD";
      if (amountEl) amountEl.textContent = "$2,800.00 USD";
      if (statusChipEl) {
        statusChipEl.textContent = "ISSUED (NET 14)";
        statusChipEl.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-paypal-blue";
      }
    } else if (type === "overdue-notice") {
      if (subjectEl) subjectEl.textContent = "URGENT NOTICE: Invoice INV-2026-081 is 7 Days Past Due";
      if (amountEl) amountEl.textContent = "$2,884.00 USD (Includes Late Fee)";
      if (statusChipEl) {
        statusChipEl.textContent = "PAST DUE - ESCALATED";
        statusChipEl.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-600";
      }
    } else if (type === "agreement-settle") {
      if (subjectEl) subjectEl.textContent = "A2A Consensus Reached: Revised Settlement Schedule";
      if (amountEl) amountEl.textContent = "$1,442.00 USD (Milestone #1 of 2)";
      if (statusChipEl) {
        statusChipEl.textContent = "AGREED - READY TO PAY";
        statusChipEl.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700";
      }
    }
  }

  async resetDemo() {
    try {
      const res = await fetch("/api/demo/reset", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        window.demoRunner.currentStep = 0;
        window.demoRunner.updateBanner("Click <b>\"3-Min Hackathon Demo\"</b> to start the judge walkthrough flow.", 0);
        await this.fetchData();
        this.openWarRoomFor("INV-2026-081");
        this.switchTab("pipeline");
      }
    } catch (err) {
      console.error(err);
    }
  }
}

window.app = new App();
document.addEventListener("DOMContentLoaded", () => window.app.init());
