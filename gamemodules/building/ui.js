/* CoderWarz Building Interior — UI Sidebar Panel */
window.BuildingInterior = window.BuildingInterior || {};

(function() {
  var BI = window.BuildingInterior;

  var panelEl = null;
  var gameState = null;
  var activeCategory = 'all';
  var activeTab = 'furniture'; // furniture, stats, staff, crime

  var CATEGORIES = {
    all: { label: 'All', icon: '📦' },
    seating: { label: 'Seating', icon: '🪑' },
    tables: { label: 'Tables', icon: '🪴' },
    kitchen: { label: 'Kitchen', icon: '🍳' },
    decor: { label: 'Decor', icon: '🎨' },
    entertainment: { label: 'Fun', icon: '🎮' },
    fixtures: { label: 'Fixtures', icon: '🧱' },
    lighting: { label: 'Lights', icon: '💡' },
  };

  function init(container, opts) {
    panelEl = container;
    opts = opts || {};
    gameState = opts.gameState || null;
    activeTab = 'furniture';
    activeCategory = 'all';
    render();
  }

  function setGameState(state) {
    gameState = state;
    render();
  }

  function render() {
    if(!panelEl) return;
    panelEl.innerHTML = '';

    // Header
    var header = el('div', 'bi-panel-header');
    header.innerHTML = '<span class="bi-logo">🏗️</span> BUILDING INTERIOR';
    panelEl.appendChild(header);

    // Tabs
    var tabs = el('div', 'bi-tabs');
    ['furniture', 'stats', 'staff', 'crime'].forEach(function(t) {
      var btn = el('button', 'bi-tab' + (activeTab === t ? ' active' : ''));
      btn.textContent = t.charAt(0).toUpperCase() + t.slice(1);
      btn.onclick = function() { activeTab = t; render(); };
      tabs.appendChild(btn);
    });
    panelEl.appendChild(tabs);

    // Tab content
    var content = el('div', 'bi-panel-content');

    if(activeTab === 'furniture') renderFurnitureTab(content);
    else if(activeTab === 'stats') renderStatsTab(content);
    else if(activeTab === 'staff') renderStaffTab(content);
    else if(activeTab === 'crime') renderCrimeTab(content);

    panelEl.appendChild(content);
  }

  function renderFurnitureTab(container) {
    // Category filter
    var catBar = el('div', 'bi-categories');
    Object.keys(CATEGORIES).forEach(function(key) {
      var c = CATEGORIES[key];
      var btn = el('button', 'bi-cat-btn' + (activeCategory === key ? ' active' : ''));
      btn.innerHTML = c.icon + ' ' + c.label;
      btn.onclick = function() { activeCategory = key; render(); };
      catBar.appendChild(btn);
    });
    container.appendChild(catBar);

    // Furniture grid
    var items = Object.keys(BI.FURNITURE).filter(function(id) {
      if(activeCategory === 'all') return true;
      return BI.FURNITURE[id].category === activeCategory;
    });

    var grid = el('div', 'bi-furniture-grid');

    items.forEach(function(id) {
      var item = BI.FURNITURE[id];
      var card = el('div', 'bi-furniture-card');
      card.onclick = function() { BI.selectTool(id); render(); };

      card.innerHTML =
        '<div class="bi-furn-icon">' + item.icon + '</div>' +
        '<div class="bi-furn-info">' +
          '<div class="bi-furn-name">' + item.label + '</div>' +
          '<div class="bi-furn-cost">$' + item.cost.toLocaleString() + '</div>' +
        '</div>' +
        '<div class="bi-furn-stats">' +
          (item.satisfaction ? '<span class="bi-stat" title="Satisfaction">😊' + item.satisfaction + '</span>' : '') +
          (item.efficiency ? '<span class="bi-stat" title="Efficiency">⚡' + item.efficiency + '</span>' : '') +
          (item.hygiene ? '<span class="bi-stat" title="Hygiene">🧹' + item.hygiene + '</span>' : '') +
          (item.ambiance ? '<span class="bi-stat" title="Ambiance">✨' + item.ambiance + '</span>' : '') +
          (item.capacity ? '<span class="bi-stat" title="Capacity">👥' + item.capacity + '</span>' : '') +
        '</div>';

      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  function renderStatsTab(container) {
    var stats = BI.getStats();
    if(!stats) {
      var empty = el('div', 'bi-empty');
      empty.textContent = 'No building loaded.';
      container.appendChild(empty);
      return;
    }

    var statsArr = [
      { key: 'satisfaction', label: 'Customer Satisfaction', icon: '😊', color: '#4ade80', desc: 'How happy customers are with your layout.' },
      { key: 'efficiency', label: 'Staff Efficiency', icon: '⚡', color: '#60a5fa', desc: 'How fast staff can move and serve.' },
      { key: 'hygiene', label: 'Cleanliness', icon: '🧹', color: '#a78bfa', desc: 'Hygiene rating affects health inspections.' },
      { key: 'ambiance', label: 'Ambiance', icon: '✨', color: '#f59e0b', desc: 'Atmosphere affects customer stay time.' },
      { key: 'capacity', label: 'Seating Capacity', icon: '👥', color: '#22d3ee', desc: 'Maximum customers at once.' },
    ];

    statsArr.forEach(function(s) {
      var card = el('div', 'bi-stat-card');
      var pct = Math.min(100, Math.round((s.key === 'capacity' ? Math.min(stats[s.key], 100) : stats[s.key]) / 1.5));

      card.innerHTML =
        '<div class="bi-stat-header">' +
          '<span class="bi-stat-icon">' + s.icon + '</span>' +
          '<span class="bi-stat-label">' + s.label + '</span>' +
          '<span class="bi-stat-value" style="color:' + s.color + '">' + (s.key === 'capacity' ? stats[s.key] + ' seats' : stats[s.key] + '%') + '</span>' +
        '</div>' +
        '<div class="bi-stat-bar"><div style="width:' + pct + '%;background:' + s.color + '"></div></div>' +
        '<div class="bi-stat-desc">' + s.desc + '</div>';
      container.appendChild(card);
    });

    // Overall rating
    var overall = Math.round((stats.satisfaction + stats.efficiency + stats.hygiene + stats.ambiance) / 4);
    var ratingCard = el('div', 'bi-rating-card');
    var stars = '';
    for(var i = 0; i < 5; i++) {
      stars += i < Math.round(overall / 20) ? '⭐' : '☆';
    }
    ratingCard.innerHTML =
      '<div class="bi-rating-label">OVERALL RATING</div>' +
      '<div class="bi-rating-stars">' + stars + '</div>' +
      '<div class="bi-rating-score">' + overall + '/100</div>';
    container.appendChild(ratingCard);
  }

  function renderStaffTab(container) {
    var staffTypes = [
      { id: 'chef', label: 'Chef', icon: '👨‍🍳', cost: 500, skill: 'cooking', desc: 'Prepares food. Efficiency affects speed.' },
      { id: 'waiter', label: 'Waiter', icon: '🤵', cost: 300, skill: 'service', desc: 'Serves customers. Affects satisfaction.' },
      { id: 'manager', label: 'Manager', icon: '👔', cost: 800, skill: 'management', desc: 'Boosts all staff efficiency.' },
      { id: 'cleaner', label: 'Cleaner', icon: '🧹', cost: 200, skill: 'cleaning', desc: 'Maintains hygiene rating.' },
      { id: 'bouncer', label: 'Bouncer', icon: '💂', cost: 600, skill: 'security', desc: 'Reduces crime risk. Required for nightlife.' },
    ];

    var label = el('div', 'bi-card-label');
    label.textContent = 'STAFF ROSTER';
    container.appendChild(label);

    staffTypes.forEach(function(s) {
      var card = el('div', 'bi-staff-card');
      var count = (gameState && gameState.staff) ? (gameState.staff[s.id] || 0) : 0;

      card.innerHTML =
        '<div class="bi-staff-header">' +
          '<span class="bi-staff-icon">' + s.icon + '</span>' +
          '<div class="bi-staff-info">' +
            '<div class="bi-staff-name">' + s.label + '</div>' +
            '<div class="bi-staff-desc">' + s.desc + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="bi-staff-footer">' +
          '<span class="bi-staff-count">x' + count + '</span>' +
          '<span class="bi-staff-cost">$' + s.cost + '</span>' +
          '<button class="bi-btn-sm bi-btn-hire" data-staff="' + s.id + '">+ Hire</button>' +
        '</div>';
      container.appendChild(card);
    });
  }

  function renderCrimeTab(container) {
    var crimes = [
      { id: 'sabotage', label: 'Sabotage', icon: '🔥', desc: 'Destroy rival equipment.', risk: 'Medium', reward: 'Reputation' },
      { id: 'robbery', label: 'Robbery', icon: '💰', desc: 'Steal cash from target.', risk: 'High', reward: 'Dirty Cash' },
      { id: 'intimidation', label: 'Intimidate', icon: '😠', desc: 'Threaten rival staff.', risk: 'Low', reward: 'Fear' },
      { id: 'heist', label: 'Heist', icon: '🏦', desc: 'Major coordinated robbery.', risk: 'Very High', reward: 'Big Payout' },
      { id: 'launder', label: 'Launder', icon: '🔄', desc: 'Clean dirty money.', risk: 'Low', reward: 'Clean Cash' },
    ];

    var label = el('div', 'bi-card-label');
    label.textContent = 'CRIMINAL OPERATIONS';
    container.appendChild(label);

    crimes.forEach(function(c) {
      var card = el('div', 'bi-crime-card');
      var riskColor = c.risk === 'Very High' ? '#ef4444' : c.risk === 'High' ? '#f97316' : c.risk === 'Medium' ? '#f59e0b' : '#4ade80';

      card.innerHTML =
        '<div class="bi-crime-header">' +
          '<span class="bi-crime-icon">' + c.icon + '</span>' +
          '<div class="bi-crime-info">' +
            '<div class="bi-crime-name">' + c.label + '</div>' +
            '<div class="bi-crime-desc">' + c.desc + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="bi-crime-footer">' +
          '<span class="bi-crime-risk" style="color:' + riskColor + '">Risk: ' + c.risk + '</span>' +
          '<span class="bi-crime-reward">Reward: ' + c.reward + '</span>' +
          '<button class="bi-btn-sm bi-btn-crime" data-crime="' + c.id + '">Execute</button>' +
        '</div>';
      container.appendChild(card);
    });

    // Heat meter
    var heat = (gameState && gameState.heat) || 0;
    var heatCard = el('div', 'bi-heat-card');
    var heatColor = heat < 20 ? '#4ade80' : heat < 50 ? '#f59e0b' : heat < 80 ? '#f97316' : '#ef4444';
    heatCard.innerHTML =
      '<div class="bi-heat-header">' +
        '<span class="bi-heat-icon">🌡️</span>' +
        '<span class="bi-heat-label">POLICE HEAT</span>' +
        '<span class="bi-heat-value" style="color:' + heatColor + '">' + heat + '%</span>' +
      '</div>' +
      '<div class="bi-heat-bar"><div style="width:' + heat + '%;background:' + heatColor + '"></div></div>' +
      '<div class="bi-heat-desc">' +
        (heat < 20 ? 'No police activity.' :
         heat < 50 ? 'Increased patrols in the area.' :
         heat < 80 ? 'Investigation underway. Be careful.' :
         'RAID IMMINENT. Lie low.') +
      '</div>';
    container.appendChild(heatCard);
  }

  // === EVENT HANDLERS ===
  function handleAction(action, data) {
    if(action === 'hire_staff') {
      dispatchToParent({ type: 'HIRE_STAFF', staffId: data.staffId });
    }
    if(action === 'execute_crime') {
      dispatchToParent({ type: 'EXECUTE_CRIME', crimeId: data.crimeId });
    }
    if(action === 'remove_furniture') {
      BI.removeFurniture(data.x, data.y);
      render();
    }
  }

  function dispatchToParent(action) {
    try {
      if(window.parent && window.parent !== window && window.parent.dispatch) {
        window.parent.dispatch(action);
      } else {
        window.parent.postMessage(action, '*');
      }
    } catch(e) {}
  }

  // === HELPERS ===
  function el(tag, className) {
    var e = document.createElement(tag);
    if(className) e.className = className;
    return e;
  }

  // === PUBLIC API ===
  BI.UI = {
    init: init,
    render: render,
    setGameState: setGameState,
    handleAction: handleAction,
  };

})();
