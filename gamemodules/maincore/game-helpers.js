/* CoderWarz Main Core — Helpers & Utilities */
var clamp = function(v, min, max) { return Math.max(min, Math.min(max, v)); };
var uuid = function() { return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16); };
var ICON_STROKE = 1.5;

var GameEntity = function(data) {
  data = data || {};
  Object.assign(this, data);
  if (!this.id) this.id = uuid();
};

var Server = function(id, name, stats) {
  stats = stats || {};
  this.id = id;
  this.name = name;
  this.cpu = stats.cpu || 100;
  this.storage = stats.storage || 500;
  this.tasks = [];
  this.status = "online";
};
Server.prototype = Object.create(GameEntity.prototype);
Server.prototype.constructor = Server;
Server.prototype.tick = function(delta) {};

var createGameStateManager = function(initialData) {
  var manager = Object.assign({}, initialData);
  manager.updateEntity = function(type, id, patch) {
    return this[type].map(function(e) { return e.id === id ? Object.assign({}, e, patch) : e; });
  };
  return manager;
};

var GameLoop = function(callback) {
  this.callback = callback;
  this.last = performance.now();
  this.active = false;
};
GameLoop.prototype.start = function() {
  this.active = true;
  var self = this;
  function loop(now) {
    if (!self.active) return;
    var delta = (now - self.last) / 1000;
    self.last = now;
    self.callback(delta);
    requestAnimationFrame(loop);
  }
  loop(performance.now());
};
GameLoop.prototype.stop = function() { this.active = false; };
