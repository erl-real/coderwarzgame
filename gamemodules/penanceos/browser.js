/* PenanceOS Browser — Linux-style web browser */
(function(){
  var P = window.PaneOS;
  if(!P) return;

  var BOOKMARKS = [
    { name: 'Penance Project', url: 'site://penance.com.html' },
    { name: 'PC Experts', url: 'site://pcexperts.com.html' },
    { name: 'Register Business', url: 'site://registerbiz.org.html' },
    { name: 'Anywhere Travel', url: 'site://anywhere.travel.html' },
    { name: 'Void Network', url: 'site://void.net.html' },
  ];

  P.registerApp('browser', {
    name: 'Browser',
    icon: '🌐',
    description: 'Browse the web',
    defaultW: 860,
    defaultH: 560,

    render: function(bodyEl, win) {
      var currentUrl = '';
      var history = [];
      var historyIdx = -1;
      var bookmarks = BOOKMARKS.slice();

      function render() {
        bodyEl.innerHTML = '';
        bodyEl.style.cssText = 'display:flex;flex-direction:column;height:100%;background:#1a1d21;color:#e7e9ea;font-family:Inter,system-ui,sans-serif;';

        // Toolbar
        var toolbar = P.el('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderBottom: '1px solid #2a2d31', background: '#1e2025' } });

        var btnBack = P.el('button', { style: { background: 'none', border: 'none', color: historyIdx > 0 ? '#e7e9ea' : '#4a4d51', fontSize: '16px', cursor: historyIdx > 0 ? 'pointer' : 'default', padding: '4px 8px' } }, '◀');
        btnBack.addEventListener('click', function(){ if(historyIdx > 0) { historyIdx--; navigate(history[historyIdx], false); } });

        var btnFwd = P.el('button', { style: { background: 'none', border: 'none', color: historyIdx < history.length - 1 ? '#e7e9ea' : '#4a4d51', fontSize: '16px', cursor: historyIdx < history.length - 1 ? 'pointer' : 'default', padding: '4px 8px' } }, '▶');
        btnFwd.addEventListener('click', function(){ if(historyIdx < history.length - 1) { historyIdx++; navigate(history[historyIdx], false); } });

        var btnRefresh = P.el('button', { style: { background: 'none', border: 'none', color: '#8b949b', fontSize: '14px', cursor: 'pointer', padding: '4px 8px' } }, '⟳');
        btnRefresh.addEventListener('click', function(){ if(currentUrl) navigate(currentUrl, false); });

        var urlBar = P.el('input', { style: { flex: '1', background: '#252830', border: '1px solid #3a3d41', borderRadius: '4px', padding: '6px 10px', color: '#e7e9ea', fontSize: '12px', fontFamily: '"SFMono-Regular",Consolas,monospace', outline: 'none' } });
        urlBar.value = currentUrl;
        urlBar.addEventListener('keydown', function(e) {
          if(e.key === 'Enter') {
            var url = urlBar.value.trim();
            if(url && url.indexOf('://') < 0 && url.indexOf('/') < 0) url = 'site://' + url;
            if(url && !url.endsWith('.html') && url.indexOf('site://') === 0) url = url + '.html';
            navigate(url, true);
          }
        });

        var btnBookmark = P.el('button', { style: { background: 'none', border: 'none', color: '#f59e0b', fontSize: '14px', cursor: 'pointer', padding: '4px 8px' } }, '☆');
        btnBookmark.addEventListener('click', function() {
          if(currentUrl) {
            bookmarks.push({ name: currentUrl.split('/').pop() || currentUrl, url: currentUrl });
            P.notify('Bookmarked', currentUrl);
          }
        });

        toolbar.append(btnBack, btnFwd, btnRefresh, urlBar, btnBookmark);

        // Content area with sidebar bookmarks
        var mainArea = P.el('div', { style: { display: 'flex', flex: '1', overflow: 'hidden' } });

        // Bookmarks sidebar
        var sidebar = P.el('div', { style: { width: '170px', borderRight: '1px solid #2a2d31', padding: '8px 0', overflowY: 'auto', flexShrink: '0' } });
        sidebar.appendChild(P.el('div', { style: { padding: '6px 14px', fontSize: '10px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em' } }, 'Bookmarks'));
        bookmarks.forEach(function(bm) {
          var bmItem = P.el('div', { style: { padding: '6px 14px', fontSize: '12px', color: '#8b949b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '4px', margin: '0 6px' } });
          bmItem.innerHTML = '🔖 <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + bm.name + '</span>';
          bmItem.addEventListener('click', function(){ navigate(bm.url, true); });
          bmItem.addEventListener('mouseenter', function(){ bmItem.style.background = '#252830'; bmItem.style.color = '#e7e9ea'; });
          bmItem.addEventListener('mouseleave', function(){ bmItem.style.background = 'transparent'; bmItem.style.color = '#8b949b'; });
          sidebar.appendChild(bmItem);
        });

        // Page content (iframe or placeholder)
        var pageFrame = P.el('div', { style: { flex: '1', background: '#0d1117', position: 'relative', overflow: 'hidden' } });

        if(currentUrl) {
          var iframe = P.el('iframe', { style: { width: '100%', height: '100%', border: 'none' } });
          iframe.src = currentUrl.replace('site://', './internetsites/');
          pageFrame.appendChild(iframe);
        } else {
          // New tab page
          var newTab = P.el('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' } });
          newTab.appendChild(P.el('div', { style: { fontSize: '36px', opacity: '0.3' } }, '🌐'));
          newTab.appendChild(P.el('div', { style: { fontSize: '14px', color: '#6b7280' } }, 'PenanceOS Browser'));
          var quickLinks = P.el('div', { style: { display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap', justifyContent: 'center' } });
          bookmarks.slice(0, 5).forEach(function(bm) {
            var ql = P.el('div', { style: { padding: '8px 14px', background: '#1e2025', border: '1px solid #2a2d31', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#8b949b', transition: 'all .15s' } }, bm.name);
            ql.addEventListener('click', function(){ navigate(bm.url, true); });
            ql.addEventListener('mouseenter', function(){ ql.style.borderColor = '#4a9eff33'; ql.style.color = '#e7e9ea'; });
            ql.addEventListener('mouseleave', function(){ ql.style.borderColor = '#2a2d31'; ql.style.color = '#8b949b'; });
            quickLinks.appendChild(ql);
          });
          newTab.appendChild(quickLinks);
          pageFrame.appendChild(newTab);
        }

        mainArea.append(sidebar, pageFrame);
        bodyEl.append(toolbar, mainArea);
      }

      function navigate(url, addToHistory) {
        currentUrl = url;
        if(addToHistory) {
          history = history.slice(0, historyIdx + 1);
          history.push(url);
          historyIdx = history.length - 1;
        }
        render();
      }

      render();
    }
  });

})();
