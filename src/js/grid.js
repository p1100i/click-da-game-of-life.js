var
  Grid;

Grid = function Grid() {
  var
    cells = {},

    getKey = function getKey(x, y) {
      return x + '_' + y;
    },

    getCells = function getCells() {
      return cells;
    },

    createCell = function createCell(x, y, s) {
      var
        key   = getKey(x, y),
        cell  = cells[key];

      if (!cell) {
        cell = {
          'x'   : x,
          'y'   : y,
          's'   : s === undefined ? false : s,
          'a'   : 0,
          'ns'  : false
        };
        cells[key] = cell;
      } else if (s !== undefined) {
        cell.s = s;
      }

      return cell;
    },

    setCell = function setCell(x, y, s) {
      if (x === undefined || y === undefined) {
        return false;
      }

      return createCell(x, y, s);
    },

    getNeighbourCoordinates = function getNeighbourCoordinates(x, y) {
      var
        coordinates = [];

      coordinates.push(x - 1, y - 1 );
      coordinates.push(x - 1, y + 1 );
      coordinates.push(x - 1, y     );
      coordinates.push(x    , y - 1 );
      coordinates.push(x    , y + 1 );
      coordinates.push(x + 1, y     );
      coordinates.push(x + 1, y - 1 );
      coordinates.push(x + 1, y + 1 );

      return coordinates;
    },

    getAliveNeighbourCount = function getAliveNeighbourCount(cell) {
      var
        i,
        key,
        otherCell,
        count   = 0,
        coords  = getNeighbourCoordinates(cell.x, cell.y);

      for (i = 0; i < coords.length; i += 2) {
        key       = getKey(coords[i], coords[i + 1]);
        otherCell = cells[key];

        if (otherCell && otherCell.s) {
          count++;
        }
      }

      return count;
    },

    createCellsDeadNeighbours = function createCellsDeadNeighbours() {
      var
        i,
        key,
        cell,
        coords;

      for (key in cells) {
        cell    = cells[key];
        coords  = getNeighbourCoordinates(cell.x, cell.y);

        for (i = 0; i < coords.length; i += 2) {
          createCell(coords[i], coords[i + 1]);
        }
      }
    },

    updateNextState = function updateNextState() {
      var
        key,
        cell,
        alives;

      for (key in cells) {
        cell    = cells[key];
        alives  = getAliveNeighbourCount(cell);
        cell.ns = false;

        if (alives === 3 || (cell.s && alives === 2)) {
          cell.ns = true;
        }
      }
    },

    updateState = function updateState() {
      var
        key,
        cell;

      for (key in cells) {
        cell = cells[key];

        if (cell.s) {
          cell.a++;
        }

        cell.s  = cell.ns;
        cell.ns = false;

        if (!cell.s) {
          delete cells[key];
        }
      }
    },

    iterate = function iterate() {
      createCellsDeadNeighbours();
      updateNextState();
      updateState();
    };

  this.iterate  = iterate;
  this.setCell  = setCell;
  this.getCells = getCells;

};

module.exports = Grid;
