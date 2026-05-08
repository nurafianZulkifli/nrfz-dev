 // ── State ──────────────────────────────────────────────────────────────
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  let state = load();

  function defaultState() {
    const now = new Date();
    const id = uid();
    return {
      activeAccountId: id,
      activeMonth: now.getMonth(),
      activeYear: now.getFullYear(),
      accounts: [{
        id,
        name: 'Commitments',
        allocated: 0,
        transactions: []
      }]
    };
  }

  function load() {
    try {
      const s = JSON.parse(localStorage.getItem('fintrack'));
      if (!s) return defaultState();
      // Migrate flat state (pre-accounts structure)
      if (s.transactions && !s.accounts) {
        const id = uid();
        return {
          activeAccountId: id,
          activeMonth: s.activeMonth != null ? s.activeMonth : new Date().getMonth(),
          activeYear: s.activeYear || new Date().getFullYear(),
          accounts: [{ id, name: 'Commitments', allocated: s.allocated || 0, transactions: s.transactions || [] }]
        };
      }
      return s;
    } catch { return defaultState(); }
  }
  function save() { localStorage.setItem('fintrack', JSON.stringify(state)); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
  function activeAccount() {
    return state.accounts.find(a => a.id === state.activeAccountId) || state.accounts[0];
  }

  // ── Computed ───────────────────────────────────────────────────────────
  function filteredTxns() {
    return activeAccount().transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === state.activeMonth && d.getFullYear() === state.activeYear;
    });
  }

  // Balance is always cumulative across ALL months — month tabs only filter the list view
  function calcBalance() {
    const acct = activeAccount();
    const totalSpent = acct.transactions.filter(t => t.type === 'debit').reduce((s,t) => s + t.amount, 0);
    return { totalSpent, remaining: acct.allocated - totalSpent };
  }

  // ── Render ─────────────────────────────────────────────────────────────
  function renderAll() {
    renderAccountSwitcher();
    renderMonthTabs();
    renderBalance();
    renderTxns();
  }

  function renderAccountSwitcher() {
    const el = document.getElementById('acctSwitcherName');
    if (el) el.textContent = activeAccount().name;
  }

  function renderMonthTabs() {
    const now = new Date();
    const cur = now.getMonth(), curY = now.getFullYear();
    // show 3 months before and 2 after active
    const tabs = [];
    for (let i = -3; i <= 2; i++) {
      let m = state.activeMonth + i, y = state.activeYear;
      while (m < 0) { m += 12; y--; }
      while (m > 11) { m -= 12; y++; }
      tabs.push({ m, y });
    }
    const container = document.getElementById('monthTabs');
    container.innerHTML = tabs.map(({m, y}) => {
      const active = m === state.activeMonth && y === state.activeYear;
      return `<button class="month-btn${active?' active':''}" onclick="setMonth(${m},${y})">${MONTHS[m]}</button>`;
    }).join('');
  }

  function renderBalance() {
    const { totalSpent, remaining } = calcBalance();
    const alloc = activeAccount().allocated;
    const pct = alloc > 0 ? Math.min((totalSpent / alloc) * 100, 100) : 0;

    document.getElementById('allocatedDisplay').textContent = fmt(alloc);
    document.getElementById('spentDisplay').textContent = fmt(totalSpent);
    const remEl = document.getElementById('remainingDisplay');
    remEl.textContent = fmt(Math.abs(remaining));
    remEl.className = 'balance-amount ' + (remaining >= 0 ? 'positive' : 'negative');

    const bar = document.getElementById('progressBar');
    bar.style.width = pct + '%';
    bar.className = 'ft-progress-bar' + (pct >= 90 ? ' danger' : pct >= 70 ? ' warn' : '');

    document.getElementById('progressPct').textContent = pct.toFixed(0) + '% used';
    document.getElementById('progressLeft').textContent = (remaining >= 0 ? fmt(remaining) + ' left' : fmt(Math.abs(remaining)) + ' over budget');
  }

  function renderTxns() {
    const txns = filteredTxns().sort((a,b) => new Date(b.date) - new Date(a.date));
    const section = document.getElementById('txnSection');
    if (!txns.length) {
      section.innerHTML = `<div class="empty-state"><i class="fa-regular fa-inbox"></i><div>No transactions for ${MONTH_NAMES[state.activeMonth]} ${state.activeYear}</div></div>`;
      return;
    }
    // group by date
    const groups = {};
    txns.forEach(t => {
      if (!groups[t.date]) groups[t.date] = [];
      groups[t.date].push(t);
    });
    section.innerHTML = Object.entries(groups).sort((a,b) => new Date(b[0]) - new Date(a[0])).map(([date, items]) => `
      <div style="margin-bottom:18px">
        <div class="txn-date-label">${fmtDate(date)}</div>
        <div class="txn-group-card">
          ${items.map(t => `
            <div class="txn-item" onclick="openEdit('${t.id}')">
              <div class="txn-icon ${iconClass(t.cat)}">${iconEmoji(t.cat)}</div>
              <div class="txn-info">
                <div class="txn-name">${esc(t.name)}</div>
                <div class="txn-cat">${esc(t.cat)}</div>
              </div>
              <div class="txn-amount ${t.type === 'debit' ? 'debit' : 'credit'}">${t.type === 'debit' ? '−' : '+'}${fmt(t.amount)}</div>
            </div>`).join('')}
        </div>
      </div>`).join('');
  }

  // ── Helpers ────────────────────────────────────────────────────────────
  function fmt(n) { return 'SGD ' + n.toFixed(2); }
  function fmtDate(s) {
    const d = new Date(s + 'T00:00:00');
    return d.toLocaleDateString('en-SG', { weekday:'short', day:'numeric', month:'short', year:'numeric' }).toUpperCase();
  }
  function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function iconClass(cat) {
    if (cat === 'ATM') return 'atm';
    if (cat === 'Transfer') return 'income';
    if (cat === 'Bills') return 'bills';
    if (['Point-of-Sale','Food','Transport'].includes(cat)) return 'pos';
    return 'other';
  }
  function iconEmoji(cat) {
    const map = {
      'Point-of-Sale': '<i class="fa-regular fa-bag-shopping"></i>',
      'ATM':           '<i class="fa-regular fa-building-columns"></i>',
      'Transfer':      '<i class="fa-regular fa-money-bill-transfer"></i>',
      'Bills':         '<i class="fa-regular fa-file-invoice"></i>',
      'Food':          '<i class="fa-regular fa-utensils"></i>',
      'Transport':     '<i class="fa-regular fa-bus"></i>',
      'Others':        '<i class="fa-regular fa-credit-card"></i>'
    };
    return map[cat] || '<i class="fa-regular fa-credit-card"></i>';
  }

  // ── Month nav ──────────────────────────────────────────────────────────
  function setMonth(m, y) {
    state.activeMonth = m;
    state.activeYear = y;
    save();
    renderAll();
  }

  // ── Add / Edit ─────────────────────────────────────────────────────────
  let editingId = null;
  let currentType = 'debit';

  function openAdd() {
    editingId = null;
    currentType = 'debit';
    document.getElementById('sheetTitle').textContent = 'Add Transaction';
    document.getElementById('txnName').value = '';
    document.getElementById('txnAmount').value = '';
    document.getElementById('txnCat').value = 'Point-of-Sale';
    const today = new Date();
    document.getElementById('txnDate').value = today.toISOString().slice(0,10);
    document.getElementById('deleteBtn').style.display = 'none';
    setType('debit');
    openOverlay('addOverlay');
    setTimeout(() => document.getElementById('txnName').focus(), 300);
  }

  function openEdit(id) {
    const t = activeAccount().transactions.find(x => x.id === id);
    if (!t) return;
    editingId = id;
    currentType = t.type;
    document.getElementById('sheetTitle').textContent = 'Edit Transaction';
    document.getElementById('txnName').value = t.name;
    document.getElementById('txnAmount').value = t.amount;
    document.getElementById('txnCat').value = t.cat;
    document.getElementById('txnDate').value = t.date;
    document.getElementById('deleteBtn').style.display = '';
    setType(t.type);
    openOverlay('addOverlay');
  }

  function setType(type) {
    currentType = type;
    const db = document.getElementById('typeDebit');
    const cb = document.getElementById('typeCredit');
    db.className = 'type-btn' + (type === 'debit' ? ' active-debit' : '');
    cb.className = 'type-btn' + (type === 'credit' ? ' active-credit' : '');
  }

  function saveTxn() {
    const name = document.getElementById('txnName').value.trim();
    const amount = parseFloat(document.getElementById('txnAmount').value);
    const cat = document.getElementById('txnCat').value;
    const date = document.getElementById('txnDate').value;
    if (!name) { showToast('Please enter a description'); return; }
    if (!amount || amount <= 0) { showToast('Please enter a valid amount'); return; }
    if (!date) { showToast('Please select a date'); return; }

    if (editingId) {
      const txns = activeAccount().transactions;
      const idx = txns.findIndex(x => x.id === editingId);
      if (idx !== -1) txns[idx] = { ...txns[idx], name, amount, cat, date, type: currentType };
      showToast('Transaction updated');
    } else {
      activeAccount().transactions.push({ id: uid(), name, amount, cat, date, type: currentType });
      showToast('Transaction added');
    }
    save();
    closeOverlay('addOverlay');
    renderAll();
  }

  function deleteCurrentTxn() {
    if (!editingId) return;
    if (!confirm('Delete this transaction?')) return;
    const acct = activeAccount();
    acct.transactions = acct.transactions.filter(x => x.id !== editingId);
    save();
    closeOverlay('addOverlay');
    renderAll();
    showToast('Transaction deleted');
  }

  // ── Settings ───────────────────────────────────────────────────────────
  function openSettings() {
    const acct = activeAccount();
    document.getElementById('settingsAcctName').value = acct.name;
    document.getElementById('settingsAllocated').value = acct.allocated;
    document.getElementById('settingsMonth').value = state.activeMonth;
    document.getElementById('settingsYear').value = state.activeYear;
    document.getElementById('deleteAccountBtn').style.display = '';
    openOverlay('settingsOverlay');
  }

  function saveSettings() {
    const name = document.getElementById('settingsAcctName').value.trim();
    const alloc = parseFloat(document.getElementById('settingsAllocated').value);
    const month = parseInt(document.getElementById('settingsMonth').value);
    const year = parseInt(document.getElementById('settingsYear').value);
    if (!name) { showToast('Enter an account name'); return; }
    if (!alloc || alloc <= 0) { showToast('Enter a valid allocated amount'); return; }
    if (!year || year < 2020) { showToast('Enter a valid year'); return; }
    const acct = activeAccount();
    acct.name = name;
    acct.allocated = alloc;
    state.activeMonth = month;
    state.activeYear = year;
    save();
    closeOverlay('settingsOverlay');
    renderAll();
    showToast('Settings saved');
  }

  // ── Overlay ────────────────────────────────────────────────────────────
  function openOverlay(id) { document.getElementById(id).classList.add('open'); }
  function closeOverlay(id) { document.getElementById(id).classList.remove('open'); }
  function closeOnBackdrop(e, id) { if (e.target === document.getElementById(id)) closeOverlay(id); }

  // ── Toast ──────────────────────────────────────────────────────────────
  let toastTimer;
  function showToast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  // ── Accounts ────────────────────────────────────────────────────────────
  function openAddAccount() {
    document.getElementById('newAcctName').value = '';
    document.getElementById('newAcctAllocated').value = '';
    openOverlay('addAccountOverlay');
    setTimeout(() => document.getElementById('newAcctName').focus(), 300);
  }

  function saveAccount() {
    const name = document.getElementById('newAcctName').value.trim();
    const alloc = parseFloat(document.getElementById('newAcctAllocated').value);
    if (!name) { showToast('Enter an account name'); return; }
    if (!alloc || alloc <= 0) { showToast('Enter a valid allocated amount'); return; }
    const id = uid();
    state.accounts.push({ id, name, allocated: alloc, transactions: [] });
    state.activeAccountId = id;
    save();
    closeOverlay('addAccountOverlay');
    renderAll();
    showToast('Account created');
  }

  function openAccountSwitcher() {
    renderAccountList();
    openOverlay('acctSwitcherOverlay');
  }

  function renderAccountList() {
    const list = document.getElementById('acctList');
    list.innerHTML = state.accounts.map(a => {
      const spent = a.transactions.filter(t => t.type === 'debit').reduce((s,t) => s + t.amount, 0);
      const rem = a.allocated - spent;
      const active = a.id === state.activeAccountId;
      return `
        <div class="acct-item${active ? ' active' : ''}" onclick="switchAccount('${a.id}')">
          <div class="acct-item-icon"><i class="fa-regular fa-wallet"></i></div>
          <div class="acct-item-info">
            <div class="acct-item-name">${esc(a.name)}</div>
            <div class="acct-item-balance">${fmt(rem)} remaining</div>
          </div>
          ${active ? '<i class="fa-regular fa-check acct-item-check"></i>' : ''}
          <button class="acct-delete-btn" onclick="event.stopPropagation(); deleteAccount('${a.id}')" title="Delete account">
            <i class="fa-regular fa-trash"></i>
          </button>
        </div>`;
    }).join('');
  }

  function switchAccount(id) {
    if (!state.accounts.find(a => a.id === id)) return;
    state.activeAccountId = id;
    save();
    closeOverlay('acctSwitcherOverlay');
    renderAll();
  }

  function deleteAccount(id) {
    const targetId = id || state.activeAccountId;
    const acct = state.accounts.find(a => a.id === targetId);
    if (!acct) return;
    if (!confirm('Delete "' + acct.name + '" and all its transactions?')) return;
    state.accounts = state.accounts.filter(a => a.id !== targetId);
    if (state.accounts.length === 0) {
      state = defaultState();
    } else {
      if (state.activeAccountId === targetId) state.activeAccountId = state.accounts[0].id;
    }
    save();
    closeOverlay('settingsOverlay');
    closeOverlay('acctSwitcherOverlay');
    renderAll();
    showToast('Account deleted');
  }

  // ── Init ───────────────────────────────────────────────────────────────
  renderAll();
  if (window.location.hash === '#addAccount') {
    history.replaceState(null, '', window.location.pathname);
    openAddAccount();
  }