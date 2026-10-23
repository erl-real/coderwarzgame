/* PenanceOS Email — syncs with parent game emails */
(function(){
  var P = window.PaneOS;
  if(!P) return;

  P.registerApp('email', {
    name: 'Email',
    icon: '📧',
    description: 'Read and send emails',
    defaultW: 680,
    defaultH: 480,

    render: function(bodyEl, win) {
      var sync = P.getState().gameSync;
      var selectedEmail = null;

      function render() {
        bodyEl.innerHTML = '';
        bodyEl.style.cssText = 'display:flex;flex-direction:column;height:100%;background:#1a1d21;color:#e7e9ea;font-family:Inter,system-ui,sans-serif;';

        // Header
        var header = P.el('div', { style: { padding: '10px 16px', borderBottom: '1px solid #2a2d31', display: 'flex', alignItems: 'center', justifyContent: 'space-between' } });
        header.appendChild(P.el('div', { style: { fontSize: '14px', fontWeight: '600' } }, '📧 Mail'));
        var composeBtn = P.el('button', { style: { padding: '6px 12px', background: '#4a9eff', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' } }, 'Compose');
        composeBtn.addEventListener('click', function(){ P.notify('Info', 'Use CubeOS email client to compose messages'); });
        header.appendChild(composeBtn);
        bodyEl.appendChild(header);

        // Main area
        var main = P.el('div', { style: { display: 'flex', flex: '1', overflow: 'hidden' } });

        // Email list
        var listPane = P.el('div', { style: { width: selectedEmail ? '260px' : '100%', borderRight: selectedEmail ? '1px solid #2a2d31' : 'none', overflowY: 'auto', flexShrink: '0' } });

        var emails = sync.emails || [];
        if(emails.length === 0) {
          listPane.appendChild(P.el('div', { style: { textAlign: 'center', padding: '40px 20px', color: '#6b7280', fontSize: '13px' } }, 'No emails yet'));
          listPane.appendChild(P.el('div', { style: { textAlign: 'center', color: '#4a5568', fontSize: '11px', marginTop: '8px' } }, 'Emails will appear here as you progress'));
        }

        emails.slice().reverse().forEach(function(email) {
          var item = P.el('div', { style: { padding: '10px 14px', borderBottom: '1px solid #2a2d31', cursor: 'pointer', background: selectedEmail === email ? '#252830' : 'transparent', transition: 'background .15s' } });
          item.addEventListener('click', function(){ selectedEmail = email; render(); });
          item.addEventListener('mouseenter', function(){ if(selectedEmail !== email) item.style.background = '#202328'; });
          item.addEventListener('mouseleave', function(){ if(selectedEmail !== email) item.style.background = 'transparent'; });

          var from = P.el('div', { style: { fontSize: '12px', fontWeight: '600', color: '#e7e9ea', marginBottom: '2px' } }, email.from || 'Unknown');
          var subj = P.el('div', { style: { fontSize: '11px', color: '#8b949b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, email.subject || email.message || '(no subject)');
          var time = P.el('div', { style: { fontSize: '10px', color: '#4a5568', marginTop: '2px' } }, email.time || '');
          item.append(from, subj, time);
          listPane.appendChild(item);
        });

        // Detail pane
        if(selectedEmail) {
          var detailPane = P.el('div', { style: { flex: '1', padding: '20px', overflowY: 'auto' } });
          detailPane.appendChild(P.el('div', { style: { fontSize: '16px', fontWeight: '600', marginBottom: '8px' } }, selectedEmail.subject || '(no subject)'));
          detailPane.appendChild(P.el('div', { style: { fontSize: '12px', color: '#8b949b', marginBottom: '4px' } }, 'From: ' + (selectedEmail.from || 'Unknown')));
          if(selectedEmail.time) detailPane.appendChild(P.el('div', { style: { fontSize: '11px', color: '#4a5568', marginBottom: '16px' } }, selectedEmail.time));
          detailPane.appendChild(P.el('div', { style: { fontSize: '13px', lineHeight: '1.6', color: '#c9ced1', whiteSpace: 'pre-wrap' } }, selectedEmail.message || selectedEmail.body || ''));

          var backBtn = P.el('button', { style: { padding: '6px 12px', background: '#252830', color: '#8b949b', border: '1px solid #3a3d41', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', marginTop: '16px' } }, '← Back');
          backBtn.addEventListener('click', function(){ selectedEmail = null; render(); });
          detailPane.appendChild(backBtn);

          main.append(listPane, detailPane);
        } else {
          main.appendChild(listPane);
        }

        bodyEl.appendChild(main);
        P.on('gameSync', onSync);
      }

      function onSync(s) { sync = s; render(); }
      render();
      bodyEl._cleanup = function() { P.off('gameSync', onSync); };
    }
  });

})();
