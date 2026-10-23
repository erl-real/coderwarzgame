/* CoderWarz City Map — Isometric Macro Layer Engine */
window.CityMap = window.CityMap || {};

(function() {
  var CM = window.CityMap;

  // === TILE CONSTANTS ===
  var TILE_W = 64;
  var TILE_H = 32;
  var HALF_W = TILE_W / 2;
  var HALF_H = TILE_H / 2;

  // === DISTRICT TYPES ===
  var DISTRICTS = {
    commercial:  { color: '#2d5a27', label: 'Commercial',  wealth: 0.7, crime: 0.1, traffic: 0.8 },
    residential: { color: '#3a5a8a', label: 'Residential', wealth: 0.5, crime: 0.15, traffic: 0.4 },
    nightlife:   { color: '#6a3a7a', label: 'Nightlife',   wealth: 0.6, crime: 0.4, traffic: 0.6 },
    industrial:  { color: '#5a5040', label: 'Industrial',  wealth: 0.3, crime: 0.3, traffic: 0.3 },
    downtown:    { color: '#4a6a5a', label: 'Downtown',    wealth: 0.9, crime: 0.2, traffic: 0.9 },
    suburbs:     { color: '#3a6a3a', label: 'Suburbs',     wealth: 0.5, crime: 0.05, traffic: 0.3 },
  };

  // === MAP LAYOUT (16x16 grid) ===
  // Each cell: { district, walkable, building }
  var MAP_DATA = [];

  function generateMap(seed) {
    var rng = mulberry32(seed || 42);
    MAP_DATA = [];
    for(var y = 0; y < 16; y++) {
      MAP_DATA[y] = [];
      for(var x = 0; x < 16; x++) {
        var d = pickDistrict(x, y, rng);
        MAP_DATA[y][x] = {
          district: d,
          walkable: d !== 'water',
          building: null,
        };
      }
    }
    // Place buildings on nodes
    placeBuildings();
  }

  function pickDistrict(x, y, rng) {
    // Create a natural layout: downtown center, commercial ring, residential outer, industrial corners
    var cx = 7.5, cy = 7.5;
    var dist = Math.sqrt((x-cx)*(x-cx) + (y-cy)*(y-cy));
    var angle = Math.atan2(y-cy, x-cx);

    if(dist < 2.5) return 'downtown';
    if(dist < 4.5) {
      if(angle > -0.5 && angle < 1.0) return 'commercial';
      if(angle > 1.0 || angle < -2.0) return 'nightlife';
      return 'commercial';
    }
    if(dist < 6.5) return 'residential';
    if((x < 3 || x > 12) && (y < 3 || y > 12)) return 'industrial';
    return 'suburbs';
  }

  function mulberry32(a) {
    return function() {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
  }

  // === LOCATION NODES ===
  var NODES = [];
  var NODE_TYPES = {
    bank:       { icon: '🏦', color: '#4ade80', label: 'Bank' },
    restaurant: { icon: '🍕', color: '#f59e0b', label: 'Restaurant' },
    supplier:   { icon: '📦', color: '#60a5fa', label: 'Supplier' },
    syndicate:  { icon: '💀', color: '#ef4444', label: 'Syndicate Hub' },
    rival:      { icon: '⚔️', color: '#f97316', label: 'Rival Location' },
    warehouse:  { icon: '🏭', color: '#8b5cf6', label: 'Warehouse' },
    player:     { icon: '🏠', color: '#22d3ee', label: 'Your Business' },
  };

  function placeBuildings() {
    NODES = [
      // Downtown
      { id: 'bank_main', type: 'bank', x: 7, y: 7, name: 'Offchain Bank HQ' },
      { id: 'player_1', type: 'player', x: 8, y: 7, name: 'Your Business' },

      // Commercial
      { id: 'restaurant_1', type: 'restaurant', x: 5, y: 6, name: "Joe's Pizza" },
      { id: 'restaurant_2', type: 'restaurant', x: 10, y: 8, name: 'Sakura Sushi' },
      { id: 'supplier_1', type: 'supplier', x: 4, y: 5, name: 'Fresh Supply Co' },
      { id: 'supplier_2', type: 'supplier', x: 11, y: 6, name: 'Wholesale Depot' },

      // Nightlife
      { id: 'syndicate_1', type: 'syndicate', x: 3, y: 9, name: 'The Void Cell' },
      { id: 'warehouse_1', type: 'warehouse', x: 2, y: 8, name: 'Old Warehouse' },

      // Residential
      { id: 'restaurant_3', type: 'restaurant', x: 6, y: 11, name: 'Corner Bistro' },
      { id: 'bank_2', type: 'bank', x: 10, y: 11, name: 'Local Branch' },

      // Industrial
      { id: 'rival_1', type: 'rival', x: 2, y: 2, name: 'Rival HQ' },
      { id: 'warehouse_2', type: 'warehouse', x: 13, y: 3, name: 'Storage Yard' },
      { id: 'supplier_3', type: 'supplier', x: 1, y: 12, name: 'Bulk Foods Inc' },

      // Suburbs
      { id: 'restaurant_4', type: 'restaurant', x: 13, y: 13, name: 'Suburbs Diner' },
      { id: 'player_2', type: 'player', x: 12, y: 10, name: 'Second Location' },
    ];

    // Mark buildings on map
    NODES.forEach(function(n) {
      if(MAP_DATA[n.y] && MAP_DATA[n.y][n.x]) {
        MAP_DATA[n.y][n.x].building = n.id;
      }
    });
  }

  // === ISOMETRIC HELPERS ===
  function toIso(gx, gy) {
    return {
      sx: (gx - gy) * HALF_W,
      sy: (gx + gy) * HALF_H,
    };
  }

  function fromIso(sx, sy) {
    return {
      gx: (sx / HALF_W + sy / HALF_H) / 2,
      gy: (sy / HALF_H - sx / HALF_W) / 2,
    };
  }

  // === RENDERER ===
  var canvas, ctx;
  var camera = { x: 0, y: 0, zoom: 1 };
  var playerPos = { x: 7, y: 7 };
  var selectedNode = null;
  var hoverNode = null;
  var mapReady = false;
  var onNodeSelect = null;

  function init(canvasEl, opts) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    mapReady = false;

    opts = opts || {};
    onNodeSelect = opts.onNodeSelect || null;

    generateMap(opts.seed || 42);

    // Center camera on player
    var iso = toIso(playerPos.x, playerPos.y);
    camera.x = canvas.width / 2 - iso.sx;
    camera.y = canvas.height / 2 - iso.sy;

    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel);

    mapReady = true;
    render();
  }

  function resize() {
    if(!canvas) return;
    canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : 800;
    canvas.height = canvas.parentElement ? canvas.parentElement.clientHeight : 600;
    render();
  }

  var isDragging = false;
  var dragStart = { x: 0, y: 0 };
  var camStart = { x: 0, y: 0 };

  function onMouseDown(e) {
    isDragging = true;
    dragStart = { x: e.clientX, y: e.clientY };
    camStart = { x: camera.x, y: camera.y };
  }

  function onMouseMove(e) {
    if(isDragging) {
      camera.x = camStart.x + (e.clientX - dragStart.x);
      camera.y = camStart.y + (e.clientY - dragStart.y);
      render();
      return;
    }

    // Hover detection
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left - camera.x) / camera.zoom;
    var my = (e.clientY - rect.top - camera.y) / camera.zoom;

    var found = null;
    for(var i = 0; i < NODES.length; i++) {
      var n = NODES[i];
      var iso = toIso(n.x, n.y);
      var dx = mx - iso.sx;
      var dy = my - iso.sy;
      if(Math.abs(dx) < 24 && Math.abs(dy) < 16) {
        found = n;
        break;
      }
    }

    if(found !== hoverNode) {
      hoverNode = found;
      canvas.style.cursor = found ? 'pointer' : 'grab';
      render();
    }
  }

  function onMouseUp(e) {
    if(isDragging) {
      var dx = Math.abs(e.clientX - dragStart.x);
      var dy = Math.abs(e.clientY - dragStart.y);
      if(dx < 5 && dy < 5) {
        // Click — check node
        if(hoverNode) {
          selectedNode = hoverNode;
          if(onNodeSelect) onNodeSelect(selectedNode);
          render();
        } else {
          selectedNode = null;
          render();
        }
      }
      isDragging = false;
    }
  }

  function onWheel(e) {
    e.preventDefault();
    var delta = e.deltaY > 0 ? 0.9 : 1.1;
    camera.zoom = Math.max(0.3, Math.min(3, camera.zoom * delta));
    render();
  }

  // === RENDER ===
  function render() {
    if(!ctx || !mapReady) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0a0c0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);

    // Draw tiles
    for(var y = 0; y < 16; y++) {
      for(var x = 0; x < 16; x++) {
        drawTile(x, y, MAP_DATA[y][x]);
      }
    }

    // Draw roads between nodes (paths)
    drawPaths();

    // Draw nodes
    NODES.forEach(function(n) {
      drawNode(n);
    });

    // Draw player marker
    drawPlayerMarker();

    // Draw selection ring on selected node
    if(selectedNode) {
      var si = toIso(selectedNode.x, selectedNode.y);
      ctx.beginPath();
      ctx.ellipse(si.sx, si.sy + 4, 20, 10, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();

    // HUD
    drawHUD();
  }

  function drawTile(x, y, cell) {
    var iso = toIso(x, y);
    var d = DISTRICTS[cell.district] || DISTRICTS.commercial;

    ctx.beginPath();
    ctx.moveTo(iso.sx, iso.sy - HALF_H);
    ctx.lineTo(iso.sx + HALF_W, iso.sy);
    ctx.lineTo(iso.sx, iso.sy + HALF_H);
    ctx.lineTo(iso.sx - HALF_W, iso.sy);
    ctx.closePath();

    ctx.fillStyle = d.color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  function drawPaths() {
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);

    for(var i = 0; i < NODES.length; i++) {
      for(var j = i + 1; j < NODES.length; j++) {
        var a = NODES[i], b = NODES[j];
        var dist = Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
        if(dist <= 4) {
          var ai = toIso(a.x, a.y);
          var bi = toIso(b.x, b.y);
          ctx.beginPath();
          ctx.moveTo(ai.sx, ai.sy);
          ctx.lineTo(bi.sx, bi.sy);
          ctx.stroke();
        }
      }
    }
    ctx.setLineDash([]);
  }

  function drawNode(n) {
    var iso = toIso(n.x, n.y);
    var t = NODE_TYPES[n.type];
    var isHover = (hoverNode === n);
    var isSelected = (selectedNode === n);

    // Glow
    if(isHover || isSelected) {
      ctx.beginPath();
      ctx.ellipse(iso.sx, iso.sy + 2, 18, 10, 0, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? 'rgba(34,211,238,0.25)' : 'rgba(255,255,255,0.12)';
      ctx.fill();
    }

    // Icon
    ctx.font = (isHover ? '20px' : '16px') + ' serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(t.icon, iso.sx, iso.sy - 6);

    // Label
    if(isHover || isSelected) {
      ctx.font = '10px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#e7e9ea';
      ctx.textAlign = 'center';
      ctx.fillText(n.name, iso.sx, iso.sy + 14);
    }
  }

  function drawPlayerMarker() {
    var iso = toIso(playerPos.x, playerPos.y);
    // Pulsing ring
    var t = (Date.now() % 2000) / 2000;
    var pulse = 10 + Math.sin(t * Math.PI * 2) * 4;
    ctx.beginPath();
    ctx.ellipse(iso.sx, iso.sy + 2, pulse, pulse / 2, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(34,211,238,0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Player dot
    ctx.beginPath();
    ctx.arc(iso.sx, iso.sy - 2, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#22d3ee';
    ctx.fill();
    ctx.strokeStyle = '#0e7490';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function drawHUD() {
    if(!ctx) return;

    // District legend
    var legendX = 12;
    var legendY = canvas.height - 120;
    ctx.fillStyle = 'rgba(10,12,15,0.85)';
    ctx.fillRect(legendX, legendY, 140, 108);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX, legendY, 140, 108);

    ctx.font = '10px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.textAlign = 'left';
    ctx.fillText('DISTRICTS', legendX + 10, legendY + 16);

    var i = 0;
    Object.keys(DISTRICTS).forEach(function(key) {
      var d = DISTRICTS[key];
      var ly = legendY + 30 + i * 14;
      ctx.fillStyle = d.color;
      ctx.fillRect(legendX + 10, ly - 4, 8, 8);
      ctx.fillStyle = '#9ca3af';
      ctx.fillText(d.label, legendX + 24, ly + 2);
      i++;
    });

    // Selected node info
    if(selectedNode) {
      var infoX = canvas.width - 200;
      var infoY = 12;
      var t = NODE_TYPES[selectedNode.type];

      ctx.fillStyle = 'rgba(10,12,15,0.9)';
      ctx.fillRect(infoX, infoY, 188, 120);
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.strokeRect(infoX, infoY, 188, 120);

      ctx.font = '11px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#e7e9ea';
      ctx.textAlign = 'left';
      ctx.fillText(t.icon + ' ' + selectedNode.name, infoX + 10, infoY + 22);

      ctx.font = '10px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#8b949b';
      ctx.fillText('Type: ' + t.label, infoX + 10, infoY + 40);

      var d = DISTRICTS[MAP_DATA[selectedNode.y][selectedNode.x].district];
      ctx.fillText('District: ' + (d ? d.label : 'Unknown'), infoX + 10, infoY + 55);
      ctx.fillText('Traffic: ' + (d ? Math.round(d.traffic * 100) + '%' : '?'), infoX + 10, infoY + 70);
      ctx.fillText('Crime: ' + (d ? Math.round(d.crime * 100) + '%' : '?'), infoX + 10, infoY + 85);
      ctx.fillText('Wealth: ' + (d ? Math.round(d.wealth * 100) + '%' : '?'), infoX + 10, infoY + 100);

      // Travel button
      var btnX = infoX + 10, btnY = infoY + 108;
      ctx.fillStyle = selectedNode.x === playerPos.x && selectedNode.y === playerPos.y ? '#4a5568' : '#4a9eff';
      ctx.fillRect(btnX, btnY, 168, 22);
      ctx.fillStyle = '#fff';
      ctx.font = '11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        selectedNode.x === playerPos.x && selectedNode.y === playerPos.y ? 'You are here' : 'Travel Here',
        btnX + 84, btnY + 15
      );
    }

    // Player position
    ctx.fillStyle = 'rgba(10,12,15,0.8)';
    ctx.fillRect(canvas.width - 150, canvas.height - 30, 138, 22);
    ctx.fillStyle = '#8b949b';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('POS: ' + playerPos.x + ', ' + playerPos.y, canvas.width - 18, canvas.height - 15);
  }

  // === TRAVEL ===
  function travelTo(nodeId) {
    var node = NODES.find(function(n){ return n.id === nodeId; });
    if(!node) return false;
    playerPos = { x: node.x, y: node.y };
    selectedNode = node;
    render();
    return node;
  }

  function getPlayerPosition() {
    return { x: playerPos.x, y: playerPos.y };
  }

  function getSelectedNode() {
    return selectedNode;
  }

  function getNodes() {
    return NODES;
  }

  function getDistricts() {
    return DISTRICTS;
  }

  // === PUBLIC API ===
  CM.init = init;
  CM.render = render;
  CM.travelTo = travelTo;
  CM.getPlayerPosition = getPlayerPosition;
  CM.getSelectedNode = getSelectedNode;
  CM.getNodes = getNodes;
  CM.getDistricts = getDistricts;
  CM.NODE_TYPES = NODE_TYPES;
  CM.toIso = toIso;

  // === EMBED MODE ===
  // Modules can be used standalone OR embedded in other sites via iframe/postMessage.
  // Embed mode: compact UI, accepts external commands, reports events back.
  var embedMode = false;
  var embedOpts = {};

  function setEmbedMode(opts) {
    embedMode = true;
    embedOpts = opts || {};
    if(opts.focusNode) {
      var node = NODES.find(function(n){ return n.id === opts.focusNode; });
      if(node) {
        selectedNode = node;
        playerPos = { x: node.x, y: node.y };
        var iso = toIso(node.x, node.y);
        camera.x = (canvas ? canvas.width / 2 : 400) - iso.sx;
        camera.y = (canvas ? canvas.height / 2 : 300) - iso.sy;
      }
    }
    if(opts.focusX !== undefined && opts.focusY !== undefined) {
      playerPos = { x: opts.focusX, y: opts.focusY };
      var iso = toIso(opts.focusX, opts.focusY);
      camera.x = (canvas ? canvas.width / 2 : 400) - iso.sx;
      camera.y = (canvas ? canvas.height / 2 : 300) - iso.sy;
    }
    if(opts.readOnly) {
      onNodeSelect = null;
    }
    render();
  }

  function isEmbedMode() { return embedMode; }

  // postMessage API — external sites can send commands
  function handlePostMessage(e) {
    if(!e.data || typeof e.data !== 'object') return;
    var msg = e.data;

    if(msg.type === 'CM_TRAVEL_TO' || msg.type === 'travelTo') {
      travelTo(msg.nodeId);
      render();
      reportEvent('traveled', { nodeId: msg.nodeId, x: playerPos.x, y: playerPos.y });
    }
    if(msg.type === 'CM_FOCUS_NODE' || msg.type === 'focusNode') {
      var node = NODES.find(function(n){ return n.id === msg.nodeId; });
      if(node) {
        selectedNode = node;
        var iso = toIso(node.x, node.y);
        camera.x = (canvas ? canvas.width / 2 : 400) - iso.sx;
        camera.y = (canvas ? canvas.height / 2 : 300) - iso.sy;
        render();
      }
    }
    if(msg.type === 'CM_FOCUS_POSITION' || msg.type === 'focusPosition') {
      var iso = toIso(msg.x, msg.y);
      camera.x = (canvas ? canvas.width / 2 : 400) - iso.sx;
      camera.y = (canvas ? canvas.height / 2 : 300) - iso.sy;
      render();
    }
    if(msg.type === 'CM_SET_PLAYER_POS' || msg.type === 'setPlayerPosition') {
      playerPos = { x: msg.x, y: msg.y };
      render();
      reportEvent('positionSet', { x: msg.x, y: msg.y });
    }
    if(msg.type === 'CM_SELECT_MISSION' || msg.type === 'selectMission') {
      reportEvent('missionSelected', { missionId: msg.missionId, target: msg.target });
    }
    if(msg.type === 'CM_GET_STATE' || msg.type === 'getState') {
      reportEvent('state', {
        playerPos: playerPos,
        selectedNode: selectedNode ? selectedNode.id : null,
        nodes: NODES.map(function(n) { return { id: n.id, type: n.type, name: n.name, x: n.x, y: n.y }; }),
      });
    }
    if(msg.type === 'CM_UPDATE_SYNC' || msg.type === 'updateSync') {
      // External sites can push fresh game state
      if(msg.gameState) {
        reportEvent('syncUpdated', { gameState: msg.gameState });
      }
    }
  }

  function reportEvent(eventName, data) {
    try {
      var payload = { type: 'CM_EVENT', event: eventName, data: data };
      window.parent.postMessage(payload, '*');
    } catch(e) {}
  }

  window.addEventListener('message', handlePostMessage);

  // Parse URL params for embed config
  function parseUrlParams() {
    var params = {};
    try {
      var search = window.location.search;
      if(search) {
        search.substring(1).split('&').forEach(function(pair) {
          var kv = pair.split('=');
          params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
        });
      }
    } catch(e) {}
    return params;
  }

  // Auto-detect embed mode from URL
  var urlParams = parseUrlParams();
  if(urlParams.embed === '1' || urlParams.embed === 'true') {
    embedMode = true;
    embedOpts = {
      focusNode: urlParams.node || null,
      focusX: urlParams.x ? parseInt(urlParams.x) : null,
      focusY: urlParams.y ? parseInt(urlParams.y) : null,
      readOnly: urlParams.readOnly === '1',
    };
  }

  CM.setEmbedMode = setEmbedMode;
  CM.isEmbedMode = isEmbedMode;
  CM.reportEvent = reportEvent;

})();
