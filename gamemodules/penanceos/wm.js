/* PenanceOS Window Manager — drag, resize, tile, focus */
(function(){
  const P = window.PaneOS;
  if(!P) return;

  let desktopEl = null;
  let dragState = null;
  let resizeState = null;

  P.initWM = (container) => {
    desktopEl = container;
    P.on('stateChange', renderWindows);
    P.on('workspaceChange', renderWindows);
    renderWindows();
    initKeybinds();
  };

  function getVisibleWindows() {
    const s = P.getState();
    return s.windows.filter(w => w.workspace === s.activeWorkspace);
  }

  function renderWindows() {
    if(!desktopEl) return;
    const vis = getVisibleWindows();
    const s = P.getState();

    // Remove stale elements
    const existing = desktopEl.querySelectorAll('.pane-window');
    existing.forEach(el => {
      if(!vis.find(w => w.id === el.dataset.id)) el.remove();
    });

    vis.forEach(win => {
      let el = desktopEl.querySelector(`.pane-window[data-id="${win.id}"]`);
      if(!el) {
        el = createWindowEl(win);
        desktopEl.appendChild(el);
      }
      updateWindowEl(el, win, win.id === s.focusedWinId);
    });
  }

  function createWindowEl(win) {
    const P2 = P;
    const el = P.el('div', { className: 'pane-window pane-scale-in', 'data-id': win.id });

    // Header
    const header = P.el('div', { className: 'pane-window-header' });
    const icon = P.el('span', { className: 'pane-window-icon' }, win.icon);
    const title = P.el('span', { className: 'pane-window-title' }, win.title);
    const controls = P.el('div', { className: 'pane-window-controls' });

    const btnMin = P.el('button', { className: 'pane-win-ctrl', title: 'Minimize' }, '−');
    btnMin.onclick = (e) => { e.stopPropagation(); P2.minimizeWindow(win.id); };

    const btnMax = P.el('button', { className: 'pane-win-ctrl', title: 'Maximize' }, '□');
    btnMax.onclick = (e) => { e.stopPropagation(); P2.maximizeWindow(win.id); };

    const btnClose = P.el('button', { className: 'pane-win-ctrl close', title: 'Close' }, '×');
    btnClose.onclick = (e) => { e.stopPropagation(); P2.closeWindow(win.id); };

    controls.append(btnMin, btnMax, btnClose);
    header.append(icon, title, controls);

    // Drag header
    header.addEventListener('mousedown', (e) => {
      if(e.target.tagName === 'BUTTON') return;
      P2.focusWindow(win.id);
      const w = P2.getWindow(win.id);
      if(w.maximized) return;
      dragState = { winId: win.id, startX: e.clientX, startY: e.clientY, origX: w.x, origY: w.y };
      e.preventDefault();
    });

    // Double-click header to maximize
    header.addEventListener('dblclick', (e) => {
      if(e.target.tagName === 'BUTTON') return;
      P2.maximizeWindow(win.id);
    });

    // Focus on click
    el.addEventListener('mousedown', () => P2.focusWindow(win.id));

    // Body (app content rendered by app)
    const body = P.el('div', { className: 'pane-window-body' });
    body.id = 'body-' + win.id;

    // Resize handle
    const resize = P.el('div', { className: 'pane-window-resize' });
    resize.addEventListener('mousedown', (e) => {
      P2.focusWindow(win.id);
      const w = P2.getWindow(win.id);
      if(w.maximized) return;
      resizeState = { winId: win.id, startX: e.clientX, startY: e.clientY, origW: w.w, origH: w.h };
      e.preventDefault();
      e.stopPropagation();
    });

    el.append(header, body, resize);

    // Store refs
    el._titleEl = title;
    el._bodyEl = body;

    return el;
  }

  function updateWindowEl(el, win, isFocused) {
    el.className = 'pane-window' + (isFocused ? ' focused' : '') + (win.maximized ? ' maximized' : '') + (win.minimized ? ' minimized' : '');
    el._titleEl.textContent = win.title;

    if(win.maximized) {
      el.style.left = '0px';
      el.style.top = '0px';
      el.style.width = '100%';
      el.style.height = '100%';
    } else {
      el.style.left = win.x + 'px';
      el.style.top = win.y + 'px';
      el.style.width = win.w + 'px';
      el.style.height = win.h + 'px';
    }

    el.style.zIndex = isFocused ? 100 : 10;

    // Render app content if not yet rendered
    if(!el._rendered) {
      el._rendered = true;
      renderAppContent(win, el._bodyEl);
    }
  }

  function renderAppContent(win, bodyEl) {
    const app = P.getApp(win.app);
    if(app && app.render) {
      bodyEl.innerHTML = '';
      app.render(bodyEl, win);
    } else {
      bodyEl.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font:13px var(--font-sans)">App "${win.app}" not found</div>`;
    }
  }

  // ===== MOUSE HANDLERS =====
  document.addEventListener('mousemove', (e) => {
    if(dragState) {
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;
      P.updateWindow(dragState.winId, {
        x: dragState.origX + dx,
        y: Math.max(0, dragState.origY + dy),
      });
    }
    if(resizeState) {
      const dx = e.clientX - resizeState.startX;
      const dy = e.clientY - resizeState.startY;
      const w = P.getWindow(resizeState.winId);
      if(w) {
        P.updateWindow(resizeState.winId, {
          w: Math.max(w.minW || 200, resizeState.origW + dx),
          h: Math.max(w.minH || 120, resizeState.origH + dy),
        });
      }
    }
  });

  document.addEventListener('mouseup', () => {
    dragState = null;
    resizeState = null;
  });

  // ===== KEYBINDS =====
  function initKeybinds() {
    document.addEventListener('keydown', (e) => {
      const s = P.getState();
      // Super key (Meta or Ctrl+Shift as proxy)
      const superKey = e.ctrlKey && e.shiftKey;

      // Super+Q = close focused window
      if(superKey && e.key === 'q') {
        if(s.focusedWinId) P.closeWindow(s.focusedWinId);
        e.preventDefault();
      }

      // Super+F = toggle maximize
      if(superKey && e.key === 'f') {
        if(s.focusedWinId) P.maximizeWindow(s.focusedWinId);
        e.preventDefault();
      }

      // Super+M = minimize
      if(superKey && e.key === 'm') {
        if(s.focusedWinId) P.minimizeWindow(s.focusedWinId);
        e.preventDefault();
      }

      // Super+Space = launcher
      if(superKey && e.code === 'Space') {
        P.emit('toggleLauncher');
        e.preventDefault();
      }

      // Super+1-4 = switch workspace
      if(superKey && e.key >= '1' && e.key <= '4') {
        P.switchWorkspace(parseInt(e.key) - 1);
        e.preventDefault();
      }

      // Super+T = tile mode (split left/right)
      if(superKey && e.key === 't') {
        if(s.focusedWinId) tileWindow(s.focusedWinId, 'right');
        e.preventDefault();
      }

      // Super+Shift+T = tile left
      if(superKey && e.shiftKey && e.key === 'T') {
        if(s.focusedWinId) tileWindow(s.focusedWinId, 'left');
        e.preventDefault();
      }

      // Alt+Tab = cycle windows
      if(e.altKey && e.key === 'Tab') {
        cycleWindows(s);
        e.preventDefault();
      }
    });
  }

  function tileWindow(id, side) {
    const s = P.getState();
    const vis = getVisibleWindows();
    if(vis.length < 2) {
      // Single window: take half screen
      const panelH = 32;
      P.updateWindow(id, {
        x: side === 'left' ? 0 : window.innerWidth / 2,
        y: 0,
        w: window.innerWidth / 2,
        h: window.innerHeight - panelH,
        maximized: false,
      });
    } else {
      // Tile all visible windows
      const panelH = 32;
      const w = window.innerWidth;
      const h = window.innerHeight - panelH;
      const half = Math.floor(w / 2);
      vis.forEach((win, i) => {
        P.updateWindow(win.id, {
          x: i % 2 === 0 ? 0 : half,
          y: Math.floor(i / 2) * (h / Math.ceil(vis.length / 2)),
          w: vis.length === 1 ? w : half,
          h: h / Math.ceil(vis.length / 2),
          maximized: false,
        });
      });
    }
  }

  function cycleWindows(s) {
    const vis = getVisibleWindows();
    if(vis.length <= 1) return;
    const currentIdx = vis.findIndex(w => w.id === s.focusedWinId);
    const nextIdx = (currentIdx + 1) % vis.length;
    P.focusWindow(vis[nextIdx].id);
  }

})();
