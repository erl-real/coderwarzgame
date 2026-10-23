/* PenanceOS Core — State, IPC, Events, Utilities */
window.PaneOS = window.PaneOS || {};

(function(){
  const P = window.PaneOS;

  // ===== EVENT BUS =====
  const listeners = {};
  P.on = (ev, fn) => { (listeners[ev] = listeners[ev]||[]).push(fn); };
  P.off = (ev, fn) => { if(listeners[ev]) listeners[ev] = listeners[ev].filter(f=>f!==fn); };
  P.emit = (ev, data) => { (listeners[ev]||[]).forEach(fn=>fn(data)); };

  // ===== STATE =====
  let _state = {
    workspaces: [{ id:0, name:'1' },{ id:1, name:'2' },{ id:2, name:'3' },{ id:3, name:'4' }],
    activeWorkspace: 0,
    windows: [],
    nextWinId: 1,
    focusedWinId: null,
    launcherOpen: false,
    gameSync: {},
    panelClock: new Date(),
    notifications: [],
    nextNotifId: 1,
  };

  P.getState = () => _state;
  P.setState = (patch) => {
    const prev = { ..._state };
    if(typeof patch === 'function') patch = patch(_state);
    Object.assign(_state, patch);
    P.emit('stateChange', { prev, next: _state, patch });
  };

  // ===== IPC WITH PARENT GAME =====
  P.postToParent = (msg) => {
    try { window.parent.postMessage(msg, '*'); } catch(e){}
  };
  P.dispatch = (action) => {
    P.postToParent({ type: 'PANE_DISPATCH', action });
  };

  P.requestSync = () => {
    P.postToParent({ type: 'REQUEST_SYNC' });
    try {
      const s = window.parent.gameState;
      if(s) P.handleGameSync(s);
    } catch(e){}
  };

  P.handleGameSync = (data) => {
    const sync = {
      cash: data.economy?.government?.USD || 0,
      economy: data.economy || {},
      businesses: data.businesses || [],
      businessesOwned: data.player?.businessesOwned || [],
      ownedBuildingIds: data.player?.ownedBuildingIds || [],
      homesOwned: data.player?.homesOwned || [],
      homes: data.player?.homes || {},
      inventory: data.player?.inventory || [],
      emails: data.player?.emails || [],
      currentCity: data.player?.currentCity || 'Unknown',
      playerName: data.player?.playerName || 'user',
      pc: data.pc || {},
      wallets: data.economy?.connectedWallets || [],
      bankAccountUsd: data.economy?.bankAccountUsd || 0,
      bankSavingsUsd: data.economy?.bankSavingsUsd || 0,
      crypto: data.economy?.crypto || {},
      installedIds: data.installedIds || [],
    };
    P.setState({ gameSync: sync });
    P.emit('gameSync', sync);
  };

  window.addEventListener('message', (e) => {
    const d = e.data || {};
    if(d.type === 'SYNC_STATE') {
      P.handleGameSync(d);
    }
  });

  // ===== WINDOW MANAGEMENT (delegated to wm.js) =====
  P.openWindow = (opts) => {
    const id = 'pw-' + _state.nextWinId;
    const win = {
      id,
      title: opts.title || 'Window',
      icon: opts.icon || '📄',
      app: opts.app || 'generic',
      x: opts.x ?? 100 + (_state.windows.length * 20) % 200,
      y: opts.y ?? 60 + (_state.windows.length * 20) % 150,
      w: opts.w || 640,
      h: opts.h || 420,
      minW: opts.minW || 200,
      minH: opts.minH || 120,
      workspace: _state.activeWorkspace,
      maximized: false,
      minimized: false,
      focused: true,
      payload: opts.payload || {},
    };
    P.setState(s => ({
      windows: [...s.windows, win],
      nextWinId: s.nextWinId + 1,
      focusedWinId: id,
    }));
    P.emit('winOpen', win);
    P.emit('taskbarUpdate');
    return id;
  };

  P.closeWindow = (id) => {
    P.setState(s => ({
      windows: s.windows.filter(w => w.id !== id),
      focusedWinId: s.focusedWinId === id ? null : s.focusedWinId,
    }));
    P.emit('winClose', id);
    P.emit('taskbarUpdate');
  };

  P.focusWindow = (id) => {
    P.setState(s => ({
      windows: s.windows.map(w => ({ ...w, focused: w.id === id })),
      focusedWinId: id,
    }));
    P.emit('winFocus', id);
    P.emit('taskbarUpdate');
  };

  P.minimizeWindow = (id) => {
    P.setState(s => ({
      windows: s.windows.map(w => w.id === id ? { ...w, minimized: true, focused: false } : w),
      focusedWinId: s.focusedWinId === id ? null : s.focusedWinId,
    }));
    P.emit('taskbarUpdate');
  };

  P.maximizeWindow = (id) => {
    P.setState(s => ({
      windows: s.windows.map(w => w.id === id ? { ...w, maximized: !w.maximized } : w),
    }));
  };

  P.updateWindow = (id, patch) => {
    P.setState(s => ({
      windows: s.windows.map(w => w.id === id ? { ...w, ...patch } : w),
    }));
  };

  P.getWindow = (id) => _state.windows.find(w => w.id === id);

  // ===== WORKSPACES =====
  P.switchWorkspace = (idx) => {
    if(idx < 0 || idx >= _state.workspaces.length) return;
    P.setState({ activeWorkspace: idx });
    P.emit('workspaceChange', idx);
  };

  // ===== NOTIFICATIONS =====
  P.notify = (title, body, opts = {}) => {
    const id = 'notif-' + _state.nextNotifId;
    const notif = { id, title, body, timeout: opts.timeout || 4000 };
    P.setState(s => ({
      notifications: [...s.notifications, notif],
      nextNotifId: s.nextNotifId + 1,
    }));
    P.emit('notification', notif);
    if(notif.timeout > 0) {
      setTimeout(() => P.dismissNotification(id), notif.timeout);
    }
    return id;
  };

  P.dismissNotification = (id) => {
    P.setState(s => ({
      notifications: s.notifications.filter(n => n.id !== id),
    }));
  };

  // ===== UTILITIES =====
  P.el = (tag, attrs, ...children) => {
    const e = document.createElement(tag);
    if(attrs) Object.entries(attrs).forEach(([k,v]) => {
      if(k === 'className') e.className = v;
      else if(k === 'style' && typeof v === 'object') Object.assign(e.style, v);
      else if(k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
      else e.setAttribute(k, v);
    });
    children.forEach(c => {
      if(typeof c === 'string') e.appendChild(document.createTextNode(c));
      else if(c) e.appendChild(c);
    });
    return e;
  };

  P.clamp = (val, min, max) => Math.max(min, Math.min(max, val));

  P.formatTime = (d) => {
    const h = d.getHours();
    const m = String(d.getMinutes()).padStart(2,'0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${m} ${ampm}`;
  };

  P.formatDate = (d) => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    return `${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()}`;
  };

  P.uid = () => Math.random().toString(36).slice(2,9);

  // ===== APP REGISTRY =====
  const _apps = {};
  P.registerApp = (id, def) => { _apps[id] = def; };
  P.getApp = (id) => _apps[id];
  P.getAllApps = () => ({ ..._apps });
  P.getAppList = () => Object.entries(_apps).map(([id, def]) => ({ id, ...def }));

})();
