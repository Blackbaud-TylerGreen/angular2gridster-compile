// const GridCol = function(lanes) {
//     for (let i = 0; i < lanes; i++) {
//         this.push(null);
//     }
// };
const makeGridCol = function (lanes) {
    let result = [];
    for (let i = 0; i < lanes; i++) {
        result.push(null);
    }
    return result;
};
const ɵ0 = makeGridCol;
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
export class GridList {
    constructor(items, options) {
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
    toString() {
        const widthOfGrid = this.grid.length;
        let output = '\n #|', border = '\n --', item, i, j;
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
    }
    setOption(name, value) {
        this.options[name] = value;
    }
    /**
     * Build the grid structure from scratch, with the current item positions
     */
    generateGrid() {
        let i;
        this.resetGrid();
        for (i = 0; i < this.items.length; i++) {
            this.markItemPositionToGrid(this.items[i]);
        }
    }
    resizeGrid(lanes) {
        let currentColumn = 0;
        this.options.lanes = lanes;
        this.adjustSizeOfItems();
        this.sortItemsByPosition();
        this.resetGrid();
        // The items will be sorted based on their index within the this.items array,
        // that is their "1d position"
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i], position = this.getItemPosition(item);
            this.updateItemPosition(item, this.findPositionForItem(item, { x: currentColumn, y: 0 }));
            // New items should never be placed to the left of previous items
            currentColumn = Math.max(currentColumn, position.x);
        }
        this.pullItemsToLeft();
    }
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
    findPositionForItem(item, start, fixedRow) {
        let x, y, position;
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
        const newCol = this.grid.length;
        let newRow = 0;
        if (fixedRow !== undefined &&
            this.itemFitsAtPosition(item, [newCol, fixedRow])) {
            newRow = fixedRow;
        }
        return [newCol, newRow];
    }
    moveAndResize(item, newPosition, size) {
        const position = this.getItemPosition({
            x: newPosition[0],
            y: newPosition[1],
            w: item.w,
            h: item.h
        });
        const width = size.w || item.w, height = size.h || item.h;
        this.updateItemPosition(item, [position.x, position.y]);
        this.updateItemSize(item, width, height);
        this.resolveCollisions(item);
    }
    moveItemToPosition(item, newPosition) {
        const position = this.getItemPosition({
            x: newPosition[0],
            y: newPosition[1],
            w: item.w,
            h: item.h
        });
        this.updateItemPosition(item, [position.x, position.y]);
        this.resolveCollisions(item);
    }
    /**
     * Resize an item and resolve collisions.
     *
     * @param Object item A reference to an item that's part of the grid.
     * @param Object size
     * @param number [size.w=item.w] The new width.
     * @param number [size.h=item.h] The new height.
     */
    resizeItem(item, size) {
        const width = size.w || item.w, height = size.h || item.h;
        this.updateItemSize(item, width, height);
        this.pullItemsToLeft(item);
    }
    /**
     * Compare the current items against a previous snapshot and return only
     * the ones that changed their attributes in the meantime. This includes both
     * position (x, y) and size (w, h)
     *
     * Each item that is returned is not the GridListItem but the helper that holds GridListItem
     * and list of changed properties.
     */
    getChangedItems(initialItems, breakpoint) {
        return this.items
            .map((item) => {
            const changes = [];
            const oldValues = {};
            const initItem = initialItems.find(initItm => initItm.$element === item.$element);
            if (!initItem) {
                return { item, changes: ['x', 'y', 'w', 'h'], isNew: true };
            }
            const oldX = initItem.getValueX(breakpoint);
            if (item.getValueX(breakpoint) !== oldX) {
                changes.push('x');
                if (oldX || oldX === 0) {
                    oldValues.x = oldX;
                }
            }
            const oldY = initItem.getValueY(breakpoint);
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
            return { item, oldValues, changes, isNew: false };
        })
            .filter((itemChange) => {
            return itemChange.changes.length;
        });
    }
    resolveCollisions(item) {
        if (!this.tryToResolveCollisionsLocally(item)) {
            this.pullItemsToLeft(item);
        }
        if (this.options.floating) {
            this.pullItemsToLeft();
        }
        else if (this.getItemsCollidingWithItem(item).length) {
            this.pullItemsToLeft();
        }
    }
    pushCollidingItems(fixedItem) {
        // Start a fresh grid with the fixed item already placed inside
        this.sortItemsByPosition();
        this.resetGrid();
        this.generateGrid();
        this.items
            .filter(item => !this.isItemFloating(item) && item !== fixedItem)
            .forEach(item => {
            if (!this.tryToResolveCollisionsLocally(item)) {
                this.pullItemsToLeft(item);
            }
        });
    }
    /**
     * Build the grid from scratch, by using the current item positions and
     * pulling them as much to the left as possible, removing as space between
     * them as possible.
     *
     * If a "fixed item" is provided, its position will be kept intact and the
     * rest of the items will be layed around it.
     */
    pullItemsToLeft(fixedItem) {
        if (this.options.direction === 'none') {
            return;
        }
        // Start a fresh grid with the fixed item already placed inside
        this.sortItemsByPosition();
        this.resetGrid();
        // Start the grid with the fixed item as the first positioned item
        if (fixedItem) {
            const fixedPosition = this.getItemPosition(fixedItem);
            this.updateItemPosition(fixedItem, [
                fixedPosition.x,
                fixedPosition.y
            ]);
        }
        this.items
            .filter((item) => {
            return !item.dragAndDrop && item !== fixedItem;
        })
            .forEach((item) => {
            const fixedPosition = this.getItemPosition(item);
            this.updateItemPosition(item, [
                fixedPosition.x,
                fixedPosition.y
            ]);
        });
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i], position = this.getItemPosition(item);
            // The fixed item keeps its exact position
            if ((fixedItem && item === fixedItem) ||
                !item.dragAndDrop ||
                (!this.options.floating &&
                    this.isItemFloating(item) &&
                    !this.getItemsCollidingWithItem(item).length)) {
                continue;
            }
            const x = this.findLeftMostPositionForItem(item), newPosition = this.findPositionForItem(item, { x: x, y: 0 }, position.y);
            this.updateItemPosition(item, newPosition);
        }
    }
    isOverFixedArea(x, y, w, h, item = null) {
        let itemData = { x, y, w, h };
        if (this.options.direction !== 'horizontal') {
            itemData = { x: y, y: x, w: h, h: w };
        }
        for (let i = itemData.x; i < itemData.x + itemData.w; i++) {
            for (let j = itemData.y; j < itemData.y + itemData.h; j++) {
                if (this.grid[i] &&
                    this.grid[i][j] &&
                    this.grid[i][j] !== item &&
                    !this.grid[i][j].dragAndDrop) {
                    return true;
                }
            }
        }
        return false;
    }
    checkItemAboveEmptyArea(item, newPosition) {
        let itemData = {
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
    }
    fixItemsPositions(options) {
        // items with x, y that fits gird with size of options.lanes
        const validItems = this.items
            .filter((item) => item.itemComponent)
            .filter((item) => this.isItemValidForGrid(item, options));
        // items that x, y must be generated
        const invalidItems = this.items
            .filter((item) => item.itemComponent)
            .filter((item) => !this.isItemValidForGrid(item, options));
        const gridList = new GridList([], options);
        // put items with defined positions to the grid
        gridList.items = validItems.map((item) => {
            return item.copyForBreakpoint(options.breakpoint);
        });
        gridList.generateGrid();
        invalidItems.forEach(item => {
            // TODO: check if this change does not broke anything
            // const itemCopy = item.copy();
            const itemCopy = item.copyForBreakpoint(options.breakpoint);
            const position = gridList.findPositionForItem(itemCopy, {
                x: 0,
                y: 0
            });
            gridList.items.push(itemCopy);
            gridList.setItemPosition(itemCopy, position);
            gridList.markItemPositionToGrid(itemCopy);
        });
        gridList.pullItemsToLeft();
        gridList.pushCollidingItems();
        this.items.forEach((itm) => {
            const cachedItem = gridList.items.filter(cachedItm => {
                return cachedItm.$element === itm.$element;
            })[0];
            itm.setValueX(cachedItem.x, options.breakpoint);
            itm.setValueY(cachedItem.y, options.breakpoint);
            itm.setValueW(cachedItem.w, options.breakpoint);
            itm.setValueH(cachedItem.h, options.breakpoint);
            itm.autoSize = cachedItem.autoSize;
        });
    }
    deleteItemPositionFromGrid(item) {
        const position = this.getItemPosition(item);
        let x, y;
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
    }
    isItemFloating(item) {
        if (item.itemComponent && item.itemComponent.isDragging) {
            return false;
        }
        const position = this.getItemPosition(item);
        if (position.x === 0) {
            return false;
        }
        const rowBelowItem = this.grid[position.x - 1];
        return (rowBelowItem || [])
            .slice(position.y, position.y + position.h)
            .reduce((isFloating, cellItem) => {
            return isFloating && !cellItem;
        }, true);
    }
    isItemValidForGrid(item, options) {
        const itemData = options.direction === 'horizontal'
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
    }
    findDefaultPositionHorizontal(width, height) {
        for (const col of this.grid) {
            const colIdx = this.grid.indexOf(col);
            let rowIdx = 0;
            while (rowIdx < col.length - height + 1) {
                if (!this.checkItemsInArea(colIdx, colIdx + width - 1, rowIdx, rowIdx + height - 1)) {
                    return [colIdx, rowIdx];
                }
                rowIdx++;
            }
        }
        return [this.grid.length, 0];
    }
    findDefaultPositionVertical(width, height) {
        for (const row of this.grid) {
            const rowIdx = this.grid.indexOf(row);
            let colIdx = 0;
            while (colIdx < row.length - width + 1) {
                if (!this.checkItemsInArea(rowIdx, rowIdx + height - 1, colIdx, colIdx + width - 1)) {
                    return [colIdx, rowIdx];
                }
                colIdx++;
            }
        }
        return [0, this.grid.length];
    }
    checkItemsInArea(rowStart, rowEnd, colStart, colEnd, item) {
        for (let i = rowStart; i <= rowEnd; i++) {
            for (let j = colStart; j <= colEnd; j++) {
                if (this.grid[i] &&
                    this.grid[i][j] &&
                    (item ? this.grid[i][j] !== item : true)) {
                    return true;
                }
            }
        }
        return false;
    }
    sortItemsByPosition() {
        this.items.sort((item1, item2) => {
            const position1 = this.getItemPosition(item1), position2 = this.getItemPosition(item2);
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
    }
    /**
     * Some items can have 100% height or 100% width. Those dimmensions are
     * expressed as 0. We need to ensure a valid width and height for each of
     * those items as the number of items per lane.
     */
    adjustSizeOfItems() {
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
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
    }
    resetGrid() {
        this.grid = [];
    }
    /**
     * Check that an item wouldn't overlap with another one if placed at a
     * certain position within the grid
     */
    itemFitsAtPosition(item, newPosition) {
        const position = this.getItemPosition(item);
        let x, y;
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
            const col = this.grid[x];
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
    }
    updateItemPosition(item, position) {
        if (item.x !== null && item.y !== null) {
            this.deleteItemPositionFromGrid(item);
        }
        this.setItemPosition(item, position);
        this.markItemPositionToGrid(item);
    }
    /**
     * @param Object item A reference to a grid item.
     * @param number width The new width.
     * @param number height The new height.
     */
    updateItemSize(item, width, height) {
        if (item.x !== null && item.y !== null) {
            this.deleteItemPositionFromGrid(item);
        }
        item.w = width;
        item.h = height;
        this.markItemPositionToGrid(item);
    }
    /**
     * Mark the grid cells that are occupied by an item. This prevents items
     * from overlapping in the grid
     */
    markItemPositionToGrid(item) {
        const position = this.getItemPosition(item);
        let x, y;
        // Ensure that the grid has enough columns to accomodate the current item.
        this.ensureColumns(position.x + position.w);
        for (x = position.x; x < position.x + position.w; x++) {
            for (y = position.y; y < position.y + position.h; y++) {
                this.grid[x][y] = item;
            }
        }
    }
    /**
     * Ensure that the grid has at least N columns available.
     */
    ensureColumns(N) {
        for (let i = 0; i < N; i++) {
            if (!this.grid[i]) {
                this.grid.push(makeGridCol(this.options.lanes));
            }
        }
    }
    getItemsCollidingWithItem(item) {
        const collidingItems = [];
        for (let i = 0; i < this.items.length; i++) {
            if (item !== this.items[i] &&
                this.itemsAreColliding(item, this.items[i])) {
                collidingItems.push(i);
            }
        }
        return collidingItems;
    }
    itemsAreColliding(item1, item2) {
        const position1 = this.getItemPosition(item1), position2 = this.getItemPosition(item2);
        return !(position2.x >= position1.x + position1.w ||
            position2.x + position2.w <= position1.x ||
            position2.y >= position1.y + position1.h ||
            position2.y + position2.h <= position1.y);
    }
    /**
     * Attempt to resolve the collisions after moving an item over one or more
     * other items within the grid, by shifting the position of the colliding
     * items around the moving one. This might result in subsequent collisions,
     * in which case we will revert all position permutations. To be able to
     * revert to the initial item positions, we create a virtual grid in the
     * process
     */
    tryToResolveCollisionsLocally(item) {
        const collidingItems = this.getItemsCollidingWithItem(item);
        if (!collidingItems.length) {
            return true;
        }
        const _gridList = new GridList(this.items.map(itm => {
            return itm.copy();
        }), this.options);
        let leftOfItem;
        let rightOfItem;
        let aboveOfItem;
        let belowOfItem;
        for (let i = 0; i < collidingItems.length; i++) {
            const collidingItem = _gridList.items[collidingItems[i]], collidingPosition = this.getItemPosition(collidingItem);
            // We use a simple algorithm for moving items around when collisions occur:
            // In this prioritized order, we try to move a colliding item around the
            // moving one:
            // 1. to its left side
            // 2. above it
            // 3. under it
            // 4. to its right side
            const position = this.getItemPosition(item);
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
        this.items.forEach((itm, idx) => {
            const cachedItem = _gridList.items.filter(cachedItm => {
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
    }
    /**
     * When pulling items to the left, we need to find the leftmost position for
     * an item, with two considerations in mind:
     * - preserving its current row
     * - preserving the previous horizontal order between items
     */
    findLeftMostPositionForItem(item) {
        let tail = 0;
        const position = this.getItemPosition(item);
        for (let i = 0; i < this.grid.length; i++) {
            for (let j = position.y; j < position.y + position.h; j++) {
                const otherItem = this.grid[i][j];
                if (!otherItem) {
                    continue;
                }
                const otherPosition = this.getItemPosition(otherItem);
                if (this.items.indexOf(otherItem) < this.items.indexOf(item)) {
                    tail = otherPosition.x + otherPosition.w;
                }
            }
        }
        return tail;
    }
    findItemByPosition(x, y) {
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].x === x && this.items[i].y === y) {
                return this.items[i];
            }
        }
    }
    getItemByAttribute(key, value) {
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i][key] === value) {
                return this.items[i];
            }
        }
        return null;
    }
    padNumber(nr, prefix) {
        // Currently works for 2-digit numbers (<100)
        return nr >= 10 ? nr : prefix + nr;
    }
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
    getItemPosition(item) {
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
    }
    /**
     * See getItemPosition.
     */
    setItemPosition(item, position) {
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
    }
}
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZExpc3QuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyMmdyaWRzdGVyLyIsInNvdXJjZXMiOlsibGliL2dyaWRMaXN0L2dyaWRMaXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLG9DQUFvQztBQUNwQyx3Q0FBd0M7QUFDeEMsMkJBQTJCO0FBQzNCLFFBQVE7QUFDUixLQUFLO0FBQ0wsTUFBTSxXQUFXLEdBQUcsVUFBVSxLQUFhO0lBQ3ZDLElBQUksTUFBTSxHQUFtQixFQUFFLENBQUM7SUFDaEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUM1QixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ3JCO0lBQ0QsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQyxDQUFDOztBQUlGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F3Qkc7QUFDSCxNQUFNLE9BQU8sUUFBUTtJQU1qQixZQUFZLEtBQTBCLEVBQUUsT0FBeUI7UUFDN0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFFdkIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFFbkIsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFFekIsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7T0FXRztJQUNILFFBQVE7UUFDSixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNyQyxJQUFJLE1BQU0sR0FBRyxPQUFPLEVBQ2hCLE1BQU0sR0FBRyxPQUFPLEVBQ2hCLElBQUksRUFDSixDQUFDLEVBQ0QsQ0FBQyxDQUFDO1FBRU4sMEJBQTBCO1FBQzFCLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzlCLE1BQU0sSUFBSSxHQUFH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RUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDVCxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDWixDQUFDO1NBQ0w7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDSyxlQUFlLENBQUMsSUFBUyxFQUFFLFFBQTBCO1FBQ3pELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEtBQUssWUFBWSxFQUFFO1lBQ3pDLElBQUksQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3hCO2FBQU07WUFDSCx5RUFBeUU7WUFDekUsZ0NBQWdDO1lBQ2hDLElBQUksQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3hCO0lBQ0wsQ0FBQztDQUNKIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgR3JpZExpc3RJdGVtIH0gZnJvbSAnLi9HcmlkTGlzdEl0ZW0nO1xuaW1wb3J0IHsgSUdyaWRzdGVyT3B0aW9ucyB9IGZyb20gJy4uL0lHcmlkc3Rlck9wdGlvbnMnO1xuXG4vLyBjb25zdCBHcmlkQ29sID0gZnVuY3Rpb24obGFuZXMpIHtcbi8vICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxhbmVzOyBpKyspIHtcbi8vICAgICAgICAgdGhpcy5wdXNoKG51bGwpO1xuLy8gICAgIH1cbi8vIH07XG5jb25zdCBtYWtlR3JpZENvbCA9IGZ1bmN0aW9uIChsYW5lczogbnVtYmVyKTogR3JpZENvbCB7XG4gICAgbGV0IHJlc3VsdDogR3JpZExpc3RJdGVtW10gPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxhbmVzOyBpKyspIHtcbiAgICAgICAgcmVzdWx0LnB1c2gobnVsbCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG50eXBlIEdyaWRDb2wgPSBHcmlkTGlzdEl0ZW1bXTtcblxuLyoqXG4gKiBBIEdyaWRMaXN0IG1hbmFnZXMgdGhlIHR3by1kaW1lbnNpb25hbCBwb3NpdGlvbnMgZnJvbSBhIGxpc3Qgb2YgaXRlbXMsXG4gKiB3aXRoaW4gYSB2aXJ0dWFsIG1hdHJpeC5cbiAqXG4gKiBUaGUgR3JpZExpc3QncyBtYWluIGZ1bmN0aW9uIGlzIHRvIGNvbnZlcnQgdGhlIGl0ZW0gcG9zaXRpb25zIGZyb20gb25lXG4gKiBncmlkIHNpemUgdG8gYW5vdGhlciwgbWFpbnRhaW5pbmcgYXMgbXVjaCBvZiB0aGVpciBvcmRlciBhcyBwb3NzaWJsZS5cbiAqXG4gKiBUaGUgR3JpZExpc3QncyBzZWNvbmQgZnVuY3Rpb24gaXMgdG8gaGFuZGxlIGNvbGxpc2lvbnMgd2hlbiBtb3ZpbmcgYW4gaXRlbVxuICogb3ZlciBhbm90aGVyLlxuICpcbiAqIFRoZSBwb3NpdGlvbmluZyBhbGdvcml0aG0gcGxhY2VzIGl0ZW1zIGluIGNvbHVtbnMuIFN0YXJ0aW5nIGZyb20gbGVmdCB0b1xuICogcmlnaHQsIGdvaW5nIHRocm91Z2ggZWFjaCBjb2x1bW4gdG9wIHRvIGJvdHRvbS5cbiAqXG4gKiBUaGUgc2l6ZSBvZiBhbiBpdGVtIGlzIGV4cHJlc3NlZCB1c2luZyB0aGUgbnVtYmVyIG9mIGNvbHMgYW5kIHJvd3MgaXRcbiAqIHRha2VzIHVwIHdpdGhpbiB0aGUgZ3JpZCAodyBhbmQgaClcbiAqXG4gKiBUaGUgcG9zaXRpb24gb2YgYW4gaXRlbSBpcyBleHByZXNzIHVzaW5nIHRoZSBjb2wgYW5kIHJvdyBwb3NpdGlvbiB3aXRoaW5cbiAqIHRoZSBncmlkICh4IGFuZCB5KVxuICpcbiAqIEFuIGl0ZW0gaXMgYW4gb2JqZWN0IG9mIHN0cnVjdHVyZTpcbiAqIHtcbiAqICAgdzogMywgaDogMSxcbiAqICAgeDogMCwgeTogMVxuICogfVxuICovXG5leHBvcnQgY2xhc3MgR3JpZExpc3Qge1xuICAgIGl0ZW1zOiBBcnJheTxHcmlkTGlzdEl0ZW0+O1xuICAgIGdyaWQ6IEFycmF5PEFycmF5PEdyaWRMaXN0SXRlbT4+O1xuXG4gICAgb3B0aW9uczogSUdyaWRzdGVyT3B0aW9ucztcblxuICAgIGNvbnN0cnVjdG9yKGl0ZW1zOiBBcnJheTxHcmlkTGlzdEl0ZW0+LCBvcHRpb25zOiBJR3JpZHN0ZXJPcHRpb25zKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cbiAgICAgICAgdGhpcy5pdGVtcyA9IGl0ZW1zO1xuXG4gICAgICAgIHRoaXMuYWRqdXN0U2l6ZU9mSXRlbXMoKTtcblxuICAgICAgICB0aGlzLmdlbmVyYXRlR3JpZCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIElsbHVzdHJhdGVzIGdyaWQgYXMgdGV4dC1iYXNlZCB0YWJsZSwgdXNpbmcgYSBudW1iZXIgaWRlbnRpZmllciBmb3IgZWFjaFxuICAgICAqIGl0ZW0uIEUuZy5cbiAgICAgKlxuICAgICAqICAjfCAgMCAgMSAgMiAgMyAgNCAgNSAgNiAgNyAgOCAgOSAxMCAxMSAxMiAxM1xuICAgICAqICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAqICAwfCAwMCAwMiAwMyAwNCAwNCAwNiAwOCAwOCAwOCAxMiAxMiAxMyAxNCAxNlxuICAgICAqICAxfCAwMSAtLSAwMyAwNSAwNSAwNyAwOSAxMCAxMSAxMSAtLSAxMyAxNSAtLVxuICAgICAqXG4gICAgICogV2FybjogRG9lcyBub3Qgd29yayBpZiBpdGVtcyBkb24ndCBoYXZlIGEgd2lkdGggb3IgaGVpZ2h0IHNwZWNpZmllZFxuICAgICAqIGJlc2lkZXMgdGhlaXIgcG9zaXRpb24gaW4gdGhlIGdyaWQuXG4gICAgICovXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIGNvbnN0IHdpZHRoT2ZHcmlkID0gdGhpcy5ncmlkLmxlbmd0aDtcbiAgICAgICAgbGV0IG91dHB1dCA9ICdcXG4gI3wnLFxuICAgICAgICAgICAgYm9yZGVyID0gJ1xcbiAtLScsXG4gICAgICAgICAgICBpdGVtLFxuICAgICAgICAgICAgaSxcbiAgICAgICAgICAgIGo7XG5cbiAgICAgICAgLy8gUmVuZGVyIHRoZSB0YWJsZSBoZWFkZXJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHdpZHRoT2ZHcmlkOyBpKyspIHtcbiAgICAgICAgICAgIG91dHB1dCArPSAnICcgKyB0aGlzLnBhZE51bWJlcihpLCAnICcpO1xuICAgICAgICAgICAgYm9yZGVyICs9ICctLS0nO1xuICAgICAgICB9XG4gICAgICAgIG91dHB1dCArPSBib3JkZXI7XG5cbiAgICAgICAgLy8gUmVuZGVyIHRhYmxlIGNvbnRlbnRzIHJvdyBieSByb3csIGFzIHdlIGdvIG9uIHRoZSB5IGF4aXNcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMub3B0aW9ucy5sYW5lczsgaSsrKSB7XG4gICAgICAgICAgICBvdXRwdXQgKz0gJ1xcbicgKyB0aGlzLnBhZE51bWJlcihpLCAnICcpICsgJ3wnO1xuICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IHdpZHRoT2ZHcmlkOyBqKyspIHtcbiAgICAgICAgICAgICAgICBvdXRwdXQgKz0gJyAnO1xuICAgICAgICAgICAgICAgIGl0ZW0gPSB0aGlzLmdyaWRbal1baV07XG4gICAgICAgICAgICAgICAgb3V0cHV0ICs9IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgPyB0aGlzLnBhZE51bWJlcih0aGlzLml0ZW1zLmluZGV4T2YoaXRlbSksICcwJylcbiAgICAgICAgICAgICAgICAgICAgOiAnLS0nO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG91dHB1dCArPSAnXFxuJztcbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICB9XG5cbiAgICBzZXRPcHRpb24obmFtZToga2V5b2YgSUdyaWRzdGVyT3B0aW9ucywgdmFsdWU6IGFueSkge1xuICAgICAgICAoPGFueT50aGlzLm9wdGlvbnNbbmFtZV0pID0gdmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQnVpbGQgdGhlIGdyaWQgc3RydWN0dXJlIGZyb20gc2NyYXRjaCwgd2l0aCB0aGUgY3VycmVudCBpdGVtIHBvc2l0aW9uc1xuICAgICAqL1xuICAgIGdlbmVyYXRlR3JpZCgpIHtcbiAgICAgICAgbGV0IGk7XG4gICAgICAgIHRoaXMucmVzZXRHcmlkKCk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLml0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLm1hcmtJdGVtUG9zaXRpb25Ub0dyaWQodGhpcy5pdGVtc1tpXSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXNpemVHcmlkKGxhbmVzOiBudW1iZXIpIHtcbiAgICAgICAgbGV0IGN1cnJlbnRDb2x1bW4gPSAwO1xuXG4gICAgICAgIHRoaXMub3B0aW9ucy5sYW5lcyA9IGxhbmVzO1xuICAgICAgICB0aGlzLmFkanVzdFNpemVPZkl0ZW1zKCk7XG5cbiAgICAgICAgdGhpcy5zb3J0SXRlbXNCeVBvc2l0aW9uKCk7XG4gICAgICAgIHRoaXMucmVzZXRHcmlkKCk7XG5cbiAgICAgICAgLy8gVGhlIGl0ZW1zIHdpbGwgYmUgc29ydGVkIGJhc2VkIG9uIHRoZWlyIGluZGV4IHdpdGhpbiB0aGUgdGhpcy5pdGVtcyBhcnJheSxcbiAgICAgICAgLy8gdGhhdCBpcyB0aGVpciBcIjFkIHBvc2l0aW9uXCJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLml0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBpdGVtID0gdGhpcy5pdGVtc1tpXSxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbiA9IHRoaXMuZ2V0SXRlbVBvc2l0aW9uKGl0ZW0pO1xuXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUl0ZW1Qb3NpdGlvbihcbiAgICAgICAgICAgICAgICBpdGVtLFxuICAgICAgICAgICAgICAgIHRoaXMuZmluZFBvc2l0aW9uRm9ySXRlbShpdGVtLCB7IHg6IGN1cnJlbnRDb2x1bW4sIHk6IDAgfSlcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIC8vIE5ldyBpdGVtcyBzaG91bGQgbmV2ZXIgYmUgcGxhY2VkIHRvIHRoZSBsZWZ0IG9mIHByZXZpb3VzIGl0ZW1zXG4gICAgICAgICAgICBjdXJyZW50Q29sdW1uID0gTWF0aC5tYXgoY3VycmVudENvbHVtbiwgcG9zaXRpb24ueCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnB1bGxJdGVtc1RvTGVmdCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGhhcyB0d28gb3B0aW9ucyBmb3IgdGhlIHBvc2l0aW9uIHdlIHdhbnQgZm9yIHRoZSBpdGVtOlxuICAgICAqIC0gU3RhcnRpbmcgZnJvbSBhIGNlcnRhaW4gcm93L2NvbHVtbiBudW1iZXIgYW5kIG9ubHkgbG9va2luZyBmb3JcbiAgICAgKiAgIHBvc2l0aW9ucyB0byBpdHMgcmlnaHRcbiAgICAgKiAtIEFjY2VwdGluZyBwb3NpdGlvbnMgZm9yIGEgY2VydGFpbiByb3cgbnVtYmVyIG9ubHkgKHVzZS1jYXNlOiBpdGVtc1xuICAgICAqICAgYmVpbmcgc2hpZnRlZCB0byB0aGUgbGVmdC9yaWdodCBhcyBhIHJlc3VsdCBvZiBjb2xsaXNpb25zKVxuICAgICAqXG4gICAgICogQHBhcmFtIE9iamVjdCBpdGVtXG4gICAgICogQHBhcmFtIE9iamVjdCBzdGFydCBQb3NpdGlvbiBmcm9tIHdoaWNoIHRvIHN0YXJ0XG4gICAgICogICAgIHRoZSBzZWFyY2guXG4gICAgICogQHBhcmFtIG51bWJlciBbZml4ZWRSb3ddIElmIHByb3ZpZGVkLCB3ZSdyZSBnb2luZyB0byB0cnkgdG8gZmluZCBhXG4gICAgICogICAgIHBvc2l0aW9uIGZvciB0aGUgbmV3IGl0ZW0gb24gaXQuIElmIGRvZXNuJ3QgZml0IHRoZXJlLCB3ZSdyZSBnb2luZ1xuICAgICAqICAgICB0byBwdXQgaXQgb24gdGhlIGZpcnN0IHJvdy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIEFycmF5IHggYW5kIHkuXG4gICAgICovXG4gICAgZmluZFBvc2l0aW9uRm9ySXRlbShcbiAgICAgICAgaXRlbTogR3JpZExpc3RJdGVtLFxuICAgICAgICBzdGFydDogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9LFxuICAgICAgICBmaXhlZFJvdz86IG51bWJlclxuICAgICk6IFtudW1iZXIsIG51bWJlcl0ge1xuICAgICAgICBsZXQgeCwgeSwgcG9zaXRpb247XG5cbiAgICAgICAgLy8gU3RhcnQgc2VhcmNoaW5nIGZvciBhIHBvc2l0aW9uIGZyb20gdGhlIGhvcml6b250YWwgcG9zaXRpb24gb2YgdGhlXG4gICAgICAgIC8vIHJpZ2h0bW9zdCBpdGVtIGZyb20gdGhlIGdyaWRcbiAgICAgICAgZm9yICh4ID0gc3RhcnQueDsgeCA8IHRoaXMuZ3JpZC5sZW5ndGg7IHgrKykge1xuICAgICAgICAgICAgaWYgKGZpeGVkUm93ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbiA9IFt4LCBmaXhlZFJvd107XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pdGVtRml0c0F0UG9zaXRpb24oaXRlbSwgcG9zaXRpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwb3NpdGlvbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvciAoeSA9IHN0YXJ0Lnk7IHkgPCB0aGlzLm9wdGlvbnMubGFuZXM7IHkrKykge1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbiA9IFt4LCB5XTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pdGVtRml0c0F0UG9zaXRpb24oaXRlbSwgcG9zaXRpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcG9zaXRpb247XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB3ZSd2ZSByZWFjaGVkIHRoaXMgcG9pbnQsIHdlIG5lZWQgdG8gc3RhcnQgYSBuZXcgY29sdW1uXG4gICAgICAgIGNvbnN0IG5ld0NvbCA9IHRoaXMuZ3JpZC5sZW5ndGg7XG4gICAgICAgIGxldCBuZXdSb3cgPSAwO1xuXG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIGZpeGVkUm93ICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgIHRoaXMuaXRlbUZpdHNBdFBvc2l0aW9uKGl0ZW0sIFtuZXdDb2wsIGZpeGVkUm93XSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBuZXdSb3cgPSBmaXhlZFJvdztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBbbmV3Q29sLCBuZXdSb3ddO1xuICAgIH1cblxuICAgIG1vdmVBbmRSZXNpemUoXG4gICAgICAgIGl0ZW06IEdyaWRMaXN0SXRlbSxcbiAgICAgICAgbmV3UG9zaXRpb246IEFycmF5PG51bWJlcj4sXG4gICAgICAgIHNpemU6IHsgdzogbnVtYmVyOyBoOiBudW1iZXIgfVxuICAgICkge1xuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuZ2V0SXRlbVBvc2l0aW9uKHtcbiAgICAgICAgICAgIHg6IG5ld1Bvc2l0aW9uWzBdLFxuICAgICAgICAgICAgeTogbmV3UG9zaXRpb25bMV0sXG4gICAgICAgICAgICB3OiBpdGVtLncsXG4gICAgICAgICAgICBoOiBpdGVtLmhcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHdpZHRoID0gc2l6ZS53IHx8IGl0ZW0udyxcbiAgICAgICAgICAgIGhlaWdodCA9IHNpemUuaCB8fCBpdGVtLmg7XG5cbiAgICAgICAgdGhpcy51cGRhdGVJdGVtUG9zaXRpb24oaXRlbSwgW3Bvc2l0aW9uLngsIHBvc2l0aW9uLnldKTtcbiAgICAgICAgdGhpcy51cGRhdGVJdGVtU2l6ZShpdGVtLCB3aWR0aCwgaGVpZ2h0KTtcblxuICAgICAgICB0aGlzLnJlc29sdmVDb2xsaXNpb25zKGl0ZW0pO1xuICAgIH1cblxuICAgIG1vdmVJdGVtVG9Qb3NpdGlvbihpdGVtOiBHcmlkTGlzdEl0ZW0sIG5ld1Bvc2l0aW9uOiBBcnJheTxudW1iZXI+KSB7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5nZXRJdGVtUG9zaXRpb24oe1xuICAgICAgICAgICAgeDogbmV3UG9zaXRpb25bMF0sXG4gICAgICAgICAgICB5OiBuZXdQb3NpdGlvblsxXSxcbiAgICAgICAgICAgIHc6IGl0ZW0udyxcbiAgICAgICAgICAgIGg6IGl0ZW0uaFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnVwZGF0ZUl0ZW1Qb3NpdGlvbihpdGVtLCBbcG9zaXRpb24ueCwgcG9zaXRpb24ueV0pO1xuICAgICAgICB0aGlzLnJlc29sdmVDb2xsaXNpb25zKGl0ZW0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlc2l6ZSBhbiBpdGVtIGFuZCByZXNvbHZlIGNvbGxpc2lvbnMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gT2JqZWN0IGl0ZW0gQSByZWZlcmVuY2UgdG8gYW4gaXRlbSB0aGF0J3MgcGFydCBvZiB0aGUgZ3JpZC5cbiAgICAgKiBAcGFyYW0gT2JqZWN0IHNpemVcbiAgICAgKiBAcGFyYW0gbnVtYmVyIFtzaXplLnc9aXRlbS53XSBUaGUgbmV3IHdpZHRoLlxuICAgICAqIEBwYXJhbSBudW1iZXIgW3NpemUuaD1pdGVtLmhdIFRoZSBuZXcgaGVpZ2h0LlxuICAgICAqL1xuICAgIHJlc2l6ZUl0ZW0oaXRlbTogR3JpZExpc3RJdGVtLCBzaXplOiB7IHc6IG51bWJlcjsgaDogbnVtYmVyIH0pIHtcbiAgICAgICAgY29uc3Qgd2lkdGggPSBzaXplLncgfHwgaXRlbS53LFxuICAgICAgICAgICAgaGVpZ2h0ID0gc2l6ZS5oIHx8IGl0ZW0uaDtcblxuICAgICAgICB0aGlzLnVwZGF0ZUl0ZW1TaXplKGl0ZW0sIHdpZHRoLCBoZWlnaHQpO1xuXG4gICAgICAgIHRoaXMucHVsbEl0ZW1zVG9MZWZ0KGl0ZW0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbXBhcmUgdGhlIGN1cnJlbnQgaXRlbXMgYWdhaW5zdCBhIHByZXZpb3VzIHNuYXBzaG90IGFuZCByZXR1cm4gb25seVxuICAgICAqIHRoZSBvbmVzIHRoYXQgY2hhbmdlZCB0aGVpciBhdHRyaWJ1dGVzIGluIHRoZSBtZWFudGltZS4gVGhpcyBpbmNsdWRlcyBib3RoXG4gICAgICogcG9zaXRpb24gKHgsIHkpIGFuZCBzaXplICh3LCBoKVxuICAgICAqXG4gICAgICogRWFjaCBpdGVtIHRoYXQgaXMgcmV0dXJuZWQgaXMgbm90IHRoZSBHcmlkTGlzdEl0ZW0gYnV0IHRoZSBoZWxwZXIgdGhhdCBob2xkcyBHcmlkTGlzdEl0ZW1cbiAgICAgKiBhbmQgbGlzdCBvZiBjaGFuZ2VkIHByb3BlcnRpZXMuXG4gICAgICovXG4gICAgZ2V0Q2hhbmdlZEl0ZW1zKFxuICAgICAgICBpbml0aWFsSXRlbXM6IEFycmF5PEdyaWRMaXN0SXRlbT4sXG4gICAgICAgIGJyZWFrcG9pbnQ/OiBzdHJpbmdcbiAgICApOiBBcnJheTx7XG4gICAgICAgIGl0ZW06IEdyaWRMaXN0SXRlbTtcbiAgICAgICAgY2hhbmdlczogQXJyYXk8c3RyaW5nPjtcbiAgICAgICAgaXNOZXc6IGJvb2xlYW47XG4gICAgfT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5pdGVtc1xuICAgICAgICAgICAgLm1hcCgoaXRlbTogR3JpZExpc3RJdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2hhbmdlcyA9IFtdO1xuICAgICAgICAgICAgICAgIGNvbnN0IG9sZFZhbHVlczoge1xuICAgICAgICAgICAgICAgICAgICB4PzogbnVtYmVyO1xuICAgICAgICAgICAgICAgICAgICB5PzogbnVtYmVyO1xuICAgICAgICAgICAgICAgICAgICB3PzogbnVtYmVyO1xuICAgICAgICAgICAgICAgICAgICBoPzogbnVtYmVyO1xuICAgICAgICAgICAgICAgIH0gPSB7fTtcbiAgICAgICAgICAgICAgICBjb25zdCBpbml0SXRlbSA9IGluaXRpYWxJdGVtcy5maW5kKFxuICAgICAgICAgICAgICAgICAgICBpbml0SXRtID0+IGluaXRJdG0uJGVsZW1lbnQgPT09IGl0ZW0uJGVsZW1lbnRcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFpbml0SXRlbSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBpdGVtLCBjaGFuZ2VzOiBbJ3gnLCAneScsICd3JywgJ2gnXSwgaXNOZXc6IHRydWUgfTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBvbGRYID0gaW5pdEl0ZW0uZ2V0VmFsdWVYKGJyZWFrcG9pbnQpO1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLmdldFZhbHVlWChicmVha3BvaW50KSAhPT0gb2xkWCkge1xuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VzLnB1c2goJ3gnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9sZFggfHwgb2xkWCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2xkVmFsdWVzLnggPSBvbGRYO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3Qgb2xkWSA9IGluaXRJdGVtLmdldFZhbHVlWShicmVha3BvaW50KTtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5nZXRWYWx1ZVkoYnJlYWtwb2ludCkgIT09IG9sZFkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlcy5wdXNoKCd5Jyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvbGRZIHx8IG9sZFkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9sZFZhbHVlcy55ID0gb2xkWTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZ2V0VmFsdWVXKGJyZWFrcG9pbnQpICE9PVxuICAgICAgICAgICAgICAgICAgICBpbml0SXRlbS5nZXRWYWx1ZVcoYnJlYWtwb2ludClcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlcy5wdXNoKCd3Jyk7XG4gICAgICAgICAgICAgICAgICAgIG9sZFZhbHVlcy53ID0gaW5pdEl0ZW0udztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICBpdGVtLmdldFZhbHVlSChicmVha3BvaW50KSAhPT1cbiAgICAgICAgICAgICAgICAgICAgaW5pdEl0ZW0uZ2V0VmFsdWVIKGJyZWFrcG9pbnQpXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZXMucHVzaCgnaCcpO1xuICAgICAgICAgICAgICAgICAgICBvbGRWYWx1ZXMuaCA9IGluaXRJdGVtLmg7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgaXRlbSwgb2xkVmFsdWVzLCBjaGFuZ2VzLCBpc05ldzogZmFsc2UgfTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuZmlsdGVyKFxuICAgICAgICAgICAgICAgIChpdGVtQ2hhbmdlOiB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW06IEdyaWRMaXN0SXRlbTtcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlczogQXJyYXk8c3RyaW5nPjtcbiAgICAgICAgICAgICAgICB9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtQ2hhbmdlLmNoYW5nZXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgfVxuXG4gICAgcmVzb2x2ZUNvbGxpc2lvbnMoaXRlbTogR3JpZExpc3RJdGVtKSB7XG4gICAgICAgIGlmICghdGhpcy50cnlUb1Jlc29sdmVDb2xsaXNpb25zTG9jYWxseShpdGVtKSkge1xuICAgICAgICAgICAgdGhpcy5wdWxsSXRlbXNUb0xlZnQoaXRlbSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5mbG9hdGluZykge1xuICAgICAgICAgICAgdGhpcy5wdWxsSXRlbXNUb0xlZnQoKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmdldEl0ZW1zQ29sbGlkaW5nV2l0aEl0ZW0oaXRlbSkubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLnB1bGxJdGVtc1RvTGVmdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVzaENvbGxpZGluZ0l0ZW1zKGZpeGVkSXRlbT86IEdyaWRMaXN0SXRlbSkge1xuICAgICAgICAvLyBTdGFydCBhIGZyZXNoIGdyaWQgd2l0aCB0aGUgZml4ZWQgaXRlbSBhbHJlYWR5IHBsYWNlZCBpbnNpZGVcbiAgICAgICAgdGhpcy5zb3J0SXRlbXNCeVBvc2l0aW9uKCk7XG4gICAgICAgIHRoaXMucmVzZXRHcmlkKCk7XG4gICAgICAgIHRoaXMuZ2VuZXJhdGVHcmlkKCk7XG5cbiAgICAgICAgdGhpcy5pdGVtc1xuICAgICAgICAgICAgLmZpbHRlcihpdGVtID0+ICF0aGlzLmlzSXRlbUZsb2F0aW5nKGl0ZW0pICYmIGl0ZW0gIT09IGZpeGVkSXRlbSlcbiAgICAgICAgICAgIC5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy50cnlUb1Jlc29sdmVDb2xsaXNpb25zTG9jYWxseShpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnB1bGxJdGVtc1RvTGVmdChpdGVtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBCdWlsZCB0aGUgZ3JpZCBmcm9tIHNjcmF0Y2gsIGJ5IHVzaW5nIHRoZSBjdXJyZW50IGl0ZW0gcG9zaXRpb25zIGFuZFxuICAgICAqIHB1bGxpbmcgdGhlbSBhcyBtdWNoIHRvIHRoZSBsZWZ0IGFzIHBvc3NpYmxlLCByZW1vdmluZyBhcyBzcGFjZSBiZXR3ZWVuXG4gICAgICogdGhlbSBhcyBwb3NzaWJsZS5cbiAgICAgKlxuICAgICAqIElmIGEgXCJmaXhlZCBpdGVtXCIgaXMgcHJvdmlkZWQsIGl0cyBwb3NpdGlvbiB3aWxsIGJlIGtlcHQgaW50YWN0IGFuZCB0aGVcbiAgICAgKiByZXN0IG9mIHRoZSBpdGVtcyB3aWxsIGJlIGxheWVkIGFyb3VuZCBpdC5cbiAgICAgKi9cbiAgICBwdWxsSXRlbXNUb0xlZnQoZml4ZWRJdGVtPzogYW55KSB7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZGlyZWN0aW9uID09PSAnbm9uZScpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFN0YXJ0IGEgZnJlc2ggZ3JpZCB3aXRoIHRoZSBmaXhlZCBpdGVtIGFscmVhZHkgcGxhY2VkIGluc2lkZVxuICAgICAgICB0aGlzLnNvcnRJdGVtc0J5UG9zaXRpb24oKTtcbiAgICAgICAgdGhpcy5yZXNldEdyaWQoKTtcblxuICAgICAgICAvLyBTdGFydCB0aGUgZ3JpZCB3aXRoIHRoZSBmaXhlZCBpdGVtIGFzIHRoZSBmaXJzdCBwb3NpdGlvbmVkIGl0ZW1cbiAgICAgICAgaWYgKGZpeGVkSXRlbSkge1xuICAgICAgICAgICAgY29uc3QgZml4ZWRQb3NpdGlvbiA9IHRoaXMuZ2V0SXRlbVBvc2l0aW9uKGZpeGVkSXRlbSk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUl0ZW1Qb3NpdGlvbihmaXhlZEl0ZW0sIFtcbiAgICAgICAgICAgICAgICBmaXhlZFBvc2l0aW9uLngsXG4gICAgICAgICAgICAgICAgZml4ZWRQb3NpdGlvbi55XG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaXRlbXNcbiAgICAgICAgICAgIC5maWx0ZXIoKGl0ZW06IEdyaWRMaXN0SXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAhaXRlbS5kcmFnQW5kRHJvcCAmJiBpdGVtICE9PSBmaXhlZEl0ZW07XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmZvckVhY2goKGl0ZW06IEdyaWRMaXN0SXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpeGVkUG9zaXRpb24gPSB0aGlzLmdldEl0ZW1Qb3NpdGlvbihpdGVtKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUl0ZW1Qb3NpdGlvbihpdGVtLCBbXG4gICAgICAgICAgICAgICAgICAgIGZpeGVkUG9zaXRpb24ueCxcbiAgICAgICAgICAgICAgICAgICAgZml4ZWRQb3NpdGlvbi55XG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLml0ZW1zW2ldLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gdGhpcy5nZXRJdGVtUG9zaXRpb24oaXRlbSk7XG5cbiAgICAgICAgICAgIC8vIFRoZSBmaXhlZCBpdGVtIGtlZXBzIGl0cyBleGFjdCBwb3NpdGlvblxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIChmaXhlZEl0ZW0gJiYgaXRlbSA9PT0gZml4ZWRJdGVtKSB8fFxuICAgICAgICAgICAgICAgICFpdGVtLmRyYWdBbmREcm9wIHx8XG4gICAgICAgICAgICAgICAgKCF0aGlzLm9wdGlvbnMuZmxvYXRpbmcgJiZcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0l0ZW1GbG9hdGluZyhpdGVtKSAmJlxuICAgICAgICAgICAgICAgICAgICAhdGhpcy5nZXRJdGVtc0NvbGxpZGluZ1dpdGhJdGVtKGl0ZW0pLmxlbmd0aClcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCB4ID0gdGhpcy5maW5kTGVmdE1vc3RQb3NpdGlvbkZvckl0ZW0oaXRlbSksXG4gICAgICAgICAgICAgICAgbmV3UG9zaXRpb24gPSB0aGlzLmZpbmRQb3NpdGlvbkZvckl0ZW0oXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0sXG4gICAgICAgICAgICAgICAgICAgIHsgeDogeCwgeTogMCB9LFxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbi55XG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgdGhpcy51cGRhdGVJdGVtUG9zaXRpb24oaXRlbSwgbmV3UG9zaXRpb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaXNPdmVyRml4ZWRBcmVhKFxuICAgICAgICB4OiBudW1iZXIsXG4gICAgICAgIHk6IG51bWJlcixcbiAgICAgICAgdzogbnVtYmVyLFxuICAgICAgICBoOiBudW1iZXIsXG4gICAgICAgIGl0ZW06IEdyaWRMaXN0SXRlbSA9IG51bGxcbiAgICApOiBib29sZWFuIHtcbiAgICAgICAgbGV0IGl0ZW1EYXRhID0geyB4LCB5LCB3LCBoIH07XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kaXJlY3Rpb24gIT09ICdob3Jpem9udGFsJykge1xuICAgICAgICAgICAgaXRlbURhdGEgPSB7IHg6IHksIHk6IHgsIHc6IGgsIGg6IHcgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGkgPSBpdGVtRGF0YS54OyBpIDwgaXRlbURhdGEueCArIGl0ZW1EYXRhLnc7IGkrKykge1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IGl0ZW1EYXRhLnk7IGogPCBpdGVtRGF0YS55ICsgaXRlbURhdGEuaDsgaisrKSB7XG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdyaWRbaV0gJiZcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ncmlkW2ldW2pdICYmXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JpZFtpXVtqXSAhPT0gaXRlbSAmJlxuICAgICAgICAgICAgICAgICAgICAhdGhpcy5ncmlkW2ldW2pdLmRyYWdBbmREcm9wXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY2hlY2tJdGVtQWJvdmVFbXB0eUFyZWEoXG4gICAgICAgIGl0ZW06IEdyaWRMaXN0SXRlbSxcbiAgICAgICAgbmV3UG9zaXRpb246IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfVxuICAgICkge1xuICAgICAgICBsZXQgaXRlbURhdGEgPSB7XG4gICAgICAgICAgICB4OiBuZXdQb3NpdGlvbi54LFxuICAgICAgICAgICAgeTogbmV3UG9zaXRpb24ueSxcbiAgICAgICAgICAgIHc6IGl0ZW0udyxcbiAgICAgICAgICAgIGg6IGl0ZW0uaFxuICAgICAgICB9O1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICAhaXRlbS5pdGVtUHJvdG90eXBlICYmXG4gICAgICAgICAgICBpdGVtLnggPT09IG5ld1Bvc2l0aW9uLnggJiZcbiAgICAgICAgICAgIGl0ZW0ueSA9PT0gbmV3UG9zaXRpb24ueVxuICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kaXJlY3Rpb24gPT09ICdob3Jpem9udGFsJykge1xuICAgICAgICAgICAgaXRlbURhdGEgPSB7XG4gICAgICAgICAgICAgICAgeDogbmV3UG9zaXRpb24ueSxcbiAgICAgICAgICAgICAgICB5OiBuZXdQb3NpdGlvbi54LFxuICAgICAgICAgICAgICAgIHc6IGl0ZW1EYXRhLmgsXG4gICAgICAgICAgICAgICAgaDogaXRlbURhdGEud1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gIXRoaXMuY2hlY2tJdGVtc0luQXJlYShcbiAgICAgICAgICAgIGl0ZW1EYXRhLnksXG4gICAgICAgICAgICBpdGVtRGF0YS55ICsgaXRlbURhdGEuaCAtIDEsXG4gICAgICAgICAgICBpdGVtRGF0YS54LFxuICAgICAgICAgICAgaXRlbURhdGEueCArIGl0ZW1EYXRhLncgLSAxLFxuICAgICAgICAgICAgaXRlbVxuICAgICAgICApO1xuICAgIH1cblxuICAgIGZpeEl0ZW1zUG9zaXRpb25zKG9wdGlvbnM6IElHcmlkc3Rlck9wdGlvbnMpIHtcbiAgICAgICAgLy8gaXRlbXMgd2l0aCB4LCB5IHRoYXQgZml0cyBnaXJkIHdpdGggc2l6ZSBvZiBvcHRpb25zLmxhbmVzXG4gICAgICAgIGNvbnN0IHZhbGlkSXRlbXMgPSB0aGlzLml0ZW1zXG4gICAgICAgICAgICAuZmlsdGVyKChpdGVtOiBHcmlkTGlzdEl0ZW0pID0+IGl0ZW0uaXRlbUNvbXBvbmVudClcbiAgICAgICAgICAgIC5maWx0ZXIoKGl0ZW06IEdyaWRMaXN0SXRlbSkgPT5cbiAgICAgICAgICAgICAgICB0aGlzLmlzSXRlbVZhbGlkRm9yR3JpZChpdGVtLCBvcHRpb25zKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgLy8gaXRlbXMgdGhhdCB4LCB5IG11c3QgYmUgZ2VuZXJhdGVkXG4gICAgICAgIGNvbnN0IGludmFsaWRJdGVtcyA9IHRoaXMuaXRlbXNcbiAgICAgICAgICAgIC5maWx0ZXIoKGl0ZW06IEdyaWRMaXN0SXRlbSkgPT4gaXRlbS5pdGVtQ29tcG9uZW50KVxuICAgICAgICAgICAgLmZpbHRlcihcbiAgICAgICAgICAgICAgICAoaXRlbTogR3JpZExpc3RJdGVtKSA9PiAhdGhpcy5pc0l0ZW1WYWxpZEZvckdyaWQoaXRlbSwgb3B0aW9ucylcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgZ3JpZExpc3QgPSBuZXcgR3JpZExpc3QoW10sIG9wdGlvbnMpO1xuXG4gICAgICAgIC8vIHB1dCBpdGVtcyB3aXRoIGRlZmluZWQgcG9zaXRpb25zIHRvIHRoZSBncmlkXG4gICAgICAgIGdyaWRMaXN0Lml0ZW1zID0gdmFsaWRJdGVtcy5tYXAoKGl0ZW06IEdyaWRMaXN0SXRlbSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0uY29weUZvckJyZWFrcG9pbnQob3B0aW9ucy5icmVha3BvaW50KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZ3JpZExpc3QuZ2VuZXJhdGVHcmlkKCk7XG5cbiAgICAgICAgaW52YWxpZEl0ZW1zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgICAvLyBUT0RPOiBjaGVjayBpZiB0aGlzIGNoYW5nZSBkb2VzIG5vdCBicm9rZSBhbnl0aGluZ1xuICAgICAgICAgICAgLy8gY29uc3QgaXRlbUNvcHkgPSBpdGVtLmNvcHkoKTtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1Db3B5ID0gaXRlbS5jb3B5Rm9yQnJlYWtwb2ludChvcHRpb25zLmJyZWFrcG9pbnQpO1xuICAgICAgICAgICAgY29uc3QgcG9zaXRpb24gPSBncmlkTGlzdC5maW5kUG9zaXRpb25Gb3JJdGVtKGl0ZW1Db3B5LCB7XG4gICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICB5OiAwXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZ3JpZExpc3QuaXRlbXMucHVzaChpdGVtQ29weSk7XG4gICAgICAgICAgICBncmlkTGlzdC5zZXRJdGVtUG9zaXRpb24oaXRlbUNvcHksIHBvc2l0aW9uKTtcbiAgICAgICAgICAgIGdyaWRMaXN0Lm1hcmtJdGVtUG9zaXRpb25Ub0dyaWQoaXRlbUNvcHkpO1xuICAgICAgICB9KTtcblxuICAgICAgICBncmlkTGlzdC5wdWxsSXRlbXNUb0xlZnQoKTtcbiAgICAgICAgZ3JpZExpc3QucHVzaENvbGxpZGluZ0l0ZW1zKCk7XG5cbiAgICAgICAgdGhpcy5pdGVtcy5mb3JFYWNoKChpdG06IEdyaWRMaXN0SXRlbSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY2FjaGVkSXRlbSA9IGdyaWRMaXN0Lml0ZW1zLmZpbHRlcihjYWNoZWRJdG0gPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWNoZWRJdG0uJGVsZW1lbnQgPT09IGl0bS4kZWxlbWVudDtcbiAgICAgICAgICAgIH0pWzBdO1xuXG4gICAgICAgICAgICBpdG0uc2V0VmFsdWVYKGNhY2hlZEl0ZW0ueCwgb3B0aW9ucy5icmVha3BvaW50KTtcbiAgICAgICAgICAgIGl0bS5zZXRWYWx1ZVkoY2FjaGVkSXRlbS55LCBvcHRpb25zLmJyZWFrcG9pbnQpO1xuICAgICAgICAgICAgaXRtLnNldFZhbHVlVyhjYWNoZWRJdGVtLncsIG9wdGlvbnMuYnJlYWtwb2ludCk7XG4gICAgICAgICAgICBpdG0uc2V0VmFsdWVIKGNhY2hlZEl0ZW0uaCwgb3B0aW9ucy5icmVha3BvaW50KTtcbiAgICAgICAgICAgIGl0bS5hdXRvU2l6ZSA9IGNhY2hlZEl0ZW0uYXV0b1NpemU7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRlbGV0ZUl0ZW1Qb3NpdGlvbkZyb21HcmlkKGl0ZW06IEdyaWRMaXN0SXRlbSkge1xuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuZ2V0SXRlbVBvc2l0aW9uKGl0ZW0pO1xuICAgICAgICBsZXQgeCwgeTtcblxuICAgICAgICBmb3IgKHggPSBwb3NpdGlvbi54OyB4IDwgcG9zaXRpb24ueCArIHBvc2l0aW9uLnc7IHgrKykge1xuICAgICAgICAgICAgLy8gSXQgY2FuIGhhcHBlbiB0byB0cnkgdG8gcmVtb3ZlIGFuIGl0ZW0gZnJvbSBhIHBvc2l0aW9uIG5vdCBnZW5lcmF0ZWRcbiAgICAgICAgICAgIC8vIGluIHRoZSBncmlkLCBwcm9iYWJseSB3aGVuIGxvYWRpbmcgYSBwZXJzaXN0ZWQgZ3JpZCBvZiBpdGVtcy4gTm8gbmVlZFxuICAgICAgICAgICAgLy8gdG8gY3JlYXRlIGEgY29sdW1uIHRvIGJlIGFibGUgdG8gcmVtb3ZlIHNvbWV0aGluZyBmcm9tIGl0LCB0aG91Z2hcbiAgICAgICAgICAgIGlmICghdGhpcy5ncmlkW3hdKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAoeSA9IHBvc2l0aW9uLnk7IHkgPCBwb3NpdGlvbi55ICsgcG9zaXRpb24uaDsgeSsrKSB7XG4gICAgICAgICAgICAgICAgLy8gRG9uJ3QgY2xlYXIgdGhlIGNlbGwgaWYgaXQncyBiZWVuIG9jY3VwaWVkIGJ5IGEgZGlmZmVyZW50IHdpZGdldCBpblxuICAgICAgICAgICAgICAgIC8vIHRoZSBtZWFudGltZSAoZS5nLiB3aGVuIGFuIGl0ZW0gaGFzIGJlZW4gbW92ZWQgb3ZlciB0aGlzIG9uZSwgYW5kXG4gICAgICAgICAgICAgICAgLy8gdGh1cyBieSBjb250aW51aW5nIHRvIGNsZWFyIHRoaXMgaXRlbSdzIHByZXZpb3VzIHBvc2l0aW9uIHlvdSB3b3VsZFxuICAgICAgICAgICAgICAgIC8vIGNhbmNlbCB0aGUgZmlyc3QgaXRlbSdzIG1vdmUsIGxlYXZpbmcgaXQgd2l0aG91dCBhbnkgcG9zaXRpb24gZXZlbilcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ncmlkW3hdW3ldID09PSBpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JpZFt4XVt5XSA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc0l0ZW1GbG9hdGluZyhpdGVtOiBhbnkpIHtcbiAgICAgICAgaWYgKGl0ZW0uaXRlbUNvbXBvbmVudCAmJiBpdGVtLml0ZW1Db21wb25lbnQuaXNEcmFnZ2luZykge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5nZXRJdGVtUG9zaXRpb24oaXRlbSk7XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uLnggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByb3dCZWxvd0l0ZW0gPSB0aGlzLmdyaWRbcG9zaXRpb24ueCAtIDFdO1xuXG4gICAgICAgIHJldHVybiAocm93QmVsb3dJdGVtIHx8IFtdKVxuICAgICAgICAgICAgLnNsaWNlKHBvc2l0aW9uLnksIHBvc2l0aW9uLnkgKyBwb3NpdGlvbi5oKVxuICAgICAgICAgICAgLnJlZHVjZSgoaXNGbG9hdGluZywgY2VsbEl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXNGbG9hdGluZyAmJiAhY2VsbEl0ZW07XG4gICAgICAgICAgICB9LCB0cnVlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzSXRlbVZhbGlkRm9yR3JpZChpdGVtOiBHcmlkTGlzdEl0ZW0sIG9wdGlvbnM6IElHcmlkc3Rlck9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgaXRlbURhdGEgPVxuICAgICAgICAgICAgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICdob3Jpem9udGFsJ1xuICAgICAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgICAgICAgIHg6IGl0ZW0uZ2V0VmFsdWVZKG9wdGlvbnMuYnJlYWtwb2ludCksXG4gICAgICAgICAgICAgICAgICAgICAgeTogaXRlbS5nZXRWYWx1ZVgob3B0aW9ucy5icmVha3BvaW50KSxcbiAgICAgICAgICAgICAgICAgICAgICB3OiBpdGVtLmdldFZhbHVlSChvcHRpb25zLmJyZWFrcG9pbnQpLFxuICAgICAgICAgICAgICAgICAgICAgIGg6IE1hdGgubWluKFxuICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmdldFZhbHVlVyh0aGlzLm9wdGlvbnMuYnJlYWtwb2ludCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMubGFuZXNcbiAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgOiB7XG4gICAgICAgICAgICAgICAgICAgICAgeDogaXRlbS5nZXRWYWx1ZVgob3B0aW9ucy5icmVha3BvaW50KSxcbiAgICAgICAgICAgICAgICAgICAgICB5OiBpdGVtLmdldFZhbHVlWShvcHRpb25zLmJyZWFrcG9pbnQpLFxuICAgICAgICAgICAgICAgICAgICAgIHc6IE1hdGgubWluKFxuICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmdldFZhbHVlVyh0aGlzLm9wdGlvbnMuYnJlYWtwb2ludCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMubGFuZXNcbiAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgIGg6IGl0ZW0uZ2V0VmFsdWVIKG9wdGlvbnMuYnJlYWtwb2ludClcbiAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIHR5cGVvZiBpdGVtRGF0YS54ID09PSAnbnVtYmVyJyAmJlxuICAgICAgICAgICAgdHlwZW9mIGl0ZW1EYXRhLnkgPT09ICdudW1iZXInICYmXG4gICAgICAgICAgICBpdGVtRGF0YS54ICsgaXRlbURhdGEudyA8PSBvcHRpb25zLmxhbmVzXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHVibGljIGZpbmREZWZhdWx0UG9zaXRpb25Ib3Jpem9udGFsKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XG4gICAgICAgIGZvciAoY29uc3QgY29sIG9mIHRoaXMuZ3JpZCkge1xuICAgICAgICAgICAgY29uc3QgY29sSWR4ID0gdGhpcy5ncmlkLmluZGV4T2YoY29sKTtcbiAgICAgICAgICAgIGxldCByb3dJZHggPSAwO1xuICAgICAgICAgICAgd2hpbGUgKHJvd0lkeCA8IGNvbC5sZW5ndGggLSBoZWlnaHQgKyAxKSB7XG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAhdGhpcy5jaGVja0l0ZW1zSW5BcmVhKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29sSWR4LFxuICAgICAgICAgICAgICAgICAgICAgICAgY29sSWR4ICsgd2lkdGggLSAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgcm93SWR4LFxuICAgICAgICAgICAgICAgICAgICAgICAgcm93SWR4ICsgaGVpZ2h0IC0gMVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbY29sSWR4LCByb3dJZHhdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByb3dJZHgrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW3RoaXMuZ3JpZC5sZW5ndGgsIDBdO1xuICAgIH1cblxuICAgIHB1YmxpYyBmaW5kRGVmYXVsdFBvc2l0aW9uVmVydGljYWwod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICAgICAgZm9yIChjb25zdCByb3cgb2YgdGhpcy5ncmlkKSB7XG4gICAgICAgICAgICBjb25zdCByb3dJZHggPSB0aGlzLmdyaWQuaW5kZXhPZihyb3cpO1xuICAgICAgICAgICAgbGV0IGNvbElkeCA9IDA7XG4gICAgICAgICAgICB3aGlsZSAoY29sSWR4IDwgcm93Lmxlbmd0aCAtIHdpZHRoICsgMSkge1xuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgIXRoaXMuY2hlY2tJdGVtc0luQXJlYShcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvd0lkeCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvd0lkeCArIGhlaWdodCAtIDEsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xJZHgsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xJZHggKyB3aWR0aCAtIDFcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW2NvbElkeCwgcm93SWR4XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29sSWR4Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFswLCB0aGlzLmdyaWQubGVuZ3RoXTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNoZWNrSXRlbXNJbkFyZWEoXG4gICAgICAgIHJvd1N0YXJ0OiBudW1iZXIsXG4gICAgICAgIHJvd0VuZDogbnVtYmVyLFxuICAgICAgICBjb2xTdGFydDogbnVtYmVyLFxuICAgICAgICBjb2xFbmQ6IG51bWJlcixcbiAgICAgICAgaXRlbT86IEdyaWRMaXN0SXRlbVxuICAgICkge1xuICAgICAgICBmb3IgKGxldCBpID0gcm93U3RhcnQ7IGkgPD0gcm93RW5kOyBpKyspIHtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSBjb2xTdGFydDsgaiA8PSBjb2xFbmQ7IGorKykge1xuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ncmlkW2ldICYmXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JpZFtpXVtqXSAmJlxuICAgICAgICAgICAgICAgICAgICAoaXRlbSA/IHRoaXMuZ3JpZFtpXVtqXSAhPT0gaXRlbSA6IHRydWUpXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzb3J0SXRlbXNCeVBvc2l0aW9uKCkge1xuICAgICAgICB0aGlzLml0ZW1zLnNvcnQoKGl0ZW0xLCBpdGVtMikgPT4ge1xuICAgICAgICAgICAgY29uc3QgcG9zaXRpb24xID0gdGhpcy5nZXRJdGVtUG9zaXRpb24oaXRlbTEpLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uMiA9IHRoaXMuZ2V0SXRlbVBvc2l0aW9uKGl0ZW0yKTtcblxuICAgICAgICAgICAgLy8gVHJ5IHRvIHByZXNlcnZlIGNvbHVtbnMuXG4gICAgICAgICAgICBpZiAocG9zaXRpb24xLnggIT09IHBvc2l0aW9uMi54KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBvc2l0aW9uMS54IC0gcG9zaXRpb24yLng7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChwb3NpdGlvbjEueSAhPT0gcG9zaXRpb24yLnkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcG9zaXRpb24xLnkgLSBwb3NpdGlvbjIueTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVGhlIGl0ZW1zIGFyZSBwbGFjZWQgb24gdGhlIHNhbWUgcG9zaXRpb24uXG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU29tZSBpdGVtcyBjYW4gaGF2ZSAxMDAlIGhlaWdodCBvciAxMDAlIHdpZHRoLiBUaG9zZSBkaW1tZW5zaW9ucyBhcmVcbiAgICAgKiBleHByZXNzZWQgYXMgMC4gV2UgbmVlZCB0byBlbnN1cmUgYSB2YWxpZCB3aWR0aCBhbmQgaGVpZ2h0IGZvciBlYWNoIG9mXG4gICAgICogdGhvc2UgaXRlbXMgYXMgdGhlIG51bWJlciBvZiBpdGVtcyBwZXIgbGFuZS5cbiAgICAgKi9cbiAgICBwcml2YXRlIGFkanVzdFNpemVPZkl0ZW1zKCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLml0ZW1zW2ldO1xuXG4gICAgICAgICAgICAvLyBUaGlzIGNhbiBoYXBwZW4gb25seSB0aGUgZmlyc3QgdGltZSBpdGVtcyBhcmUgY2hlY2tlZC5cbiAgICAgICAgICAgIC8vIFdlIG5lZWQgdGhlIHByb3BlcnR5IHRvIGhhdmUgYSB2YWx1ZSBmb3IgYWxsIHRoZSBpdGVtcyBzbyB0aGF0IHRoZVxuICAgICAgICAgICAgLy8gYGNsb25lSXRlbXNgIG1ldGhvZCB3aWxsIG1lcmdlIHRoZSBwcm9wZXJ0aWVzIHByb3Blcmx5LiBJZiB3ZSBvbmx5IHNldFxuICAgICAgICAgICAgLy8gaXQgdG8gdGhlIGl0ZW1zIHRoYXQgbmVlZCBpdCB0aGVuIHRoZSBmb2xsb3dpbmcgY2FuIGhhcHBlbjpcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBjbG9uZUl0ZW1zKFt7aWQ6IDEsIGF1dG9TaXplOiB0cnVlfSwge2lkOiAyfV0sXG4gICAgICAgICAgICAvLyAgICAgICAgICAgIFt7aWQ6IDJ9LCB7aWQ6IDEsIGF1dG9TaXplOiB0cnVlfV0pO1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIHdpbGwgcmVzdWx0IGluXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gW3tpZDogMSwgYXV0b1NpemU6IHRydWV9LCB7aWQ6IDIsIGF1dG9TaXplOiB0cnVlfV1cbiAgICAgICAgICAgIGlmIChpdGVtLmF1dG9TaXplID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBpdGVtLmF1dG9TaXplID0gaXRlbS53ID09PSAwIHx8IGl0ZW0uaCA9PT0gMDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGl0ZW0uYXV0b1NpemUpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRpcmVjdGlvbiA9PT0gJ2hvcml6b250YWwnKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uaCA9IHRoaXMub3B0aW9ucy5sYW5lcztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpdGVtLncgPSB0aGlzLm9wdGlvbnMubGFuZXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZXNldEdyaWQoKSB7XG4gICAgICAgIHRoaXMuZ3JpZCA9IFtdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIHRoYXQgYW4gaXRlbSB3b3VsZG4ndCBvdmVybGFwIHdpdGggYW5vdGhlciBvbmUgaWYgcGxhY2VkIGF0IGFcbiAgICAgKiBjZXJ0YWluIHBvc2l0aW9uIHdpdGhpbiB0aGUgZ3JpZFxuICAgICAqL1xuICAgIHByaXZhdGUgaXRlbUZpdHNBdFBvc2l0aW9uKGl0ZW06IEdyaWRMaXN0SXRlbSwgbmV3UG9zaXRpb246IFtudW1iZXIsIG51bWJlcl0pIHtcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLmdldEl0ZW1Qb3NpdGlvbihpdGVtKTtcbiAgICAgICAgbGV0IHgsIHk7XG5cbiAgICAgICAgLy8gTm8gY29vcmRvbmF0ZSBjYW4gYmUgbmVnYXRpdmVcbiAgICAgICAgaWYgKG5ld1Bvc2l0aW9uWzBdIDwgMCB8fCBuZXdQb3NpdGlvblsxXSA8IDApIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgaXRlbSBpc24ndCBsYXJnZXIgdGhhbiB0aGUgZW50aXJlIGdyaWRcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgbmV3UG9zaXRpb25bMV0gKyBNYXRoLm1pbihwb3NpdGlvbi5oLCB0aGlzLm9wdGlvbnMubGFuZXMpID5cbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5sYW5lc1xuICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmlzT3ZlckZpeGVkQXJlYShpdGVtLngsIGl0ZW0ueSwgaXRlbS53LCBpdGVtLmgpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIHBvc2l0aW9uIGRvZXNuJ3Qgb3ZlcmxhcCB3aXRoIGFuIGFscmVhZHkgcG9zaXRpb25lZFxuICAgICAgICAvLyBpdGVtLlxuICAgICAgICBmb3IgKHggPSBuZXdQb3NpdGlvblswXTsgeCA8IG5ld1Bvc2l0aW9uWzBdICsgcG9zaXRpb24udzsgeCsrKSB7XG4gICAgICAgICAgICBjb25zdCBjb2wgPSB0aGlzLmdyaWRbeF07XG4gICAgICAgICAgICAvLyBTdXJlbHkgYSBjb2x1bW4gdGhhdCBoYXNuJ3QgZXZlbiBiZWVuIGNyZWF0ZWQgeWV0IGlzIGF2YWlsYWJsZVxuICAgICAgICAgICAgaWYgKCFjb2wpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh5ID0gbmV3UG9zaXRpb25bMV07IHkgPCBuZXdQb3NpdGlvblsxXSArIHBvc2l0aW9uLmg7IHkrKykge1xuICAgICAgICAgICAgICAgIC8vIEFueSBzcGFjZSBvY2N1cGllZCBieSBhbiBpdGVtIGNhbiBjb250aW51ZSB0byBiZSBvY2N1cGllZCBieSB0aGVcbiAgICAgICAgICAgICAgICAvLyBzYW1lIGl0ZW0uXG4gICAgICAgICAgICAgICAgaWYgKGNvbFt5XSAmJiBjb2xbeV0gIT09IGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgdXBkYXRlSXRlbVBvc2l0aW9uKGl0ZW06IEdyaWRMaXN0SXRlbSwgcG9zaXRpb246IFtudW1iZXIsIG51bWJlcl0pIHtcbiAgICAgICAgaWYgKGl0ZW0ueCAhPT0gbnVsbCAmJiBpdGVtLnkgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlSXRlbVBvc2l0aW9uRnJvbUdyaWQoaXRlbSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldEl0ZW1Qb3NpdGlvbihpdGVtLCBwb3NpdGlvbik7XG5cbiAgICAgICAgdGhpcy5tYXJrSXRlbVBvc2l0aW9uVG9HcmlkKGl0ZW0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSBPYmplY3QgaXRlbSBBIHJlZmVyZW5jZSB0byBhIGdyaWQgaXRlbS5cbiAgICAgKiBAcGFyYW0gbnVtYmVyIHdpZHRoIFRoZSBuZXcgd2lkdGguXG4gICAgICogQHBhcmFtIG51bWJlciBoZWlnaHQgVGhlIG5ldyBoZWlnaHQuXG4gICAgICovXG4gICAgcHJpdmF0ZSB1cGRhdGVJdGVtU2l6ZShpdGVtOiBHcmlkTGlzdEl0ZW0sIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XG4gICAgICAgIGlmIChpdGVtLnggIT09IG51bGwgJiYgaXRlbS55ICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmRlbGV0ZUl0ZW1Qb3NpdGlvbkZyb21HcmlkKGl0ZW0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaXRlbS53ID0gd2lkdGg7XG4gICAgICAgIGl0ZW0uaCA9IGhlaWdodDtcblxuICAgICAgICB0aGlzLm1hcmtJdGVtUG9zaXRpb25Ub0dyaWQoaXRlbSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWFyayB0aGUgZ3JpZCBjZWxscyB0aGF0IGFyZSBvY2N1cGllZCBieSBhbiBpdGVtLiBUaGlzIHByZXZlbnRzIGl0ZW1zXG4gICAgICogZnJvbSBvdmVybGFwcGluZyBpbiB0aGUgZ3JpZFxuICAgICAqL1xuICAgIHByaXZhdGUgbWFya0l0ZW1Qb3NpdGlvblRvR3JpZChpdGVtOiBHcmlkTGlzdEl0ZW0pIHtcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLmdldEl0ZW1Qb3NpdGlvbihpdGVtKTtcbiAgICAgICAgbGV0IHgsIHk7XG5cbiAgICAgICAgLy8gRW5zdXJlIHRoYXQgdGhlIGdyaWQgaGFzIGVub3VnaCBjb2x1bW5zIHRvIGFjY29tb2RhdGUgdGhlIGN1cnJlbnQgaXRlbS5cbiAgICAgICAgdGhpcy5lbnN1cmVDb2x1bW5zKHBvc2l0aW9uLnggKyBwb3NpdGlvbi53KTtcblxuICAgICAgICBmb3IgKHggPSBwb3NpdGlvbi54OyB4IDwgcG9zaXRpb24ueCArIHBvc2l0aW9uLnc7IHgrKykge1xuICAgICAgICAgICAgZm9yICh5ID0gcG9zaXRpb24ueTsgeSA8IHBvc2l0aW9uLnkgKyBwb3NpdGlvbi5oOyB5KyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdyaWRbeF1beV0gPSBpdGVtO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRW5zdXJlIHRoYXQgdGhlIGdyaWQgaGFzIGF0IGxlYXN0IE4gY29sdW1ucyBhdmFpbGFibGUuXG4gICAgICovXG4gICAgcHJpdmF0ZSBlbnN1cmVDb2x1bW5zKE46IG51bWJlcikge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IE47IGkrKykge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmdyaWRbaV0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdyaWQucHVzaChtYWtlR3JpZENvbCh0aGlzLm9wdGlvbnMubGFuZXMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0SXRlbXNDb2xsaWRpbmdXaXRoSXRlbShpdGVtOiBHcmlkTGlzdEl0ZW0pOiBudW1iZXJbXSB7XG4gICAgICAgIGNvbnN0IGNvbGxpZGluZ0l0ZW1zID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5pdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIGl0ZW0gIT09IHRoaXMuaXRlbXNbaV0gJiZcbiAgICAgICAgICAgICAgICB0aGlzLml0ZW1zQXJlQ29sbGlkaW5nKGl0ZW0sIHRoaXMuaXRlbXNbaV0pXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBjb2xsaWRpbmdJdGVtcy5wdXNoKGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb2xsaWRpbmdJdGVtcztcbiAgICB9XG5cbiAgICBwcml2YXRlIGl0ZW1zQXJlQ29sbGlkaW5nKGl0ZW0xOiBHcmlkTGlzdEl0ZW0sIGl0ZW0yOiBHcmlkTGlzdEl0ZW0pIHtcbiAgICAgICAgY29uc3QgcG9zaXRpb24xID0gdGhpcy5nZXRJdGVtUG9zaXRpb24oaXRlbTEpLFxuICAgICAgICAgICAgcG9zaXRpb24yID0gdGhpcy5nZXRJdGVtUG9zaXRpb24oaXRlbTIpO1xuXG4gICAgICAgIHJldHVybiAhKFxuICAgICAgICAgICAgcG9zaXRpb24yLnggPj0gcG9zaXRpb24xLnggKyBwb3NpdGlvbjEudyB8fFxuICAgICAgICAgICAgcG9zaXRpb24yLnggKyBwb3NpdGlvbjIudyA8PSBwb3NpdGlvbjEueCB8fFxuICAgICAgICAgICAgcG9zaXRpb24yLnkgPj0gcG9zaXRpb24xLnkgKyBwb3NpdGlvbjEuaCB8fFxuICAgICAgICAgICAgcG9zaXRpb24yLnkgKyBwb3NpdGlvbjIuaCA8PSBwb3NpdGlvbjEueVxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEF0dGVtcHQgdG8gcmVzb2x2ZSB0aGUgY29sbGlzaW9ucyBhZnRlciBtb3ZpbmcgYW4gaXRlbSBvdmVyIG9uZSBvciBtb3JlXG4gICAgICogb3RoZXIgaXRlbXMgd2l0aGluIHRoZSBncmlkLCBieSBzaGlmdGluZyB0aGUgcG9zaXRpb24gb2YgdGhlIGNvbGxpZGluZ1xuICAgICAqIGl0ZW1zIGFyb3VuZCB0aGUgbW92aW5nIG9uZS4gVGhpcyBtaWdodCByZXN1bHQgaW4gc3Vic2VxdWVudCBjb2xsaXNpb25zLFxuICAgICAqIGluIHdoaWNoIGNhc2Ugd2Ugd2lsbCByZXZlcnQgYWxsIHBvc2l0aW9uIHBlcm11dGF0aW9ucy4gVG8gYmUgYWJsZSB0b1xuICAgICAqIHJldmVydCB0byB0aGUgaW5pdGlhbCBpdGVtIHBvc2l0aW9ucywgd2UgY3JlYXRlIGEgdmlydHVhbCBncmlkIGluIHRoZVxuICAgICAqIHByb2Nlc3NcbiAgICAgKi9cbiAgICBwcml2YXRlIHRyeVRvUmVzb2x2ZUNvbGxpc2lvbnNMb2NhbGx5KGl0ZW06IEdyaWRMaXN0SXRlbSkge1xuICAgICAgICBjb25zdCBjb2xsaWRpbmdJdGVtcyA9IHRoaXMuZ2V0SXRlbXNDb2xsaWRpbmdXaXRoSXRlbShpdGVtKTtcbiAgICAgICAgaWYgKCFjb2xsaWRpbmdJdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgX2dyaWRMaXN0ID0gbmV3IEdyaWRMaXN0KFxuICAgICAgICAgICAgdGhpcy5pdGVtcy5tYXAoaXRtID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRtLmNvcHkoKTtcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgdGhpcy5vcHRpb25zXG4gICAgICAgICk7XG5cbiAgICAgICAgbGV0IGxlZnRPZkl0ZW06IFtudW1iZXIsIG51bWJlcl07XG4gICAgICAgIGxldCByaWdodE9mSXRlbTogW251bWJlciwgbnVtYmVyXTtcbiAgICAgICAgbGV0IGFib3ZlT2ZJdGVtOiBbbnVtYmVyLCBudW1iZXJdO1xuICAgICAgICBsZXQgYmVsb3dPZkl0ZW06IFtudW1iZXIsIG51bWJlcl07XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2xsaWRpbmdJdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgY29sbGlkaW5nSXRlbSA9IF9ncmlkTGlzdC5pdGVtc1tjb2xsaWRpbmdJdGVtc1tpXV0sXG4gICAgICAgICAgICAgICAgY29sbGlkaW5nUG9zaXRpb24gPSB0aGlzLmdldEl0ZW1Qb3NpdGlvbihjb2xsaWRpbmdJdGVtKTtcblxuICAgICAgICAgICAgLy8gV2UgdXNlIGEgc2ltcGxlIGFsZ29yaXRobSBmb3IgbW92aW5nIGl0ZW1zIGFyb3VuZCB3aGVuIGNvbGxpc2lvbnMgb2NjdXI6XG4gICAgICAgICAgICAvLyBJbiB0aGlzIHByaW9yaXRpemVkIG9yZGVyLCB3ZSB0cnkgdG8gbW92ZSBhIGNvbGxpZGluZyBpdGVtIGFyb3VuZCB0aGVcbiAgICAgICAgICAgIC8vIG1vdmluZyBvbmU6XG4gICAgICAgICAgICAvLyAxLiB0byBpdHMgbGVmdCBzaWRlXG4gICAgICAgICAgICAvLyAyLiBhYm92ZSBpdFxuICAgICAgICAgICAgLy8gMy4gdW5kZXIgaXRcbiAgICAgICAgICAgIC8vIDQuIHRvIGl0cyByaWdodCBzaWRlXG4gICAgICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuZ2V0SXRlbVBvc2l0aW9uKGl0ZW0pO1xuXG4gICAgICAgICAgICBsZWZ0T2ZJdGVtID0gW1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uLnggLSBjb2xsaWRpbmdQb3NpdGlvbi53LFxuICAgICAgICAgICAgICAgIGNvbGxpZGluZ1Bvc2l0aW9uLnlcbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICByaWdodE9mSXRlbSA9IFtwb3NpdGlvbi54ICsgcG9zaXRpb24udywgY29sbGlkaW5nUG9zaXRpb24ueV07XG4gICAgICAgICAgICBhYm92ZU9mSXRlbSA9IFtcbiAgICAgICAgICAgICAgICBjb2xsaWRpbmdQb3NpdGlvbi54LFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uLnkgLSBjb2xsaWRpbmdQb3NpdGlvbi5oXG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgYmVsb3dPZkl0ZW0gPSBbY29sbGlkaW5nUG9zaXRpb24ueCwgcG9zaXRpb24ueSArIHBvc2l0aW9uLmhdO1xuXG4gICAgICAgICAgICBpZiAoX2dyaWRMaXN0Lml0ZW1GaXRzQXRQb3NpdGlvbihjb2xsaWRpbmdJdGVtLCBsZWZ0T2ZJdGVtKSkge1xuICAgICAgICAgICAgICAgIF9ncmlkTGlzdC51cGRhdGVJdGVtUG9zaXRpb24oY29sbGlkaW5nSXRlbSwgbGVmdE9mSXRlbSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgIF9ncmlkTGlzdC5pdGVtRml0c0F0UG9zaXRpb24oY29sbGlkaW5nSXRlbSwgYWJvdmVPZkl0ZW0pXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBfZ3JpZExpc3QudXBkYXRlSXRlbVBvc2l0aW9uKGNvbGxpZGluZ0l0ZW0sIGFib3ZlT2ZJdGVtKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgX2dyaWRMaXN0Lml0ZW1GaXRzQXRQb3NpdGlvbihjb2xsaWRpbmdJdGVtLCBiZWxvd09mSXRlbSlcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIF9ncmlkTGlzdC51cGRhdGVJdGVtUG9zaXRpb24oY29sbGlkaW5nSXRlbSwgYmVsb3dPZkl0ZW0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICBfZ3JpZExpc3QuaXRlbUZpdHNBdFBvc2l0aW9uKGNvbGxpZGluZ0l0ZW0sIHJpZ2h0T2ZJdGVtKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgX2dyaWRMaXN0LnVwZGF0ZUl0ZW1Qb3NpdGlvbihjb2xsaWRpbmdJdGVtLCByaWdodE9mSXRlbSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIENvbGxpc2lvbnMgZmFpbGVkLCB3ZSBtdXN0IHVzZSB0aGUgcHVsbEl0ZW1zVG9MZWZ0IG1ldGhvZCB0byBhcnJhbmdlXG4gICAgICAgICAgICAgICAgLy8gdGhlIG90aGVyIGl0ZW1zIGFyb3VuZCB0aGlzIGl0ZW0gd2l0aCBmaXhlZCBwb3NpdGlvbi4gVGhpcyBpcyBvdXJcbiAgICAgICAgICAgICAgICAvLyBwbGFuIEIgZm9yIHdoZW4gbG9jYWwgY29sbGlzaW9uIHJlc29sdmluZyBmYWlscy5cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgd2UgcmVhY2hlZCB0aGlzIHBvaW50IGl0IG1lYW5zIHdlIG1hbmFnZWQgdG8gcmVzb2x2ZSB0aGUgY29sbGlzaW9uc1xuICAgICAgICAvLyBmcm9tIG9uZSBzaW5nbGUgaXRlcmF0aW9uLCBqdXN0IGJ5IG1vdmluZyB0aGUgY29sbGlkaW5nIGl0ZW1zIGFyb3VuZC4gU29cbiAgICAgICAgLy8gd2UgYWNjZXB0IHRoaXMgc2NlbmFyaW8gYW5kIG1lcmdlIHRoZSBicmFuY2hlZC1vdXQgZ3JpZCBpbnN0YW5jZSBpbnRvIHRoZVxuICAgICAgICAvLyBvcmlnaW5hbCBvbmVcblxuICAgICAgICB0aGlzLml0ZW1zLmZvckVhY2goKGl0bTogR3JpZExpc3RJdGVtLCBpZHg6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgY29uc3QgY2FjaGVkSXRlbSA9IF9ncmlkTGlzdC5pdGVtcy5maWx0ZXIoY2FjaGVkSXRtID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FjaGVkSXRtLiRlbGVtZW50ID09PSBpdG0uJGVsZW1lbnQ7XG4gICAgICAgICAgICB9KVswXTtcblxuICAgICAgICAgICAgaXRtLnggPSBjYWNoZWRJdGVtLng7XG4gICAgICAgICAgICBpdG0ueSA9IGNhY2hlZEl0ZW0ueTtcbiAgICAgICAgICAgIGl0bS53ID0gY2FjaGVkSXRlbS53O1xuICAgICAgICAgICAgaXRtLmggPSBjYWNoZWRJdGVtLmg7XG4gICAgICAgICAgICBpdG0uYXV0b1NpemUgPSBjYWNoZWRJdGVtLmF1dG9TaXplO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5nZW5lcmF0ZUdyaWQoKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2hlbiBwdWxsaW5nIGl0ZW1zIHRvIHRoZSBsZWZ0LCB3ZSBuZWVkIHRvIGZpbmQgdGhlIGxlZnRtb3N0IHBvc2l0aW9uIGZvclxuICAgICAqIGFuIGl0ZW0sIHdpdGggdHdvIGNvbnNpZGVyYXRpb25zIGluIG1pbmQ6XG4gICAgICogLSBwcmVzZXJ2aW5nIGl0cyBjdXJyZW50IHJvd1xuICAgICAqIC0gcHJlc2VydmluZyB0aGUgcHJldmlvdXMgaG9yaXpvbnRhbCBvcmRlciBiZXR3ZWVuIGl0ZW1zXG4gICAgICovXG4gICAgcHJpdmF0ZSBmaW5kTGVmdE1vc3RQb3NpdGlvbkZvckl0ZW0oaXRlbTogYW55KSB7XG4gICAgICAgIGxldCB0YWlsID0gMDtcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLmdldEl0ZW1Qb3NpdGlvbihpdGVtKTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZ3JpZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IHBvc2l0aW9uLnk7IGogPCBwb3NpdGlvbi55ICsgcG9zaXRpb24uaDsgaisrKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgb3RoZXJJdGVtID0gdGhpcy5ncmlkW2ldW2pdO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFvdGhlckl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3Qgb3RoZXJQb3NpdGlvbiA9IHRoaXMuZ2V0SXRlbVBvc2l0aW9uKG90aGVySXRlbSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pdGVtcy5pbmRleE9mKG90aGVySXRlbSkgPCB0aGlzLml0ZW1zLmluZGV4T2YoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFpbCA9IG90aGVyUG9zaXRpb24ueCArIG90aGVyUG9zaXRpb24udztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGFpbDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZmluZEl0ZW1CeVBvc2l0aW9uKHg6IG51bWJlciwgeTogbnVtYmVyKTogR3JpZExpc3RJdGVtIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLml0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5pdGVtc1tpXS54ID09PSB4ICYmIHRoaXMuaXRlbXNbaV0ueSA9PT0geSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLml0ZW1zW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGdldEl0ZW1CeUF0dHJpYnV0ZShrZXk6IGtleW9mIEdyaWRMaXN0SXRlbSwgdmFsdWU6IGFueSkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzLml0ZW1zW2ldW2tleV0gPT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaXRlbXNbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwYWROdW1iZXIobnI6IG51bWJlciwgcHJlZml4OiBzdHJpbmcpIHtcbiAgICAgICAgLy8gQ3VycmVudGx5IHdvcmtzIGZvciAyLWRpZ2l0IG51bWJlcnMgKDwxMDApXG4gICAgICAgIHJldHVybiBuciA+PSAxMCA/IG5yIDogcHJlZml4ICsgbnI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSWYgdGhlIGRpcmVjdGlvbiBpcyB2ZXJ0aWNhbCB3ZSBuZWVkIHRvIHJvdGF0ZSB0aGUgZ3JpZCA5MCBkZWcgdG8gdGhlXG4gICAgICogbGVmdC4gVGh1cywgd2Ugc2ltdWxhdGUgdGhlIGZhY3QgdGhhdCBpdGVtcyBhcmUgYmVpbmcgcHVsbGVkIHRvIHRoZSB0b3AuXG4gICAgICpcbiAgICAgKiBTaW5jZSB0aGUgaXRlbXMgaGF2ZSB3aWR0aHMgYW5kIGhlaWdodHMsIGlmIHdlIGFwcGx5IHRoZSBjbGFzc2ljXG4gICAgICogY291bnRlci1jbG9ja3dpc2UgOTAgZGVnIHJvdGF0aW9uXG4gICAgICpcbiAgICAgKiAgICAgWzAgLTFdXG4gICAgICogICAgIFsxICAwXVxuICAgICAqXG4gICAgICogdGhlbiB0aGUgdG9wIGxlZnQgcG9pbnQgb2YgYW4gaXRlbSB3aWxsIGJlY29tZSB0aGUgYm90dG9tIGxlZnQgcG9pbnQgb2ZcbiAgICAgKiB0aGUgcm90YXRlZCBpdGVtLiBUbyBhZGp1c3QgZm9yIHRoaXMsIHdlIG5lZWQgdG8gc3VidHJhY3QgZnJvbSB0aGUgeVxuICAgICAqIHBvc2l0aW9uIHRoZSBoZWlnaHQgb2YgdGhlIG9yaWdpbmFsIGl0ZW0gLSB0aGUgd2lkdGggb2YgdGhlIHJvdGF0ZWQgaXRlbS5cbiAgICAgKlxuICAgICAqIEhvd2V2ZXIsIGlmIHdlIGRvIHRoaXMgdGhlbiB3ZSdsbCByZXZlcnNlIHNvbWUgYWN0aW9uczogcmVzaXppbmcgdGhlXG4gICAgICogd2lkdGggb2YgYW4gaXRlbSB3aWxsIHN0cmV0Y2ggdGhlIGl0ZW0gdG8gdGhlIGxlZnQgaW5zdGVhZCBvZiB0byB0aGVcbiAgICAgKiByaWdodDsgcmVzaXppbmcgYW4gaXRlbSB0aGF0IGRvZXNuJ3QgZml0IGludG8gdGhlIGdyaWQgd2lsbCBwdXNoIHRoZVxuICAgICAqIGl0ZW1zIGFyb3VuZCBpdCBpbnN0ZWFkIG9mIGdvaW5nIG9uIGEgbmV3IHJvdywgZXRjLlxuICAgICAqXG4gICAgICogV2UgZm91bmQgaXQgYmV0dGVyIHRvIGRvIGEgdmVydGljYWwgZmxpcCBvZiB0aGUgZ3JpZCBhZnRlciByb3RhdGluZyBpdC5cbiAgICAgKiBUaGlzIHJlc3RvcmVzIHRoZSBkaXJlY3Rpb24gb2YgdGhlIGFjdGlvbnMgYW5kIGdyZWF0bHkgc2ltcGxpZmllcyB0aGVcbiAgICAgKiB0cmFuc2Zvcm1hdGlvbnMuXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRJdGVtUG9zaXRpb24oaXRlbTogYW55KTogeyB4OiBudW1iZXIsIHk6IG51bWJlciwgdzogbnVtYmVyLCBoOiBudW1iZXIgfSB7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZGlyZWN0aW9uID09PSAnaG9yaXpvbnRhbCcpIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB4OiBpdGVtLnksXG4gICAgICAgICAgICAgICAgeTogaXRlbS54LFxuICAgICAgICAgICAgICAgIHc6IGl0ZW0uaCxcbiAgICAgICAgICAgICAgICBoOiBpdGVtLndcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZWUgZ2V0SXRlbVBvc2l0aW9uLlxuICAgICAqL1xuICAgIHByaXZhdGUgc2V0SXRlbVBvc2l0aW9uKGl0ZW06IGFueSwgcG9zaXRpb246IFtudW1iZXIsIG51bWJlcl0pIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kaXJlY3Rpb24gPT09ICdob3Jpem9udGFsJykge1xuICAgICAgICAgICAgaXRlbS54ID0gcG9zaXRpb25bMF07XG4gICAgICAgICAgICBpdGVtLnkgPSBwb3NpdGlvblsxXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFdlJ3JlIHN1cHBvc2VkIHRvIHN1YnRyYWN0IHRoZSByb3RhdGVkIGl0ZW0ncyBoZWlnaHQgd2hpY2ggaXMgYWN0dWFsbHlcbiAgICAgICAgICAgIC8vIHRoZSBub24tcm90YXRlZCBpdGVtJ3Mgd2lkdGguXG4gICAgICAgICAgICBpdGVtLnggPSBwb3NpdGlvblsxXTtcbiAgICAgICAgICAgIGl0ZW0ueSA9IHBvc2l0aW9uWzBdO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19