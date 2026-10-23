/* PenanceOS Desktop — icons, context menus, file manager */
(function(){
  const P = window.PaneOS;
  if(!P) return;

  // ===== DESKTOP ICONS =====
  const DESKTOP_ICONS = [
    { id: 'terminal', icon: '>_', label: 'Terminal', app: 'terminal' },
    { id: 'files', icon: '📁', label: 'Files', app: 'filemanager' },
    { id: 'editor', icon: '📝', label: 'Editor', app: 'editor' },
    { id: 'sysmon', icon: '📊', label: 'System', app: 'sysmon' },
    { id: 'about', icon: 'ℹ️', label: 'About', app: 'about' },
  ];

  let desktopArea = null;

  P.initDesktop = (container) => {
    desktopArea = container;
    renderIcons();
    initContextMenu();
  };

  function renderIcons() {
    if(!desktopArea) return;
    const iconContainer = P.el('div', { className: 'pane-desktop-icons' });

    DESKTOP_ICONS.forEach(item => {
      const icon = P.el('div', { className: 'pane-desktop-icon' });
      icon.ondblclick = () => {
        const app = P.getApp(item.app);
        if(app) {
          P.openWindow({ title: app.name||item.id, icon: app.icon, app: item.id, w: app.defaultW, h: app.defaultH });
        }
      };
      icon.appendChild(P.el('div', { className: 'pane-desktop-icon-img' }, item.icon));
      icon.appendChild(P.el('div', { className: 'pane-desktop-icon-label' }, item.label));
      iconContainer.appendChild(icon);
    });

    desktopArea.appendChild(iconContainer);
  }

  // ===== CONTEXT MENU =====
  let ctxMenu = null;

  function initContextMenu() {
    ctxMenu = P.el('div', { className: 'pane-ctx-menu' });
    document.body.appendChild(ctxMenu);

    document.addEventListener('contextmenu', (e) => {
      if(e.target.closest('.pane-window') || e.target.closest('.pane-os-panel')) return;
      e.preventDefault();
      showContextMenu(e.clientX, e.clientY);
    });

    document.addEventListener('click', () => hideContextMenu());
    document.addEventListener('keydown', (e) => { if(e.key === 'Escape') hideContextMenu(); });
  }

  function showContextMenu(x, y) {
    ctxMenu.innerHTML = '';
    const items = [
      { label: 'Open Terminal', icon: '>_', action: () => openApp('terminal') },
      { label: 'Open File Manager', icon: '📁', action: () => openApp('filemanager') },
      { label: 'Open Text Editor', icon: '📝', action: () => openApp('editor') },
      { sep: true },
      { label: 'System Monitor', icon: '📊', action: () => openApp('sysmon') },
      { sep: true },
      { label: 'Tile Windows', icon: '⊞', shortcut: 'Ctrl+Shift+T', action: () => tileAll() },
      { label: 'Cascade Windows', icon: '⊞', action: () => cascadeAll() },
      { sep: true },
      { label: 'About PenanceOS', icon: 'ℹ️', action: () => openApp('about') },
    ];

    items.forEach(item => {
      if(item.sep) {
        ctxMenu.appendChild(P.el('div', { className: 'pane-ctx-sep' }));
        return;
      }
      const el = P.el('button', { className: 'pane-ctx-item' });
      el.appendChild(P.el('span', { className: 'pane-ctx-item-icon' }, item.icon));
      el.appendChild(P.el('span', {}, item.label));
      if(item.shortcut) el.appendChild(P.el('span', { className: 'pane-ctx-item-shortcut' }, item.shortcut));
      el.onclick = (e) => { e.stopPropagation(); item.action(); hideContextMenu(); };
      ctxMenu.appendChild(el);
    });

    // Position
    ctxMenu.style.left = Math.min(x, window.innerWidth - 200) + 'px';
    ctxMenu.style.top = Math.min(y, window.innerHeight - ctxMenu.children.length * 32) + 'px';
    ctxMenu.classList.add('visible');
  }

  function hideContextMenu() {
    if(ctxMenu) ctxMenu.classList.remove('visible');
  }

  function openApp(id) {
    const app = P.getApp(id);
    if(app) P.openWindow({ title: app.name||id, icon: app.icon, app: id, w: app.defaultW, h: app.defaultH });
  }

  function tileAll() {
    const s = P.getState();
    const vis = s.windows.filter(w => w.workspace === s.activeWorkspace);
    if(vis.length === 0) return;
    const panelH = 32;
    const w = window.innerWidth;
    const h = window.innerHeight - panelH;
    const cols = Math.ceil(Math.sqrt(vis.length));
    const rows = Math.ceil(vis.length / cols);
    const cw = Math.floor(w / cols);
    const ch = Math.floor(h / rows);
    vis.forEach((win, i) => {
      P.updateWindow(win.id, {
        x: (i % cols) * cw,
        y: Math.floor(i / cols) * ch,
        w: cw,
        h: ch,
        maximized: false,
      });
    });
  }

  function cascadeAll() {
    const s = P.getState();
    const vis = s.windows.filter(w => w.workspace === s.activeWorkspace);
    vis.forEach((win, i) => {
      P.updateWindow(win.id, {
        x: 80 + i * 30,
        y: 50 + i * 30,
        w: 640,
        h: 420,
        maximized: false,
      });
    });
  }

  // ===== FILE MANAGER APP =====
  P.registerApp('filemanager', {
    name: 'Files',
    icon: '📁',
    description: 'PenanceOS file manager',
    defaultW: 720,
    defaultH: 460,

    render(bodyEl, win) {
      const sync = P.getState().gameSync;
      const fm = P.el('div', { className: 'pane-filemanager', style: { height: '100%' } });

      // Sidebar
      const sidebar = P.el('div', { className: 'pane-fm-sidebar' });
      const sidebarLabel = P.el('div', { className: 'pane-fm-sidebar-label' }, 'Places');
      sidebar.appendChild(sidebarLabel);

      const places = [
        { name: 'Home', icon: '🏠', path: '/home/user' },
        { name: 'Documents', icon: '📄', path: '/home/user/Documents' },
        { name: 'Downloads', icon: '⬇️', path: '/home/user/Downloads' },
        { name: 'Desktop', icon: '🖥️', path: '/home/user/Desktop' },
        { name: 'Config', icon: '⚙️', path: '/home/user/.config' },
        { sep: true },
        { name: 'Game Files', icon: '🎮', path: '/game' },
      ];

      if(sync.homesOwned?.length) {
        sidebar.appendChild(P.el('div', { className: 'pane-fm-sidebar-label' }, 'Homes'));
        sync.homesOwned.forEach(id => {
          const h = (sync.homes||{})[id];
          if(h) {
            const item = P.el('div', { className: 'pane-fm-sidebar-item' });
            item.innerHTML = `🏠 ${h.name}`;
            item.title = h.city;
            sidebar.appendChild(item);
          }
        });
      }

      places.forEach(p => {
        if(p.sep) { sidebar.appendChild(P.el('div', { className: 'pane-fm-sidebar-label' }, '────────')); return; }
        const item = P.el('div', { className: 'pane-fm-sidebar-item' });
        item.innerHTML = `${p.icon} ${p.name}`;
        sidebar.appendChild(item);
      });

      // Content
      const content = P.el('div', { className: 'pane-fm-content' });

      // Path bar
      const pathBar = P.el('div', { className: 'pane-fm-path' });
      pathBar.innerHTML = '<span class="pane-fm-path-seg">~</span> / <span class="pane-fm-path-seg">Documents</span>';
      content.appendChild(pathBar);

      // Grid
      const grid = P.el('div', { className: 'pane-fm-grid' });
      const files = [
        { name: 'readme.txt', icon: '📄', type: 'file' },
        { name: '.bashrc', icon: '⚙️', type: 'file' },
        { name: 'projects', icon: '📁', type: 'dir' },
        { name: 'notes.md', icon: '📝', type: 'file' },
        { name: 'saves', icon: '📁', type: 'dir' },
        { name: 'keybinds.conf', icon: '⚙️', type: 'file' },
      ];
      files.forEach(f => {
        const item = P.el('div', { className: 'pane-fm-item' });
        item.innerHTML = `<div class="pane-fm-item-icon">${f.icon}</div><div class="pane-fm-item-name">${f.name}</div>`;
        grid.appendChild(item);
      });
      content.appendChild(grid);

      fm.append(sidebar, content);
      bodyEl.appendChild(fm);
    }
  });

  // ===== TEXT EDITOR APP =====
  P.registerApp('editor', {
    name: 'Editor',
    icon: '📝',
    description: 'PenanceOS text editor',
    defaultW: 640,
    defaultH: 440,

    render(bodyEl, win) {
      const ed = P.el('div', { className: 'pane-editor', style: { height: '100%' } });
      const toolbar = P.el('div', { className: 'pane-editor-toolbar' });
      toolbar.innerHTML = '<button>New</button><button>Open</button><button>Save</button><button>Find</button>';
      const textarea = P.el('textarea', { placeholder: 'Start typing...\n\nPenanceOS Text Editor v1.0', spellcheck: 'false' });
      textarea.value = '# Welcome to PenanceOS\n\nThis is a minimal text editor.\nWrite your scripts, configs, or notes here.\n\nTip: Use the terminal for faster editing.\n';
      ed.append(toolbar, textarea);
      bodyEl.appendChild(ed);
    }
  });

  // ===== SYSTEM MONITOR APP =====
  P.registerApp('sysmon', {
    name: 'System Monitor',
    icon: '📊',
    description: 'PenanceOS system monitor',
    defaultW: 560,
    defaultH: 400,

    render(bodyEl, win) {
      const sync = P.getState().gameSync;
      const sm = P.el('div', { className: 'pane-sysmon', style: { height: '100%', overflow: 'auto' } });

      const grid = P.el('div', { className: 'pane-sysmon-grid' });

      const cpu = Math.floor(Math.random() * 40 + 10);
      const ram = Math.floor(Math.random() * 60 + 20);
      const net = Math.floor(Math.random() * 80 + 5);

      const cards = [
        { label: 'CPU USAGE', val: cpu + '%', fill: cpu, color: cpu > 80 ? 'var(--red)' : 'var(--accent)' },
        { label: 'MEMORY', val: ram + '%', fill: ram, color: ram > 80 ? 'var(--amber)' : 'var(--accent)' },
        { label: 'NETWORK', val: net + ' KB/s', fill: net, color: 'var(--cyan)' },
        { label: 'PROCESSES', val: P.getState().windows.length + ' active', fill: Math.min(100, P.getState().windows.length * 20), color: 'var(--green)' },
      ];

      cards.forEach(c => {
        const card = P.el('div', { className: 'pane-sysmon-card' });
        card.innerHTML = `
          <h3>${c.label}</h3>
          <div class="pane-sysmon-val" style="color:${c.color}">${c.val}</div>
          <div class="pane-sysmon-bar"><div class="pane-sysmon-bar-fill" style="width:${c.fill}%;background:${c.color}"></div></div>
        `;
        grid.appendChild(card);
      });

      // Game info
      const gameCard = P.el('div', { className: 'pane-sysmon-card', style: { gridColumn: 'span 2' } });
      gameCard.innerHTML = `
        <h3>GAME INFO</h3>
        <div style="font:11px var(--font-mono);color:var(--text-dim);display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:6px">
          <div>Player: ${sync.playerName || '—'}</div>
          <div>City: ${sync.currentCity || '—'}</div>
          <div>Cash: $${Number(sync.cash||0).toLocaleString()}</div>
          <div>Homes: ${(sync.homesOwned||[]).length}</div>
          <div>Businesses: ${(sync.businesses||[]).length}</div>
          <div>Inventory: ${(sync.inventory||[]).length} items</div>
        </div>
      `;
      grid.appendChild(gameCard);

      sm.appendChild(grid);
      bodyEl.appendChild(sm);
    }
  });

  // ===== ABOUT APP =====
  P.registerApp('about', {
    name: 'About PenanceOS',
    icon: 'ℹ️',
    description: 'About this system',
    defaultW: 440,
    defaultH: 320,

    render(bodyEl, win) {
      const about = P.el('div', { className: 'pane-welcome', style: { height: '100%' } });
      about.innerHTML = `
        <h1>P<span>enance</span>OS</h1>
        <p>A Linux-inspired desktop environment for CoderWarz. Built for hackers who want more control, more speed, and a real workflow.</p>
        <div class="version">v1.0.0 — CW Kernel — ${new Date().getFullYear()}</div>
        <div style="margin-top:24px;font:11px var(--font-mono);color:var(--text-muted)">
          <div>Ctrl+Shift+Space — Launcher</div>
          <div>Ctrl+Shift+Q — Close Window</div>
          <div>Ctrl+Shift+F — Maximize</div>
          <div>Ctrl+Shift+T — Tile</div>
          <div>Ctrl+Shift+1-4 — Workspaces</div>
          <div>Alt+Tab — Cycle Windows</div>
        </div>
      `;
      bodyEl.appendChild(about);
    }
  });

})();
