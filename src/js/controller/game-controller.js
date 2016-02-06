var
  GameControllerFactoryConstructor;

GameControllerFactoryConstructor = function GameControllerFactoryConstructor(app) {
  app.controller('gameController', ['$rootScope', '$scope', '$window', 'angular', 'Grid', 'Vec2', 'paper', 'MyHelper', 'magicService', function GameControllerFactory($rootScope, $scope, $window, angular, Grid, Vec2, paper, MyHelper, magicService) {
    var
      spawning,
      playing,
      updater,
      timediff,
      timeoutId,
      timeupdate,
      lastTimestamp,
      lastIteratedTimestamp,
      viewSize,
      mouseDrawnCell,
      targetVec             = new Vec2(),
      mouseGridVec          = new Vec2(),
      windowSizeVec         = new Vec2(),
      gridDimensions        = new Vec2(),
      canvas                = document.getElementById('paper-canvas'),
      grid                  = new Grid(),
      cells                 = grid.getCells(),
      drawnCells            = [],
      CELL_SIZE             = new Vec2(10, 10),
      HALF_CELL_SIZE        = CELL_SIZE.divide(2, true),
      PAGE_OFFSET           = new Vec2(50, 50),
      TIME_UNIT             = 50,
      ITERATE_TIME_UNIT     = 200,
      CELL_FILL_COLOR_NORM  = magicService.divideElement([88, 255, 179], 255),
      CELL_FILL_COLOR_MOUSE = magicService.divideElement([207, 106, 180], 255),
      DEAD_CELL_AGE         = 10,

      STARTING_CELLS = [
        [ -1, -11],
        [ -1, -10],
        [  0, -10],
        [  0,  -9],
        [  1, -11],
        [  1, -10],
        [  -41, -11],
        [  -40, -11],
        [  -39, -11],
        [  -41, -10],
        [  -39, -10],
        [  -41,  -9],
        [  -39,  -9],
        [  -40,  -8]
      ],

      setPlaying = function setPlaying(newPlaying) {
        $scope.playing = playing = newPlaying;
      },

      togglePlaying = function togglePlaying() {
        setPlaying(!playing);
      },

      setSpawning = function setSpawning(newSpawning) {
        spawning = newSpawning;
      },

      createRectangle = function createRectangle(x, y, sizeX, sizeY, offsetX, offsetY) {
        offsetX = offsetX || 0;
        offsetY = offsetY || 0;

        var
          begPoint  = new paper.Point(x + offsetX, y + offsetY),
          endPoint  = new paper.Point(x + sizeX - offsetX, y + sizeY - offsetY);

        return new paper.Rectangle(begPoint, endPoint);
      },

      createDrawnObject = function createDrawnObject(size, fillColorTriplet, strokeColorTriplet) {
        var
          rect = createRectangle(0, 0, size.x, size.y, 1, 1),
          path = new paper.Path.Rectangle(rect);

        if (strokeColorTriplet) {
          path.strokeColor = new paper.Color(strokeColorTriplet[0], strokeColorTriplet[1], strokeColorTriplet[2]);
        }

        if (fillColorTriplet) {
          path.fillColor = new paper.Color(fillColorTriplet[0], fillColorTriplet[1], fillColorTriplet[2]);
        }

        return {
          'path' : path
        };
      },

      /**
       * @param {Array} colorModifier e.g. [2, -0.01] meaning decreasing the last index of RGB
       */
      setDrawnObject = function setDrawnObject(object, position, positionScale, offset, colorModifier) {
        var
          path  = object.path;

        path.position.x = position.x;
        path.position.y = position.y;

        if (positionScale) {
          path.position.x *= positionScale.x;
          path.position.y *= positionScale.y;
        }

        if (offset) {
          path.position.x += offset.x;
          path.position.y += offset.y;
        }

        if (colorModifier) {
          path.fillColor[colorModifier[0]] = colorModifier[1];
        }
      },

      spawnDrawnObjects = function spawnDrawnObjects(drawnObjects, objectCount, fillColorTriplet, strokeColorTriplet) {
        var
          i,
          path,
          drawnObject,
          length  = drawnObjects.length,
          diff    = objectCount - length;

        if (diff > 0) {
          while (diff--) {
            drawnObject = createDrawnObject(CELL_SIZE, fillColorTriplet, strokeColorTriplet);
            drawnObjects.push(drawnObject);
          }
        }

        for (i = 0; i < length; i++) {
          path          = drawnObjects[i].path;
          path.visible  = i < objectCount;
        }
      },

      setMouseDrawnCell = function setMouseDrawnCell() {
        mouseDrawnCell = createDrawnObject(CELL_SIZE, CELL_FILL_COLOR_MOUSE);
      },

      drawMouseCell = function drawMouseCell() {
        if (!mouseGridVec.length()) {
          return;
        }

        setDrawnObject(mouseDrawnCell, mouseGridVec, CELL_SIZE, HALF_CELL_SIZE);
      },

      drawCells = function drawCells() {
        var
          i,
          key,
          cell,
          drawnCell,
          cellYoungness;

        i = 0;
        spawnDrawnObjects(drawnCells, Object.keys(cells).length, CELL_FILL_COLOR_NORM, undefined, true);

        for (key in cells) {
          cell          = cells[key];
          drawnCell     = drawnCells[i];
          cellYoungness = Math.max(0, DEAD_CELL_AGE - cell.a) / DEAD_CELL_AGE;
          setDrawnObject(drawnCell, cell, CELL_SIZE, HALF_CELL_SIZE, ['green', cellYoungness]);
          i++;
        }

        drawMouseCell();
      },

      redraw = function redraw(redrawGrid) {
        drawCells();

        paper.view.draw();
      },

      requestUpdate = function requestUpdate() {
        if (timeoutId) {
          $window.clearTimeout(timeoutId);
        }

        $window.requestAnimationFrame(updater);
      },

      iterate = function iterate(timestamp) {
        lastIteratedTimestamp = lastIteratedTimestamp || timestamp;

        var
          diff = timestamp - lastIteratedTimestamp ;

        if (diff > ITERATE_TIME_UNIT && playing) {
          grid.iterate();
          lastIteratedTimestamp = timestamp;
        }
      },

      update = function update(timestamp) {
        lastTimestamp = lastTimestamp || timestamp;
        timediff      = timestamp - lastTimestamp;
        timeupdate    = Math.max(0, TIME_UNIT - timediff);

        iterate(timestamp);
        redraw();

        timeoutId     = $window.setTimeout(requestUpdate, timeupdate);
        lastTimestamp = timestamp + timeupdate;
      },

      setPaperSize = function setPaperSize($event) {
        gridDimensions.set($window.innerWidth - PAGE_OFFSET.x, $window.innerHeight - PAGE_OFFSET.y);
        gridDimensions.divide(CELL_SIZE);

        gridDimensions.x  = Math.floor(gridDimensions.x);
        gridDimensions.y  = Math.floor(gridDimensions.y);

        windowSizeVec.set(CELL_SIZE);
        windowSizeVec.multiply(gridDimensions);

        if (viewSize) {
          // Unfortunetely this is needed, as on resize a new Size vector gets reassigned to the view.
          viewSize        = paper.view.viewSize;
          viewSize.width  = windowSizeVec.x;
          viewSize.height = windowSizeVec.y;
        } else {
          viewSize = paper.view.viewSize = new paper.Size(windowSizeVec.x, windowSizeVec.y);
        }

        redraw();
      },

      populate = function populate(cells) {
        var
          i,
          cell;

        targetVec.set(gridDimensions);
        targetVec.divide(2);
        targetVec.set(Math.round(targetVec.x), Math.round(targetVec.y));

        for (i = 0; i < cells.length; i++) {
          cell = cells[i];

          grid.setCell(cell[0] + targetVec.x, cell[1] + targetVec.y, 1);
        }
      },

      spawn = function spawn($event) {
        if (!spawning) {
          return;
        }

        grid.setCell(mouseGridVec.x, mouseGridVec.y, 1);
      },

      onMouseDown = function onMouseDown($event) {
        setSpawning(true);
        spawn($event);
      },

      onMouseUp = function onMouseUp($event) {
        setSpawning(false);
      },

      onMouseMove = function onMouseMove($event) {
        var
          canvasOffset  = MyHelper.getElementPageOffset(canvas, $window),
          mouseOffset   = MyHelper.getMouseEventPageOffset($event);

        mouseGridVec.set(mouseOffset.left - canvasOffset.left - 8, mouseOffset.top - canvasOffset.top - 7);
        mouseGridVec.divide(CELL_SIZE);
        mouseGridVec.set(Math.round(mouseGridVec.x), Math.round(mouseGridVec.y));

        spawn($event);
      },

      init = function init() {
        updater = update;
        paper.setup(canvas);

        setMouseDrawnCell();
        setPlaying(true);
        setPaperSize();

        populate(STARTING_CELLS);
        requestUpdate();

        angular.element($window).bind('resize', setPaperSize);

        $scope.togglePlaying  = togglePlaying;
        $scope.onMouseMove    = onMouseMove;
        $scope.onMouseDown    = onMouseDown;
        $scope.onMouseUp      = onMouseUp;
        $scope.ready          = true;
      };

    init();
  }]);
};

module.exports = GameControllerFactoryConstructor;
