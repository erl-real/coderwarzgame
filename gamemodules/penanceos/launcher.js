/* PenanceOS Launcher — keyboard-driven app launcher (Ctrl+Shift+Space) */
(function(){
  const P = window.PaneOS;
  if(!P) return;

  let overlayEl = null;
  let inputEl = null;
  let listEl = null;
  let selectedIdx = 0;
  let filteredApps = [];

  P.initLauncher = (container) => {
    overlayEl = container;

    // Overlay
    overlayEl.className = 'pane-launcher-overlay';
    overlayEl.onclick = (e) => { if(e.target === overlayEl) close(); };

    // Launcher box
    const box = P.el('div', { className: 'pane-launcher pane-scale-in' });

    // Input
    inputEl = P.el('input', {
      className: 'pane-launcher-input',
      type: 'text',
      placeholder: 'Type to search apps...',
    });
    inputEl.addEventListener('input', onInput);
    inputEl.addEventListener('keydown', onKeyDown);

    // List
    listEl = P.el('div', { className: 'pane-launcher-list' });

    box.append(inputEl, listEl);
    overlayEl.appendChild(box);

    P.on('toggleLauncher', toggle);
  };

  function toggle() {
    if(overlayEl.classList.contains('visible')) {
      close();
    } else {
      open();
    }
  }

  function open() {
    overlayEl.classList.add('visible');
    inputEl.value = '';
    selectedIdx = 0;
    renderList('');
    setTimeout(() => inputEl.focus(), 50);
  }

  function close() {
    overlayEl.classList.remove('visible');
    inputEl.value = '';
  }

  function onInput() {
    selectedIdx = 0;
    renderList(inputEl.value.trim().toLowerCase());
  }

  function onKeyDown(e) {
    if(e.key === 'Escape') { close(); return; }
    if(e.key === 'ArrowDown') { selectedIdx = Math.min(selectedIdx + 1, filteredApps.length - 1); renderList(inputEl.value.trim().toLowerCase()); e.preventDefault(); }
    if(e.key === 'ArrowUp') { selectedIdx = Math.max(selectedIdx - 1, 0); renderList(inputEl.value.trim().toLowerCase()); e.preventDefault(); }
    if(e.key === 'Enter') {
      if(filteredApps[selectedIdx]) {
        launchApp(filteredApps[selectedIdx].id);
        close();
      }
      e.preventDefault();
    }
  }

  function renderList(query) {
    const apps = P.getAppList();
    filteredApps = query
      ? apps.filter(a => (a.name||a.id).toLowerCase().includes(query) || (a.description||'').toLowerCase().includes(query))
      : apps;

    listEl.innerHTML = '';
    if(filteredApps.length === 0) {
      listEl.appendChild(P.el('div', { style: { padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' } }, 'No matching applications'));
      return;
    }

    filteredApps.forEach((app, i) => {
      const item = P.el('div', {
        className: 'pane-launcher-item' + (i === selectedIdx ? ' selected' : ''),
      });
      item.onclick = () => { launchApp(app.id); close(); };
      item.onmouseenter = () => { selectedIdx = i; renderList(query); };

      const icon = P.el('div', { className: 'pane-launcher-item-icon' }, app.icon || '📄');
      const text = P.el('div', { className: 'pane-launcher-item-text' });
      text.appendChild(P.el('div', { className: 'pane-launcher-item-name' }, app.name || app.id));
      if(app.description) text.appendChild(P.el('div', { className: 'pane-launcher-item-desc' }, app.description));

      item.append(icon, text);
      listEl.appendChild(item);
    });
  }

  function launchApp(appId) {
    const app = P.getApp(appId);
    if(!app) return;
    P.openWindow({
      title: app.name || appId,
      icon: app.icon || '📄',
      app: appId,
      w: app.defaultW || 640,
      h: app.defaultH || 420,
      payload: app.defaultPayload || {},
    });
  }

})();
