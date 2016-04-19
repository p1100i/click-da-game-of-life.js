var
  Grid = require('../../src/js/grid');

describe('Grid', function () {
  beforeEach(function () {
    this.grid = new Grid();
  });

  describe('.setCell()', function () {
    beforeEach(function () {
      this.cell = this.grid.setCell(-1, 2, true);
    });

    it('should return a proper cell object', function() {
      expect(this.cell).toBeTruthy();
      expect(this.cell.x).toBe(-1);
      expect(this.cell.y).toBe(2);
      expect(this.cell.s).toBe(true);
      expect(this.cell.ns).toBe(false);
    });

    describe('with no cell state param', function () {
      it('should return a cell object with 0 state', function() {
        this.cell = this.grid.setCell(2, 2);

        expect(this.cell).toBeTruthy();
        expect(this.cell.s).toBe(false);
        expect(this.cell.ns).toBe(false);
      });
    });

    describe('with same params as cell already inserted', function () {
      describe('with undefined cell state', function () {
        it('should not reset the cell state', function() {
          this.cell = this.grid.setCell(-1, 2);

          expect(this.cell).toBeTruthy();
          expect(this.cell.s).toBe(true);
          expect(this.cell.ns).toBe(false);
        });
      });

      describe('with give cell state', function () {
        it('should set the cell state', function() {
          this.cell = this.grid.setCell(-1, 2, false);

          expect(this.cell).toBeTruthy();
          expect(this.cell.s).toBe(false);
          expect(this.cell.ns).toBe(false);
        });
      });
    });

    describe('with not enough params', function () {
      it('should return false', function() {
        expect(this.grid.setCell(2)).toBe(false);
      });
    });
  });

  describe('.getCells()', function () {
    describe('with no cells inserted', function () {
      it('should return an empty object', function() {
        expect(this.grid.getCells()).toEqual({});
      });
    });

    describe('with cells inserted', function () {
      beforeEach(function () {
        this.cell   = this.grid.setCell(-1, 2);
        this.cells  = this.grid.getCells();
      });

      it('should return the object containing the cells', function() {
        var
          key = '-1_2',
          cell,
          keys;

        expect(this.cells).toBeTruthy();
        expect(this.cells[key]).toBeTruthy();

        keys = Object.keys(this.cells);

        expect(keys.length).toBe(1);

        cell = this.cells[key];

        expect(this.cell).toBe(cell);
      });
    });
  });

  describe('.iterate()', function () {
    describe('with 3 cells over each other', function () {
      beforeEach(function () {
        this.grid.setCell(3, -1, true);
        this.grid.setCell(3, 1,  true);

        this.cell = this.grid.setCell(3, 0,  true);

        this.grid.iterate();
      });

      it('should leave the middle one alive', function() {
        var
          cells = this.grid.getCells(),
          keys  = Object.keys(cells);

        expect(keys.length).toBe(3);
        expect(cells['3_0']).toBe(this.cell);
        expect(cells['2_0']).toBeTruthy();
        expect(cells['4_0']).toBeTruthy();
      });
    });

    describe('with 3 cells in L formation', function () {
      beforeEach(function () {
        this.grid.setCell(0, -1,  true);
        this.grid.setCell(1, 0,  true);
        this.cell = this.grid.setCell(0, 0,  true);

        this.grid.iterate();
        this.cells = this.grid.getCells();
      });

      it('should add one to fill up the quadrant', function() {
        var
          keys  = Object.keys(this.cells);

        expect(keys.length).toBe(4);
      });

      it('should increase the age of the existing cell', function() {
        expect(this.cell.a).toBe(1);
      });

      it('should increase the living cells age', function() {
        var
          newCell = this.cells['1_-1'];

        expect(newCell).toBeTruthy();
        expect(newCell.a).toBe(0);
      });
    });

    describe('with 4 cells in a quadrant form', function () {
      beforeEach(function () {
        this.grid.setCell(0, -1,  true);
        this.grid.setCell(1,  0,  true);
        this.grid.setCell(0,  0,  true);
        this.grid.setCell(1, -1,  true);

        this.grid.iterate();
        this.cells = this.grid.getCells();
        this.keys  = Object.keys(this.cells);
        this.cell  = this.cells[this.keys[0]];
      });

      it('should leave all alive', function() {
        expect(this.keys.length).toBe(4);
      });

      it('should increase theire age', function() {
        expect(this.cell.a).toBe(1);
      });

      describe('with updating again', function () {
        beforeEach(function () {
          this.grid.iterate();
        });

        it('should leave all alive', function() {
          expect(this.keys.length).toBe(4);
        });

        it('should increase theire age again', function() {
          expect(this.cell.a).toBe(2);
        });
      });
    });
  });
});
