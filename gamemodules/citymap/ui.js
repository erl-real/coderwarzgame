/* CoderWarz City Map — UI Sidebar Panel */
window.CityMap = window.CityMap || {};

(function() {
  var CM = window.CityMap;

  var panelEl = null;
  var gameState = null;
  var activeTab = 'nav'; // nav, missions, districts, rivals

  var MISSIONS = [
    {
      id: 'rob_bank',
      title: 'Bank Robbery',
      type: 'syndicate',
      target: 'bank_main',
      reward: 25000,
      risk: 0.4,
      travelTime: 3,
      description: 'Hit the Offchain Bank HQ. High reward, high risk.',
      requires: 'syndicate_rep_50',
    },
    {
      id: 'sabotage_rival',
      title: 'Sabotage Rival',
      type: 'crime',
      target: 'rival_1',
      reward: 8000,
      risk: 0.2,
      travelTime: 2,
      description: 'Destroy equipment at Rival HQ.',
      requires: null,
    },
    {
      id: 'steal_ingredients',
      title: 'Steal Ingredients',
      type: 'crime',
      target: 'supplier_1',
      reward: 3000,
      risk: 0.15,
      travelTime: 1,
      description: 'Steal supplies from Fresh Supply Co.',
      requires: null,
    },
    {
      id: 'intimidate_manager',
      title: 'Intimidate Manager',
      type: 'syndicate',
      target: 'restaurant_2',
      reward: 12000,
      risk: 0.3,
      travelTime: 2,
      description: 'Threaten the manager at Sakura Sushi.',
      requires: 'syndicate_rep_30',
    },
    {
      id: 'launder_money',
      title: 'Launder Money',
      type: 'syndicate',
      target: 'warehouse_1',
      reward: 0,
      risk: 0.1,
      travelTime: 1,
      description: 'Clean dirty cash at the Old Warehouse.',
      requires: 'dirty_cash_5000',
    },
    {
      id: 'supply_run',
      title: 'Supply Run',
      type: 'logistics',
      target: 'supplier_2',
      reward: 2000,
      risk: 0.05,
      travelTime: 1,
      description: 'Pick up wholesale ingredients.',
      requires: null,
    },
  ];

  function init(container, opts) {
    panelEl = container;
    opts = opts || {};
    gameState = opts.gameState || null;
    activeTab = 'nav';
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
    var header = el('div', 'cm-panel-header');
    header.innerHTML = '<span class="cm-logo">🏙️</span> CITY MAP';
    panelEl.appendChild(header);

    // Tabs
    var tabs = el('div', 'cm-tabs');
    ['nav', 'missions', 'districts', 'rivals'].forEach(function(t) {
      var btn = el('button', 'cm-tab' + (activeTab === t ? ' active' : ''));
      btn.textContent = t.charAt(0).toUpperCase() + t.slice(1);
      btn.onclick = function() { activeTab = t; render(); };
      tabs.appendChild(btn);
    });
    panelEl.appendChild(tabs);

    // Tab content
    var content = el('div', 'cm-panel-content');

    if(activeTab === 'nav') renderNavTab(content);
    else if(activeTab === 'missions') renderMissionsTab(content);
    else if(activeTab === 'districts') renderDistrictsTab(content);
    else if(activeTab === 'rivals') renderRivalsTab(content);

    panelEl.appendChild(content);
  }

  function renderNavTab(container) {
    var playerPos = CM.getPlayerPosition();
    var nodes = CM.getNodes();
    var selected = CM.getSelectedNode();

    // Current position
    var posCard = el('div', 'cm-card');
    posCard.innerHTML = '<div class="cm-card-label">YOUR POSITION</div>' +
      '<div class="cm-card-value">Grid ' + playerPos.x + ', ' + playerPos.y + '</div>';
    container.appendChild(posCard);

    // Nearby nodes
    var nearby = nodes.filter(function(n) {
      var d = Math.abs(n.x - playerPos.x) + Math.abs(n.y - playerPos.y);
      return d <= 6 && d > 0;
    }).sort(function(a, b) {
      return (Math.abs(a.x-playerPos.x)+Math.abs(a.y-playerPos.y)) -
             (Math.abs(b.x-playerPos.x)+Math.abs(b.y-playerPos.y));
    });

    var navLabel = el('div', 'cm-card-label');
    navLabel.textContent = 'NEARBY LOCATIONS (' + nearby.length + ')';
    container.appendChild(navLabel);

    nearby.forEach(function(n) {
      var t = CM.NODE_TYPES[n.type];
      var dist = Math.abs(n.x - playerPos.x) + Math.abs(n.y - playerPos.y);
      var travelMin = dist * 2;

      var row = el('div', 'cm-nav-row');
      row.innerHTML =
        '<div class="cm-nav-icon">' + t.icon + '</div>' +
        '<div class="cm-nav-info">' +
          '<div class="cm-nav-name">' + n.name + '</div>' +
          '<div class="cm-nav-meta">' + t.label + ' · ' + travelMin + ' min travel</div>' +
        '</div>' +
        '<button class="cm-btn-sm cm-btn-travel" data-node="' + n.id + '">GO</button>';
      container.appendChild(row);
    });

    // Travel button for selected node
    if(selected) {
      var dist = Math.abs(selected.x - playerPos.x) + Math.abs(selected.y - playerPos.y);
      var travelMin = dist * 2;
      var isHere = selected.x === playerPos.x && selected.y === playerPos.y;

      var travelCard = el('div', 'cm-card cm-travel-card');
      travelCard.innerHTML =
        '<div class="cm-card-label">TRAVEL TO</div>' +
        '<div class="cm-card-value">' + CM.NODE_TYPES[selected.type].icon + ' ' + selected.name + '</div>' +
        '<div class="cm-card-meta">' + travelMin + ' min travel time</div>' +
        '<button class="cm-btn cm-btn-primary' + (isHere ? ' cm-btn-disabled' : '') + '" data-action="travel"' +
          (isHere ? ' disabled' : '') + '>' +
          (isHere ? 'Already Here' : 'Travel Now (' + travelMin + ' min)') +
        '</button>';
      container.appendChild(travelCard);
    }
  }

  function renderMissionsTab(container) {
    var playerPos = CM.getPlayerPosition();
    var nodes = CM.getNodes();

    var available = MISSIONS.filter(function(m) {
      if(!m.requires) return true;
      // Check basic requirements
      if(m.requires.startsWith('syndicate_rep_')) {
        var req = parseInt(m.requires.split('_')[2]);
        return gameState && (gameState.syndicateRep || 0) >= req;
      }
      if(m.requires.startsWith('dirty_cash_')) {
        var req = parseInt(m.requires.split('_')[2]);
        return gameState && (gameState.dirtyCash || 0) >= req;
      }
      return true;
    });

    var navLabel = el('div', 'cm-card-label');
    navLabel.textContent = 'AVAILABLE MISSIONS (' + available.length + ')';
    container.appendChild(navLabel);

    available.forEach(function(m) {
      var targetNode = nodes.find(function(n){ return n.id === m.target; });
      var travelDist = targetNode ? Math.abs(targetNode.x - playerPos.x) + Math.abs(targetNode.y - playerPos.y) : 0;

      var riskColor = m.risk > 0.3 ? '#ef4444' : m.risk > 0.15 ? '#f59e0b' : '#4ade80';

      var card = el('div', 'cm-mission-card');
      card.innerHTML =
        '<div class="cm-mission-header">' +
          '<span class="cm-mission-type cm-type-' + m.type + '">' + m.type.toUpperCase() + '</span>' +
          '<span class="cm-mission-reward">$' + m.reward.toLocaleString() + '</span>' +
        '</div>' +
        '<div class="cm-mission-title">' + m.title + '</div>' +
        '<div class="cm-mission-desc">' + m.description + '</div>' +
        '<div class="cm-mission-footer">' +
          '<span class="cm-mission-stat">⏱️ ' + (travelDist * 2) + ' min</span>' +
          '<span class="cm-mission-stat" style="color:' + riskColor + '">⚠️ ' + Math.round(m.risk * 100) + '% risk</span>' +
          '<button class="cm-btn-sm cm-btn-mission" data-mission="' + m.id + '">RUN</button>' +
        '</div>';
      container.appendChild(card);
    });

    if(available.length === 0) {
      var empty = el('div', 'cm-empty');
      empty.textContent = 'No missions available. Build your reputation first.';
      container.appendChild(empty);
    }
  }

  function renderDistrictsTab(container) {
    var districts = CM.getDistricts();
    var nodes = CM.getNodes();

    Object.keys(districts).forEach(function(key) {
      var d = districts[key];
      var count = nodes.filter(function(n) {
        return true; // simplified
      }).length;

      var card = el('div', 'cm-district-card');
      card.innerHTML =
        '<div class="cm-district-header">' +
          '<span class="cm-district-dot" style="background:' + d.color + '"></span>' +
          '<span class="cm-district-name">' + d.label + '</span>' +
        '</div>' +
        '<div class="cm-district-stats">' +
          '<div class="cm-stat"><span class="cm-stat-label">💰 Wealth</span><span class="cm-stat-bar"><span style="width:' + (d.wealth*100) + '%"></span></span><span class="cm-stat-val">' + Math.round(d.wealth*100) + '%</span></div>' +
          '<div class="cm-stat"><span class="cm-stat-label">🚗 Traffic</span><span class="cm-stat-bar"><span style="width:' + (d.traffic*100) + '%"></span></span><span class="cm-stat-val">' + Math.round(d.traffic*100) + '%</span></div>' +
          '<div class="cm-stat"><span class="cm-stat-label">🔪 Crime</span><span class="cm-stat-bar"><span style="width:' + (d.crime*100) + '%"></span></span><span class="cm-stat-val">' + Math.round(d.crime*100) + '%</span></div>' +
        '</div>';
      container.appendChild(card);
    });
  }

  function renderRivalsTab(container) {
    var nodes = CM.getNodes();
    var rivals = nodes.filter(function(n) { return n.type === 'rival'; });

    var navLabel = el('div', 'cm-card-label');
    navLabel.textContent = 'COMPETITOR LOCATIONS';
    container.appendChild(navLabel);

    rivals.forEach(function(n) {
      var card = el('div', 'cm-rival-card');
      card.innerHTML =
        '<div class="cm-rival-header">' +
          '<span class="cm-rival-icon">⚔️</span>' +
          '<span class="cm-rival-name">' + n.name + '</span>' +
        '</div>' +
        '<div class="cm-rival-stats">' +
          '<div class="cm-rival-stat">📍 Grid ' + n.x + ', ' + n.y + '</div>' +
          '<div class="cm-rival-stat">Level: ' + (gameState?.rivalLevel || 1) + '</div>' +
        '</div>' +
        '<div class="cm-rival-actions">' +
          '<button class="cm-btn-sm cm-btn-crime" data-mission="sabotage_rival" data-target="' + n.id + '">🗡️ Sabotage</button>' +
          '<button class="cm-btn-sm cm-btn-crime" data-mission="steal_ingredients" data-target="' + n.id + '">📦 Steal</button>' +
          '<button class="cm-btn-sm cm-btn-crime" data-mission="intimidate_manager" data-target="' + n.id + '">威胁 Intimidate</button>' +
        '</div>';
      container.appendChild(card);
    });
  }

  // === EVENT HANDLERS ===
  function handleAction(action, data) {
    if(action === 'travel' && data.nodeId) {
      var node = CM.travelTo(data.nodeId);
      if(node) {
        dispatchToParent({ type: 'TRAVEL_TO', nodeId: node.id, gx: node.x, gy: node.y });
        render();
      }
    }
    if(action === 'run_mission' && data.missionId) {
      var mission = MISSIONS.find(function(m){ return m.id === data.missionId; });
      if(mission) {
        dispatchToParent({ type: 'RUN_MISSION', mission: mission });
      }
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
  CM.UI = {
    init: init,
    render: render,
    setGameState: setGameState,
    handleAction: handleAction,
    MISSIONS: MISSIONS,
  };

})();
