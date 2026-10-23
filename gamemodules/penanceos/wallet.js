/* PenanceOS Wallet — syncs with parent game economy */
(function(){
  var P = window.PaneOS;
  if(!P) return;

  function fmt$(n) { return '$' + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  P.registerApp('wallet', {
    name: 'Wallet',
    icon: '💰',
    description: 'Manage your finances',
    defaultW: 560,
    defaultH: 440,

    render: function(bodyEl, win) {
      var sync = P.getState().gameSync;

      function render() {
        bodyEl.innerHTML = '';
        bodyEl.style.cssText = 'display:flex;flex-direction:column;height:100%;background:#1a1d21;color:#e7e9ea;font-family:Inter,system-ui,sans-serif;overflow-y:auto;';

        // Header
        var header = P.el('div', { style: { padding: '16px 20px', borderBottom: '1px solid #2a2d31' } });
        header.appendChild(P.el('div', { style: { fontSize: '10px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px' } }, 'Total Balance'));
        header.appendChild(P.el('div', { style: { fontSize: '28px', fontWeight: '700', color: '#e7e9ea' } }, fmt$(sync.cash)));
        bodyEl.appendChild(header);

        // Wallet section
        var section = P.el('div', { style: { padding: '16px 20px' } });
        section.appendChild(P.el('div', { style: { fontSize: '10px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px' } }, 'Connected Wallets'));

        var wallets = sync.wallets || [];
        wallets.forEach(function(w) {
          var row = P.el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#1e2025', border: '1px solid #2a2d31', borderRadius: '6px', marginBottom: '6px' } });
          row.appendChild(P.el('div', { style: { fontSize: '12px', color: '#8b949b' } }, w.id || 'Wallet'));
          row.appendChild(P.el('div', { style: { fontSize: '12px', fontWeight: '600' } }, w.currency || 'USD'));
          section.appendChild(row);
        });

        if(wallets.length === 0) {
          section.appendChild(P.el('div', { style: { fontSize: '12px', color: '#6b7280', padding: '10px 0' } }, 'No wallets connected'));
        }

        // Bank accounts
        section.appendChild(P.el('div', { style: { fontSize: '10px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px', marginTop: '16px' } }, 'Bank Accounts'));

        var bankRow = P.el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#1e2025', border: '1px solid #2a2d31', borderRadius: '6px', marginBottom: '6px' } });
        bankRow.appendChild(P.el('div', { style: { fontSize: '12px', color: '#8b949b' } }, 'Checking Account'));
        bankRow.appendChild(P.el('div', { style: { fontSize: '12px', fontWeight: '600' } }, fmt$(sync.bankAccountUsd)));
        section.appendChild(bankRow);

        var savingsRow = P.el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#1e2025', border: '1px solid #2a2d31', borderRadius: '6px', marginBottom: '6px' } });
        savingsRow.appendChild(P.el('div', { style: { fontSize: '12px', color: '#8b949b' } }, 'Savings Account'));
        savingsRow.appendChild(P.el('div', { style: { fontSize: '12px', fontWeight: '600' } }, fmt$(sync.bankSavingsUsd)));
        section.appendChild(savingsRow);

        // Crypto
        section.appendChild(P.el('div', { style: { fontSize: '10px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px', marginTop: '16px' } }, 'Cryptocurrency'));

        var crypto = sync.crypto || {};
        var cryptoList = [
          { code: 'BTC', label: 'Bitcoin', icon: '₿' },
          { code: 'ETH', label: 'Ethereum', icon: 'Ξ' },
          { code: 'XMR', label: 'Monero', icon: 'ɱ' },
          { code: 'SOL', label: 'Solana', icon: '◎' },
        ];
        cryptoList.forEach(function(c) {
          var amt = crypto[c.code] || 0;
          if(amt > 0) {
            var crow = P.el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#1e2025', border: '1px solid #2a2d31', borderRadius: '6px', marginBottom: '6px' } });
            var left = P.el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } });
            left.appendChild(P.el('span', { style: { fontSize: '16px' } }, c.icon));
            left.appendChild(P.el('span', { style: { fontSize: '12px', fontWeight: '600' } }, c.label));
            crow.appendChild(left);
            crow.appendChild(P.el('div', { style: { fontSize: '12px', fontWeight: '600' } }, amt.toFixed(4) + ' ' + c.code));
            section.appendChild(crow);
          }
        });

        var hasCrypto = Object.keys(crypto).some(function(k){ return (crypto[k] || 0) > 0; });
        if(!hasCrypto) {
          section.appendChild(P.el('div', { style: { fontSize: '12px', color: '#6b7280', padding: '10px 0' } }, 'No cryptocurrency holdings'));
        }

        bodyEl.appendChild(section);

        P.on('gameSync', onSync);
      }

      function onSync(s) { sync = s; render(); }
      render();
      bodyEl._cleanup = function() { P.off('gameSync', onSync); };
    }
  });

})();
