(function() {
  /*
  This file contains game logic which may be used on the client OR server.
  In MVC, these classes are models.
  
  NOTE: The coordinate system used for the board is inverted across the x-axis
  with the origin in the top right.
  */
  var DIRS, EMPTY, Game, Pathfinder, Player, bill, g, peter, printBoard, _;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  _ = require('underscore');
  DIRS = ['W', 'N', 'E', 'S'];
  EMPTY = -1;
  Player = (function() {
    function Player(name, id, score) {
      this.name = name;
      this.id = id;
      this.score = score;
    }
    return Player;
  })();
  Pathfinder = (function() {
    function Pathfinder(x, y, direction) {
      this.x = x;
      this.y = y;
      this.direction = direction;
      this.path = [];
      this.turnRight = (__bind(function() {
        var dir;
        dir = DIRS.indexOf(this.direction);
        return __bind(function() {
          dir = (dir + 1) % 4;
          this.direction = DIRS[dir];
          return this;
        }, this);
      }, this))();
      this.turnLeft = (__bind(function() {
        var dir, revDirs;
        dir = DIRS.indexOf(this.direction);
        revDirs = DIRS.slice().reverse();
        return __bind(function() {
          dir = (dir + 1) % 4;
          this.direction = revDirs[dir];
          return this;
        }, this);
      }, this))();
    }
    Pathfinder.prototype.move = function() {
      switch (this.direction) {
        case 'E':
          this.x++;
          break;
        case 'S':
          this.y++;
          break;
        case 'W':
          this.x--;
          break;
        case 'N':
          this.y--;
      }
      return this;
    };
    Pathfinder.prototype.front = function() {
      switch (this.direction) {
        case 'E':
          return {
            x: this.x + 1,
            y: this.y
          };
        case 'S':
          return {
            x: this.x,
            y: this.y + 1
          };
        case 'W':
          return {
            x: this.x - 1,
            y: this.y
          };
        case 'N':
          return {
            x: this.x,
            y: this.y - 1
          };
      }
    };
    Pathfinder.prototype.right = function() {
      switch (this.direction) {
        case 'E':
          return {
            x: this.x,
            y: this.y + 1
          };
        case 'S':
          return {
            x: this.x - 1,
            y: this.y
          };
        case 'W':
          return {
            x: this.x,
            y: this.y - 1
          };
        case 'N':
          return {
            x: this.x + 1,
            y: this.y
          };
      }
    };
    Pathfinder.prototype.position = function() {
      return {
        x: this.x,
        y: this.y
      };
    };
    Pathfinder.prototype.farEast = function() {
      var pos;
      return _.max((function() {
        var _i, _len, _ref, _results;
        _ref = this.path;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          pos = _ref[_i];
          _results.push(pos[0]);
        }
        return _results;
      }).call(this));
    };
    Pathfinder.prototype.farWest = function() {
      var pos;
      return _.min((function() {
        var _i, _len, _ref, _results;
        _ref = this.path;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          pos = _ref[_i];
          _results.push(pos[0]);
        }
        return _results;
      }).call(this));
    };
    Pathfinder.prototype.farNorth = function() {
      var pos;
      return _.min((function() {
        var _i, _len, _ref, _results;
        _ref = this.path;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          pos = _ref[_i];
          _results.push(pos[1]);
        }
        return _results;
      }).call(this));
    };
    Pathfinder.prototype.farSouth = function() {
      var pos;
      return _.max((function() {
        var _i, _len, _ref, _results;
        _ref = this.path;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          pos = _ref[_i];
          _results.push(pos[1]);
        }
        return _results;
      }).call(this));
    };
    Pathfinder.prototype.pointInPath = function(x, y) {
      var pointsToLeft, pointsToRight;
      pointsToLeft = _.filter(this.path, function(p) {
        return p.x < x && p.y === y;
      });
      pointsToRight = _.filter(this.path, function(p) {
        return p.x > x && p.y === y;
      });
      return pointsToRight % 2 === 1 && pointsToRight % 2 === 1;
    };
    return Pathfinder;
  })();
  Game = (function() {
    function Game(height, width) {
      var num, numa;
      this.height = height;
      this.width = width;
      this.innerPaths = __bind(this.innerPaths, this);
      this.placeStone = __bind(this.placeStone, this);
      this.board = (function() {
        var _results;
        _results = [];
        for (num = 1; 1 <= height ? num <= height : num >= height; 1 <= height ? num++ : num--) {
          _results.push((function() {
            var _results2;
            _results2 = [];
            for (numa = 1; 1 <= width ? numa <= width : numa >= width; 1 <= width ? numa++ : numa--) {
              _results2.push(EMPTY);
            }
            return _results2;
          })());
        }
        return _results;
      })();
    }
    Game.prototype.placeStone = function(player, x, y) {
      if (x < this.width && y < this.height && this.board[x][y] === EMPTY) {
        this.board[x][y] = player.id;
        this.fill(this.innerPaths(x, y));
        return true;
      } else {
        return false;
      }
    };
    Game.prototype.innerPaths = function(lastX, lastY) {
      var front, i, lastPlayer, paths, pf, right, s, starts, _len;
      paths = [];
      starts = [
        {
          x: lastX,
          y: lastY + 1,
          d: 'W',
          x: lastX - 1,
          y: lastY,
          d: 'N',
          x: lastX,
          y: lastY - 1,
          d: 'E',
          x: lastX + 1,
          y: lastY,
          d: 'S'
        }
      ];
      lastPlayer = this.board[lastX][lastY];
      for (i = 0, _len = starts.length; i < _len; i++) {
        s = starts[i];
        if (this.board[s.x][s.y] !== lastPlayer && (this.board[s.x][s.y] != null) && !s.visited) {
          pf = new Pathfinder(s.x, s.y, s.d);
          front = pf.front();
          right = pf.right();
          while (!_.isEqual(_.last(pf.path), _.first(pf.path)) || pf.path.length < 4) {
            pf.paths.push(pf.position());
            if (this.board[right.x][right.y] !== lastPlayer) {
              pf.turnRight().move();
            } else if (!(this.board[front.x] != null) || !(this.board[front.x][front.y] != null)) {
              break;
            } else if (this.board[front.x][front.y] === lastPlayer) {
              pf.turnLeft().move();
            } else if (this.board[front.x][front.y] !== lastPlayer) {
              pf.move();
            }
            front = pf.front();
            right = pf.right();
          }
          s.visited = true;
          if (!pf.pointInPath(s.x(s.y))) {
            paths.push(pf.path);
          }
        }
      }
      return paths;
    };
    Game.prototype.fill = function(path) {};
    return Game;
  })();
  printBoard = function(g) {
    var row, _i, _len, _ref, _results;
    _ref = g.board;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      row = _ref[_i];
      _results.push(console.log(row));
    }
    return _results;
  };
  g = new Game(10, 10);
  peter = new Player('Peter', 1);
  bill = new Player('Bill', 2);
  g.placeStone(peter, 1, 1);
}).call(this);
