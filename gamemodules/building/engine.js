/* CoderWarz Building Interior — Isometric Micro Layer Engine */
window.BuildingInterior = window.BuildingInterior || {};

(function() {
  var BI = window.BuildingInterior;

  // === TILE CONSTANTS ===
  var TILE_W = 48;
  var TILE_H = 24;
  var HALF_W = TILE_W / 2;
  var HALF_H = TILE_H / 2;

  // === ROOM TYPES ===
  var ROOM_TYPES = {
    dining:    { label: 'Dining Area', color: '#3a5a4a', maxFurniture: 20 },
    kitchen:   { label: 'Kitchen', color: '#5a4a3a', maxFurniture: 15 },
    bathroom:  { label: 'Bathroom', color: '#3a4a5a', maxFurniture: 5 },
    storage:   { label: 'Storage', color: '#4a4a4a', maxFurniture: 10 },
    office:    { label: 'Office', color: '#4a3a5a', maxFurniture: 8 },
    bar:       { label: 'Bar Area', color: '#5a3a3a', maxFurniture: 12 },
    entrance:  { label: 'Entrance', color: '#3a5a5a', maxFurniture: 3 },
    vip:       { label: 'VIP Room', color: '#5a5a3a', maxFurniture: 8 },
  };

  // === FURNITURE CATALOG ===
  var FURNITURE = {
    // Seating
    chair_basic:    { label: 'Basic Chair', category: 'seating', w: 1, h: 1, cost: 50, satisfaction: 2, capacity: 1, icon: '🪑' },
    chair_booth:    { label: 'Booth Seat', category: 'seating', w: 2, h: 1, cost: 200, satisfaction: 5, capacity: 4, icon: '🛋️' },
    chair_bar:      { label: 'Bar Stool', category: 'seating', w: 1, h: 1, cost: 80, satisfaction: 3, capacity: 1, icon: '🪑' },
    table_small:    { label: 'Small Table', category: 'tables', w: 1, h: 1, cost: 100, satisfaction: 3, capacity: 2, icon: '🪴' },
    table_large:    { label: 'Large Table', category: 'tables', w: 2, h: 2, cost: 350, satisfaction: 6, capacity: 6, icon: '🪴' },
    table_bar:      { label: 'Bar Counter', category: 'tables', w: 3, h: 1, cost: 500, satisfaction: 4, capacity: 4, icon: '🍺' },

    // Kitchen
    oven:           { label: 'Pizza Oven', category: 'kitchen', w: 2, h: 2, cost: 2000, efficiency: 15, icon: '🔥' },
    stove:          { label: 'Stove', category: 'kitchen', w: 2, h: 1, cost: 800, efficiency: 10, icon: '🍳' },
    fridge:         { label: 'Refrigerator', category: 'kitchen', w: 1, h: 1, cost: 600, freshness: 20, icon: '🧊' },
    prep_station:   { label: 'Prep Station', category: 'kitchen', w: 2, h: 1, cost: 400, efficiency: 8, icon: '🔪' },
    dishwasher:     { label: 'Dishwasher', category: 'kitchen', w: 1, h: 1, cost: 300, efficiency: 5, icon: '🍽️' },

    // Decor
    plant:          { label: 'Potted Plant', category: 'decor', w: 1, h: 1, cost: 50, satisfaction: 3, ambiance: 5, icon: '🪴' },
    painting:       { label: 'Wall Art', category: 'decor', w: 1, h: 1, cost: 150, satisfaction: 4, ambiance: 8, icon: '🖼️' },
    neon_sign:      { label: 'Neon Sign', category: 'decor', w: 2, h: 1, cost: 300, satisfaction: 5, ambiance: 12, icon: '💡' },
    tv:             { label: 'TV Screen', category: 'entertainment', w: 2, h: 1, cost: 500, satisfaction: 6, ambiance: 10, icon: '📺' },
    arcade:         { label: 'Arcade Machine', category: 'entertainment', w: 1, h: 2, cost: 800, satisfaction: 8, ambiance: 15, icon: '🕹️' },
    jukebox:        { label: 'Jukebox', category: 'entertainment', w: 1, h: 1, cost: 400, satisfaction: 5, ambiance: 10, icon: '🎵' },

    // Fixtures
    counter:        { label: 'Counter', category: 'fixtures', w: 3, h: 1, cost: 600, icon: '🧱' },
    wall:           { label: 'Partition Wall', category: 'fixtures', w: 1, h: 1, cost: 100, icon: '🧱' },
    door:           { label: 'Door', category: 'fixtures', w: 1, h: 1, cost: 200, icon: '🚪' },
    sink:           { label: 'Sink', category: 'fixtures', w: 1, h: 1, cost: 250, hygiene: 10, icon: '🚿' },
    toilet:         { label: 'Toilet', category: 'fixtures', w: 1, h: 1, cost: 300, hygiene: 15, icon: '🚽' },

    // Lighting
    light_ceiling:  { label: 'Ceiling Light', category: 'lighting', w: 1, h: 1, cost: 100, ambiance: 5, icon: '💡' },
    light_neon:     { label: 'Neon Tube', category: 'lighting', w: 2, h: 1, cost: 250, ambiance: 10, icon: '💡' },
    light_spot:     { label: 'Spotlight', category: 'lighting', w: 1, h: 1, cost: 150, ambiance: 8, icon: '🔦' },
  };

  // === BUILDING TEMPLATES ===
  var TEMPLATES = {
    restaurant_small: {
      label: 'Small Restaurant',
      width: 8,
      height: 8,
      rooms: [
        { type: 'entrance', x: 0, y: 0, w: 2, h: 2 },
        { type: 'dining', x: 2, y: 0, w: 6, h: 5 },
        { type: 'kitchen', x: 0, y: 2, w: 4, h: 6 },
        { type: 'bathroom', x: 4, y: 5, w: 2, h: 3 },
        { type: 'storage', x: 6, y: 5, w: 2, h: 3 },
      ],
      defaultFurniture: [
        { id: 'counter', x: 1, y: 1 },
        { id: 'oven', x: 1, y: 3 },
        { id: 'fridge', x: 3, y: 3 },
        { id: 'table_small', x: 4, y: 1 },
        { id: 'table_small', x: 6, y: 1 },
        { id: 'chair_basic', x: 4, y: 2 },
        { id: 'chair_basic', x: 5, y: 1 },
        { id: 'chair_basic', x: 6, y: 2 },
        { id: 'chair_basic', x: 7, y: 1 },
        { id: 'plant', x: 7, y: 4 },
        { id: 'light_ceiling', x: 5, y: 2 },
      ],
    },
    restaurant_large: {
      label: 'Large Restaurant',
      width: 12,
      height: 10,
      rooms: [
        { type: 'entrance', x: 0, y: 0, w: 3, h: 2 },
        { type: 'dining', x: 3, y: 0, w: 9, h: 6 },
        { type: 'bar', x: 0, y: 2, w: 3, h: 4 },
        { type: 'kitchen', x: 0, y: 6, w: 6, h: 4 },
        { type: 'bathroom', x: 6, y: 6, w: 3, h: 4 },
        { type: 'storage', x: 9, y: 6, w: 3, h: 4 },
        { type: 'vip', x: 9, y: 0, w: 3, h: 6 },
        { type: 'office', x: 6, y: 0, w: 3, h: 3 },
      ],
      defaultFurniture: [
        { id: 'counter', x: 1, y: 3 },
        { id: 'table_bar', x: 1, y: 4 },
        { id: 'chair_bar', x: 1, y: 5 },
        { id: 'chair_bar', x: 2, y: 5 },
        { id: 'oven', x: 1, y: 7 },
        { id: 'stove', x: 3, y: 7 },
        { id: 'fridge', x: 5, y: 7 },
        { id: 'prep_station', x: 1, y: 9 },
        { id: 'table_large', x: 5, y: 2 },
        { id: 'table_large', x: 8, y: 2 },
        { id: 'table_small', x: 4, y: 4 },
        { id: 'table_small', x: 7, y: 4 },
        { id: 'booth', x: 10, y: 1 },
        { id: 'neon_sign', x: 5, y: 0 },
        { id: 'tv', x: 8, y: 0 },
        { id: 'plant', x: 11, y: 5 },
        { id: 'plant', x: 3, y: 0 },
        { id: 'light_neon', x: 6, y: 3 },
        { id: 'light_ceiling', x: 9, y: 3 },
      ],
    },
    bank: {
      label: 'Bank Branch',
      width: 8,
      height: 6,
      rooms: [
        { type: 'entrance', x: 0, y: 0, w: 3, h: 2 },
        { type: 'dining', x: 3, y: 0, w: 5, h: 4 },
        { type: 'office', x: 0, y: 2, w: 3, h: 4 },
        { type: 'storage', x: 3, y: 4, w: 5, h: 2 },
      ],
      defaultFurniture: [
        { id: 'counter', x: 3, y: 1 },
        { id: 'chair_basic', x: 4, y: 2 },
        { id: 'chair_basic', x: 5, y: 2 },
        { id: 'table_small', x: 1, y: 3 },
        { id: 'plant', x: 7, y: 0 },
        { id: 'light_ceiling', x: 4, y: 1 },
      ],
    },
  };

  // === STATE ===
  var canvas, ctx;
  var currentBuilding = null;
  var buildingState = null;
  var camera = { x: 0, y: 0, zoom: 1 };
  var selectedTool = null; // furniture id being placed
  var selectedFurniture = null; // placed furniture selected
  var hoverTile = null;
  var gridW = 0, gridH = 0;
  var onAction = null;
  var mapReady = false;

  // === INIT ===
  function init(canvasEl, opts) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    opts = opts || {};
    onAction = opts.onAction || null;
    mapReady = false;

    if(opts.building) {
      loadBuilding(opts.building, opts.state);
    }

    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel);
    canvas.addEventListener('contextmenu', function(e) { e.preventDefault(); cancelPlacement(); });

    mapReady = true;
    render();
  }

  function loadBuilding(templateId, savedState) {
    var tpl = TEMPLATES[templateId];
    if(!tpl) return false;

    currentBuilding = {
      templateId: templateId,
      template: tpl,
      width: tpl.width,
      height: tpl.height,
    };

    gridW = tpl.width;
    gridH = tpl.height;

    // Init grid
    var grid = [];
    for(var y = 0; y < gridH; y++) {
      grid[y] = [];
      for(var x = 0; x < gridW; x++) {
        grid[y][x] = { type: 'floor', furniture: null, room: null };
      }
    }

    // Assign rooms
    tpl.rooms.forEach(function(r) {
      for(var ry = r.y; ry < r.y + r.h && ry < gridH; ry++) {
        for(var rx = r.x; rx < r.x + r.w && rx < gridW; rx++) {
          if(grid[ry] && grid[ry][rx]) {
            grid[ry][rx].room = r.type;
            grid[ry][rx].type = 'floor';
          }
        }
      }
      // Mark walls around room perimeter
      for(var rx = r.x; rx < r.x + r.w && rx < gridW; rx++) {
        if(r.y > 0 && grid[r.y-1] && grid[r.y-1][rx]) grid[r.y-1][rx].type = 'wall';
        if(r.y + r.h < gridH && grid[r.y+r.h] && grid[r.y+r.h][rx]) grid[r.y+r.h][rx].type = 'wall';
      }
      for(var ry = r.y; ry < r.y + r.h && ry < gridH; ry++) {
        if(r.x > 0 && grid[ry][r.x-1]) grid[ry][r.x-1].type = 'wall';
        if(r.x + r.w < gridW && grid[ry][r.x+r.w]) grid[ry][r.x+r.w].type = 'wall';
      }
    });

    // Place default furniture
    tpl.defaultFurniture.forEach(function(f) {
      var item = FURNITURE[f.id];
      if(item && grid[f.y] && grid[f.y][f.x]) {
        grid[f.y][f.x].furniture = {
          id: f.id,
          label: item.label,
          icon: item.icon,
          w: item.w,
          h: item.h,
          category: item.category,
        };
      }
    });

    buildingState = {
      grid: grid,
      templateId: templateId,
      staff: [],
      customers: [],
      stats: {
        satisfaction: 50,
        efficiency: 50,
        hygiene: 50,
        ambiance: 30,
        capacity: 0,
      },
    };

    // Calculate stats
    recalcStats();

    // Center camera
    var iso = toIso(gridW / 2, gridH / 2);
    camera.x = canvas.width / 2 - iso.sx;
    camera.y = canvas.height / 2 - iso.sy;

    return true;
  }

  // === STATS ===
  function recalcStats() {
    if(!buildingState) return;
    var grid = buildingState.grid;
    var stats = { satisfaction: 10, efficiency: 10, hygiene: 10, ambiance: 10, capacity: 0 };

    for(var y = 0; y < gridH; y++) {
      for(var x = 0; x < gridW; x++) {
        var cell = grid[y][x];
        if(cell.furniture) {
          var item = FURNITURE[cell.furniture.id];
          if(item) {
            stats.satisfaction += (item.satisfaction || 0);
            stats.efficiency += (item.efficiency || 0);
            stats.hygiene += (item.hygiene || 0);
            stats.ambiance += (item.ambiance || 0);
            stats.capacity += (item.capacity || 0);
          }
        }
      }
    }

    buildingState.stats = stats;
  }

  // === ISO HELPERS ===
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

  // === RENDER ===
  function render() {
    if(!ctx || !buildingState) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0d0f12';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);

    var grid = buildingState.grid;

    // Draw tiles (back to front for proper overlap)
    for(var y = 0; y < gridH; y++) {
      for(var x = 0; x < gridW; x++) {
        drawTile(x, y, grid[y][x]);
      }
    }

    // Draw furniture (back to front)
    for(var y = 0; y < gridH; y++) {
      for(var x = 0; x < gridW; x++) {
        if(grid[y][x].furniture) {
          drawFurniture(x, y, grid[y][x].furniture);
        }
      }
    }

    // Draw placement preview
    if(selectedTool && hoverTile) {
      drawPlacementPreview(hoverTile.x, hoverTile.y, selectedTool);
    }

    // Draw staff/customers
    drawEntities();

    ctx.restore();

    // HUD
    drawHUD();
  }

  function drawTile(x, y, cell) {
    var iso = toIso(x, y);
    var roomColor = cell.room ? (ROOM_TYPES[cell.room] || {}).color : '#2a2d34';

    if(cell.type === 'wall') {
      // Wall tile — taller
      ctx.beginPath();
      ctx.moveTo(iso.sx, iso.sy - HALF_H - 12);
      ctx.lineTo(iso.sx + HALF_W, iso.sy - 12);
      ctx.lineTo(iso.sx + HALF_W, iso.sy);
      ctx.lineTo(iso.sx, iso.sy + HALF_H);
      ctx.lineTo(iso.sx - HALF_W, iso.sy);
      ctx.lineTo(iso.sx - HALF_W, iso.sy - 12);
      ctx.closePath();
      ctx.fillStyle = '#4a4a4a';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    } else {
      // Floor tile
      ctx.beginPath();
      ctx.moveTo(iso.sx, iso.sy - HALF_H);
      ctx.lineTo(iso.sx + HALF_W, iso.sy);
      ctx.lineTo(iso.sx, iso.sy + HALF_H);
      ctx.lineTo(iso.sx - HALF_W, iso.sy);
      ctx.closePath();

      // Hover highlight
      if(hoverTile && hoverTile.x === x && hoverTile.y === y) {
        ctx.fillStyle = selectedTool ? 'rgba(74,158,255,0.2)' : 'rgba(255,255,255,0.05)';
      } else {
        ctx.fillStyle = roomColor || '#2a2d34';
      }
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }

  function drawFurniture(x, y, furn) {
    var iso = toIso(x, y);
    var item = FURNITURE[furn.id];
    var isSelected = selectedFurniture && selectedFurniture.x === x && selectedFurniture.y === y;

    // Draw furniture shape based on size
    var w = (furn.w || 1);
    var h = (furn.h || 1);

    if(w === 1 && h === 1) {
      // Single tile
      ctx.beginPath();
      ctx.moveTo(iso.sx, iso.sy - HALF_H - 6);
      ctx.lineTo(iso.sx + HALF_W - 4, iso.sy - 6);
      ctx.lineTo(iso.sx, iso.sy + HALF_H - 6);
      ctx.lineTo(iso.sx - HALF_W + 4, iso.sy - 6);
      ctx.closePath();
      ctx.fillStyle = isSelected ? 'rgba(74,158,255,0.4)' : 'rgba(255,255,255,0.12)';
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#4a9eff' : 'rgba(255,255,255,0.15)';
      ctx.lineWidth = isSelected ? 1.5 : 0.5;
      ctx.stroke();
    } else {
      // Multi-tile — draw a block
      ctx.beginPath();
      ctx.moveTo(iso.sx, iso.sy - HALF_H * h - 8);
      ctx.lineTo(iso.sx + HALF_W * w, iso.sy - 8);
      ctx.lineTo(iso.sx + HALF_W * w, iso.sy);
      ctx.lineTo(iso.sx, iso.sy + HALF_H * h);
      ctx.lineTo(iso.sx - HALF_W * w, iso.sy);
      ctx.lineTo(iso.sx - HALF_W * w, iso.sy - 8);
      ctx.closePath();
      ctx.fillStyle = isSelected ? 'rgba(74,158,255,0.4)' : 'rgba(255,255,255,0.1)';
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#4a9eff' : 'rgba(255,255,255,0.12)';
      ctx.lineWidth = isSelected ? 1.5 : 0.5;
      ctx.stroke();
    }

    // Icon
    ctx.font = '14px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(furn.icon, iso.sx, iso.sy - 4);
  }

  function drawPlacementPreview(x, y, toolId) {
    var item = FURNITURE[toolId];
    if(!item) return;

    var iso = toIso(x, y);
    var w = item.w || 1;
    var h = item.h || 1;
    var canPlace = canPlaceAt(x, y, w, h);

    ctx.globalAlpha = 0.6;

    ctx.beginPath();
    ctx.moveTo(iso.sx, iso.sy - HALF_H * h - 8);
    ctx.lineTo(iso.sx + HALF_W * w, iso.sy - 8);
    ctx.lineTo(iso.sx + HALF_W * w, iso.sy);
    ctx.lineTo(iso.sx, iso.sy + HALF_H * h);
    ctx.lineTo(iso.sx - HALF_W * w, iso.sy);
    ctx.lineTo(iso.sx - HALF_W * w, iso.sy - 8);
    ctx.closePath();
    ctx.fillStyle = canPlace ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.3)';
    ctx.fill();
    ctx.strokeStyle = canPlace ? '#4ade80' : '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = '14px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(item.icon, iso.sx, iso.sy - 4);

    ctx.globalAlpha = 1;
  }

  function drawEntities() {
    // Draw animated staff/customers (simplified for now)
    var t = (Date.now() % 5000) / 5000;

    // Staff dots
    if(buildingState.staff) {
      buildingState.staff.forEach(function(s, i) {
        var x = s.x + Math.sin(t * Math.PI * 2 + i) * 0.3;
        var y = s.y + Math.cos(t * Math.PI * 2 + i) * 0.3;
        var iso = toIso(x, y);
        ctx.beginPath();
        ctx.arc(iso.sx, iso.sy - 2, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#22d3ee';
        ctx.fill();
      });
    }

    // Customer dots
    if(buildingState.customers) {
      buildingState.customers.forEach(function(c, i) {
        var x = c.x + Math.sin(t * Math.PI * 2 + i * 0.7) * 0.2;
        var y = c.y + Math.cos(t * Math.PI * 2 + i * 0.7) * 0.2;
        var iso = toIso(x, y);
        ctx.beginPath();
        ctx.arc(iso.sx, iso.sy - 2, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
      });
    }
  }

  function drawHUD() {
    if(!ctx || !buildingState) return;

    var stats = buildingState.stats;
    var template = currentBuilding.template;

    // Building name
    ctx.fillStyle = 'rgba(10,12,15,0.9)';
    ctx.fillRect(12, 12, 200, 28);
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#e7e9ea';
    ctx.textAlign = 'left';
    ctx.fillText('🏠 ' + (template ? template.label : 'Building'), 20, 30);

    // Stats bar
    var statY = 48;
    var statsArr = [
      { label: '😊', value: stats.satisfaction, max: 100, color: '#4ade80' },
      { label: '⚡', value: stats.efficiency, max: 100, color: '#60a5fa' },
      { label: '🧹', value: stats.hygiene, max: 100, color: '#a78bfa' },
      { label: '✨', value: stats.ambiance, max: 100, color: '#f59e0b' },
    ];

    ctx.fillStyle = 'rgba(10,12,15,0.85)';
    ctx.fillRect(12, statY, 200, statsArr.length * 20 + 10);

    statsArr.forEach(function(s, i) {
      var y = statY + 10 + i * 20;
      ctx.font = '10px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#6b7280';
      ctx.textAlign = 'left';
      ctx.fillText(s.label, 20, y + 10);

      // Bar
      ctx.fillStyle = '#1a1d24';
      ctx.fillRect(40, y + 3, 140, 8);
      ctx.fillStyle = s.color;
      ctx.fillRect(40, y + 3, Math.min(140, (s.value / s.max) * 140), 8);

      ctx.fillStyle = '#9ca3af';
      ctx.textAlign = 'right';
      ctx.fillText(s.value, 190, y + 10);
    });

    // Selected tool info
    if(selectedTool) {
      var item = FURNITURE[selectedTool];
      ctx.fillStyle = 'rgba(10,12,15,0.9)';
      ctx.fillRect(12, canvas.height - 50, 200, 38);
      ctx.font = '10px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#4a9eff';
      ctx.textAlign = 'left';
      ctx.fillText('PLACING: ' + item.icon + ' ' + item.label + ' ($' + item.cost + ')', 20, canvas.height - 28);
      ctx.fillStyle = '#6b7280';
      ctx.fillText('Click to place · Right-click to cancel', 20, canvas.height - 16);
    }

    // Selected furniture info
    if(selectedFurniture && !selectedTool) {
      var cell = buildingState.grid[selectedFurniture.y] && buildingState.grid[selectedFurniture.y][selectedFurniture.x];
      if(cell && cell.furniture) {
        var furn = cell.furniture;
        var item = FURNITURE[furn.id];
        ctx.fillStyle = 'rgba(10,12,15,0.9)';
        ctx.fillRect(12, canvas.height - 60, 200, 48);
        ctx.font = '11px Inter, system-ui, sans-serif';
        ctx.fillStyle = '#e7e9ea';
        ctx.textAlign = 'left';
        ctx.fillText(item.icon + ' ' + item.label, 20, canvas.height - 40);
        ctx.font = '10px Inter, system-ui, sans-serif';
        ctx.fillStyle = '#6b7280';
        ctx.fillText('Click to select · DELETE to remove', 20, canvas.height - 26);
        ctx.fillText('Category: ' + item.category, 20, canvas.height - 14);
      }
    }
  }

  // === PLACEMENT ===
  function canPlaceAt(x, y, w, h) {
    if(!buildingState) return false;
    for(var dy = 0; dy < h; dy++) {
      for(var dx = 0; dx < w; dx++) {
        var cx = x + dx, cy = y + dy;
        if(cx < 0 || cx >= gridW || cy < 0 || cy >= gridH) return false;
        var cell = buildingState.grid[cy][cx];
        if(cell.type === 'wall' || cell.furniture) return false;
      }
    }
    return true;
  }

  function placeFurniture(x, y, toolId) {
    if(!buildingState || !canPlaceAt(x, y, FURNITURE[toolId].w, FURNITURE[toolId].h)) return false;
    var item = FURNITURE[toolId];
    buildingState.grid[y][x].furniture = {
      id: toolId,
      label: item.label,
      icon: item.icon,
      w: item.w,
      h: item.h,
      category: item.category,
    };
    recalcStats();
    if(onAction) onAction('place_furniture', { x: x, y: y, id: toolId, cost: item.cost });
    return true;
  }

  function removeFurniture(x, y) {
    if(!buildingState) return false;
    var cell = buildingState.grid[y] && buildingState.grid[y][x];
    if(!cell || !cell.furniture) return false;
    var removed = cell.furniture;
    cell.furniture = null;
    recalcStats();
    if(onAction) onAction('remove_furniture', { x: x, y: y, id: removed.id });
    return true;
  }

  function cancelPlacement() {
    selectedTool = null;
    selectedFurniture = null;
    render();
  }

  // === EVENTS ===
  var isDragging = false;
  var dragStart = { x: 0, y: 0 };
  var camStart = { x: 0, y: 0 };

  function onMouseDown(e) {
    if(e.button === 2) { cancelPlacement(); return; }
    isDragging = true;
    dragStart = { x: e.clientX, y: e.clientY };
    camStart = { x: camera.x, y: camera.y };
  }

  function onMouseMove(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left - camera.x) / camera.zoom;
    var my = (e.clientY - rect.top - camera.y) / camera.zoom;
    var g = fromIso(mx, my);
    var gx = Math.round(g.gx);
    var gy = Math.round(g.gy);

    if(gx >= 0 && gx < gridW && gy >= 0 && gy < gridH) {
      hoverTile = { x: gx, y: gy };
    } else {
      hoverTile = null;
    }

    if(isDragging) {
      camera.x = camStart.x + (e.clientX - dragStart.x);
      camera.y = camStart.y + (e.clientY - dragStart.y);
    }

    render();
  }

  function onMouseUp(e) {
    if(isDragging) {
      var dx = Math.abs(e.clientX - dragStart.x);
      var dy = Math.abs(e.clientY - dragStart.y);
      if(dx < 5 && dy < 5 && hoverTile) {
        if(selectedTool) {
          placeFurniture(hoverTile.x, hoverTile.y, selectedTool);
        } else {
          // Select placed furniture
          var cell = buildingState.grid[hoverTile.y] && buildingState.grid[hoverTile.y][hoverTile.x];
          if(cell && cell.furniture) {
            selectedFurniture = { x: hoverTile.x, y: hoverTile.y };
          } else {
            selectedFurniture = null;
          }
        }
      }
      isDragging = false;
      render();
    }
  }

  function onWheel(e) {
    e.preventDefault();
    var delta = e.deltaY > 0 ? 0.9 : 1.1;
    camera.zoom = Math.max(0.4, Math.min(3, camera.zoom * delta));
    render();
  }

  // === PUBLIC API ===
  BI.init = init;
  BI.loadBuilding = loadBuilding;
  BI.render = render;
  BI.selectTool = function(toolId) { selectedTool = toolId; selectedFurniture = null; render(); };
  BI.cancelPlacement = cancelPlacement;
  BI.removeFurniture = removeFurniture;
  BI.getBuildingState = function() { return buildingState; };
  BI.getStats = function() { return buildingState ? buildingState.stats : null; };
  BI.FURNITURE = FURNITURE;
  BI.TEMPLATES = TEMPLATES;
  BI.ROOM_TYPES = ROOM_TYPES;

  // === EMBED MODE ===
  // Buildings can be loaded inside other sites via iframe/postMessage.
  // e.g., registerbiz.org opens building.html?building=restaurant_small&embed=1
  // e.g., the_syndicate opens building.html?building=bank&embed=1&readOnly=1
  var embedMode = false;
  var embedOpts = {};

  function setEmbedMode(opts) {
    embedMode = true;
    embedOpts = opts || {};
    if(opts.templateId) {
      loadBuilding(opts.templateId, opts.state || null);
      render();
    }
    if(opts.readOnly) {
      // Disable placement in read-only mode
      selectedTool = null;
    }
  }

  function isEmbedMode() { return embedMode; }

  // postMessage API — external sites can send commands
  function handlePostMessage(e) {
    if(!e.data || typeof e.data !== 'object') return;
    var msg = e.data;

    if(msg.type === 'BI_LOAD_BUILDING' || msg.type === 'loadBuilding') {
      loadBuilding(msg.templateId, msg.state || null);
      render();
      reportEvent('buildingLoaded', { templateId: msg.templateId });
    }
    if(msg.type === 'BI_SELECT_TOOL' || msg.type === 'selectTool') {
      selectTool(msg.toolId);
    }
    if(msg.type === 'BI_PLACE_FURNITURE' || msg.type === 'placeFurniture') {
      placeFurniture(msg.x, msg.y, msg.toolId);
      render();
    }
    if(msg.type === 'BI_REMOVE_FURNITURE' || msg.type === 'removeFurnish') {
      removeFurniture(msg.x, msg.y);
      render();
    }
    if(msg.type === 'BI_GET_STATE' || msg.type === 'getState') {
      reportEvent('state', {
        templateId: currentBuilding ? currentBuilding.templateId : null,
        stats: buildingState ? buildingState.stats : null,
        grid: buildingState ? buildingState.grid.map(function(row) {
          return row.map(function(cell) {
            return { type: cell.type, room: cell.room, furniture: cell.furniture ? cell.furniture.id : null };
          });
        }) : null,
      });
    }
    if(msg.type === 'BI_SET_READONLY' || msg.type === 'setReadOnly') {
      selectedTool = null;
      selectedFurniture = null;
      embedOpts.readOnly = msg.readOnly;
      render();
    }
    if(msg.type === 'BI_UPDATE_SYNC' || msg.type === 'updateSync') {
      if(msg.gameState) {
        reportEvent('syncUpdated', { gameState: msg.gameState });
      }
    }
    if(msg.type === 'BI_HIGHLIGHT_ROOM' || msg.type === 'highlightRoom') {
      // Highlight a specific room type
      reportEvent('roomHighlighted', { roomType: msg.roomType });
    }
  }

  function reportEvent(eventName, data) {
    try {
      var payload = { type: 'BI_EVENT', event: eventName, data: data };
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
      templateId: urlParams.building || urlParams.templateId || null,
      readOnly: urlParams.readOnly === '1',
    };
    // Auto-load building if specified
    if(embedOpts.templateId) {
      // Will be loaded after init
      setTimeout(function() {
        if(embedOpts.templateId) {
          loadBuilding(embedOpts.templateId);
          render();
        }
      }, 100);
    }
  }

  BI.setEmbedMode = setEmbedMode;
  BI.isEmbedMode = isEmbedMode;
  BI.reportEvent = reportEvent;

})();
