/* PenanceOS Terminal — terminal emulator app */
(function(){
  const P = window.PaneOS;
  if(!P) return;

  const COMMANDS = {
    help: () => ({
      output: [
        'PenanceOS Terminal v1.0',
        '',
        'Available commands:',
        '  help          Show this help',
        '  clear         Clear terminal',
        '  ls            List files',
        '  cat <file>    Display file contents',
        '  pwd           Print working directory',
        '  echo <text>   Print text',
        '  date          Show current date/time',
        '  whoami        Show current user',
        '  uname         Show system info',
        '  neofetch      System info display',
        '  cash          Show cash balance',
        '  homes         List owned homes',
        '  inventory     Show inventory',
        '  travel <city> Travel to city',
        '  send <amount> Send money',
        '  store         Open Software Center',
        '  browser       Open Browser',
        '  wallet        Open Wallet',
        '  email         Open Email',
        '  inv           Open Inventory',
        '  open <app>    Open an application',
        '  exit          Close terminal',
      ]
    }),

    ls: (args, state) => {
      const files = [
        { name: 'Documents', type: 'dir', icon: '📁' },
        { name: 'Downloads', type: 'dir', icon: '📁' },
        { name: '.config', type: 'dir', icon: '📁' },
        { name: '.bashrc', type: 'file', icon: '📄' },
        { name: 'readme.txt', type: 'file', icon: '📄' },
      ];
      const sync = state.gameSync;
      if(sync.homesOwned?.length) files.push({ name: 'homes/', type: 'dir', icon: '🏠' });
      return {
        output: files.map(f => `${f.icon} ${f.name}`),
        class: 'pane-term-info'
      };
    },

    cat: (args) => {
      if(!args) return { output: ['Usage: cat <filename>'], class: 'pane-term-error' };
      if(args === 'readme.txt') return {
        output: [
          'Welcome to PenanceOS',
          '====================',
          '',
          'A Linux-inspired desktop environment for CoderWarz.',
          'Use Ctrl+Shift+Space to open the application launcher.',
          'Use Ctrl+Shift+1-4 to switch workspaces.',
          'Use Ctrl+Shift+Q to close the focused window.',
          'Use Ctrl+Shift+F to maximize/restore.',
          'Use Ctrl+Shift+T to tile windows.',
          '',
          'Built for hackers who live in the terminal.',
        ]
      };
      if(args === '.bashrc') return {
        output: [
          '# PenanceOS bash config',
          'export PS1="\\u@penance:\\w$ "',
          'export EDITOR=nano',
          'alias ll="ls -la"',
          'alias ..="cd .."',
        ]
      };
      return { output: [`cat: ${args}: No such file or directory`], class: 'pane-term-error' };
    },

    pwd: () => ({ output: ['/home/user'] }),
    echo: (args) => ({ output: [args || ''] }),
    date: () => ({ output: [new Date().toString()] }),

    whoami: (args, state) => ({
      output: [state.gameSync.playerName || 'user']
    }),

    uname: () => ({
      output: ['PenanceOS 1.0.0 (x86_64) — CoderWarz Kernel']
    }),

    neofetch: (args, state) => {
      const sync = state.gameSync;
      return {
        output: [
          '        ╔═══════════╗        user@penance',
          '        ║ PenanceOS ║        ──────────────',
          '        ║  ┌─────┐  ║        OS: PenanceOS 1.0',
          '        ║  │ ▲▼  │  ║        Host: CoderWarz PC',
          '        ║  └─────┘  ║        Kernel: CW-Kernel',
          '        ╚═══════════╝        Uptime: ' + Math.floor((Date.now() - (state.bootTime||Date.now())) / 60000) + ' min',
          '                             RAM: 512MB / 2048MB',
          '                             Cash: $' + Number(sync.cash||0).toLocaleString(),
          '                             City: ' + (sync.currentCity || 'Unknown'),
          '                             Homes: ' + (sync.homesOwned?.length || 0),
          '',
        ],
        class: 'pane-term-info'
      };
    },

    cash: (args, state) => ({
      output: [`Cash: $${Number(state.gameSync.cash||0).toLocaleString()}`]
    }),

    homes: (args, state) => {
      const sync = state.gameSync;
      const homes = sync.homes || {};
      const ids = sync.homesOwned || [];
      if(ids.length === 0) return { output: ['No homes owned.'] };
      return {
        output: ids.map(id => {
          const h = homes[id];
          return h ? `  🏠 ${h.name} — ${h.city} ($${Number(h.price||0).toLocaleString()})` : `  ${id}`;
        })
      };
    },

    inventory: (args, state) => {
      const inv = state.gameSync.inventory || [];
      if(inv.length === 0) return { output: ['Inventory empty.'] };
      return {
        output: inv.slice(0, 20).map(it => `  ${it.icon||'📦'} ${it.name||it.id} [${it.type||'item'}]`)
          .concat(inv.length > 20 ? [`  ... and ${inv.length - 20} more`] : [])
      };
    },

    travel: (args) => {
      if(!args) return { output: ['Usage: travel <city name>'], class: 'pane-term-error' };
      P.dispatch({ type: 'PLAYER_TRAVEL', city: args, cost: 0 });
      return { output: [`Traveling to ${args}...`], class: 'pane-term-success' };
    },

    send: (args) => {
      if(!args) return { output: ['Usage: send <amount>'], class: 'pane-term-error' };
      var amount = parseFloat(args);
      if(isNaN(amount)) return { output: ['Invalid amount'], class: 'pane-term-error' };
      P.dispatch({ type: 'WALLET_SEND', amount: amount });
      return { output: ['Sent $' + amount.toFixed(2)], class: 'pane-term-success' };
    },

    store: () => { P.openWindow({ title: 'Software Center', icon: '🏪', app: 'store', w: 780, h: 520 }); return { output: ['Opening Software Center...'], class: 'pane-term-success' }; },
    browser: () => { P.openWindow({ title: 'Browser', icon: '🌐', app: 'browser', w: 860, h: 560 }); return { output: ['Opening Browser...'], class: 'pane-term-success' }; },
    wallet: () => { P.openWindow({ title: 'Wallet', icon: '💰', app: 'wallet', w: 560, h: 440 }); return { output: ['Opening Wallet...'], class: 'pane-term-success' }; },
    email: () => { P.openWindow({ title: 'Email', icon: '📧', app: 'email', w: 680, h: 480 }); return { output: ['Opening Email...'], class: 'pane-term-success' }; },
    inv: () => { P.openWindow({ title: 'Inventory', icon: '🎒', app: 'inventory', w: 620, h: 460 }); return { output: ['Opening Inventory...'], class: 'pane-term-success' }; },

    open: (args) => {
      if(!args) return { output: ['Usage: open <app-name>'], class: 'pane-term-error' };
      const apps = P.getAppList();
      const match = apps.find(a => a.id.toLowerCase() === args.toLowerCase() || (a.name||'').toLowerCase() === args.toLowerCase());
      if(match) {
        P.openWindow({ title: match.name||match.id, icon: match.icon, app: match.id, w: match.defaultW, h: match.defaultH });
        return { output: [`Opened ${match.name||match.id}`], class: 'pane-term-success' };
      }
      return { output: [`No app found: ${args}`], class: 'pane-term-error' };
    },

    exit: (args, state) => {
      if(state.winId) P.closeWindow(state.winId);
      return { output: [] };
    },
  };

  // Register terminal as an app
  P.registerApp('terminal', {
    name: 'Terminal',
    icon: '>_',
    description: 'PenanceOS terminal emulator',
    defaultW: 680,
    defaultH: 420,

    render(bodyEl, win) {
      const term = P.el('div', { className: 'pane-terminal' });
      term.tabIndex = 0;

      const history = [];
      let histIdx = -1;

      function addLine(text, cls) {
        const line = P.el('div', { className: cls || '' }, text);
        term.appendChild(line);
      }

      function addPrompt() {
        const line = P.el('div');
        const prompt = P.el('span', { className: 'pane-term-prompt' }, 'user@penance:~$ ');
        const input = P.el('input', { className: 'pane-term-input', type: 'text', spellcheck: 'false', autocomplete: 'off' });

        input.addEventListener('keydown', (e) => {
          if(e.key === 'Enter') {
            const cmd = input.value.trim();
            input.disabled = true;

            if(cmd) {
              history.push(cmd);
              histIdx = history.length;
            }

            const parts = cmd.split(/\s+/);
            const name = parts[0];
            const args = parts.slice(1).join(' ');
            const handler = COMMANDS[name];

            if(name === 'clear') {
              term.innerHTML = '';
            } else if(handler) {
              const result = handler(args, { ...P.getState(), winId: win.id });
              if(result.output) result.output.forEach(line => addLine(line, result.class));
            } else if(name) {
              addLine(`${name}: command not found. Type "help" for available commands.`, 'pane-term-error');
            }

            addPrompt();
            const newInput = term.querySelector('.pane-term-input:not([disabled])');
            if(newInput) newInput.focus();
          }

          if(e.key === 'ArrowUp') {
            e.preventDefault();
            if(histIdx > 0) { histIdx--; input.value = history[histIdx]; }
          }
          if(e.key === 'ArrowDown') {
            e.preventDefault();
            if(histIdx < history.length - 1) { histIdx++; input.value = history[histIdx]; }
            else { histIdx = history.length; input.value = ''; }
          }
        });

        line.append(prompt, input);
        term.appendChild(line);
        input.focus();
      }

      addLine('PenanceOS Terminal v1.0 — Type "help" for commands', 'pane-term-info');
      addLine('', '');
      addPrompt();

      bodyEl.appendChild(term);
      term.focus();
    }
  });

})();
