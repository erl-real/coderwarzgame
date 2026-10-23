/* PenanceOS App Store — Linux-style package manager */
(function(){
  var P = window.PaneOS;
  if(!P) return;

  var STORE_CATEGORIES = [
    { id: 'all', name: 'All', icon: '📦' },
    { id: 'system', name: 'System', icon: '⚙️' },
    { id: 'tools', name: 'Tools', icon: '🔧' },
    { id: 'network', name: 'Network', icon: '🌐' },
    { id: 'security', name: 'Security', icon: '🛡️' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎮' },
    { id: 'widgets', name: 'Widgets', icon: '📊' },
  ];

  function getStoreItems() {
    var sync = P.getState().gameSync;
    var installed = sync.installedIds || [];
    return [
      { id: 'auto-clicker', name: 'Auto Clicker', icon: '🖱️', category: 'tools', price: 250, desc: 'Automated clicking tool for repetitive tasks.', installed: installed.indexOf('auto-clicker') >= 0 },
      { id: 'remote-pc', name: 'Remote PC', icon: '📱', category: 'network', price: 12, desc: 'Access and control remote computers securely.', installed: installed.indexOf('remote-pc') >= 0 },
      { id: 'file-transfer', name: 'File Transfer', icon: '↔️', category: 'system', price: 0, desc: 'Quickly move files between local devices.', installed: installed.indexOf('file-transfer') >= 0 },
      { id: 'password-manager', name: 'Password Manager', icon: '🔑', category: 'security', price: 0, desc: 'Securely store and manage your credentials.', installed: installed.indexOf('password-manager') >= 0 },
      { id: 'backup-downloader', name: 'Backup Downloader', icon: '☁️', category: 'system', price: 3.5, desc: 'Retrieve and manage remote backups.', installed: installed.indexOf('backup-downloader') >= 0 },
      { id: 'hdd-cloner', name: 'Hard Drive Cloner', icon: '📋', category: 'system', price: 8, desc: 'Create exact copies of hard drives and partitions.', installed: installed.indexOf('hdd-cloner') >= 0 },
      { id: 'calculator', name: 'Calculator', icon: '🧮', category: 'tools', price: 0, desc: 'Advanced mathematical calculations.', installed: installed.indexOf('calculator') >= 0 },
      { id: 'photo-editor', name: 'Photo Editor', icon: '🖼️', category: 'tools', price: 0, desc: 'Basic photo editing and retouching.', installed: installed.indexOf('photo-editor') >= 0 },
      { id: 'software-repair', name: 'Software Repair', icon: '🔧', category: 'system', price: 15, desc: 'Fix corrupted system software.', installed: installed.indexOf('software-repair') >= 0 },
      { id: 'defender', name: 'Defender', icon: '🛡️', category: 'security', price: 0, desc: 'Real-time protection against threats.', installed: installed.indexOf('defender') >= 0 },
      { id: 'srv-term', name: 'Server Terminal', icon: '🖥️', category: 'network', price: 0, desc: 'Connect to remote servers via SSH.', installed: installed.indexOf('srv-term') >= 0 },
      { id: 'port-scanner', name: 'Port Scanner', icon: '🔍', category: 'network', price: 6, desc: 'Scan open ports on target hosts.', installed: installed.indexOf('port-scanner') >= 0 },
      { id: 'file-scrape', name: 'File Scraper', icon: '📁', category: 'tools', price: 2.5, desc: 'Scrape and download files from remote servers.', installed: installed.indexOf('file-scrape') >= 0 },
      { id: 'weather-widget', name: 'Weather Widget', icon: '⛅', category: 'widgets', price: 0, desc: 'Shows weather for your current city.', installed: installed.indexOf('weather-widget') >= 0 },
      { id: 'pc-meters-widget', name: 'PC Meters', icon: '📊', category: 'widgets', price: 0, desc: 'CPU, RAM, and network usage meters.', installed: installed.indexOf('pc-meters-widget') >= 0 },
      { id: 'wallet-widget', name: 'Wallet Widget', icon: '💰', category: 'widgets', price: 0, desc: 'Quick wallet and crypto overview.', installed: installed.indexOf('wallet-widget') >= 0 },
    ];
  }

  function fmtPrice(p) {
    if(p === 0) return 'Free';
    return '$' + p.toFixed(2);
  }

  P.registerApp('store', {
    name: 'Software Center',
    icon: '🏪',
    description: 'Browse and install applications',
    defaultW: 780,
    defaultH: 520,

    render: function(bodyEl, win) {
      var sync = P.getState().gameSync;
      var activeCat = 'all';
      var searchQuery = '';

      function getFiltered() {
        var items = getStoreItems();
        if(activeCat !== 'all') items = items.filter(function(i){ return i.category === activeCat; });
        if(searchQuery) {
          var q = searchQuery.toLowerCase();
          items = items.filter(function(i){ return i.name.toLowerCase().indexOf(q) >= 0 || i.desc.toLowerCase().indexOf(q) >= 0; });
        }
        return items;
      }

      function render() {
        bodyEl.innerHTML = '';
        bodyEl.style.cssText = 'display:flex;flex-direction:column;height:100%;background:#1a1d21;color:#e7e9ea;font-family:Inter,system-ui,sans-serif;';

        // Header
        var header = P.el('div', { style: { padding: '12px 16px', borderBottom: '1px solid #2a2d31', display: 'flex', alignItems: 'center', gap: '12px' } });
        var searchInput = P.el('input', { style: { flex: '1', background: '#252830', border: '1px solid #3a3d41', borderRadius: '4px', padding: '8px 12px', color: '#e7e9ea', fontSize: '13px', outline: 'none' }, placeholder: 'Search applications...' });
        searchInput.value = searchQuery;
        searchInput.addEventListener('input', function(){ searchQuery = searchInput.value; render(); });
        header.appendChild(searchInput);

        var cashLabel = P.el('div', { style: { fontSize: '12px', color: '#8b949b', whiteSpace: 'nowrap' } }, '💰 ' + fmtPrice(sync.cash));
        header.appendChild(cashLabel);

        // Sidebar + content
        var main = P.el('div', { style: { display: 'flex', flex: '1', overflow: 'hidden' } });

        // Sidebar
        var sidebar = P.el('div', { style: { width: '160px', borderRight: '1px solid #2a2d31', padding: '8px 0', overflowY: 'auto', flexShrink: '0' } });
        STORE_CATEGORIES.forEach(function(cat) {
          var catBtn = P.el('div', { style: { padding: '8px 16px', cursor: 'pointer', fontSize: '13px', color: activeCat === cat.id ? '#e7e9ea' : '#8b949b', background: activeCat === cat.id ? '#252830' : 'transparent', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background .15s' } });
          catBtn.innerHTML = '<span>' + cat.icon + '</span><span>' + cat.name + '</span>';
          catBtn.addEventListener('click', function(){ activeCat = cat.id; render(); });
          catBtn.addEventListener('mouseenter', function(){ if(activeCat !== cat.id) catBtn.style.background = '#202328'; });
          catBtn.addEventListener('mouseleave', function(){ if(activeCat !== cat.id) catBtn.style.background = 'transparent'; });
          sidebar.appendChild(catBtn);
        });

        // Content
        var content = P.el('div', { style: { flex: '1', overflowY: 'auto', padding: '12px' } });
        var items = getFiltered();

        if(items.length === 0) {
          content.appendChild(P.el('div', { style: { textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '13px' } }, 'No applications found'));
        }

        items.forEach(function(item) {
          var card = P.el('div', { style: { display: 'flex', alignItems: 'center', padding: '12px', borderRadius: '6px', border: '1px solid #2a2d31', marginBottom: '8px', background: '#1e2025', gap: '12px', transition: 'border-color .15s' } });
          card.addEventListener('mouseenter', function(){ card.style.borderColor = '#4a9eff33'; });
          card.addEventListener('mouseleave', function(){ card.style.borderColor = '#2a2d31'; });

          var iconDiv = P.el('div', { style: { width: '42px', height: '42px', borderRadius: '8px', background: '#252830', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: '0' } }, item.icon);

          var info = P.el('div', { style: { flex: '1', minWidth: '0' } });
          info.appendChild(P.el('div', { style: { fontSize: '13px', fontWeight: '600', color: '#e7e9ea' } }, item.name));
          info.appendChild(P.el('div', { style: { fontSize: '11px', color: '#8b949b', marginTop: '2px' } }, item.desc));

          var actionDiv = P.el('div', { style: { flexShrink: '0', textAlign: 'right' } });
          if(item.installed) {
            var installedBadge = P.el('div', { style: { fontSize: '11px', color: '#4ade80', padding: '6px 12px', border: '1px solid #4ade8033', borderRadius: '4px' } }, '✓ Installed');
            actionDiv.appendChild(installedBadge);
          } else {
            var buyBtn = P.el('button', { style: { padding: '6px 14px', borderRadius: '4px', border: 'none', background: item.price === 0 ? '#4ade80' : '#4a9eff', color: item.price === 0 ? '#000' : '#fff', fontSize: '11px', fontWeight: '600', cursor: 'pointer' } }, fmtPrice(item.price));
            buyBtn.addEventListener('click', function() {
              if(item.price > 0) {
                P.dispatch({ type: 'PURCHASE_APP', id: item.id, price: item.price });
              } else {
                P.dispatch({ type: 'PURCHASE_APP', id: item.id, price: 0 });
              }
              sync.installedIds = sync.installedIds || [];
              sync.installedIds.push(item.id);
              P.notify('Installed', item.name + ' has been installed');
              render();
            });
            actionDiv.appendChild(buyBtn);
          }

          card.append(iconDiv, info, actionDiv);
          content.appendChild(card);
        });

        main.append(sidebar, content);
        bodyEl.appendChild(header);
        bodyEl.appendChild(main);

        // Listen for sync updates
        P.on('gameSync', onSync);
      }

      function onSync(s) {
        sync = s;
      }

      render();

      bodyEl._cleanup = function() {
        P.off('gameSync', onSync);
      };
    }
  });

})();
