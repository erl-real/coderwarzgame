/* PenanceOS Inventory — syncs with parent game inventory */
(function(){
  var P = window.PaneOS;
  if(!P) return;

  var TYPE_ICONS = {
    usb: '🔌', drive: '💾', laptop: '💻', phone: '📱', chip: '🧩',
    hdd: '💽', ssd: '⚡', gpu: '🎮', cpu: '🔧', ram: '🧠',
    network: '🌐', software: '📦', data: '📊', crypto: '🪙',
    weapon: '⚔️', tool: '🔨', key: '🔑', document: '📄',
  };

  P.registerApp('inventory', {
    name: 'Inventory',
    icon: '🎒',
    description: 'View your items',
    defaultW: 620,
    defaultH: 460,

    render: function(bodyEl, win) {
      var sync = P.getState().gameSync;
      var selectedItem = null;

      function render() {
        bodyEl.innerHTML = '';
        bodyEl.style.cssText = 'display:flex;flex-direction:column;height:100%;background:#1a1d21;color:#e7e9ea;font-family:Inter,system-ui,sans-serif;';

        // Header
        var header = P.el('div', { style: { padding: '10px 16px', borderBottom: '1px solid #2a2d31', display: 'flex', alignItems: 'center', justifyContent: 'space-between' } });
        var inv = sync.inventory || [];
        header.appendChild(P.el('div', { style: { fontSize: '14px', fontWeight: '600' } }, '🎒 Inventory (' + inv.length + ')'));
        header.appendChild(P.el('div', { style: { fontSize: '11px', color: '#8b949b' } }, sync.currentCity || ''));
        bodyEl.appendChild(header);

        var main = P.el('div', { style: { display: 'flex', flex: '1', overflow: 'hidden' } });

        // Item list
        var listPane = P.el('div', { style: { width: selectedItem ? '240px' : '100%', borderRight: selectedItem ? '1px solid #2a2d31' : 'none', overflowY: 'auto', flexShrink: '0' } });

        if(inv.length === 0) {
          listPane.appendChild(P.el('div', { style: { textAlign: 'center', padding: '40px 20px', color: '#6b7280', fontSize: '13px' } }, 'Inventory empty'));
          listPane.appendChild(P.el('div', { style: { textAlign: 'center', color: '#4a5568', fontSize: '11px', marginTop: '8px' } }, 'Items will appear as you explore'));
        }

        inv.forEach(function(item) {
          var row = P.el('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', borderBottom: '1px solid #2a2d31', cursor: 'pointer', background: selectedItem === item ? '#252830' : 'transparent', transition: 'background .15s' } });
          row.addEventListener('click', function(){ selectedItem = item; render(); });
          row.addEventListener('mouseenter', function(){ if(selectedItem !== item) row.style.background = '#202328'; });
          row.addEventListener('mouseleave', function(){ if(selectedItem !== item) row.style.background = 'transparent'; });

          var icon = P.el('div', { style: { fontSize: '16px', width: '24px', textAlign: 'center' } }, TYPE_ICONS[item.type] || item.icon || '📦');
          var nameDiv = P.el('div', { style: { flex: '1', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, item.name || item.id);

          row.append(icon, nameDiv);
          listPane.appendChild(row);
        });

        // Detail pane
        if(selectedItem) {
          var detailPane = P.el('div', { style: { flex: '1', padding: '20px', overflowY: 'auto' } });

          var topRow = P.el('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' } });
          topRow.appendChild(P.el('div', { style: { fontSize: '28px' } }, TYPE_ICONS[selectedItem.type] || selectedItem.icon || '📦'));
          var nameBlock = P.el('div');
          nameBlock.appendChild(P.el('div', { style: { fontSize: '16px', fontWeight: '600' } }, selectedItem.name || selectedItem.id));
          nameBlock.appendChild(P.el('div', { style: { fontSize: '11px', color: '#8b949b', marginTop: '2px' } }, selectedItem.type || 'item'));
          topRow.appendChild(nameBlock);
          detailPane.appendChild(topRow);

          if(selectedItem.description) {
            detailPane.appendChild(P.el('div', { style: { fontSize: '12px', color: '#c9ced1', lineHeight: '1.6', marginBottom: '16px' } }, selectedItem.description));
          }

          // Stats
          var statsGrid = P.el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' } });

          if(selectedItem.health !== undefined) {
            statsGrid.appendChild(makeStat('Health', selectedItem.health + '%'));
          }
          if(selectedItem.capacityGb !== undefined) {
            statsGrid.appendChild(makeStat('Capacity', selectedItem.capacityGb + ' GB'));
          }
          if(selectedItem.usedMb !== undefined) {
            statsGrid.appendChild(makeStat('Used', selectedItem.usedMb + ' MB'));
          }
          if(selectedItem.price !== undefined) {
            statsGrid.appendChild(makeStat('Value', '$' + Number(selectedItem.price).toLocaleString()));
          }

          detailPane.appendChild(statsGrid);

          var backBtn = P.el('button', { style: { padding: '6px 12px', background: '#252830', color: '#8b949b', border: '1px solid #3a3d41', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', marginTop: '16px' } }, '← Back');
          backBtn.addEventListener('click', function(){ selectedItem = null; render(); });
          detailPane.appendChild(backBtn);

          main.append(listPane, detailPane);
        } else {
          main.appendChild(listPane);
        }

        bodyEl.appendChild(main);
        P.on('gameSync', onSync);
      }

      function makeStat(label, value) {
        var box = P.el('div', { style: { padding: '8px 10px', background: '#1e2025', border: '1px solid #2a2d31', borderRadius: '4px' } });
        box.appendChild(P.el('div', { style: { fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' } }, label));
        box.appendChild(P.el('div', { style: { fontSize: '13px', fontWeight: '600', marginTop: '2px' } }, value));
        return box;
      }

      function onSync(s) { sync = s; render(); }
      render();
      bodyEl._cleanup = function() { P.off('gameSync', onSync); };
    }
  });

})();
