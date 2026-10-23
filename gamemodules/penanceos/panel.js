/* PenanceOS Panel — top bar with clock, workspaces, taskbar */
(function(){
  const P = window.PaneOS;
  if(!P) return;

  let panelEl = null;

  P.initPanel = (container) => {
    panelEl = container;
    render();
    startClock();
    P.on('stateChange', render);
    P.on('taskbarUpdate', render);
    P.on('workspaceChange', render);
  };

  function render() {
    if(!panelEl) return;
    const s = P.getState();
    panelEl.innerHTML = '';

    // Left: App launcher button + separator
    const left = P.el('div', { className: 'pane-panel-left' });
    const launcherBtn = P.el('button', { className: 'pane-panel-btn app-launcher-btn' }, '⬤ P');
    launcherBtn.title = 'Application Launcher (Ctrl+Shift+Space)';
    launcherBtn.onclick = () => P.emit('toggleLauncher');
    left.appendChild(launcherBtn);

    const sep1 = P.el('div', { className: 'pane-panel-sep' });
    left.appendChild(sep1);

    // Workspace buttons
    const wsContainer = P.el('div', { className: 'pane-panel-workspaces' });
    s.workspaces.forEach((ws, i) => {
      const dot = P.el('div', {
        className: 'pane-ws-dot' + (i === s.activeWorkspace ? ' active' : ''),
        title: `Workspace ${ws.name}`,
      });
      dot.onclick = () => P.switchWorkspace(i);
      wsContainer.appendChild(dot);
    });
    left.appendChild(wsContainer);

    // Center: open window tabs
    const center = P.el('div', { className: 'pane-panel-center' });
    const vis = s.windows.filter(w => w.workspace === s.activeWorkspace);
    vis.forEach(win => {
      const btn = P.el('button', {
        className: 'pane-panel-btn' + (win.id === s.focusedWinId ? ' active' : ''),
      }, `${win.icon} ${win.title}`);
      btn.onclick = () => {
        if(win.minimized) {
          P.updateWindow(win.id, { minimized: false });
        }
        P.focusWindow(win.id);
      };
      center.appendChild(btn);
    });

    // Right: system info + clock
    const right = P.el('div', { className: 'pane-panel-right' });

    const sync = s.gameSync;
    if(sync.cash !== undefined) {
      const cashBtn = P.el('button', { className: 'pane-panel-btn' }, `$${Number(sync.cash||0).toLocaleString()}`);
      cashBtn.title = 'Cash on hand';
      right.appendChild(cashBtn);
    }

    if(sync.currentCity) {
      const cityBtn = P.el('button', { className: 'pane-panel-btn' }, sync.currentCity);
      cityBtn.title = 'Current city';
      right.appendChild(cityBtn);
    }

    const sep2 = P.el('div', { className: 'pane-panel-sep' });
    right.appendChild(sep2);

    const clock = P.el('div', { className: 'pane-panel-clock' });
    clock.id = 'pane-clock';
    clock.textContent = P.formatTime(new Date()) + '  ' + P.formatDate(new Date());
    right.appendChild(clock);

    panelEl.append(left, center, right);
  }

  function startClock() {
    setInterval(() => {
      const clock = document.getElementById('pane-clock');
      if(clock) {
        const now = new Date();
        clock.textContent = P.formatTime(now) + '  ' + P.formatDate(now);
      }
      P.emit('clockTick', new Date());
    }, 1000);
  }

})();
