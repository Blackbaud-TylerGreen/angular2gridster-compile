import { __values } from "tslib";
// const GridCol = function(lanes) {
//     for (let i = 0; i < lanes; i++) {
//         this.push(null);
//     }
// };
var makeGridCol = function (lanes) {
    var result = [];
    for (var i = 0; i < lanes; i++) {
        result.push(null);
    }
    return result;
};
var ɵ0 = makeGridCol;
/**
 * A GridList manages the two-dimensional positions from a list of items,
 * within a virtual matrix.
 *
 * The GridList's main function is to convert the item positions from one
 * grid size to another, maintaining as much of their order as possible.
 *
 * The GridList's second function is to handle collisions when moving an item
 * over another.
 *
 * The positioning algorithm places items in columns. Starting from left to
 * right, going through each column top to bottom.
 *
 * The size of an item is expressed using the number of cols and rows it
 * takes up within the grid (w and h)
 *
 * The position of an item is express using the col and row position within
 * the grid (x and y)
 *
 * An item is an object of structure:
 * {
 *   w: 3, h: 1,
 *   x: 0, y: 1
 * }
 */
var GridList = /** @class */ (function () {
    function GridList(items, options) {
        this.options = options;
        this.items = items;
        this.adjustSizeOfItems();
        this.generateGrid();
    }
    /**
     * Illustrates grid as text-based table, using a number identifier for each
     * item. E.g.
     *
     *  #|  0  1  2  3  4  5  6  7  8  9 10 11 12 13
     *  --------------------------------------------
     *  0| 00 02 03 04 04 06 08 08 08 12 12 13 14 16
     *  1| 01 -- 03 05 05 07 09 10 11 11 -- 13 15 --
     *
     * Warn: Does not work if items don't have a width or height specified
     * besides their position in the grid.
     */
    GridList.prototype.toString = function () {
        var widthOfGrid = this.grid.length;
        var output = '\n #|', border = '\n --', item, i, j;
        // Render the table header
        for (i = 0; i < widthOfGrid; i++) {
            output += ' ' + this.padNumber(i, ' ');
            border += '---';
        }
        output += border;
        // Render table contents row by row, as we go on the y axis
        for (i = 0; i < this.options.lanes; i++) {
            output += '\n' + this.padNumber(i, ' ') + '|';
            for (j = 0; j < widthOfGrid; j++) {
                output += ' ';
                item = this.grid[j][i];
                output += item
                    ? this.padNumber(this.items.indexOf(item), '0')
                    : '--';
            }
        }
        output += '\n';
        return output;
    };
    GridList.prototype.setOption = function (name, value) {
        this.options[name] = value;
    };
    /**
     * Build the grid structure from scratch, with the current item positions
     */
    GridList.prototype.generateGrid = function () {
        var i;
        this.resetGrid();
        for (i = 0; i < this.items.length; i++) {
            this.markItemPositionToGrid(this.items[i]);
        }
    };
    GridList.prototype.resizeGrid = function (lanes) {
        var currentColumn = 0;
        this.options.lanes = lanes;
        this.adjustSizeOfItems();
        this.sortItemsByPosition();
        this.resetGrid();
        // The items will be sorted based on their index within the this.items array,
        // that is their "1d position"
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i], position = this.getItemPosition(item);
            this.updateItemPosition(item, this.findPositionForItem(item, { x: currentColumn, y: 0 }));
            // New items should never be placed to the left of previous items
            currentColumn = Math.max(currentColumn, position.x);
        }
        this.pullItemsToLeft();
    };
    /**
     * This method has two options for the position we want for the item:
     * - Starting from a certain row/column number and only looking for
     *   positions to its right
     * - Accepting positions for a certain row number only (use-case: items
     *   being shifted to the left/right as a result of collisions)
     *
     * @param Object item
     * @param Object start Position from which to start
     *     the search.
     * @param number [fixedRow] If provided, we're going to try to find a
     *     position for the new item on it. If doesn't fit there, we're going
     *     to put it on the first row.
     *
     * @returns Array x and y.
     */
    GridList.prototype.findPositionForItem = function (item, start, fixedRow) {
        var x, y, position;
        // Start searching for a position from the horizontal position of the
        // rightmost item from the grid
        for (x = start.x; x < this.grid.length; x++) {
            if (fixedRow !== undefined) {
                position = [x, fixedRow];
                if (this.itemFitsAtPosition(item, position)) {
                    return position;
                }
            }
            else {
                for (y = start.y; y < this.options.lanes; y++) {
                    position = [x, y];
                    if (this.itemFitsAtPosition(item, position)) {
                        return position;
                    }
                }
            }
        }
        // If we've reached this point, we need to start a new column
        var newCol = this.grid.length;
        var newRow = 0;
        if (fixedRow !== undefined &&
            this.itemFitsAtPosition(item, [newCol, fixedRow])) {
            newRow = fixedRow;
        }
        return [newCol, newRow];
    };
    GridList.prototype.moveAndResize = function (item, newPosition, size) {
        var position = this.getItemPosition({
            x: newPosition[0],
            y: newPosition[1],
            w: item.w,
            h: item.h
        });
        var width = size.w || item.w, height = size.h || item.h;
        this.updateItemPosition(item, [position.x, position.y]);
        this.updateItemSize(item, width, height);
        this.resolveCollisions(item);
    };
    GridList.prototype.moveItemToPosition = function (item, newPosition) {
        var position = this.getItemPosition({
            x: newPosition[0],
            y: newPosition[1],
            w: item.w,
            h: item.h
        });
        this.updateItemPosition(item, [position.x, position.y]);
        this.resolveCollisions(item);
    };
    /**
     * Resize an item and resolve collisions.
     *
     * @param Object item A reference to an item that's part of the grid.
     * @param Object size
     * @param number [size.w=item.w] The new width.
     * @param number [size.h=item.h] The new height.
     */
    GridList.prototype.resizeItem = function (item, size) {
        var width = size.w || item.w, height = size.h || item.h;
        this.updateItemSize(item, width, height);
        this.pullItemsToLeft(item);
    };
    /**
     * Compare the current items against a previous snapshot and return only
     * the ones that changed their attributes in the meantime. This includes both
     * position (x, y) and size (w, h)
     *
     * Each item that is returned is not the GridListItem but the helper that holds GridListItem
     * and list of changed properties.
     */
    GridList.prototype.getChangedItems = function (initialItems, breakpoint) {
        return this.items
            .map(function (item) {
            var changes = [];
            var oldValues = {};
            var initItem = initialItems.find(function (initItm) { return initItm.$element === item.$element; });
            if (!initItem) {
                return { item: item, changes: ['x', 'y', 'w', 'h'], isNew: true };
            }
            var oldX = initItem.getValueX(breakpoint);
            if (item.getValueX(breakpoint) !== oldX) {
                changes.push('x');
                if (oldX || oldX === 0) {
                    oldValues.x = oldX;
                }
            }
            var oldY = initItem.getValueY(breakpoint);
            if (item.getValueY(breakpoint) !== oldY) {
                changes.push('y');
                if (oldY || oldY === 0) {
                    oldValues.y = oldY;
                }
            }
            if (item.getValueW(breakpoint) !==
                initItem.getValueW(breakpoint)) {
                changes.push('w');
                oldValues.w = initItem.w;
            }
            if (item.getValueH(breakpoint) !==
                initItem.getValueH(breakpoint)) {
                changes.push('h');
                oldValues.h = initItem.h;
            }
            return { item: item, oldValues: oldValues, changes: changes, isNew: false };
        })
            .filter(function (itemChange) {
            return itemChange.changes.length;
        });
    };
    GridList.prototype.resolveCollisions = function (item) {
        if (!this.tryToResolveCollisionsLocally(item)) {
            this.pullItemsToLeft(item);
        }
        if (this.options.floating) {
            this.pullItemsToLeft();
        }
        else if (this.getItemsCollidingWithItem(item).length) {
            this.pullItemsToLeft();
        }
    };
    GridList.prototype.pushCollidingItems = function (fixedItem) {
        var _this = this;
        // Start a fresh grid with the fixed item already placed inside
        this.sortItemsByPosition();
        this.resetGrid();
        this.generateGrid();
        this.items
            .filter(function (item) { return !_this.isItemFloating(item) && item !== fixedItem; })
            .forEach(function (item) {
            if (!_this.tryToResolveCollisionsLocally(item)) {
                _this.pullItemsToLeft(item);
            }
        });
    };
    /**
     * Build the grid from scratch, by using the current item positions and
     * pulling them as much to the left as possible, removing as space between
     * them as possible.
     *
     * If a "fixed item" is provided, its position will be kept intact and the
     * rest of the items will be layed around it.
     */
    GridList.prototype.pullItemsToLeft = function (fixedItem) {
        var _this = this;
        if (this.options.direction === 'none') {
            return;
        }
        // Start a fresh grid with the fixed item already placed inside
        this.sortItemsByPosition();
        this.resetGrid();
        // Start the grid with the fixed item as the first positioned item
        if (fixedItem) {
            var fixedPosition = this.getItemPosition(fixedItem);
            this.updateItemPosition(fixedItem, [
                fixedPosition.x,
                fixedPosition.y
            ]);
        }
        this.items
            .filter(function (item) {
            return !item.dragAndDrop && item !== fixedItem;
        })
            .forEach(function (item) {
            var fixedPosition = _this.getItemPosition(item);
            _this.updateItemPosition(item, [
                fixedPosition.x,
                fixedPosition.y
            ]);
        });
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i], position = this.getItemPosition(item);
            // The fixed item keeps its exact position
            if ((fixedItem && item === fixedItem) ||
                !item.dragAndDrop ||
                (!this.options.floating &&
                    this.isItemFloating(item) &&
                    !this.getItemsCollidingWithItem(item).length)) {
                continue;
            }
            var x = this.findLeftMostPositionForItem(item), newPosition = this.findPositionForItem(item, { x: x, y: 0 }, position.y);
            this.updateItemPosition(item, newPosition);
        }
    };
    GridList.prototype.isOverFixedArea = function (x, y, w, h, item) {
        if (item === void 0) { item = null; }
        var itemData = { x: x, y: y, w: w, h: h };
        if (this.options.direction !== 'horizontal') {
            itemData = { x: y, y: x, w: h, h: w };
        }
        for (var i = itemData.x; i < itemData.x + itemData.w; i++) {
            for (var j = itemData.y; j < itemData.y + itemData.h; j++) {
                if (this.grid[i] &&
                    this.grid[i][j] &&
                    this.grid[i][j] !== item &&
                    !this.grid[i][j].dragAndDrop) {
                    return true;
                }
            }
        }
        return false;
    };
    GridList.prototype.checkItemAboveEmptyArea = function (item, newPosition) {
        var itemData = {
            x: newPosition.x,
            y: newPosition.y,
            w: item.w,
            h: item.h
        };
        if (!item.itemPrototype &&
            item.x === newPosition.x &&
            item.y === newPosition.y) {
            return true;
        }
        if (this.options.direction === 'horizontal') {
            itemData = {
                x: newPosition.y,
                y: newPosition.x,
                w: itemData.h,
                h: itemData.w
            };
        }
        return !this.checkItemsInArea(itemData.y, itemData.y + itemData.h - 1, itemData.x, itemData.x + itemData.w - 1, item);
    };
    GridList.prototype.fixItemsPositions = function (options) {
        var _this = this;
        // items with x, y that fits gird with size of options.lanes
        var validItems = this.items
            .filter(function (item) { return item.itemComponent; })
            .filter(function (item) {
            return _this.isItemValidForGrid(item, options);
        });
        // items that x, y must be generated
        var invalidItems = this.items
            .filter(function (item) { return item.itemComponent; })
            .filter(function (item) { return !_this.isItemValidForGrid(item, options); });
        var gridList = new GridList([], options);
        // put items with defined positions to the grid
        gridList.items = validItems.map(function (item) {
            return item.copyForBreakpoint(options.breakpoint);
        });
        gridList.generateGrid();
        invalidItems.forEach(function (item) {
            // TODO: check if this change does not broke anything
            // const itemCopy = item.copy();
            var itemCopy = item.copyForBreakpoint(options.breakpoint);
            var position = gridList.findPositionForItem(itemCopy, {
                x: 0,
                y: 0
            });
            gridList.items.push(itemCopy);
            gridList.setItemPosition(itemCopy, position);
            gridList.markItemPositionToGrid(itemCopy);
        });
        gridList.pullItemsToLeft();
        gridList.pushCollidingItems();
        this.items.forEach(function (itm) {
            var cachedItem = gridList.items.filter(function (cachedItm) {
                return cachedItm.$element === itm.$element;
            })[0];
            itm.setValueX(cachedItem.x, options.breakpoint);
            itm.setValueY(cachedItem.y, options.breakpoint);
            itm.setValueW(cachedItem.w, options.breakpoint);
            itm.setValueH(cachedItem.h, options.breakpoint);
            itm.autoSize = cachedItem.autoSize;
        });
    };
    GridList.prototype.deleteItemPositionFromGrid = function (item) {
        var position = this.getItemPosition(item);
        var x, y;
        for (x = position.x; x < position.x + position.w; x++) {
            // It can happen to try to remove an item from a position not generated
            // in the grid, probably when loading a persisted grid of items. No need
            // to create a column to be able to remove something from it, though
            if (!this.grid[x]) {
                continue;
            }
            for (y = position.y; y < position.y + position.h; y++) {
                // Don't clear the cell if it's been occupied by a different widget in
                // the meantime (e.g. when an item has been moved over this one, and
                // thus by continuing to clear this item's previous position you would
                // cancel the first item's move, leaving it without any position even)
                if (this.grid[x][y] === item) {
                    this.grid[x][y] = null;
                }
            }
        }
    };
    GridList.prototype.isItemFloating = function (item) {
        if (item.itemComponent && item.itemComponent.isDragging) {
            return false;
        }
        var position = this.getItemPosition(item);
        if (position.x === 0) {
            return false;
        }
        var rowBelowItem = this.grid[position.x - 1];
        return (rowBelowItem || [])
            .slice(position.y, position.y + position.h)
            .reduce(function (isFloating, cellItem) {
            return isFloating && !cellItem;
        }, true);
    };
    GridList.prototype.isItemValidForGrid = function (item, options) {
        var itemData = options.direction === 'horizontal'
            ? {
                x: item.getValueY(options.breakpoint),
                y: item.getValueX(options.breakpoint),
                w: item.getValueH(options.breakpoint),
                h: Math.min(item.getValueW(this.options.breakpoint), options.lanes)
            }
            : {
                x: item.getValueX(options.breakpoint),
                y: item.getValueY(options.breakpoint),
                w: Math.min(item.getValueW(this.options.breakpoint), options.lanes),
                h: item.getValueH(options.breakpoint)
            };
        return (typeof itemData.x === 'number' &&
            typeof itemData.y === 'number' &&
            itemData.x + itemData.w <= options.lanes);
    };
    GridList.prototype.findDefaultPositionHorizontal = function (width, height) {
        var e_1, _a;
        try {
            for (var _b = __values(this.grid), _c = _b.next(); !_c.done; _c = _b.next()) {
                var col = _c.value;
                var colIdx = this.grid.indexOf(col);
                var rowIdx = 0;
                while (rowIdx < col.length - height + 1) {
                    if (!this.checkItemsInArea(colIdx, colIdx + width - 1, rowIdx, rowIdx + height - 1)) {
                        return [colIdx, rowIdx];
                    }
                    rowIdx++;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return [this.grid.length, 0];
    };
    GridList.prototype.findDefaultPositionVertical = function (width, height) {
        var e_2, _a;
        try {
            for (var _b = __values(this.grid), _c = _b.next(); !_c.done; _c = _b.next()) {
                var row = _c.value;
                var rowIdx = this.grid.indexOf(row);
                var colIdx = 0;
                while (colIdx < row.length - width + 1) {
                    if (!this.checkItemsInArea(rowIdx, rowIdx + height - 1, colIdx, colIdx + width - 1)) {
                        return [colIdx, rowIdx];
                    }
                    colIdx++;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return [0, this.grid.length];
    };
    GridList.prototype.checkItemsInArea = function (rowStart, rowEnd, colStart, colEnd, item) {
        for (var i = rowStart; i <= rowEnd; i++) {
            for (var j = colStart; j <= colEnd; j++) {
                if (this.grid[i] &&
                    this.grid[i][j] &&
                    (item ? this.grid[i][j] !== item : true)) {
                    return true;
                }
            }
        }
        return false;
    };
    GridList.prototype.sortItemsByPosition = function () {
        var _this = this;
        this.items.sort(function (item1, item2) {
            var position1 = _this.getItemPosition(item1), position2 = _this.getItemPosition(item2);
            // Try to preserve columns.
            if (position1.x !== position2.x) {
                return position1.x - position2.x;
            }
            if (position1.y !== position2.y) {
                return position1.y - position2.y;
            }
            // The items are placed on the same position.
            return 0;
        });
    };
    /**
     * Some items can have 100% height or 100% width. Those dimmensions are
     * expressed as 0. We need to ensure a valid width and height for each of
     * those items as the number of items per lane.
     */
    GridList.prototype.adjustSizeOfItems = function () {
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            // This can happen only the first time items are checked.
            // We need the property to have a value for all the items so that the
            // `cloneItems` method will merge the properties properly. If we only set
            // it to the items that need it then the following can happen:
            //
            // cloneItems([{id: 1, autoSize: true}, {id: 2}],
            //            [{id: 2}, {id: 1, autoSize: true}]);
            //
            // will result in
            //
            // [{id: 1, autoSize: true}, {id: 2, autoSize: true}]
            if (item.autoSize === undefined) {
                item.autoSize = item.w === 0 || item.h === 0;
            }
            if (item.autoSize) {
                if (this.options.direction === 'horizontal') {
                    item.h = this.options.lanes;
                }
                else {
                    item.w = this.options.lanes;
                }
            }
        }
    };
    GridList.prototype.resetGrid = function () {
        this.grid = [];
    };
    /**
     * Check that an item wouldn't overlap with another one if placed at a
     * certain position within the grid
     */
    GridList.prototype.itemFitsAtPosition = function (item, newPosition) {
        var position = this.getItemPosition(item);
        var x, y;
        // No coordonate can be negative
        if (newPosition[0] < 0 || newPosition[1] < 0) {
            return false;
        }
        // Make sure the item isn't larger than the entire grid
        if (newPosition[1] + Math.min(position.h, this.options.lanes) >
            this.options.lanes) {
            return false;
        }
        if (this.isOverFixedArea(item.x, item.y, item.w, item.h)) {
            return false;
        }
        // Make sure the position doesn't overlap with an already positioned
        // item.
        for (x = newPosition[0]; x < newPosition[0] + position.w; x++) {
            var col = this.grid[x];
            // Surely a column that hasn't even been created yet is available
            if (!col) {
                continue;
            }
            for (y = newPosition[1]; y < newPosition[1] + position.h; y++) {
                // Any space occupied by an item can continue to be occupied by the
                // same item.
                if (col[y] && col[y] !== item) {
                    return false;
                }
            }
        }
        return true;
    };
    GridList.prototype.updateItemPosition = function (item, position) {
        if (item.x !== null && item.y !== null) {
            this.deleteItemPositionFromGrid(item);
        }
        this.setItemPosition(item, position);
        this.markItemPositionToGrid(item);
    };
    /**
     * @param Object item A reference to a grid item.
     * @param number width The new width.
     * @param number height The new height.
     */
    GridList.prototype.updateItemSize = function (item, width, height) {
        if (item.x !== null && item.y !== null) {
            this.deleteItemPositionFromGrid(item);
        }
        item.w = width;
        item.h = height;
        this.markItemPositionToGrid(item);
    };
    /**
     * Mark the grid cells that are occupied by an item. This prevents items
     * from overlapping in the grid
     */
    GridList.prototype.markItemPositionToGrid = function (item) {
        var position = this.getItemPosition(item);
        var x, y;
        // Ensure that the grid has enough columns to accomodate the current item.
        this.ensureColumns(position.x + position.w);
        for (x = position.x; x < position.x + position.w; x++) {
            for (y = position.y; y < position.y + position.h; y++) {
                this.grid[x][y] = item;
            }
        }
    };
    /**
     * Ensure that the grid has at least N columns available.
     */
    GridList.prototype.ensureColumns = function (N) {
        for (var i = 0; i < N; i++) {
            if (!this.grid[i]) {
                this.grid.push(makeGridCol(this.options.lanes));
            }
        }
    };
    GridList.prototype.getItemsCollidingWithItem = function (item) {
        var collidingItems = [];
        for (var i = 0; i < this.items.length; i++) {
            if (item !== this.items[i] &&
                this.itemsAreColliding(item, this.items[i])) {
                collidingItems.push(i);
            }
        }
        return collidingItems;
    };
    GridList.prototype.itemsAreColliding = function (item1, item2) {
        var position1 = this.getItemPosition(item1), position2 = this.getItemPosition(item2);
        return !(position2.x >= position1.x + position1.w ||
            position2.x + position2.w <= position1.x ||
            position2.y >= position1.y + position1.h ||
            position2.y + position2.h <= position1.y);
    };
    /**
     * Attempt to resolve the collisions after moving an item over one or more
     * other items within the grid, by shifting the position of the colliding
     * items around the moving one. This might result in subsequent collisions,
     * in which case we will revert all position permutations. To be able to
     * revert to the initial item positions, we create a virtual grid in the
     * process
     */
    GridList.prototype.tryToResolveCollisionsLocally = function (item) {
        var collidingItems = this.getItemsCollidingWithItem(item);
        if (!collidingItems.length) {
            return true;
        }
        var _gridList = new GridList(this.items.map(function (itm) {
            return itm.copy();
        }), this.options);
        var leftOfItem;
        var rightOfItem;
        var aboveOfItem;
        var belowOfItem;
        for (var i = 0; i < collidingItems.length; i++) {
            var collidingItem = _gridList.items[collidingItems[i]], collidingPosition = this.getItemPosition(collidingItem);
            // We use a simple algorithm for moving items around when collisions occur:
            // In this prioritized order, we try to move a colliding item around the
            // moving one:
            // 1. to its left side
            // 2. above it
            // 3. under it
            // 4. to its right side
            var position = this.getItemPosition(item);
            leftOfItem = [
                position.x - collidingPosition.w,
                collidingPosition.y
            ];
            rightOfItem = [position.x + position.w, collidingPosition.y];
            aboveOfItem = [
                collidingPosition.x,
                position.y - collidingPosition.h
            ];
            belowOfItem = [collidingPosition.x, position.y + position.h];
            if (_gridList.itemFitsAtPosition(collidingItem, leftOfItem)) {
                _gridList.updateItemPosition(collidingItem, leftOfItem);
            }
            else if (_gridList.itemFitsAtPosition(collidingItem, aboveOfItem)) {
                _gridList.updateItemPosition(collidingItem, aboveOfItem);
            }
            else if (_gridList.itemFitsAtPosition(collidingItem, belowOfItem)) {
                _gridList.updateItemPosition(collidingItem, belowOfItem);
            }
            else if (_gridList.itemFitsAtPosition(collidingItem, rightOfItem)) {
                _gridList.updateItemPosition(collidingItem, rightOfItem);
            }
            else {
                // Collisions failed, we must use the pullItemsToLeft method to arrange
                // the other items around this item with fixed position. This is our
                // plan B for when local collision resolving fails.
                return false;
            }
        }
        // If we reached this point it means we managed to resolve the collisions
        // from one single iteration, just by moving the colliding items around. So
        // we accept this scenario and merge the branched-out grid instance into the
        // original one
        this.items.forEach(function (itm, idx) {
            var cachedItem = _gridList.items.filter(function (cachedItm) {
                return cachedItm.$element === itm.$element;
            })[0];
            itm.x = cachedItem.x;
            itm.y = cachedItem.y;
            itm.w = cachedItem.w;
            itm.h = cachedItem.h;
            itm.autoSize = cachedItem.autoSize;
        });
        this.generateGrid();
        return true;
    };
    /**
     * When pulling items to the left, we need to find the leftmost position for
     * an item, with two considerations in mind:
     * - preserving its current row
     * - preserving the previous horizontal order between items
     */
    GridList.prototype.findLeftMostPositionForItem = function (item) {
        var tail = 0;
        var position = this.getItemPosition(item);
        for (var i = 0; i < this.grid.length; i++) {
            for (var j = position.y; j < position.y + position.h; j++) {
                var otherItem = this.grid[i][j];
                if (!otherItem) {
                    continue;
                }
                var otherPosition = this.getItemPosition(otherItem);
                if (this.items.indexOf(otherItem) < this.items.indexOf(item)) {
                    tail = otherPosition.x + otherPosition.w;
                }
            }
        }
        return tail;
    };
    GridList.prototype.findItemByPosition = function (x, y) {
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].x === x && this.items[i].y === y) {
                return this.items[i];
            }
        }
    };
    GridList.prototype.getItemByAttribute = function (key, value) {
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i][key] === value) {
                return this.items[i];
            }
        }
        return null;
    };
    GridList.prototype.padNumber = function (nr, prefix) {
        // Currently works for 2-digit numbers (<100)
        return nr >= 10 ? nr : prefix + nr;
    };
    /**
     * If the direction is vertical we need to rotate the grid 90 deg to the
     * left. Thus, we simulate the fact that items are being pulled to the top.
     *
     * Since the items have widths and heights, if we apply the classic
     * counter-clockwise 90 deg rotation
     *
     *     [0 -1]
     *     [1  0]
     *
     * then the top left point of an item will become the bottom left point of
     * the rotated item. To adjust for this, we need to subtract from the y
     * position the height of the original item - the width of the rotated item.
     *
     * However, if we do this then we'll reverse some actions: resizing the
     * width of an item will stretch the item to the left instead of to the
     * right; resizing an item that doesn't fit into the grid will push the
     * items around it instead of going on a new row, etc.
     *
     * We found it better to do a vertical flip of the grid after rotating it.
     * This restores the direction of the actions and greatly simplifies the
     * transformations.
     */
    GridList.prototype.getItemPosition = function (item) {
        if (this.options.direction === 'horizontal') {
            return item;
        }
        else {
            return {
                x: item.y,
                y: item.x,
                w: item.h,
                h: item.w
            };
        }
    };
    /**
     * See getItemPosition.
     */
    GridList.prototype.setItemPosition = function (item, position) {
        if (this.options.direction === 'horizontal') {
            item.x = position[0];
            item.y = position[1];
        }
        else {
            // We're supposed to subtract the rotated item's height which is actually
            // the non-rotated item's width.
            item.x = position[1];
            item.y = position[0];
        }
    };
    return GridList;
}());
export { GridList };
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZExpc3QuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyMmdyaWRzdGVyLyIsInNvdXJjZXMiOlsibGliL2dyaWRMaXN0L2dyaWRMaXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFHQSxvQ0FBb0M7QUFDcEMsd0NBQXdDO0FBQ3hDLDJCQUEyQjtBQUMzQixRQUFRO0FBQ1IsS0FBSztBQUNMLElBQU0sV0FBVyxHQUFHLFVBQVUsS0FBYTtJQUN2QyxJQUFJLE1BQU0sR0FBbUIsRUFBRSxDQUFDO0lBQ2hDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDNUIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNyQjtJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUMsQ0FBQzs7QUFJRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBd0JHO0FBQ0g7SUFNSSxrQkFBWSxLQUEwQixFQUFFLE9BQXlCO1FBQzdELElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBRXZCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBRW5CLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBRXpCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBRUQ7Ozs7Ozs7Ozs7O09BV0c7SUFDSCwyQkFBUSxHQUFSO1FBQ0ksSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDckMsSUFBSSxNQUFNLEdBQUcsT0FBTyxFQUNoQixNQUFNLEdBQUcsT0FBTyxFQUNoQixJQUFJLEVBQ0osQ0FBQyxFQUNELENBQUMsQ0FBQztRQUVOLDBCQUEwQjtRQUMxQixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM5QixNQUFNLElBQUksR0FBRyxHQUFHLElB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SXRlbSc7XG5pbXBvcnQgeyBJR3JpZHN0ZXJPcHRpb25zIH0gZnJvbSAnLi4vSUdyaWRzdGVyT3B0aW9ucyc7XG5cbi8vIGNvbnN0IEdyaWRDb2wgPSBmdW5jdGlvbihsYW5lcykge1xuLy8gICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGFuZXM7IGkrKykge1xuLy8gICAgICAgICB0aGlzLnB1c2gobnVsbCk7XG4vLyAgICAgfVxuLy8gfTtcbmNvbnN0IG1ha2VHcmlkQ29sID0gZnVuY3Rpb24gKGxhbmVzOiBudW1iZXIpOiBHcmlkQ29sIHtcbiAgICBsZXQgcmVzdWx0OiBHcmlkTGlzdEl0ZW1bXSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGFuZXM7IGkrKykge1xuICAgICAgICByZXN1bHQucHVzaChudWxsKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbnR5cGUgR3JpZENvbCA9IEdyaWRMaXN0SXRlbVtdO1xuXG4vKipcbiAqIEEgR3JpZExpc3QgbWFuYWdlcyB0aGUgdHdvLWRpbWVuc2lvbmFsIHBvc2l0aW9ucyBmcm9tIGEgbGlzdCBvZiBpdGVtcyxcbiAqIHdpdGhpbiBhIHZpcnR1YWwgbWF0cml4LlxuICpcbiAqIFRoZSBHcmlkTGlzdCdzIG1haW4gZnVuY3Rpb24gaXMgdG8gY29udmVydCB0aGUgaXRlbSBwb3NpdGlvbnMgZnJvbSBvbmVcbiAqIGdyaWQgc2l6ZSB0byBhbm90aGVyLCBtYWludGFpbmluZyBhcyBtdWNoIG9mIHRoZWlyIG9yZGVyIGFzIHBvc3NpYmxlLlxuICpcbiAqIFRoZSBHcmlkTGlzdCdzIHNlY29uZCBmdW5jdGlvbiBpcyB0byBoYW5kbGUgY29sbGlzaW9ucyB3aGVuIG1vdmluZyBhbiBpdGVtXG4gKiBvdmVyIGFub3RoZXIuXG4gKlxuICogVGhlIHBvc2l0aW9uaW5nIGFsZ29yaXRobSBwbGFjZXMgaXRlbXMgaW4gY29sdW1ucy4gU3RhcnRpbmcgZnJvbSBsZWZ0IHRvXG4gKiByaWdodCwgZ29pbmcgdGhyb3VnaCBlYWNoIGNvbHVtbiB0b3AgdG8gYm90dG9tLlxuICpcbiAqIFRoZSBzaXplIG9mIGFuIGl0ZW0gaXMgZXhwcmVzc2VkIHVzaW5nIHRoZSBudW1iZXIgb2YgY29scyBhbmQgcm93cyBpdFxuICogdGFrZXMgdXAgd2l0aGluIHRoZSBncmlkICh3IGFuZCBoKVxuICpcbiAqIFRoZSBwb3NpdGlvbiBvZiBhbiBpdGVtIGlzIGV4cHJlc3MgdXNpbmcgdGhlIGNvbCBhbmQgcm93IHBvc2l0aW9uIHdpdGhpblxuICogdGhlIGdyaWQgKHggYW5kIHkpXG4gKlxuICogQW4gaXRlbSBpcyBhbiBvYmplY3Qgb2Ygc3RydWN0dXJlOlxuICoge1xuICogICB3OiAzLCBoOiAxLFxuICogICB4OiAwLCB5OiAxXG4gKiB9XG4gKi9cbmV4cG9ydCBjbGFzcyBHcmlkTGlzdCB7XG4gICAgaXRlbXM6IEFycmF5PEdyaWRMaXN0SXRlbT47XG4gICAgZ3JpZDogQXJyYXk8QXJyYXk8R3JpZExpc3RJdGVtPj47XG5cbiAgICBvcHRpb25zOiBJR3JpZHN0ZXJPcHRpb25zO1xuXG4gICAgY29uc3RydWN0b3IoaXRlbXM6IEFycmF5PEdyaWRMaXN0SXRlbT4sIG9wdGlvbnM6IElHcmlkc3Rlck9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcblxuICAgICAgICB0aGlzLml0ZW1zID0gaXRlbXM7XG5cbiAgICAgICAgdGhpcy5hZGp1c3RTaXplT2ZJdGVtcygpO1xuXG4gICAgICAgIHRoaXMuZ2VuZXJhdGVHcmlkKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSWxsdXN0cmF0ZXMgZ3JpZCBhcyB0ZXh0LWJhc2VkIHRhYmxlLCB1c2luZyBhIG51bWJlciBpZGVudGlmaWVyIGZvciBlYWNoXG4gICAgICogaXRlbS4gRS5nLlxuICAgICAqXG4gICAgICogICN8ICAwICAxICAyICAzICA0ICA1ICA2ICA3ICA4ICA5IDEwIDExIDEyIDEzXG4gICAgICogIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICogIDB8IDAwIDAyIDAzIDA0IDA0IDA2IDA4IDA4IDA4IDEyIDEyIDEzIDE0IDE2XG4gICAgICogIDF8IDAxIC0tIDAzIDA1IDA1IDA3IDA5IDEwIDExIDExIC0tIDEzIDE1IC0tXG4gICAgICpcbiAgICAgKiBXYXJuOiBEb2VzIG5vdCB3b3JrIGlmIGl0ZW1zIGRvbid0IGhhdmUgYSB3aWR0aCBvciBoZWlnaHQgc3BlY2lmaWVkXG4gICAgICogYmVzaWRlcyB0aGVpciBwb3NpdGlvbiBpbiB0aGUgZ3JpZC5cbiAgICAgKi9cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgY29uc3Qgd2lkdGhPZkdyaWQgPSB0aGlzLmdyaWQubGVuZ3RoO1xuICAgICAgICBsZXQgb3V0cHV0ID0gJ1xcbiAjfCcsXG4gICAgICAgICAgICBib3JkZXIgPSAnXFxuIC0tJyxcbiAgICAgICAgICAgIGl0ZW0sXG4gICAgICAgICAgICBpLFxuICAgICAgICAgICAgajtcblxuICAgICAgICAvLyBSZW5kZXIgdGhlIHRhYmxlIGhlYWRlclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgd2lkdGhPZkdyaWQ7IGkrKykge1xuICAgICAgICAgICAgb3V0cHV0ICs9ICcgJyArIHRoaXMucGFkTnVtYmVyKGksICcgJyk7XG4gICAgICAgICAgICBib3JkZXIgKz0gJy0tLSc7XG4gICAgICAgIH1cbiAgICAgICAgb3V0cHV0ICs9IGJvcmRlcjtcblxuICAgICAgICAvLyBSZW5kZXIgdGFibGUgY29udGVudHMgcm93IGJ5IHJvdywgYXMgd2UgZ28gb24gdGhlIHkgYXhpc1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5vcHRpb25zLmxhbmVzOyBpKyspIHtcbiAgICAgICAgICAgIG91dHB1dCArPSAnXFxuJyArIHRoaXMucGFkTnVtYmVyKGksICcgJykgKyAnfCc7XG4gICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgd2lkdGhPZkdyaWQ7IGorKykge1xuICAgICAgICAgICAgICAgIG91dHB1dCArPSAnICc7XG4gICAgICAgICAgICAgICAgaXRlbSA9IHRoaXMuZ3JpZFtqXVtpXTtcbiAgICAgICAgICAgICAgICBvdXRwdXQgKz0gaXRlbVxuICAgICAgICAgICAgICAgICAgICA/IHRoaXMucGFkTnVtYmVyKHRoaXMuaXRlbXMuaW5kZXhPZihpdGVtKSwgJzAnKVxuICAgICAgICAgICAgICAgICAgICA6ICctLSc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgb3V0cHV0ICs9ICdcXG4nO1xuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgIH1cblxuICAgIHNldE9wdGlvbihuYW1lOiBrZXlvZiBJR3JpZHN0ZXJPcHRpb25zLCB2YWx1ZTogYW55KSB7XG4gICAgICAgICg8YW55PnRoaXMub3B0aW9uc1tuYW1lXSkgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBCdWlsZCB0aGUgZ3JpZCBzdHJ1Y3R1cmUgZnJvbSBzY3JhdGNoLCB3aXRoIHRoZSBjdXJyZW50IGl0ZW0gcG9zaXRpb25zXG4gICAgICovXG4gICAgZ2VuZXJhdGVHcmlkKCkge1xuICAgICAgICBsZXQgaTtcbiAgICAgICAgdGhpcy5yZXNldEdyaWQoKTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMuaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMubWFya0l0ZW1Qb3NpdGlvblRvR3JpZCh0aGlzLml0ZW1zW2ldKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlc2l6ZUdyaWQobGFuZXM6IG51bWJlcikge1xuICAgICAgICBsZXQgY3VycmVudENvbHVtbiA9IDA7XG5cbiAgICAgICAgdGhpcy5vcHRpb25zLmxhbmVzID0gbGFuZXM7XG4gICAgICAgIHRoaXMuYWRqdXN0U2l6ZU9mSXRlbXMoKTtcblxuICAgICAgICB0aGlzLnNvcnRJdGVtc0J5UG9zaXRpb24oKTtcbiAgICAgICAgdGhpcy5yZXNldEdyaWQoKTtcblxuICAgICAgICAvLyBUaGUgaXRlbXMgd2lsbCBiZSBzb3J0ZWQgYmFzZWQgb24gdGhlaXIgaW5kZXggd2l0aGluIHRoZSB0aGlzLml0ZW1zIGFycmF5LFxuICAgICAgICAvLyB0aGF0IGlzIHRoZWlyIFwiMWQgcG9zaXRpb25cIlxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLml0ZW1zW2ldLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gdGhpcy5nZXRJdGVtUG9zaXRpb24oaXRlbSk7XG5cbiAgICAgICAgICAgIHRoaXMudXBkYXRlSXRlbVBvc2l0aW9uKFxuICAgICAgICAgICAgICAgIGl0ZW0sXG4gICAgICAgICAgICAgICAgdGhpcy5maW5kUG9zaXRpb25Gb3JJdGVtKGl0ZW0sIHsgeDogY3VycmVudENvbHVtbiwgeTogMCB9KVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgLy8gTmV3IGl0ZW1zIHNob3VsZCBuZXZlciBiZSBwbGFjZWQgdG8gdGhlIGxlZnQgb2YgcHJldmlvdXMgaXRlbXNcbiAgICAgICAgICAgIGN1cnJlbnRDb2x1bW4gPSBNYXRoLm1heChjdXJyZW50Q29sdW1uLCBwb3NpdGlvbi54KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucHVsbEl0ZW1zVG9MZWZ0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaGFzIHR3byBvcHRpb25zIGZvciB0aGUgcG9zaXRpb24gd2Ugd2FudCBmb3IgdGhlIGl0ZW06XG4gICAgICogLSBTdGFydGluZyBmcm9tIGEgY2VydGFpbiByb3cvY29sdW1uIG51bWJlciBhbmQgb25seSBsb29raW5nIGZvclxuICAgICAqICAgcG9zaXRpb25zIHRvIGl0cyByaWdodFxuICAgICAqIC0gQWNjZXB0aW5nIHBvc2l0aW9ucyBmb3IgYSBjZXJ0YWluIHJvdyBudW1iZXIgb25seSAodXNlLWNhc2U6IGl0ZW1zXG4gICAgICogICBiZWluZyBzaGlmdGVkIHRvIHRoZSBsZWZ0L3JpZ2h0IGFzIGEgcmVzdWx0IG9mIGNvbGxpc2lvbnMpXG4gICAgICpcbiAgICAgKiBAcGFyYW0gT2JqZWN0IGl0ZW1cbiAgICAgKiBAcGFyYW0gT2JqZWN0IHN0YXJ0IFBvc2l0aW9uIGZyb20gd2hpY2ggdG8gc3RhcnRcbiAgICAgKiAgICAgdGhlIHNlYXJjaC5cbiAgICAgKiBAcGFyYW0gbnVtYmVyIFtmaXhlZFJvd10gSWYgcHJvdmlkZWQsIHdlJ3JlIGdvaW5nIHRvIHRyeSB0byBmaW5kIGFcbiAgICAgKiAgICAgcG9zaXRpb24gZm9yIHRoZSBuZXcgaXRlbSBvbiBpdC4gSWYgZG9lc24ndCBmaXQgdGhlcmUsIHdlJ3JlIGdvaW5nXG4gICAgICogICAgIHRvIHB1dCBpdCBvbiB0aGUgZmlyc3Qgcm93LlxuICAgICAqXG4gICAgICogQHJldHVybnMgQXJyYXkgeCBhbmQgeS5cbiAgICAgKi9cbiAgICBmaW5kUG9zaXRpb25Gb3JJdGVtKFxuICAgICAgICBpdGVtOiBHcmlkTGlzdEl0ZW0sXG4gICAgICAgIHN0YXJ0OiB7IHg6IG51bWJlcjsgeTogbnVtYmVyIH0sXG4gICAgICAgIGZpeGVkUm93PzogbnVtYmVyXG4gICAgKTogW251bWJlciwgbnVtYmVyXSB7XG4gICAgICAgIGxldCB4LCB5LCBwb3NpdGlvbjtcblxuICAgICAgICAvLyBTdGFydCBzZWFyY2hpbmcgZm9yIGEgcG9zaXRpb24gZnJvbSB0aGUgaG9yaXpvbnRhbCBwb3NpdGlvbiBvZiB0aGVcbiAgICAgICAgLy8gcmlnaHRtb3N0IGl0ZW0gZnJvbSB0aGUgZ3JpZFxuICAgICAgICBmb3IgKHggPSBzdGFydC54OyB4IDwgdGhpcy5ncmlkLmxlbmd0aDsgeCsrKSB7XG4gICAgICAgICAgICBpZiAoZml4ZWRSb3cgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gW3gsIGZpeGVkUm93XTtcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLml0ZW1GaXRzQXRQb3NpdGlvbihpdGVtLCBwb3NpdGlvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBvc2l0aW9uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9yICh5ID0gc3RhcnQueTsgeSA8IHRoaXMub3B0aW9ucy5sYW5lczsgeSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gW3gsIHldO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLml0ZW1GaXRzQXRQb3NpdGlvbihpdGVtLCBwb3NpdGlvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwb3NpdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHdlJ3ZlIHJlYWNoZWQgdGhpcyBwb2ludCwgd2UgbmVlZCB0byBzdGFydCBhIG5ldyBjb2x1bW5cbiAgICAgICAgY29uc3QgbmV3Q29sID0gdGhpcy5ncmlkLmxlbmd0aDtcbiAgICAgICAgbGV0IG5ld1JvdyA9IDA7XG5cbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgZml4ZWRSb3cgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgdGhpcy5pdGVtRml0c0F0UG9zaXRpb24oaXRlbSwgW25ld0NvbCwgZml4ZWRSb3ddKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIG5ld1JvdyA9IGZpeGVkUm93O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFtuZXdDb2wsIG5ld1Jvd107XG4gICAgfVxuXG4gICAgbW92ZUFuZFJlc2l6ZShcbiAgICAgICAgaXRlbTogR3JpZExpc3RJdGVtLFxuICAgICAgICBuZXdQb3NpdGlvbjogQXJyYXk8bnVtYmVyPixcbiAgICAgICAgc2l6ZTogeyB3OiBudW1iZXI7IGg6IG51bWJlciB9XG4gICAgKSB7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5nZXRJdGVtUG9zaXRpb24oe1xuICAgICAgICAgICAgeDogbmV3UG9zaXRpb25bMF0sXG4gICAgICAgICAgICB5OiBuZXdQb3NpdGlvblsxXSxcbiAgICAgICAgICAgIHc6IGl0ZW0udyxcbiAgICAgICAgICAgIGg6IGl0ZW0uaFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3Qgd2lkdGggPSBzaXplLncgfHwgaXRlbS53LFxuICAgICAgICAgICAgaGVpZ2h0ID0gc2l6ZS5oIHx8IGl0ZW0uaDtcblxuICAgICAgICB0aGlzLnVwZGF0ZUl0ZW1Qb3NpdGlvbihpdGVtLCBbcG9zaXRpb24ueCwgcG9zaXRpb24ueV0pO1xuICAgICAgICB0aGlzLnVwZGF0ZUl0ZW1TaXplKGl0ZW0sIHdpZHRoLCBoZWlnaHQpO1xuXG4gICAgICAgIHRoaXMucmVzb2x2ZUNvbGxpc2lvbnMoaXRlbSk7XG4gICAgfVxuXG4gICAgbW92ZUl0ZW1Ub1Bvc2l0aW9uKGl0ZW06IEdyaWRMaXN0SXRlbSwgbmV3UG9zaXRpb246IEFycmF5PG51bWJlcj4pIHtcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLmdldEl0ZW1Qb3NpdGlvbih7XG4gICAgICAgICAgICB4OiBuZXdQb3NpdGlvblswXSxcbiAgICAgICAgICAgIHk6IG5ld1Bvc2l0aW9uWzFdLFxuICAgICAgICAgICAgdzogaXRlbS53LFxuICAgICAgICAgICAgaDogaXRlbS5oXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMudXBkYXRlSXRlbVBvc2l0aW9uKGl0ZW0sIFtwb3NpdGlvbi54LCBwb3NpdGlvbi55XSk7XG4gICAgICAgIHRoaXMucmVzb2x2ZUNvbGxpc2lvbnMoaXRlbSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVzaXplIGFuIGl0ZW0gYW5kIHJlc29sdmUgY29sbGlzaW9ucy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBPYmplY3QgaXRlbSBBIHJlZmVyZW5jZSB0byBhbiBpdGVtIHRoYXQncyBwYXJ0IG9mIHRoZSBncmlkLlxuICAgICAqIEBwYXJhbSBPYmplY3Qgc2l6ZVxuICAgICAqIEBwYXJhbSBudW1iZXIgW3NpemUudz1pdGVtLnddIFRoZSBuZXcgd2lkdGguXG4gICAgICogQHBhcmFtIG51bWJlciBbc2l6ZS5oPWl0ZW0uaF0gVGhlIG5ldyBoZWlnaHQuXG4gICAgICovXG4gICAgcmVzaXplSXRlbShpdGVtOiBHcmlkTGlzdEl0ZW0sIHNpemU6IHsgdzogbnVtYmVyOyBoOiBudW1iZXIgfSkge1xuICAgICAgICBjb25zdCB3aWR0aCA9IHNpemUudyB8fCBpdGVtLncsXG4gICAgICAgICAgICBoZWlnaHQgPSBzaXplLmggfHwgaXRlbS5oO1xuXG4gICAgICAgIHRoaXMudXBkYXRlSXRlbVNpemUoaXRlbSwgd2lkdGgsIGhlaWdodCk7XG5cbiAgICAgICAgdGhpcy5wdWxsSXRlbXNUb0xlZnQoaXRlbSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29tcGFyZSB0aGUgY3VycmVudCBpdGVtcyBhZ2FpbnN0IGEgcHJldmlvdXMgc25hcHNob3QgYW5kIHJldHVybiBvbmx5XG4gICAgICogdGhlIG9uZXMgdGhhdCBjaGFuZ2VkIHRoZWlyIGF0dHJpYnV0ZXMgaW4gdGhlIG1lYW50aW1lLiBUaGlzIGluY2x1ZGVzIGJvdGhcbiAgICAgKiBwb3NpdGlvbiAoeCwgeSkgYW5kIHNpemUgKHcsIGgpXG4gICAgICpcbiAgICAgKiBFYWNoIGl0ZW0gdGhhdCBpcyByZXR1cm5lZCBpcyBub3QgdGhlIEdyaWRMaXN0SXRlbSBidXQgdGhlIGhlbHBlciB0aGF0IGhvbGRzIEdyaWRMaXN0SXRlbVxuICAgICAqIGFuZCBsaXN0IG9mIGNoYW5nZWQgcHJvcGVydGllcy5cbiAgICAgKi9cbiAgICBnZXRDaGFuZ2VkSXRlbXMoXG4gICAgICAgIGluaXRpYWxJdGVtczogQXJyYXk8R3JpZExpc3RJdGVtPixcbiAgICAgICAgYnJlYWtwb2ludD86IHN0cmluZ1xuICAgICk6IEFycmF5PHtcbiAgICAgICAgaXRlbTogR3JpZExpc3RJdGVtO1xuICAgICAgICBjaGFuZ2VzOiBBcnJheTxzdHJpbmc+O1xuICAgICAgICBpc05ldzogYm9vbGVhbjtcbiAgICB9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLml0ZW1zXG4gICAgICAgICAgICAubWFwKChpdGVtOiBHcmlkTGlzdEl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaGFuZ2VzID0gW107XG4gICAgICAgICAgICAgICAgY29uc3Qgb2xkVmFsdWVzOiB7XG4gICAgICAgICAgICAgICAgICAgIHg/OiBudW1iZXI7XG4gICAgICAgICAgICAgICAgICAgIHk/OiBudW1iZXI7XG4gICAgICAgICAgICAgICAgICAgIHc/OiBudW1iZXI7XG4gICAgICAgICAgICAgICAgICAgIGg/OiBudW1iZXI7XG4gICAgICAgICAgICAgICAgfSA9IHt9O1xuICAgICAgICAgICAgICAgIGNvbnN0IGluaXRJdGVtID0gaW5pdGlhbEl0ZW1zLmZpbmQoXG4gICAgICAgICAgICAgICAgICAgIGluaXRJdG0gPT4gaW5pdEl0bS4kZWxlbWVudCA9PT0gaXRlbS4kZWxlbWVudFxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIWluaXRJdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IGl0ZW0sIGNoYW5nZXM6IFsneCcsICd5JywgJ3cnLCAnaCddLCBpc05ldzogdHJ1ZSB9O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IG9sZFggPSBpbml0SXRlbS5nZXRWYWx1ZVgoYnJlYWtwb2ludCk7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0uZ2V0VmFsdWVYKGJyZWFrcG9pbnQpICE9PSBvbGRYKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZXMucHVzaCgneCcpO1xuICAgICAgICAgICAgICAgICAgICBpZiAob2xkWCB8fCBvbGRYID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbGRWYWx1ZXMueCA9IG9sZFg7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBvbGRZID0gaW5pdEl0ZW0uZ2V0VmFsdWVZKGJyZWFrcG9pbnQpO1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLmdldFZhbHVlWShicmVha3BvaW50KSAhPT0gb2xkWSkge1xuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VzLnB1c2goJ3knKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9sZFkgfHwgb2xkWSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2xkVmFsdWVzLnkgPSBvbGRZO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5nZXRWYWx1ZVcoYnJlYWtwb2ludCkgIT09XG4gICAgICAgICAgICAgICAgICAgIGluaXRJdGVtLmdldFZhbHVlVyhicmVha3BvaW50KVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VzLnB1c2goJ3cnKTtcbiAgICAgICAgICAgICAgICAgICAgb2xkVmFsdWVzLncgPSBpbml0SXRlbS53O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZ2V0VmFsdWVIKGJyZWFrcG9pbnQpICE9PVxuICAgICAgICAgICAgICAgICAgICBpbml0SXRlbS5nZXRWYWx1ZUgoYnJlYWtwb2ludClcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlcy5wdXNoKCdoJyk7XG4gICAgICAgICAgICAgICAgICAgIG9sZFZhbHVlcy5oID0gaW5pdEl0ZW0uaDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4geyBpdGVtLCBvbGRWYWx1ZXMsIGNoYW5nZXMsIGlzTmV3OiBmYWxzZSB9O1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5maWx0ZXIoXG4gICAgICAgICAgICAgICAgKGl0ZW1DaGFuZ2U6IHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbTogR3JpZExpc3RJdGVtO1xuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VzOiBBcnJheTxzdHJpbmc+O1xuICAgICAgICAgICAgICAgIH0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW1DaGFuZ2UuY2hhbmdlcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICB9XG5cbiAgICByZXNvbHZlQ29sbGlzaW9ucyhpdGVtOiBHcmlkTGlzdEl0ZW0pIHtcbiAgICAgICAgaWYgKCF0aGlzLnRyeVRvUmVzb2x2ZUNvbGxpc2lvbnNMb2NhbGx5KGl0ZW0pKSB7XG4gICAgICAgICAgICB0aGlzLnB1bGxJdGVtc1RvTGVmdChpdGVtKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmZsb2F0aW5nKSB7XG4gICAgICAgICAgICB0aGlzLnB1bGxJdGVtc1RvTGVmdCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZ2V0SXRlbXNDb2xsaWRpbmdXaXRoSXRlbShpdGVtKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMucHVsbEl0ZW1zVG9MZWZ0KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdXNoQ29sbGlkaW5nSXRlbXMoZml4ZWRJdGVtPzogR3JpZExpc3RJdGVtKSB7XG4gICAgICAgIC8vIFN0YXJ0IGEgZnJlc2ggZ3JpZCB3aXRoIHRoZSBmaXhlZCBpdGVtIGFscmVhZHkgcGxhY2VkIGluc2lkZVxuICAgICAgICB0aGlzLnNvcnRJdGVtc0J5UG9zaXRpb24oKTtcbiAgICAgICAgdGhpcy5yZXNldEdyaWQoKTtcbiAgICAgICAgdGhpcy5nZW5lcmF0ZUdyaWQoKTtcblxuICAgICAgICB0aGlzLml0ZW1zXG4gICAgICAgICAgICAuZmlsdGVyKGl0ZW0gPT4gIXRoaXMuaXNJdGVtRmxvYXRpbmcoaXRlbSkgJiYgaXRlbSAhPT0gZml4ZWRJdGVtKVxuICAgICAgICAgICAgLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLnRyeVRvUmVzb2x2ZUNvbGxpc2lvbnNMb2NhbGx5KGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHVsbEl0ZW1zVG9MZWZ0KGl0ZW0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJ1aWxkIHRoZSBncmlkIGZyb20gc2NyYXRjaCwgYnkgdXNpbmcgdGhlIGN1cnJlbnQgaXRlbSBwb3NpdGlvbnMgYW5kXG4gICAgICogcHVsbGluZyB0aGVtIGFzIG11Y2ggdG8gdGhlIGxlZnQgYXMgcG9zc2libGUsIHJlbW92aW5nIGFzIHNwYWNlIGJldHdlZW5cbiAgICAgKiB0aGVtIGFzIHBvc3NpYmxlLlxuICAgICAqXG4gICAgICogSWYgYSBcImZpeGVkIGl0ZW1cIiBpcyBwcm92aWRlZCwgaXRzIHBvc2l0aW9uIHdpbGwgYmUga2VwdCBpbnRhY3QgYW5kIHRoZVxuICAgICAqIHJlc3Qgb2YgdGhlIGl0ZW1zIHdpbGwgYmUgbGF5ZWQgYXJvdW5kIGl0LlxuICAgICAqL1xuICAgIHB1bGxJdGVtc1RvTGVmdChmaXhlZEl0ZW0/OiBhbnkpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kaXJlY3Rpb24gPT09ICdub25lJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3RhcnQgYSBmcmVzaCBncmlkIHdpdGggdGhlIGZpeGVkIGl0ZW0gYWxyZWFkeSBwbGFjZWQgaW5zaWRlXG4gICAgICAgIHRoaXMuc29ydEl0ZW1zQnlQb3NpdGlvbigpO1xuICAgICAgICB0aGlzLnJlc2V0R3JpZCgpO1xuXG4gICAgICAgIC8vIFN0YXJ0IHRoZSBncmlkIHdpdGggdGhlIGZpeGVkIGl0ZW0gYXMgdGhlIGZpcnN0IHBvc2l0aW9uZWQgaXRlbVxuICAgICAgICBpZiAoZml4ZWRJdGVtKSB7XG4gICAgICAgICAgICBjb25zdCBmaXhlZFBvc2l0aW9uID0gdGhpcy5nZXRJdGVtUG9zaXRpb24oZml4ZWRJdGVtKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlSXRlbVBvc2l0aW9uKGZpeGVkSXRlbSwgW1xuICAgICAgICAgICAgICAgIGZpeGVkUG9zaXRpb24ueCxcbiAgICAgICAgICAgICAgICBmaXhlZFBvc2l0aW9uLnlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pdGVtc1xuICAgICAgICAgICAgLmZpbHRlcigoaXRlbTogR3JpZExpc3RJdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICFpdGVtLmRyYWdBbmREcm9wICYmIGl0ZW0gIT09IGZpeGVkSXRlbTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuZm9yRWFjaCgoaXRlbTogR3JpZExpc3RJdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZml4ZWRQb3NpdGlvbiA9IHRoaXMuZ2V0SXRlbVBvc2l0aW9uKGl0ZW0pO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlSXRlbVBvc2l0aW9uKGl0ZW0sIFtcbiAgICAgICAgICAgICAgICAgICAgZml4ZWRQb3NpdGlvbi54LFxuICAgICAgICAgICAgICAgICAgICBmaXhlZFBvc2l0aW9uLnlcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5pdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgaXRlbSA9IHRoaXMuaXRlbXNbaV0sXG4gICAgICAgICAgICAgICAgcG9zaXRpb24gPSB0aGlzLmdldEl0ZW1Qb3NpdGlvbihpdGVtKTtcblxuICAgICAgICAgICAgLy8gVGhlIGZpeGVkIGl0ZW0ga2VlcHMgaXRzIGV4YWN0IHBvc2l0aW9uXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgKGZpeGVkSXRlbSAmJiBpdGVtID09PSBmaXhlZEl0ZW0pIHx8XG4gICAgICAgICAgICAgICAgIWl0ZW0uZHJhZ0FuZERyb3AgfHxcbiAgICAgICAgICAgICAgICAoIXRoaXMub3B0aW9ucy5mbG9hdGluZyAmJlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzSXRlbUZsb2F0aW5nKGl0ZW0pICYmXG4gICAgICAgICAgICAgICAgICAgICF0aGlzLmdldEl0ZW1zQ29sbGlkaW5nV2l0aEl0ZW0oaXRlbSkubGVuZ3RoKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHggPSB0aGlzLmZpbmRMZWZ0TW9zdFBvc2l0aW9uRm9ySXRlbShpdGVtKSxcbiAgICAgICAgICAgICAgICBuZXdQb3NpdGlvbiA9IHRoaXMuZmluZFBvc2l0aW9uRm9ySXRlbShcbiAgICAgICAgICAgICAgICAgICAgaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgeyB4OiB4LCB5OiAwIH0sXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uLnlcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUl0ZW1Qb3NpdGlvbihpdGVtLCBuZXdQb3NpdGlvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpc092ZXJGaXhlZEFyZWEoXG4gICAgICAgIHg6IG51bWJlcixcbiAgICAgICAgeTogbnVtYmVyLFxuICAgICAgICB3OiBudW1iZXIsXG4gICAgICAgIGg6IG51bWJlcixcbiAgICAgICAgaXRlbTogR3JpZExpc3RJdGVtID0gbnVsbFxuICAgICk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgaXRlbURhdGEgPSB7IHgsIHksIHcsIGggfTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRpcmVjdGlvbiAhPT0gJ2hvcml6b250YWwnKSB7XG4gICAgICAgICAgICBpdGVtRGF0YSA9IHsgeDogeSwgeTogeCwgdzogaCwgaDogdyB9O1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IGl0ZW1EYXRhLng7IGkgPCBpdGVtRGF0YS54ICsgaXRlbURhdGEudzsgaSsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gaXRlbURhdGEueTsgaiA8IGl0ZW1EYXRhLnkgKyBpdGVtRGF0YS5oOyBqKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JpZFtpXSAmJlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdyaWRbaV1bal0gJiZcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ncmlkW2ldW2pdICE9PSBpdGVtICYmXG4gICAgICAgICAgICAgICAgICAgICF0aGlzLmdyaWRbaV1bal0uZHJhZ0FuZERyb3BcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjaGVja0l0ZW1BYm92ZUVtcHR5QXJlYShcbiAgICAgICAgaXRlbTogR3JpZExpc3RJdGVtLFxuICAgICAgICBuZXdQb3NpdGlvbjogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9XG4gICAgKSB7XG4gICAgICAgIGxldCBpdGVtRGF0YSA9IHtcbiAgICAgICAgICAgIHg6IG5ld1Bvc2l0aW9uLngsXG4gICAgICAgICAgICB5OiBuZXdQb3NpdGlvbi55LFxuICAgICAgICAgICAgdzogaXRlbS53LFxuICAgICAgICAgICAgaDogaXRlbS5oXG4gICAgICAgIH07XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgICFpdGVtLml0ZW1Qcm90b3R5cGUgJiZcbiAgICAgICAgICAgIGl0ZW0ueCA9PT0gbmV3UG9zaXRpb24ueCAmJlxuICAgICAgICAgICAgaXRlbS55ID09PSBuZXdQb3NpdGlvbi55XG4gICAgICAgICkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRpcmVjdGlvbiA9PT0gJ2hvcml6b250YWwnKSB7XG4gICAgICAgICAgICBpdGVtRGF0YSA9IHtcbiAgICAgICAgICAgICAgICB4OiBuZXdQb3NpdGlvbi55LFxuICAgICAgICAgICAgICAgIHk6IG5ld1Bvc2l0aW9uLngsXG4gICAgICAgICAgICAgICAgdzogaXRlbURhdGEuaCxcbiAgICAgICAgICAgICAgICBoOiBpdGVtRGF0YS53XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAhdGhpcy5jaGVja0l0ZW1zSW5BcmVhKFxuICAgICAgICAgICAgaXRlbURhdGEueSxcbiAgICAgICAgICAgIGl0ZW1EYXRhLnkgKyBpdGVtRGF0YS5oIC0gMSxcbiAgICAgICAgICAgIGl0ZW1EYXRhLngsXG4gICAgICAgICAgICBpdGVtRGF0YS54ICsgaXRlbURhdGEudyAtIDEsXG4gICAgICAgICAgICBpdGVtXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgZml4SXRlbXNQb3NpdGlvbnMob3B0aW9uczogSUdyaWRzdGVyT3B0aW9ucykge1xuICAgICAgICAvLyBpdGVtcyB3aXRoIHgsIHkgdGhhdCBmaXRzIGdpcmQgd2l0aCBzaXplIG9mIG9wdGlvbnMubGFuZXNcbiAgICAgICAgY29uc3QgdmFsaWRJdGVtcyA9IHRoaXMuaXRlbXNcbiAgICAgICAgICAgIC5maWx0ZXIoKGl0ZW06IEdyaWRMaXN0SXRlbSkgPT4gaXRlbS5pdGVtQ29tcG9uZW50KVxuICAgICAgICAgICAgLmZpbHRlcigoaXRlbTogR3JpZExpc3RJdGVtKSA9PlxuICAgICAgICAgICAgICAgIHRoaXMuaXNJdGVtVmFsaWRGb3JHcmlkKGl0ZW0sIG9wdGlvbnMpXG4gICAgICAgICAgICApO1xuICAgICAgICAvLyBpdGVtcyB0aGF0IHgsIHkgbXVzdCBiZSBnZW5lcmF0ZWRcbiAgICAgICAgY29uc3QgaW52YWxpZEl0ZW1zID0gdGhpcy5pdGVtc1xuICAgICAgICAgICAgLmZpbHRlcigoaXRlbTogR3JpZExpc3RJdGVtKSA9PiBpdGVtLml0ZW1Db21wb25lbnQpXG4gICAgICAgICAgICAuZmlsdGVyKFxuICAgICAgICAgICAgICAgIChpdGVtOiBHcmlkTGlzdEl0ZW0pID0+ICF0aGlzLmlzSXRlbVZhbGlkRm9yR3JpZChpdGVtLCBvcHRpb25zKVxuICAgICAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBncmlkTGlzdCA9IG5ldyBHcmlkTGlzdChbXSwgb3B0aW9ucyk7XG5cbiAgICAgICAgLy8gcHV0IGl0ZW1zIHdpdGggZGVmaW5lZCBwb3NpdGlvbnMgdG8gdGhlIGdyaWRcbiAgICAgICAgZ3JpZExpc3QuaXRlbXMgPSB2YWxpZEl0ZW1zLm1hcCgoaXRlbTogR3JpZExpc3RJdGVtKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbS5jb3B5Rm9yQnJlYWtwb2ludChvcHRpb25zLmJyZWFrcG9pbnQpO1xuICAgICAgICB9KTtcblxuICAgICAgICBncmlkTGlzdC5nZW5lcmF0ZUdyaWQoKTtcblxuICAgICAgICBpbnZhbGlkSXRlbXMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICAgIC8vIFRPRE86IGNoZWNrIGlmIHRoaXMgY2hhbmdlIGRvZXMgbm90IGJyb2tlIGFueXRoaW5nXG4gICAgICAgICAgICAvLyBjb25zdCBpdGVtQ29weSA9IGl0ZW0uY29weSgpO1xuICAgICAgICAgICAgY29uc3QgaXRlbUNvcHkgPSBpdGVtLmNvcHlGb3JCcmVha3BvaW50KG9wdGlvbnMuYnJlYWtwb2ludCk7XG4gICAgICAgICAgICBjb25zdCBwb3NpdGlvbiA9IGdyaWRMaXN0LmZpbmRQb3NpdGlvbkZvckl0ZW0oaXRlbUNvcHksIHtcbiAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgIHk6IDBcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBncmlkTGlzdC5pdGVtcy5wdXNoKGl0ZW1Db3B5KTtcbiAgICAgICAgICAgIGdyaWRMaXN0LnNldEl0ZW1Qb3NpdGlvbihpdGVtQ29weSwgcG9zaXRpb24pO1xuICAgICAgICAgICAgZ3JpZExpc3QubWFya0l0ZW1Qb3NpdGlvblRvR3JpZChpdGVtQ29weSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGdyaWRMaXN0LnB1bGxJdGVtc1RvTGVmdCgpO1xuICAgICAgICBncmlkTGlzdC5wdXNoQ29sbGlkaW5nSXRlbXMoKTtcblxuICAgICAgICB0aGlzLml0ZW1zLmZvckVhY2goKGl0bTogR3JpZExpc3RJdGVtKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjYWNoZWRJdGVtID0gZ3JpZExpc3QuaXRlbXMuZmlsdGVyKGNhY2hlZEl0bSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhY2hlZEl0bS4kZWxlbWVudCA9PT0gaXRtLiRlbGVtZW50O1xuICAgICAgICAgICAgfSlbMF07XG5cbiAgICAgICAgICAgIGl0bS5zZXRWYWx1ZVgoY2FjaGVkSXRlbS54LCBvcHRpb25zLmJyZWFrcG9pbnQpO1xuICAgICAgICAgICAgaXRtLnNldFZhbHVlWShjYWNoZWRJdGVtLnksIG9wdGlvbnMuYnJlYWtwb2ludCk7XG4gICAgICAgICAgICBpdG0uc2V0VmFsdWVXKGNhY2hlZEl0ZW0udywgb3B0aW9ucy5icmVha3BvaW50KTtcbiAgICAgICAgICAgIGl0bS5zZXRWYWx1ZUgoY2FjaGVkSXRlbS5oLCBvcHRpb25zLmJyZWFrcG9pbnQpO1xuICAgICAgICAgICAgaXRtLmF1dG9TaXplID0gY2FjaGVkSXRlbS5hdXRvU2l6ZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZGVsZXRlSXRlbVBvc2l0aW9uRnJvbUdyaWQoaXRlbTogR3JpZExpc3RJdGVtKSB7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5nZXRJdGVtUG9zaXRpb24oaXRlbSk7XG4gICAgICAgIGxldCB4LCB5O1xuXG4gICAgICAgIGZvciAoeCA9IHBvc2l0aW9uLng7IHggPCBwb3NpdGlvbi54ICsgcG9zaXRpb24udzsgeCsrKSB7XG4gICAgICAgICAgICAvLyBJdCBjYW4gaGFwcGVuIHRvIHRyeSB0byByZW1vdmUgYW4gaXRlbSBmcm9tIGEgcG9zaXRpb24gbm90IGdlbmVyYXRlZFxuICAgICAgICAgICAgLy8gaW4gdGhlIGdyaWQsIHByb2JhYmx5IHdoZW4gbG9hZGluZyBhIHBlcnNpc3RlZCBncmlkIG9mIGl0ZW1zLiBObyBuZWVkXG4gICAgICAgICAgICAvLyB0byBjcmVhdGUgYSBjb2x1bW4gdG8gYmUgYWJsZSB0byByZW1vdmUgc29tZXRoaW5nIGZyb20gaXQsIHRob3VnaFxuICAgICAgICAgICAgaWYgKCF0aGlzLmdyaWRbeF0pIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh5ID0gcG9zaXRpb24ueTsgeSA8IHBvc2l0aW9uLnkgKyBwb3NpdGlvbi5oOyB5KyspIHtcbiAgICAgICAgICAgICAgICAvLyBEb24ndCBjbGVhciB0aGUgY2VsbCBpZiBpdCdzIGJlZW4gb2NjdXBpZWQgYnkgYSBkaWZmZXJlbnQgd2lkZ2V0IGluXG4gICAgICAgICAgICAgICAgLy8gdGhlIG1lYW50aW1lIChlLmcuIHdoZW4gYW4gaXRlbSBoYXMgYmVlbiBtb3ZlZCBvdmVyIHRoaXMgb25lLCBhbmRcbiAgICAgICAgICAgICAgICAvLyB0aHVzIGJ5IGNvbnRpbnVpbmcgdG8gY2xlYXIgdGhpcyBpdGVtJ3MgcHJldmlvdXMgcG9zaXRpb24geW91IHdvdWxkXG4gICAgICAgICAgICAgICAgLy8gY2FuY2VsIHRoZSBmaXJzdCBpdGVtJ3MgbW92ZSwgbGVhdmluZyBpdCB3aXRob3V0IGFueSBwb3NpdGlvbiBldmVuKVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmdyaWRbeF1beV0gPT09IGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ncmlkW3hdW3ldID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGlzSXRlbUZsb2F0aW5nKGl0ZW06IGFueSkge1xuICAgICAgICBpZiAoaXRlbS5pdGVtQ29tcG9uZW50ICYmIGl0ZW0uaXRlbUNvbXBvbmVudC5pc0RyYWdnaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLmdldEl0ZW1Qb3NpdGlvbihpdGVtKTtcblxuICAgICAgICBpZiAocG9zaXRpb24ueCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJvd0JlbG93SXRlbSA9IHRoaXMuZ3JpZFtwb3NpdGlvbi54IC0gMV07XG5cbiAgICAgICAgcmV0dXJuIChyb3dCZWxvd0l0ZW0gfHwgW10pXG4gICAgICAgICAgICAuc2xpY2UocG9zaXRpb24ueSwgcG9zaXRpb24ueSArIHBvc2l0aW9uLmgpXG4gICAgICAgICAgICAucmVkdWNlKChpc0Zsb2F0aW5nLCBjZWxsSXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBpc0Zsb2F0aW5nICYmICFjZWxsSXRlbTtcbiAgICAgICAgICAgIH0sIHRydWUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNJdGVtVmFsaWRGb3JHcmlkKGl0ZW06IEdyaWRMaXN0SXRlbSwgb3B0aW9uczogSUdyaWRzdGVyT3B0aW9ucykge1xuICAgICAgICBjb25zdCBpdGVtRGF0YSA9XG4gICAgICAgICAgICBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ2hvcml6b250YWwnXG4gICAgICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgICAgICAgeDogaXRlbS5nZXRWYWx1ZVkob3B0aW9ucy5icmVha3BvaW50KSxcbiAgICAgICAgICAgICAgICAgICAgICB5OiBpdGVtLmdldFZhbHVlWChvcHRpb25zLmJyZWFrcG9pbnQpLFxuICAgICAgICAgICAgICAgICAgICAgIHc6IGl0ZW0uZ2V0VmFsdWVIKG9wdGlvbnMuYnJlYWtwb2ludCksXG4gICAgICAgICAgICAgICAgICAgICAgaDogTWF0aC5taW4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uZ2V0VmFsdWVXKHRoaXMub3B0aW9ucy5icmVha3BvaW50KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5sYW5lc1xuICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICA6IHtcbiAgICAgICAgICAgICAgICAgICAgICB4OiBpdGVtLmdldFZhbHVlWChvcHRpb25zLmJyZWFrcG9pbnQpLFxuICAgICAgICAgICAgICAgICAgICAgIHk6IGl0ZW0uZ2V0VmFsdWVZKG9wdGlvbnMuYnJlYWtwb2ludCksXG4gICAgICAgICAgICAgICAgICAgICAgdzogTWF0aC5taW4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uZ2V0VmFsdWVXKHRoaXMub3B0aW9ucy5icmVha3BvaW50KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5sYW5lc1xuICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgaDogaXRlbS5nZXRWYWx1ZUgob3B0aW9ucy5icmVha3BvaW50KVxuICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgdHlwZW9mIGl0ZW1EYXRhLnggPT09ICdudW1iZXInICYmXG4gICAgICAgICAgICB0eXBlb2YgaXRlbURhdGEueSA9PT0gJ251bWJlcicgJiZcbiAgICAgICAgICAgIGl0ZW1EYXRhLnggKyBpdGVtRGF0YS53IDw9IG9wdGlvbnMubGFuZXNcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZmluZERlZmF1bHRQb3NpdGlvbkhvcml6b250YWwod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICAgICAgZm9yIChjb25zdCBjb2wgb2YgdGhpcy5ncmlkKSB7XG4gICAgICAgICAgICBjb25zdCBjb2xJZHggPSB0aGlzLmdyaWQuaW5kZXhPZihjb2wpO1xuICAgICAgICAgICAgbGV0IHJvd0lkeCA9IDA7XG4gICAgICAgICAgICB3aGlsZSAocm93SWR4IDwgY29sLmxlbmd0aCAtIGhlaWdodCArIDEpIHtcbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICF0aGlzLmNoZWNrSXRlbXNJbkFyZWEoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xJZHgsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xJZHggKyB3aWR0aCAtIDEsXG4gICAgICAgICAgICAgICAgICAgICAgICByb3dJZHgsXG4gICAgICAgICAgICAgICAgICAgICAgICByb3dJZHggKyBoZWlnaHQgLSAxXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtjb2xJZHgsIHJvd0lkeF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJvd0lkeCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbdGhpcy5ncmlkLmxlbmd0aCwgMF07XG4gICAgfVxuXG4gICAgcHVibGljIGZpbmREZWZhdWx0UG9zaXRpb25WZXJ0aWNhbCh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xuICAgICAgICBmb3IgKGNvbnN0IHJvdyBvZiB0aGlzLmdyaWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHJvd0lkeCA9IHRoaXMuZ3JpZC5pbmRleE9mKHJvdyk7XG4gICAgICAgICAgICBsZXQgY29sSWR4ID0gMDtcbiAgICAgICAgICAgIHdoaWxlIChjb2xJZHggPCByb3cubGVuZ3RoIC0gd2lkdGggKyAxKSB7XG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAhdGhpcy5jaGVja0l0ZW1zSW5BcmVhKFxuICAgICAgICAgICAgICAgICAgICAgICAgcm93SWR4LFxuICAgICAgICAgICAgICAgICAgICAgICAgcm93SWR4ICsgaGVpZ2h0IC0gMSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbElkeCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbElkeCArIHdpZHRoIC0gMVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbY29sSWR4LCByb3dJZHhdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb2xJZHgrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gWzAsIHRoaXMuZ3JpZC5sZW5ndGhdO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2hlY2tJdGVtc0luQXJlYShcbiAgICAgICAgcm93U3RhcnQ6IG51bWJlcixcbiAgICAgICAgcm93RW5kOiBudW1iZXIsXG4gICAgICAgIGNvbFN0YXJ0OiBudW1iZXIsXG4gICAgICAgIGNvbEVuZDogbnVtYmVyLFxuICAgICAgICBpdGVtPzogR3JpZExpc3RJdGVtXG4gICAgKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSByb3dTdGFydDsgaSA8PSByb3dFbmQ7IGkrKykge1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IGNvbFN0YXJ0OyBqIDw9IGNvbEVuZDsgaisrKSB7XG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdyaWRbaV0gJiZcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ncmlkW2ldW2pdICYmXG4gICAgICAgICAgICAgICAgICAgIChpdGVtID8gdGhpcy5ncmlkW2ldW2pdICE9PSBpdGVtIDogdHJ1ZSlcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNvcnRJdGVtc0J5UG9zaXRpb24oKSB7XG4gICAgICAgIHRoaXMuaXRlbXMuc29ydCgoaXRlbTEsIGl0ZW0yKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3NpdGlvbjEgPSB0aGlzLmdldEl0ZW1Qb3NpdGlvbihpdGVtMSksXG4gICAgICAgICAgICAgICAgcG9zaXRpb24yID0gdGhpcy5nZXRJdGVtUG9zaXRpb24oaXRlbTIpO1xuXG4gICAgICAgICAgICAvLyBUcnkgdG8gcHJlc2VydmUgY29sdW1ucy5cbiAgICAgICAgICAgIGlmIChwb3NpdGlvbjEueCAhPT0gcG9zaXRpb24yLngpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcG9zaXRpb24xLnggLSBwb3NpdGlvbjIueDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHBvc2l0aW9uMS55ICE9PSBwb3NpdGlvbjIueSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwb3NpdGlvbjEueSAtIHBvc2l0aW9uMi55O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBUaGUgaXRlbXMgYXJlIHBsYWNlZCBvbiB0aGUgc2FtZSBwb3NpdGlvbi5cbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTb21lIGl0ZW1zIGNhbiBoYXZlIDEwMCUgaGVpZ2h0IG9yIDEwMCUgd2lkdGguIFRob3NlIGRpbW1lbnNpb25zIGFyZVxuICAgICAqIGV4cHJlc3NlZCBhcyAwLiBXZSBuZWVkIHRvIGVuc3VyZSBhIHZhbGlkIHdpZHRoIGFuZCBoZWlnaHQgZm9yIGVhY2ggb2ZcbiAgICAgKiB0aG9zZSBpdGVtcyBhcyB0aGUgbnVtYmVyIG9mIGl0ZW1zIHBlciBsYW5lLlxuICAgICAqL1xuICAgIHByaXZhdGUgYWRqdXN0U2l6ZU9mSXRlbXMoKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5pdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgaXRlbSA9IHRoaXMuaXRlbXNbaV07XG5cbiAgICAgICAgICAgIC8vIFRoaXMgY2FuIGhhcHBlbiBvbmx5IHRoZSBmaXJzdCB0aW1lIGl0ZW1zIGFyZSBjaGVja2VkLlxuICAgICAgICAgICAgLy8gV2UgbmVlZCB0aGUgcHJvcGVydHkgdG8gaGF2ZSBhIHZhbHVlIGZvciBhbGwgdGhlIGl0ZW1zIHNvIHRoYXQgdGhlXG4gICAgICAgICAgICAvLyBgY2xvbmVJdGVtc2AgbWV0aG9kIHdpbGwgbWVyZ2UgdGhlIHByb3BlcnRpZXMgcHJvcGVybHkuIElmIHdlIG9ubHkgc2V0XG4gICAgICAgICAgICAvLyBpdCB0byB0aGUgaXRlbXMgdGhhdCBuZWVkIGl0IHRoZW4gdGhlIGZvbGxvd2luZyBjYW4gaGFwcGVuOlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIGNsb25lSXRlbXMoW3tpZDogMSwgYXV0b1NpemU6IHRydWV9LCB7aWQ6IDJ9XSxcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgW3tpZDogMn0sIHtpZDogMSwgYXV0b1NpemU6IHRydWV9XSk7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gd2lsbCByZXN1bHQgaW5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBbe2lkOiAxLCBhdXRvU2l6ZTogdHJ1ZX0sIHtpZDogMiwgYXV0b1NpemU6IHRydWV9XVxuICAgICAgICAgICAgaWYgKGl0ZW0uYXV0b1NpemUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGl0ZW0uYXV0b1NpemUgPSBpdGVtLncgPT09IDAgfHwgaXRlbS5oID09PSAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaXRlbS5hdXRvU2l6ZSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZGlyZWN0aW9uID09PSAnaG9yaXpvbnRhbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5oID0gdGhpcy5vcHRpb25zLmxhbmVzO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0udyA9IHRoaXMub3B0aW9ucy5sYW5lcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHJlc2V0R3JpZCgpIHtcbiAgICAgICAgdGhpcy5ncmlkID0gW107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgdGhhdCBhbiBpdGVtIHdvdWxkbid0IG92ZXJsYXAgd2l0aCBhbm90aGVyIG9uZSBpZiBwbGFjZWQgYXQgYVxuICAgICAqIGNlcnRhaW4gcG9zaXRpb24gd2l0aGluIHRoZSBncmlkXG4gICAgICovXG4gICAgcHJpdmF0ZSBpdGVtRml0c0F0UG9zaXRpb24oaXRlbTogR3JpZExpc3RJdGVtLCBuZXdQb3NpdGlvbjogW251bWJlciwgbnVtYmVyXSkge1xuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuZ2V0SXRlbVBvc2l0aW9uKGl0ZW0pO1xuICAgICAgICBsZXQgeCwgeTtcblxuICAgICAgICAvLyBObyBjb29yZG9uYXRlIGNhbiBiZSBuZWdhdGl2ZVxuICAgICAgICBpZiAobmV3UG9zaXRpb25bMF0gPCAwIHx8IG5ld1Bvc2l0aW9uWzFdIDwgMCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBpdGVtIGlzbid0IGxhcmdlciB0aGFuIHRoZSBlbnRpcmUgZ3JpZFxuICAgICAgICBpZiAoXG4gICAgICAgICAgICBuZXdQb3NpdGlvblsxXSArIE1hdGgubWluKHBvc2l0aW9uLmgsIHRoaXMub3B0aW9ucy5sYW5lcykgPlxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmxhbmVzXG4gICAgICAgICkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuaXNPdmVyRml4ZWRBcmVhKGl0ZW0ueCwgaXRlbS55LCBpdGVtLncsIGl0ZW0uaCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgcG9zaXRpb24gZG9lc24ndCBvdmVybGFwIHdpdGggYW4gYWxyZWFkeSBwb3NpdGlvbmVkXG4gICAgICAgIC8vIGl0ZW0uXG4gICAgICAgIGZvciAoeCA9IG5ld1Bvc2l0aW9uWzBdOyB4IDwgbmV3UG9zaXRpb25bMF0gKyBwb3NpdGlvbi53OyB4KyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbCA9IHRoaXMuZ3JpZFt4XTtcbiAgICAgICAgICAgIC8vIFN1cmVseSBhIGNvbHVtbiB0aGF0IGhhc24ndCBldmVuIGJlZW4gY3JlYXRlZCB5ZXQgaXMgYXZhaWxhYmxlXG4gICAgICAgICAgICBpZiAoIWNvbCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHkgPSBuZXdQb3NpdGlvblsxXTsgeSA8IG5ld1Bvc2l0aW9uWzFdICsgcG9zaXRpb24uaDsgeSsrKSB7XG4gICAgICAgICAgICAgICAgLy8gQW55IHNwYWNlIG9jY3VwaWVkIGJ5IGFuIGl0ZW0gY2FuIGNvbnRpbnVlIHRvIGJlIG9jY3VwaWVkIGJ5IHRoZVxuICAgICAgICAgICAgICAgIC8vIHNhbWUgaXRlbS5cbiAgICAgICAgICAgICAgICBpZiAoY29sW3ldICYmIGNvbFt5XSAhPT0gaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB1cGRhdGVJdGVtUG9zaXRpb24oaXRlbTogR3JpZExpc3RJdGVtLCBwb3NpdGlvbjogW251bWJlciwgbnVtYmVyXSkge1xuICAgICAgICBpZiAoaXRlbS54ICE9PSBudWxsICYmIGl0ZW0ueSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5kZWxldGVJdGVtUG9zaXRpb25Gcm9tR3JpZChpdGVtKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0SXRlbVBvc2l0aW9uKGl0ZW0sIHBvc2l0aW9uKTtcblxuICAgICAgICB0aGlzLm1hcmtJdGVtUG9zaXRpb25Ub0dyaWQoaXRlbSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIE9iamVjdCBpdGVtIEEgcmVmZXJlbmNlIHRvIGEgZ3JpZCBpdGVtLlxuICAgICAqIEBwYXJhbSBudW1iZXIgd2lkdGggVGhlIG5ldyB3aWR0aC5cbiAgICAgKiBAcGFyYW0gbnVtYmVyIGhlaWdodCBUaGUgbmV3IGhlaWdodC5cbiAgICAgKi9cbiAgICBwcml2YXRlIHVwZGF0ZUl0ZW1TaXplKGl0ZW06IEdyaWRMaXN0SXRlbSwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKGl0ZW0ueCAhPT0gbnVsbCAmJiBpdGVtLnkgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlSXRlbVBvc2l0aW9uRnJvbUdyaWQoaXRlbSk7XG4gICAgICAgIH1cblxuICAgICAgICBpdGVtLncgPSB3aWR0aDtcbiAgICAgICAgaXRlbS5oID0gaGVpZ2h0O1xuXG4gICAgICAgIHRoaXMubWFya0l0ZW1Qb3NpdGlvblRvR3JpZChpdGVtKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNYXJrIHRoZSBncmlkIGNlbGxzIHRoYXQgYXJlIG9jY3VwaWVkIGJ5IGFuIGl0ZW0uIFRoaXMgcHJldmVudHMgaXRlbXNcbiAgICAgKiBmcm9tIG92ZXJsYXBwaW5nIGluIHRoZSBncmlkXG4gICAgICovXG4gICAgcHJpdmF0ZSBtYXJrSXRlbVBvc2l0aW9uVG9HcmlkKGl0ZW06IEdyaWRMaXN0SXRlbSkge1xuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuZ2V0SXRlbVBvc2l0aW9uKGl0ZW0pO1xuICAgICAgICBsZXQgeCwgeTtcblxuICAgICAgICAvLyBFbnN1cmUgdGhhdCB0aGUgZ3JpZCBoYXMgZW5vdWdoIGNvbHVtbnMgdG8gYWNjb21vZGF0ZSB0aGUgY3VycmVudCBpdGVtLlxuICAgICAgICB0aGlzLmVuc3VyZUNvbHVtbnMocG9zaXRpb24ueCArIHBvc2l0aW9uLncpO1xuXG4gICAgICAgIGZvciAoeCA9IHBvc2l0aW9uLng7IHggPCBwb3NpdGlvbi54ICsgcG9zaXRpb24udzsgeCsrKSB7XG4gICAgICAgICAgICBmb3IgKHkgPSBwb3NpdGlvbi55OyB5IDwgcG9zaXRpb24ueSArIHBvc2l0aW9uLmg7IHkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JpZFt4XVt5XSA9IGl0ZW07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFbnN1cmUgdGhhdCB0aGUgZ3JpZCBoYXMgYXQgbGVhc3QgTiBjb2x1bW5zIGF2YWlsYWJsZS5cbiAgICAgKi9cbiAgICBwcml2YXRlIGVuc3VyZUNvbHVtbnMoTjogbnVtYmVyKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgTjsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZ3JpZFtpXSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JpZC5wdXNoKG1ha2VHcmlkQ29sKHRoaXMub3B0aW9ucy5sYW5lcykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRJdGVtc0NvbGxpZGluZ1dpdGhJdGVtKGl0ZW06IEdyaWRMaXN0SXRlbSk6IG51bWJlcltdIHtcbiAgICAgICAgY29uc3QgY29sbGlkaW5nSXRlbXMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLml0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgaXRlbSAhPT0gdGhpcy5pdGVtc1tpXSAmJlxuICAgICAgICAgICAgICAgIHRoaXMuaXRlbXNBcmVDb2xsaWRpbmcoaXRlbSwgdGhpcy5pdGVtc1tpXSlcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIGNvbGxpZGluZ0l0ZW1zLnB1c2goaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbGxpZGluZ0l0ZW1zO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXRlbXNBcmVDb2xsaWRpbmcoaXRlbTE6IEdyaWRMaXN0SXRlbSwgaXRlbTI6IEdyaWRMaXN0SXRlbSkge1xuICAgICAgICBjb25zdCBwb3NpdGlvbjEgPSB0aGlzLmdldEl0ZW1Qb3NpdGlvbihpdGVtMSksXG4gICAgICAgICAgICBwb3NpdGlvbjIgPSB0aGlzLmdldEl0ZW1Qb3NpdGlvbihpdGVtMik7XG5cbiAgICAgICAgcmV0dXJuICEoXG4gICAgICAgICAgICBwb3NpdGlvbjIueCA+PSBwb3NpdGlvbjEueCArIHBvc2l0aW9uMS53IHx8XG4gICAgICAgICAgICBwb3NpdGlvbjIueCArIHBvc2l0aW9uMi53IDw9IHBvc2l0aW9uMS54IHx8XG4gICAgICAgICAgICBwb3NpdGlvbjIueSA+PSBwb3NpdGlvbjEueSArIHBvc2l0aW9uMS5oIHx8XG4gICAgICAgICAgICBwb3NpdGlvbjIueSArIHBvc2l0aW9uMi5oIDw9IHBvc2l0aW9uMS55XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXR0ZW1wdCB0byByZXNvbHZlIHRoZSBjb2xsaXNpb25zIGFmdGVyIG1vdmluZyBhbiBpdGVtIG92ZXIgb25lIG9yIG1vcmVcbiAgICAgKiBvdGhlciBpdGVtcyB3aXRoaW4gdGhlIGdyaWQsIGJ5IHNoaWZ0aW5nIHRoZSBwb3NpdGlvbiBvZiB0aGUgY29sbGlkaW5nXG4gICAgICogaXRlbXMgYXJvdW5kIHRoZSBtb3Zpbmcgb25lLiBUaGlzIG1pZ2h0IHJlc3VsdCBpbiBzdWJzZXF1ZW50IGNvbGxpc2lvbnMsXG4gICAgICogaW4gd2hpY2ggY2FzZSB3ZSB3aWxsIHJldmVydCBhbGwgcG9zaXRpb24gcGVybXV0YXRpb25zLiBUbyBiZSBhYmxlIHRvXG4gICAgICogcmV2ZXJ0IHRvIHRoZSBpbml0aWFsIGl0ZW0gcG9zaXRpb25zLCB3ZSBjcmVhdGUgYSB2aXJ0dWFsIGdyaWQgaW4gdGhlXG4gICAgICogcHJvY2Vzc1xuICAgICAqL1xuICAgIHByaXZhdGUgdHJ5VG9SZXNvbHZlQ29sbGlzaW9uc0xvY2FsbHkoaXRlbTogR3JpZExpc3RJdGVtKSB7XG4gICAgICAgIGNvbnN0IGNvbGxpZGluZ0l0ZW1zID0gdGhpcy5nZXRJdGVtc0NvbGxpZGluZ1dpdGhJdGVtKGl0ZW0pO1xuICAgICAgICBpZiAoIWNvbGxpZGluZ0l0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBfZ3JpZExpc3QgPSBuZXcgR3JpZExpc3QoXG4gICAgICAgICAgICB0aGlzLml0ZW1zLm1hcChpdG0gPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBpdG0uY29weSgpO1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnNcbiAgICAgICAgKTtcblxuICAgICAgICBsZXQgbGVmdE9mSXRlbTogW251bWJlciwgbnVtYmVyXTtcbiAgICAgICAgbGV0IHJpZ2h0T2ZJdGVtOiBbbnVtYmVyLCBudW1iZXJdO1xuICAgICAgICBsZXQgYWJvdmVPZkl0ZW06IFtudW1iZXIsIG51bWJlcl07XG4gICAgICAgIGxldCBiZWxvd09mSXRlbTogW251bWJlciwgbnVtYmVyXTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbGxpZGluZ0l0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBjb2xsaWRpbmdJdGVtID0gX2dyaWRMaXN0Lml0ZW1zW2NvbGxpZGluZ0l0ZW1zW2ldXSxcbiAgICAgICAgICAgICAgICBjb2xsaWRpbmdQb3NpdGlvbiA9IHRoaXMuZ2V0SXRlbVBvc2l0aW9uKGNvbGxpZGluZ0l0ZW0pO1xuXG4gICAgICAgICAgICAvLyBXZSB1c2UgYSBzaW1wbGUgYWxnb3JpdGhtIGZvciBtb3ZpbmcgaXRlbXMgYXJvdW5kIHdoZW4gY29sbGlzaW9ucyBvY2N1cjpcbiAgICAgICAgICAgIC8vIEluIHRoaXMgcHJpb3JpdGl6ZWQgb3JkZXIsIHdlIHRyeSB0byBtb3ZlIGEgY29sbGlkaW5nIGl0ZW0gYXJvdW5kIHRoZVxuICAgICAgICAgICAgLy8gbW92aW5nIG9uZTpcbiAgICAgICAgICAgIC8vIDEuIHRvIGl0cyBsZWZ0IHNpZGVcbiAgICAgICAgICAgIC8vIDIuIGFib3ZlIGl0XG4gICAgICAgICAgICAvLyAzLiB1bmRlciBpdFxuICAgICAgICAgICAgLy8gNC4gdG8gaXRzIHJpZ2h0IHNpZGVcbiAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5nZXRJdGVtUG9zaXRpb24oaXRlbSk7XG5cbiAgICAgICAgICAgIGxlZnRPZkl0ZW0gPSBbXG4gICAgICAgICAgICAgICAgcG9zaXRpb24ueCAtIGNvbGxpZGluZ1Bvc2l0aW9uLncsXG4gICAgICAgICAgICAgICAgY29sbGlkaW5nUG9zaXRpb24ueVxuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIHJpZ2h0T2ZJdGVtID0gW3Bvc2l0aW9uLnggKyBwb3NpdGlvbi53LCBjb2xsaWRpbmdQb3NpdGlvbi55XTtcbiAgICAgICAgICAgIGFib3ZlT2ZJdGVtID0gW1xuICAgICAgICAgICAgICAgIGNvbGxpZGluZ1Bvc2l0aW9uLngsXG4gICAgICAgICAgICAgICAgcG9zaXRpb24ueSAtIGNvbGxpZGluZ1Bvc2l0aW9uLmhcbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICBiZWxvd09mSXRlbSA9IFtjb2xsaWRpbmdQb3NpdGlvbi54LCBwb3NpdGlvbi55ICsgcG9zaXRpb24uaF07XG5cbiAgICAgICAgICAgIGlmIChfZ3JpZExpc3QuaXRlbUZpdHNBdFBvc2l0aW9uKGNvbGxpZGluZ0l0ZW0sIGxlZnRPZkl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgX2dyaWRMaXN0LnVwZGF0ZUl0ZW1Qb3NpdGlvbihjb2xsaWRpbmdJdGVtLCBsZWZ0T2ZJdGVtKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgX2dyaWRMaXN0Lml0ZW1GaXRzQXRQb3NpdGlvbihjb2xsaWRpbmdJdGVtLCBhYm92ZU9mSXRlbSlcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIF9ncmlkTGlzdC51cGRhdGVJdGVtUG9zaXRpb24oY29sbGlkaW5nSXRlbSwgYWJvdmVPZkl0ZW0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICBfZ3JpZExpc3QuaXRlbUZpdHNBdFBvc2l0aW9uKGNvbGxpZGluZ0l0ZW0sIGJlbG93T2ZJdGVtKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgX2dyaWRMaXN0LnVwZGF0ZUl0ZW1Qb3NpdGlvbihjb2xsaWRpbmdJdGVtLCBiZWxvd09mSXRlbSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgIF9ncmlkTGlzdC5pdGVtRml0c0F0UG9zaXRpb24oY29sbGlkaW5nSXRlbSwgcmlnaHRPZkl0ZW0pXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBfZ3JpZExpc3QudXBkYXRlSXRlbVBvc2l0aW9uKGNvbGxpZGluZ0l0ZW0sIHJpZ2h0T2ZJdGVtKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gQ29sbGlzaW9ucyBmYWlsZWQsIHdlIG11c3QgdXNlIHRoZSBwdWxsSXRlbXNUb0xlZnQgbWV0aG9kIHRvIGFycmFuZ2VcbiAgICAgICAgICAgICAgICAvLyB0aGUgb3RoZXIgaXRlbXMgYXJvdW5kIHRoaXMgaXRlbSB3aXRoIGZpeGVkIHBvc2l0aW9uLiBUaGlzIGlzIG91clxuICAgICAgICAgICAgICAgIC8vIHBsYW4gQiBmb3Igd2hlbiBsb2NhbCBjb2xsaXNpb24gcmVzb2x2aW5nIGZhaWxzLlxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBJZiB3ZSByZWFjaGVkIHRoaXMgcG9pbnQgaXQgbWVhbnMgd2UgbWFuYWdlZCB0byByZXNvbHZlIHRoZSBjb2xsaXNpb25zXG4gICAgICAgIC8vIGZyb20gb25lIHNpbmdsZSBpdGVyYXRpb24sIGp1c3QgYnkgbW92aW5nIHRoZSBjb2xsaWRpbmcgaXRlbXMgYXJvdW5kLiBTb1xuICAgICAgICAvLyB3ZSBhY2NlcHQgdGhpcyBzY2VuYXJpbyBhbmQgbWVyZ2UgdGhlIGJyYW5jaGVkLW91dCBncmlkIGluc3RhbmNlIGludG8gdGhlXG4gICAgICAgIC8vIG9yaWdpbmFsIG9uZVxuXG4gICAgICAgIHRoaXMuaXRlbXMuZm9yRWFjaCgoaXRtOiBHcmlkTGlzdEl0ZW0sIGlkeDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjYWNoZWRJdGVtID0gX2dyaWRMaXN0Lml0ZW1zLmZpbHRlcihjYWNoZWRJdG0gPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWNoZWRJdG0uJGVsZW1lbnQgPT09IGl0bS4kZWxlbWVudDtcbiAgICAgICAgICAgIH0pWzBdO1xuXG4gICAgICAgICAgICBpdG0ueCA9IGNhY2hlZEl0ZW0ueDtcbiAgICAgICAgICAgIGl0bS55ID0gY2FjaGVkSXRlbS55O1xuICAgICAgICAgICAgaXRtLncgPSBjYWNoZWRJdGVtLnc7XG4gICAgICAgICAgICBpdG0uaCA9IGNhY2hlZEl0ZW0uaDtcbiAgICAgICAgICAgIGl0bS5hdXRvU2l6ZSA9IGNhY2hlZEl0ZW0uYXV0b1NpemU7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmdlbmVyYXRlR3JpZCgpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXaGVuIHB1bGxpbmcgaXRlbXMgdG8gdGhlIGxlZnQsIHdlIG5lZWQgdG8gZmluZCB0aGUgbGVmdG1vc3QgcG9zaXRpb24gZm9yXG4gICAgICogYW4gaXRlbSwgd2l0aCB0d28gY29uc2lkZXJhdGlvbnMgaW4gbWluZDpcbiAgICAgKiAtIHByZXNlcnZpbmcgaXRzIGN1cnJlbnQgcm93XG4gICAgICogLSBwcmVzZXJ2aW5nIHRoZSBwcmV2aW91cyBob3Jpem9udGFsIG9yZGVyIGJldHdlZW4gaXRlbXNcbiAgICAgKi9cbiAgICBwcml2YXRlIGZpbmRMZWZ0TW9zdFBvc2l0aW9uRm9ySXRlbShpdGVtOiBhbnkpIHtcbiAgICAgICAgbGV0IHRhaWwgPSAwO1xuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuZ2V0SXRlbVBvc2l0aW9uKGl0ZW0pO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5ncmlkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gcG9zaXRpb24ueTsgaiA8IHBvc2l0aW9uLnkgKyBwb3NpdGlvbi5oOyBqKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvdGhlckl0ZW0gPSB0aGlzLmdyaWRbaV1bal07XG5cbiAgICAgICAgICAgICAgICBpZiAoIW90aGVySXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBvdGhlclBvc2l0aW9uID0gdGhpcy5nZXRJdGVtUG9zaXRpb24ob3RoZXJJdGVtKTtcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLml0ZW1zLmluZGV4T2Yob3RoZXJJdGVtKSA8IHRoaXMuaXRlbXMuaW5kZXhPZihpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICB0YWlsID0gb3RoZXJQb3NpdGlvbi54ICsgb3RoZXJQb3NpdGlvbi53O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0YWlsO1xuICAgIH1cblxuICAgIHB1YmxpYyBmaW5kSXRlbUJ5UG9zaXRpb24oeDogbnVtYmVyLCB5OiBudW1iZXIpOiBHcmlkTGlzdEl0ZW0ge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzLml0ZW1zW2ldLnggPT09IHggJiYgdGhpcy5pdGVtc1tpXS55ID09PSB5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaXRlbXNbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0SXRlbUJ5QXR0cmlidXRlKGtleToga2V5b2YgR3JpZExpc3RJdGVtLCB2YWx1ZTogYW55KSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5pdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXRlbXNbaV1ba2V5XSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5pdGVtc1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHBhZE51bWJlcihucjogbnVtYmVyLCBwcmVmaXg6IHN0cmluZykge1xuICAgICAgICAvLyBDdXJyZW50bHkgd29ya3MgZm9yIDItZGlnaXQgbnVtYmVycyAoPDEwMClcbiAgICAgICAgcmV0dXJuIG5yID49IDEwID8gbnIgOiBwcmVmaXggKyBucjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJZiB0aGUgZGlyZWN0aW9uIGlzIHZlcnRpY2FsIHdlIG5lZWQgdG8gcm90YXRlIHRoZSBncmlkIDkwIGRlZyB0byB0aGVcbiAgICAgKiBsZWZ0LiBUaHVzLCB3ZSBzaW11bGF0ZSB0aGUgZmFjdCB0aGF0IGl0ZW1zIGFyZSBiZWluZyBwdWxsZWQgdG8gdGhlIHRvcC5cbiAgICAgKlxuICAgICAqIFNpbmNlIHRoZSBpdGVtcyBoYXZlIHdpZHRocyBhbmQgaGVpZ2h0cywgaWYgd2UgYXBwbHkgdGhlIGNsYXNzaWNcbiAgICAgKiBjb3VudGVyLWNsb2Nrd2lzZSA5MCBkZWcgcm90YXRpb25cbiAgICAgKlxuICAgICAqICAgICBbMCAtMV1cbiAgICAgKiAgICAgWzEgIDBdXG4gICAgICpcbiAgICAgKiB0aGVuIHRoZSB0b3AgbGVmdCBwb2ludCBvZiBhbiBpdGVtIHdpbGwgYmVjb21lIHRoZSBib3R0b20gbGVmdCBwb2ludCBvZlxuICAgICAqIHRoZSByb3RhdGVkIGl0ZW0uIFRvIGFkanVzdCBmb3IgdGhpcywgd2UgbmVlZCB0byBzdWJ0cmFjdCBmcm9tIHRoZSB5XG4gICAgICogcG9zaXRpb24gdGhlIGhlaWdodCBvZiB0aGUgb3JpZ2luYWwgaXRlbSAtIHRoZSB3aWR0aCBvZiB0aGUgcm90YXRlZCBpdGVtLlxuICAgICAqXG4gICAgICogSG93ZXZlciwgaWYgd2UgZG8gdGhpcyB0aGVuIHdlJ2xsIHJldmVyc2Ugc29tZSBhY3Rpb25zOiByZXNpemluZyB0aGVcbiAgICAgKiB3aWR0aCBvZiBhbiBpdGVtIHdpbGwgc3RyZXRjaCB0aGUgaXRlbSB0byB0aGUgbGVmdCBpbnN0ZWFkIG9mIHRvIHRoZVxuICAgICAqIHJpZ2h0OyByZXNpemluZyBhbiBpdGVtIHRoYXQgZG9lc24ndCBmaXQgaW50byB0aGUgZ3JpZCB3aWxsIHB1c2ggdGhlXG4gICAgICogaXRlbXMgYXJvdW5kIGl0IGluc3RlYWQgb2YgZ29pbmcgb24gYSBuZXcgcm93LCBldGMuXG4gICAgICpcbiAgICAgKiBXZSBmb3VuZCBpdCBiZXR0ZXIgdG8gZG8gYSB2ZXJ0aWNhbCBmbGlwIG9mIHRoZSBncmlkIGFmdGVyIHJvdGF0aW5nIGl0LlxuICAgICAqIFRoaXMgcmVzdG9yZXMgdGhlIGRpcmVjdGlvbiBvZiB0aGUgYWN0aW9ucyBhbmQgZ3JlYXRseSBzaW1wbGlmaWVzIHRoZVxuICAgICAqIHRyYW5zZm9ybWF0aW9ucy5cbiAgICAgKi9cbiAgICBwcml2YXRlIGdldEl0ZW1Qb3NpdGlvbihpdGVtOiBhbnkpOiB7IHg6IG51bWJlciwgeTogbnVtYmVyLCB3OiBudW1iZXIsIGg6IG51bWJlciB9IHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kaXJlY3Rpb24gPT09ICdob3Jpem9udGFsJykge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHg6IGl0ZW0ueSxcbiAgICAgICAgICAgICAgICB5OiBpdGVtLngsXG4gICAgICAgICAgICAgICAgdzogaXRlbS5oLFxuICAgICAgICAgICAgICAgIGg6IGl0ZW0ud1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlZSBnZXRJdGVtUG9zaXRpb24uXG4gICAgICovXG4gICAgcHJpdmF0ZSBzZXRJdGVtUG9zaXRpb24oaXRlbTogYW55LCBwb3NpdGlvbjogW251bWJlciwgbnVtYmVyXSkge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRpcmVjdGlvbiA9PT0gJ2hvcml6b250YWwnKSB7XG4gICAgICAgICAgICBpdGVtLnggPSBwb3NpdGlvblswXTtcbiAgICAgICAgICAgIGl0ZW0ueSA9IHBvc2l0aW9uWzFdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gV2UncmUgc3VwcG9zZWQgdG8gc3VidHJhY3QgdGhlIHJvdGF0ZWQgaXRlbSdzIGhlaWdodCB3aGljaCBpcyBhY3R1YWxseVxuICAgICAgICAgICAgLy8gdGhlIG5vbi1yb3RhdGVkIGl0ZW0ncyB3aWR0aC5cbiAgICAgICAgICAgIGl0ZW0ueCA9IHBvc2l0aW9uWzFdO1xuICAgICAgICAgICAgaXRlbS55ID0gcG9zaXRpb25bMF07XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=