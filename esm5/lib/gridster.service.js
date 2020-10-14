import { __decorate, __metadata, __values } from "tslib";
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { GridList } from './gridList/gridList';
var GridsterService = /** @class */ (function () {
    function GridsterService() {
        var _this = this;
        this.items = [];
        this._items = [];
        this._itemsMap = {};
        this.disabledItems = [];
        this.debounceRenderSubject = new Subject();
        this.itemRemoveSubject = new Subject();
        this.isInit = false;
        this.itemRemoveSubject.pipe(debounceTime(0)).subscribe(function () {
            _this.gridList.pullItemsToLeft();
            _this.render();
            _this.updateCachedItems();
        });
        this.debounceRenderSubject.pipe(debounceTime(0)).subscribe(function () { return _this.render(); });
    }
    GridsterService.prototype.isInitialized = function () {
        return this.isInit;
    };
    /**
     * Must be called before init
     * @param item
     */
    GridsterService.prototype.registerItem = function (item) {
        this.items.push(item);
        return item;
    };
    GridsterService.prototype.init = function (gridsterComponent) {
        this.gridsterComponent = gridsterComponent;
        this.draggableOptions = gridsterComponent.draggableOptions;
        this.gridsterOptions = gridsterComponent.gridsterOptions;
    };
    GridsterService.prototype.start = function () {
        var _this = this;
        this.updateMaxItemSize();
        // Used to highlight a position an element will land on upon drop
        if (this.$positionHighlight) {
            this.removePositionHighlight();
        }
        this.initGridList();
        this.isInit = true;
        setTimeout(function () {
            _this.copyItems();
            _this.fixItemsPositions();
            _this.gridsterComponent.reflowGridster(true);
            _this.gridsterComponent.setReady();
        });
    };
    GridsterService.prototype.initGridList = function () {
        // Create instance of GridList (decoupled lib for handling the grid
        // positioning and sorting post-drag and dropping)
        this.gridList = new GridList(this.items, this.options);
    };
    GridsterService.prototype.render = function () {
        this.updateMaxItemSize();
        this.gridList.generateGrid();
        this.applySizeToItems();
        this.applyPositionToItems();
        this.refreshLines();
    };
    GridsterService.prototype.reflow = function () {
        this.calculateCellSize();
        this.render();
    };
    GridsterService.prototype.fixItemsPositions = function () {
        var _this = this;
        if (this.options.responsiveSizes) {
            this.gridList.fixItemsPositions(this.options);
        }
        else {
            this.gridList.fixItemsPositions(this.gridsterOptions.basicOptions);
            this.gridsterOptions.responsiveOptions.forEach(function (options) {
                _this.gridList.fixItemsPositions(options);
            });
        }
        this.updateCachedItems();
    };
    GridsterService.prototype.removeItem = function (item) {
        var idx = this.items.indexOf(item);
        if (idx >= 0) {
            this.items.splice(this.items.indexOf(item), 1);
        }
        this.gridList.deleteItemPositionFromGrid(item);
        this.removeItemFromCache(item);
    };
    GridsterService.prototype.onResizeStart = function (item) {
        this.currentElement = item.$element;
        this.copyItems();
        this._maxGridCols = this.gridList.grid.length;
        this.highlightPositionForItem(item);
        this.gridsterComponent.isResizing = true;
        this.refreshLines();
    };
    GridsterService.prototype.onResizeDrag = function (item) {
        var newSize = this.snapItemSizeToGrid(item);
        var sizeChanged = this.dragSizeChanged(newSize);
        var newPosition = this.snapItemPositionToGrid(item);
        var positionChanged = this.dragPositionChanged(newPosition);
        if (sizeChanged || positionChanged) {
            // Regenerate the grid with the positions from when the drag started
            this.restoreCachedItems();
            this.gridList.generateGrid();
            this.previousDragPosition = newPosition;
            this.previousDragSize = newSize;
            this.gridList.moveAndResize(item, newPosition, { w: newSize[0], h: newSize[1] });
            // Visually update item positions and highlight shape
            this.applyPositionToItems(true);
            this.applySizeToItems();
            this.highlightPositionForItem(item);
            this.refreshLines();
        }
    };
    GridsterService.prototype.onResizeStop = function (item) {
        this.currentElement = undefined;
        this.updateCachedItems();
        this.previousDragSize = null;
        this.removePositionHighlight();
        this.gridsterComponent.isResizing = false;
        this.gridList.pullItemsToLeft(item);
        this.debounceRenderSubject.next();
        this.fixItemsPositions();
    };
    GridsterService.prototype.onStart = function (item) {
        this.currentElement = item.$element;
        // itemCtrl.isDragging = true;
        // Create a deep copy of the items; we use them to revert the item
        // positions after each drag change, making an entire drag operation less
        // distructable
        this.copyItems();
        // Since dragging actually alters the grid, we need to establish the number
        // of cols (+1 extra) before the drag starts
        this._maxGridCols = this.gridList.grid.length;
        this.gridsterComponent.isDragging = true;
        this.gridsterComponent.updateGridsterElementData();
        this.refreshLines();
    };
    GridsterService.prototype.onDrag = function (item) {
        var newPosition = this.snapItemPositionToGrid(item);
        if (this.dragPositionChanged(newPosition)) {
            // Regenerate the grid with the positions from when the drag started
            this.restoreCachedItems();
            this.gridList.generateGrid();
            this.previousDragPosition = newPosition;
            if (this.options.direction === 'none' &&
                !this.gridList.checkItemAboveEmptyArea(item, { x: newPosition[0], y: newPosition[1] })) {
                return;
            }
            // Since the items list is a deep copy, we need to fetch the item
            // corresponding to this drag action again
            this.gridList.moveItemToPosition(item, newPosition);
            // Visually update item positions and highlight shape
            this.applyPositionToItems(true);
            this.highlightPositionForItem(item);
        }
    };
    GridsterService.prototype.cancel = function () {
        this.restoreCachedItems();
        this.previousDragPosition = null;
        this.updateMaxItemSize();
        this.applyPositionToItems();
        this.removePositionHighlight();
        this.currentElement = undefined;
        this.gridsterComponent.isDragging = false;
    };
    GridsterService.prototype.onDragOut = function (item) {
        this.cancel();
        var idx = this.items.indexOf(item);
        if (idx >= 0) {
            this.items.splice(idx, 1);
        }
        this.gridList.pullItemsToLeft();
        this.render();
    };
    GridsterService.prototype.onStop = function (item) {
        this.currentElement = undefined;
        this.updateCachedItems();
        this.previousDragPosition = null;
        this.removePositionHighlight();
        this.gridList.pullItemsToLeft(item);
        this.gridsterComponent.isDragging = false;
        this.refreshLines();
    };
    GridsterService.prototype.calculateCellSize = function () {
        if (this.options.direction === 'horizontal') {
            this.cellHeight = this.calculateCellHeight();
            this.cellWidth = this.options.cellWidth || this.cellHeight * this.options.widthHeightRatio;
        }
        else {
            this.cellWidth = this.calculateCellWidth();
            this.cellHeight = this.options.cellHeight || this.cellWidth / this.options.widthHeightRatio;
        }
        if (this.options.heightToFontSizeRatio) {
            this._fontSize = this.cellHeight * this.options.heightToFontSizeRatio;
        }
    };
    GridsterService.prototype.applyPositionToItems = function (increaseGridsterSize) {
        if (!this.options.shrink) {
            increaseGridsterSize = true;
        }
        // TODO: Implement group separators
        for (var i = 0; i < this.items.length; i++) {
            // Don't interfere with the positions of the dragged items
            if (this.isCurrentElement(this.items[i].$element)) {
                continue;
            }
            this.items[i].applyPosition(this);
        }
        var child = this.gridsterComponent.$element.firstChild;
        // Update the width of the entire grid container with enough room on the
        // right to allow dragging items to the end of the grid.
        if (this.options.direction === 'horizontal') {
            var increaseWidthWith = (increaseGridsterSize) ? this.maxItemWidth : 0;
            child.style.height = '';
            child.style.width = ((this.gridList.grid.length + increaseWidthWith) * this.cellWidth) + 'px';
        }
        else if (this.gridList.grid.length) {
            // todo: fix me
            var rowHeights = this.getRowHeights();
            var rowTops = this.getRowTops(rowHeights);
            var height = rowTops[rowTops.length - 1] + rowHeights[rowHeights.length - 1];
            var previousHeight = child.style.height;
            child.style.height = height + 'px';
            child.style.width = '';
            if (previousHeight !== child.style.height) {
                this.refreshLines();
            }
        }
    };
    GridsterService.prototype.getRowHeights = function () {
        var result = [];
        for (var row = 0; row < this.gridList.grid.length; row++) {
            result.push(0);
            for (var column = 0; column < this.gridList.grid[row].length; column++) {
                var item = this.gridList.grid[row][column];
                if (item) {
                    var height = item.contentHeight / item.h;
                    if (item.variableHeight && height > result[row]) {
                        result[row] = height;
                    }
                }
            }
            if (result[row] === 0) {
                result[row] = this.cellHeight;
            }
        }
        return result;
    };
    GridsterService.prototype.getRowTops = function (rowHeights) {
        var e_1, _a;
        var result = [];
        var lastHeight = 0;
        try {
            for (var rowHeights_1 = __values(rowHeights), rowHeights_1_1 = rowHeights_1.next(); !rowHeights_1_1.done; rowHeights_1_1 = rowHeights_1.next()) {
                var rowHeight = rowHeights_1_1.value;
                result.push(lastHeight);
                lastHeight += rowHeight;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (rowHeights_1_1 && !rowHeights_1_1.done && (_a = rowHeights_1.return)) _a.call(rowHeights_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return result;
    };
    GridsterService.prototype.refreshLines = function () {
        var canvas = this.gridsterComponent.$backgroundGrid.nativeElement;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        var canvasContext = canvas.getContext('2d');
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        if (this.options.lines && this.options.lines.visible &&
            (this.gridsterComponent.isDragging || this.gridsterComponent.isResizing || this.options.lines.always)) {
            var linesColor = this.options.lines.color || '#d8d8d8';
            var linesBgColor = this.options.lines.backgroundColor || 'transparent';
            var linesWidth = this.options.lines.width || 1;
            canvasContext.fillStyle = linesBgColor;
            canvasContext.fillRect(0, 0, canvas.width, canvas.height);
            canvasContext.strokeStyle = linesColor;
            canvasContext.lineWidth = linesWidth;
            canvasContext.beginPath();
            // draw row lines
            var rowHeights = this.getRowHeights();
            var rowTops = this.getRowTops(rowHeights);
            for (var i = 0; i < rowTops.length; i++) {
                canvasContext.moveTo(0, rowTops[i]);
                canvasContext.lineTo(canvas.width, rowTops[i]);
            }
            // draw column lines
            for (var i = 0; i < this.options.lanes; i++) {
                canvasContext.moveTo(i * this.cellWidth, 0);
                canvasContext.lineTo(i * this.cellWidth, canvas.height);
            }
            canvasContext.stroke();
            canvasContext.closePath();
        }
    };
    GridsterService.prototype.removeItemFromCache = function (item) {
        var _this = this;
        this._items = this._items
            .filter(function (cachedItem) { return cachedItem.$element !== item.$element; });
        Object.keys(this._itemsMap)
            .forEach(function (breakpoint) {
            _this._itemsMap[breakpoint] = _this._itemsMap[breakpoint]
                .filter(function (cachedItem) { return cachedItem.$element !== item.$element; });
        });
    };
    GridsterService.prototype.copyItems = function () {
        var _this = this;
        this._items = this.items
            .filter(function (item) { return _this.isValidGridItem(item); })
            .map(function (item) {
            return item.copyForBreakpoint(null);
        });
        this.gridsterOptions.responsiveOptions.forEach(function (options) {
            _this._itemsMap[options.breakpoint] = _this.items
                .filter(function (item) { return _this.isValidGridItem(item); })
                .map(function (item) {
                return item.copyForBreakpoint(options.breakpoint);
            });
        });
    };
    /**
     * Update maxItemWidth and maxItemHeight vales according to current state of items
     */
    GridsterService.prototype.updateMaxItemSize = function () {
        this.maxItemWidth = Math.max.apply(null, this.items.map(function (item) {
            return item.w;
        }));
        this.maxItemHeight = Math.max.apply(null, this.items.map(function (item) {
            return item.h;
        }));
    };
    /**
     * Update items properties of previously cached items
     */
    GridsterService.prototype.restoreCachedItems = function () {
        var _this = this;
        var items = this.options.breakpoint ? this._itemsMap[this.options.breakpoint] : this._items;
        this.items
            .filter(function (item) { return _this.isValidGridItem(item); })
            .forEach(function (item) {
            var cachedItem = items.filter(function (cachedItm) {
                return cachedItm.$element === item.$element;
            })[0];
            item.x = cachedItem.x;
            item.y = cachedItem.y;
            item.w = cachedItem.w;
            item.h = cachedItem.h;
            item.autoSize = cachedItem.autoSize;
        });
    };
    /**
     * If item should react on grid
     * @param GridListItem item
     * @returns boolean
     */
    GridsterService.prototype.isValidGridItem = function (item) {
        if (this.options.direction === 'none') {
            return !!item.itemComponent;
        }
        return true;
    };
    GridsterService.prototype.calculateCellWidth = function () {
        var gridsterWidth = parseFloat(window.getComputedStyle(this.gridsterComponent.$element).width);
        return gridsterWidth / this.options.lanes;
    };
    GridsterService.prototype.calculateCellHeight = function () {
        var gridsterHeight = parseFloat(window.getComputedStyle(this.gridsterComponent.$element).height);
        return gridsterHeight / this.options.lanes;
    };
    GridsterService.prototype.applySizeToItems = function () {
        for (var i = 0; i < this.items.length; i++) {
            this.items[i].applySize();
            if (this.options.heightToFontSizeRatio) {
                this.items[i].$element.style['font-size'] = this._fontSize;
            }
        }
    };
    GridsterService.prototype.isCurrentElement = function (element) {
        if (!this.currentElement) {
            return false;
        }
        return element === this.currentElement;
    };
    GridsterService.prototype.snapItemSizeToGrid = function (item) {
        var itemSize = {
            width: parseInt(item.$element.style.width, 10) - 1,
            height: parseInt(item.$element.style.height, 10) - 1
        };
        var colSize = Math.round(itemSize.width / this.cellWidth);
        var rowSize = Math.round(itemSize.height / this.cellHeight);
        // Keep item minimum 1
        colSize = Math.max(colSize, 1);
        rowSize = Math.max(rowSize, 1);
        // check if element is pinned
        if (this.gridList.isOverFixedArea(item.x, item.y, colSize, rowSize, item)) {
            return [item.w, item.h];
        }
        return [colSize, rowSize];
    };
    GridsterService.prototype.generateItemPosition = function (item) {
        var position;
        if (item.itemPrototype) {
            var coords = item.itemPrototype.getPositionToGridster(this);
            position = {
                x: Math.round(coords.x / this.cellWidth),
                y: Math.round(coords.y / this.cellHeight)
            };
        }
        else {
            position = {
                x: Math.round(item.positionX / this.cellWidth),
                y: Math.round(item.positionY / this.cellHeight)
            };
        }
        return position;
    };
    GridsterService.prototype.snapItemPositionToGrid = function (item) {
        var position = this.generateItemPosition(item);
        var col = position.x;
        var row = position.y;
        // Keep item position within the grid and don't let the item create more
        // than one extra column
        col = Math.max(col, 0);
        row = Math.max(row, 0);
        if (this.options.direction === 'horizontal') {
            col = Math.min(col, this._maxGridCols);
        }
        else {
            col = Math.min(col, Math.max(0, this.options.lanes - item.w));
        }
        // check if element is pinned
        if (this.gridList.isOverFixedArea(col, row, item.w, item.h)) {
            return [item.x, item.y];
        }
        return [col, row];
    };
    GridsterService.prototype.dragSizeChanged = function (newSize) {
        if (!this.previousDragSize) {
            return true;
        }
        return (newSize[0] !== this.previousDragSize[0] ||
            newSize[1] !== this.previousDragSize[1]);
    };
    GridsterService.prototype.dragPositionChanged = function (newPosition) {
        if (!this.previousDragPosition) {
            return true;
        }
        return (newPosition[0] !== this.previousDragPosition[0] ||
            newPosition[1] !== this.previousDragPosition[1]);
    };
    GridsterService.prototype.highlightPositionForItem = function (item) {
        var size = item.calculateSize(this);
        var position = item.calculatePosition(this);
        this.$positionHighlight.style.width = size.width + 'px';
        this.$positionHighlight.style.height = size.height + 'px';
        this.$positionHighlight.style.left = position.left + 'px';
        this.$positionHighlight.style.top = position.top + 'px';
        this.$positionHighlight.style.display = '';
        if (this.options.heightToFontSizeRatio) {
            this.$positionHighlight.style['font-size'] = this._fontSize;
        }
    };
    GridsterService.prototype.updateCachedItems = function () {
        var _this = this;
        // Notify the user with the items that changed since the previous snapshot
        this.triggerOnChange(null);
        this.gridsterOptions.responsiveOptions.forEach(function (options) {
            _this.triggerOnChange(options.breakpoint);
        });
        this.copyItems();
    };
    GridsterService.prototype.triggerOnChange = function (breakpoint) {
        var items = breakpoint ? this._itemsMap[breakpoint] : this._items;
        var changeItems = this.gridList.getChangedItems(items || [], breakpoint);
        changeItems
            .filter(function (itemChange) {
            return itemChange.item.itemComponent;
        })
            .forEach(function (itemChange) {
            if (itemChange.changes.indexOf('x') >= 0) {
                itemChange.item.triggerChangeX(breakpoint);
            }
            if (itemChange.changes.indexOf('y') >= 0) {
                itemChange.item.triggerChangeY(breakpoint);
            }
            if (itemChange.changes.indexOf('w') >= 0) {
                itemChange.item.triggerChangeW(breakpoint);
            }
            if (itemChange.changes.indexOf('h') >= 0) {
                itemChange.item.triggerChangeH(breakpoint);
            }
            // should be called only once (not for each breakpoint)
            itemChange.item.itemComponent.change.emit({
                item: itemChange.item,
                oldValues: itemChange.oldValues || {},
                isNew: itemChange.isNew,
                changes: itemChange.changes,
                breakpoint: breakpoint
            });
        });
    };
    GridsterService.prototype.removePositionHighlight = function () {
        this.$positionHighlight.style.display = 'none';
    };
    GridsterService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [])
    ], GridsterService);
    return GridsterService;
}());
export { GridsterService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZHN0ZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXIyZ3JpZHN0ZXIvIiwic291cmNlcyI6WyJsaWIvZ3JpZHN0ZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQy9CLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUU5QyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFRL0M7SUEyQ0k7UUFBQSxpQkFRQztRQTlDRCxVQUFLLEdBQXdCLEVBQUUsQ0FBQztRQUNoQyxXQUFNLEdBQXdCLEVBQUUsQ0FBQztRQUNqQyxjQUFTLEdBQWtELEVBQUUsQ0FBQztRQUM5RCxrQkFBYSxHQUF3QixFQUFFLENBQUM7UUFZeEMsMEJBQXFCLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQVUvQixzQkFBaUIsR0FBMEIsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQVd4RCxXQUFNLEdBQUcsS0FBSyxDQUFDO1FBR25CLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQ25ELEtBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDaEMsS0FBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2QsS0FBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDN0IsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxjQUFNLE9BQUEsS0FBSSxDQUFDLE1BQU0sRUFBRSxFQUFiLENBQWEsQ0FBQyxDQUFDO0lBQ3BGLENBQUM7SUFFRCx1Q0FBYSxHQUFi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OUM7WUFDRCxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDdEMsVUFBVSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDOUM7WUFDRCxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDdEMsVUFBVSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDOUM7WUFDRCx1REFBdUQ7WUFDdkQsVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDdEMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxJQUFJO2dCQUNyQixTQUFTLEVBQUUsVUFBVSxDQUFDLFNBQVMsSUFBSSxFQUFFO2dCQUNyQyxLQUFLLEVBQUUsVUFBVSxDQUFDLEtBQUs7Z0JBQ3ZCLE9BQU8sRUFBRSxVQUFVLENBQUMsT0FBTztnQkFDM0IsVUFBVSxFQUFFLFVBQVU7YUFDekIsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBRU8saURBQXVCLEdBQS9CO1FBQ0ksSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0lBQ25ELENBQUM7SUEzbkJRLGVBQWU7UUFEM0IsVUFBVSxFQUFFOztPQUNBLGVBQWUsQ0E2bkIzQjtJQUFELHNCQUFDO0NBQUEsQUE3bkJELElBNm5CQztTQTduQlksZUFBZSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGRlYm91bmNlVGltZSB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHsgR3JpZExpc3QgfSBmcm9tICcuL2dyaWRMaXN0L2dyaWRMaXN0JztcbmltcG9ydCB7IElHcmlkc3Rlck9wdGlvbnMgfSBmcm9tICcuL0lHcmlkc3Rlck9wdGlvbnMnO1xuaW1wb3J0IHsgSUdyaWRzdGVyRHJhZ2dhYmxlT3B0aW9ucyB9IGZyb20gJy4vSUdyaWRzdGVyRHJhZ2dhYmxlT3B0aW9ucyc7XG5pbXBvcnQgeyBHcmlkTGlzdEl0ZW0gfSBmcm9tICcuL2dyaWRMaXN0L0dyaWRMaXN0SXRlbSc7XG5pbXBvcnQgeyBHcmlkc3RlckNvbXBvbmVudCB9IGZyb20gJy4vZ3JpZHN0ZXIuY29tcG9uZW50JztcbmltcG9ydCB7IEdyaWRzdGVyT3B0aW9ucyB9IGZyb20gJy4vR3JpZHN0ZXJPcHRpb25zJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEdyaWRzdGVyU2VydmljZSB7XG4gICAgJGVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuXG4gICAgZ3JpZExpc3Q6IEdyaWRMaXN0O1xuXG4gICAgaXRlbXM6IEFycmF5PEdyaWRMaXN0SXRlbT4gPSBbXTtcbiAgICBfaXRlbXM6IEFycmF5PEdyaWRMaXN0SXRlbT4gPSBbXTtcbiAgICBfaXRlbXNNYXA6IHsgW2JyZWFrcG9pbnQ6IHN0cmluZ106IEFycmF5PEdyaWRMaXN0SXRlbT4gfSA9IHt9O1xuICAgIGRpc2FibGVkSXRlbXM6IEFycmF5PEdyaWRMaXN0SXRlbT4gPSBbXTtcblxuICAgIG9wdGlvbnM6IElHcmlkc3Rlck9wdGlvbnM7XG4gICAgZHJhZ2dhYmxlT3B0aW9uczogSUdyaWRzdGVyRHJhZ2dhYmxlT3B0aW9ucztcblxuICAgIGdyaWRzdGVyUmVjdDogQ2xpZW50UmVjdDtcbiAgICBncmlkc3RlclNjcm9sbERhdGE6IHsgc2Nyb2xsVG9wOiBudW1iZXIsIHNjcm9sbExlZnQ6IG51bWJlciB9O1xuXG4gICAgZ3JpZHN0ZXJPcHRpb25zOiBHcmlkc3Rlck9wdGlvbnM7XG5cbiAgICBncmlkc3RlckNvbXBvbmVudDogR3JpZHN0ZXJDb21wb25lbnQ7XG5cbiAgICBkZWJvdW5jZVJlbmRlclN1YmplY3QgPSBuZXcgU3ViamVjdCgpO1xuXG4gICAgcHVibGljICRwb3NpdGlvbkhpZ2hsaWdodDogSFRNTEVsZW1lbnQ7XG5cbiAgICBwdWJsaWMgbWF4SXRlbVdpZHRoOiBudW1iZXI7XG4gICAgcHVibGljIG1heEl0ZW1IZWlnaHQ6IG51bWJlcjtcblxuICAgIHB1YmxpYyBjZWxsV2lkdGg6IG51bWJlcjtcbiAgICBwdWJsaWMgY2VsbEhlaWdodDogbnVtYmVyO1xuXG4gICAgcHVibGljIGl0ZW1SZW1vdmVTdWJqZWN0OiBTdWJqZWN0PEdyaWRMaXN0SXRlbT4gPSBuZXcgU3ViamVjdCgpO1xuXG4gICAgcHJpdmF0ZSBfZm9udFNpemU6IG51bWJlcjtcblxuICAgIHByaXZhdGUgcHJldmlvdXNEcmFnUG9zaXRpb246IEFycmF5PG51bWJlcj47XG4gICAgcHJpdmF0ZSBwcmV2aW91c0RyYWdTaXplOiBBcnJheTxudW1iZXI+O1xuXG4gICAgcHJpdmF0ZSBjdXJyZW50RWxlbWVudDogSFRNTEVsZW1lbnQ7XG5cbiAgICBwcml2YXRlIF9tYXhHcmlkQ29sczogbnVtYmVyO1xuXG4gICAgcHJpdmF0ZSBpc0luaXQgPSBmYWxzZTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLml0ZW1SZW1vdmVTdWJqZWN0LnBpcGUoZGVib3VuY2VUaW1lKDApKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5ncmlkTGlzdC5wdWxsSXRlbXNUb0xlZnQoKTtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUNhY2hlZEl0ZW1zKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZGVib3VuY2VSZW5kZXJTdWJqZWN0LnBpcGUoZGVib3VuY2VUaW1lKDApKS5zdWJzY3JpYmUoKCkgPT4gdGhpcy5yZW5kZXIoKSk7XG4gICAgfVxuXG4gICAgaXNJbml0aWFsaXplZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNJbml0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE11c3QgYmUgY2FsbGVkIGJlZm9yZSBpbml0XG4gICAgICogQHBhcmFtIGl0ZW1cbiAgICAgKi9cbiAgICByZWdpc3Rlckl0ZW0oaXRlbTogR3JpZExpc3RJdGVtKSB7XG5cbiAgICAgICAgdGhpcy5pdGVtcy5wdXNoKGl0ZW0pO1xuICAgICAgICByZXR1cm4gaXRlbTtcbiAgICB9XG5cbiAgICBpbml0KGdyaWRzdGVyQ29tcG9uZW50OiBHcmlkc3RlckNvbXBvbmVudCkge1xuXG4gICAgICAgIHRoaXMuZ3JpZHN0ZXJDb21wb25lbnQgPSBncmlkc3RlckNvbXBvbmVudDtcblxuICAgICAgICB0aGlzLmRyYWdnYWJsZU9wdGlvbnMgPSBncmlkc3RlckNvbXBvbmVudC5kcmFnZ2FibGVPcHRpb25zO1xuXG4gICAgICAgIHRoaXMuZ3JpZHN0ZXJPcHRpb25zID0gZ3JpZHN0ZXJDb21wb25lbnQuZ3JpZHN0ZXJPcHRpb25zO1xuICAgIH1cblxuICAgIHN0YXJ0KCkge1xuICAgICAgICB0aGlzLnVwZGF0ZU1heEl0ZW1TaXplKCk7XG5cbiAgICAgICAgLy8gVXNlZCB0byBoaWdobGlnaHQgYSBwb3NpdGlvbiBhbiBlbGVtZW50IHdpbGwgbGFuZCBvbiB1cG9uIGRyb3BcbiAgICAgICAgaWYgKHRoaXMuJHBvc2l0aW9uSGlnaGxpZ2h0KSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZVBvc2l0aW9uSGlnaGxpZ2h0KCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmluaXRHcmlkTGlzdCgpO1xuXG4gICAgICAgIHRoaXMuaXNJbml0ID0gdHJ1ZTtcblxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY29weUl0ZW1zKCk7XG4gICAgICAgICAgICB0aGlzLmZpeEl0ZW1zUG9zaXRpb25zKCk7XG5cbiAgICAgICAgICAgIHRoaXMuZ3JpZHN0ZXJDb21wb25lbnQucmVmbG93R3JpZHN0ZXIodHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLmdyaWRzdGVyQ29tcG9uZW50LnNldFJlYWR5KCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGluaXRHcmlkTGlzdCgpIHtcbiAgICAgICAgLy8gQ3JlYXRlIGluc3RhbmNlIG9mIEdyaWRMaXN0IChkZWNvdXBsZWQgbGliIGZvciBoYW5kbGluZyB0aGUgZ3JpZFxuICAgICAgICAvLyBwb3NpdGlvbmluZyBhbmQgc29ydGluZyBwb3N0LWRyYWcgYW5kIGRyb3BwaW5nKVxuICAgICAgICB0aGlzLmdyaWRMaXN0ID0gbmV3IEdyaWRMaXN0KHRoaXMuaXRlbXMsIHRoaXMub3B0aW9ucyk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICB0aGlzLnVwZGF0ZU1heEl0ZW1TaXplKCk7XG4gICAgICAgIHRoaXMuZ3JpZExpc3QuZ2VuZXJhdGVHcmlkKCk7XG4gICAgICAgIHRoaXMuYXBwbHlTaXplVG9JdGVtcygpO1xuICAgICAgICB0aGlzLmFwcGx5UG9zaXRpb25Ub0l0ZW1zKCk7XG4gICAgICAgIHRoaXMucmVmcmVzaExpbmVzKCk7XG4gICAgfVxuXG4gICAgcmVmbG93KCkge1xuICAgICAgICB0aGlzLmNhbGN1bGF0ZUNlbGxTaXplKCk7XG4gICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgfVxuXG4gICAgZml4SXRlbXNQb3NpdGlvbnMoKSB7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmVzcG9uc2l2ZVNpemVzKSB7XG4gICAgICAgICAgICB0aGlzLmdyaWRMaXN0LmZpeEl0ZW1zUG9zaXRpb25zKHRoaXMub3B0aW9ucyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmdyaWRMaXN0LmZpeEl0ZW1zUG9zaXRpb25zKHRoaXMuZ3JpZHN0ZXJPcHRpb25zLmJhc2ljT3B0aW9ucyk7XG4gICAgICAgICAgICB0aGlzLmdyaWRzdGVyT3B0aW9ucy5yZXNwb25zaXZlT3B0aW9ucy5mb3JFYWNoKChvcHRpb25zOiBJR3JpZHN0ZXJPcHRpb25zKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5ncmlkTGlzdC5maXhJdGVtc1Bvc2l0aW9ucyhvcHRpb25zKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy51cGRhdGVDYWNoZWRJdGVtcygpO1xuICAgIH1cblxuICAgIHJlbW92ZUl0ZW0oaXRlbTogR3JpZExpc3RJdGVtKSB7XG4gICAgICAgIGNvbnN0IGlkeCA9IHRoaXMuaXRlbXMuaW5kZXhPZihpdGVtKTtcblxuICAgICAgICBpZiAoaWR4ID49IDApIHtcbiAgICAgICAgICAgIHRoaXMuaXRlbXMuc3BsaWNlKHRoaXMuaXRlbXMuaW5kZXhPZihpdGVtKSwgMSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmdyaWRMaXN0LmRlbGV0ZUl0ZW1Qb3NpdGlvbkZyb21HcmlkKGl0ZW0pO1xuICAgICAgICB0aGlzLnJlbW92ZUl0ZW1Gcm9tQ2FjaGUoaXRlbSk7XG4gICAgfVxuXG4gICAgb25SZXNpemVTdGFydChpdGVtOiBHcmlkTGlzdEl0ZW0pIHtcbiAgICAgICAgdGhpcy5jdXJyZW50RWxlbWVudCA9IGl0ZW0uJGVsZW1lbnQ7XG5cbiAgICAgICAgdGhpcy5jb3B5SXRlbXMoKTtcblxuICAgICAgICB0aGlzLl9tYXhHcmlkQ29scyA9IHRoaXMuZ3JpZExpc3QuZ3JpZC5sZW5ndGg7XG5cbiAgICAgICAgdGhpcy5oaWdobGlnaHRQb3NpdGlvbkZvckl0ZW0oaXRlbSk7XG5cbiAgICAgICAgdGhpcy5ncmlkc3RlckNvbXBvbmVudC5pc1Jlc2l6aW5nID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLnJlZnJlc2hMaW5lcygpO1xuICAgIH1cblxuICAgIG9uUmVzaXplRHJhZyhpdGVtOiBHcmlkTGlzdEl0ZW0pIHtcbiAgICAgICAgY29uc3QgbmV3U2l6ZSA9IHRoaXMuc25hcEl0ZW1TaXplVG9HcmlkKGl0ZW0pO1xuICAgICAgICBjb25zdCBzaXplQ2hhbmdlZCA9IHRoaXMuZHJhZ1NpemVDaGFuZ2VkKG5ld1NpemUpO1xuICAgICAgICBjb25zdCBuZXdQb3NpdGlvbiA9IHRoaXMuc25hcEl0ZW1Qb3NpdGlvblRvR3JpZChpdGVtKTtcbiAgICAgICAgY29uc3QgcG9zaXRpb25DaGFuZ2VkID0gdGhpcy5kcmFnUG9zaXRpb25DaGFuZ2VkKG5ld1Bvc2l0aW9uKTtcblxuICAgICAgICBpZiAoc2l6ZUNoYW5nZWQgfHwgcG9zaXRpb25DaGFuZ2VkKSB7XG4gICAgICAgICAgICAvLyBSZWdlbmVyYXRlIHRoZSBncmlkIHdpdGggdGhlIHBvc2l0aW9ucyBmcm9tIHdoZW4gdGhlIGRyYWcgc3RhcnRlZFxuICAgICAgICAgICAgdGhpcy5yZXN0b3JlQ2FjaGVkSXRlbXMoKTtcbiAgICAgICAgICAgIHRoaXMuZ3JpZExpc3QuZ2VuZXJhdGVHcmlkKCk7XG5cbiAgICAgICAgICAgIHRoaXMucHJldmlvdXNEcmFnUG9zaXRpb24gPSBuZXdQb3NpdGlvbjtcbiAgICAgICAgICAgIHRoaXMucHJldmlvdXNEcmFnU2l6ZSA9IG5ld1NpemU7XG5cbiAgICAgICAgICAgIHRoaXMuZ3JpZExpc3QubW92ZUFuZFJlc2l6ZShpdGVtLCBuZXdQb3NpdGlvbiwge3c6IG5ld1NpemVbMF0sIGg6IG5ld1NpemVbMV19KTtcblxuICAgICAgICAgICAgLy8gVmlzdWFsbHkgdXBkYXRlIGl0ZW0gcG9zaXRpb25zIGFuZCBoaWdobGlnaHQgc2hhcGVcbiAgICAgICAgICAgIHRoaXMuYXBwbHlQb3NpdGlvblRvSXRlbXModHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLmFwcGx5U2l6ZVRvSXRlbXMoKTtcbiAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0UG9zaXRpb25Gb3JJdGVtKGl0ZW0pO1xuICAgICAgICAgICAgdGhpcy5yZWZyZXNoTGluZXMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uUmVzaXplU3RvcChpdGVtOiBHcmlkTGlzdEl0ZW0pIHtcbiAgICAgICAgdGhpcy5jdXJyZW50RWxlbWVudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy51cGRhdGVDYWNoZWRJdGVtcygpO1xuICAgICAgICB0aGlzLnByZXZpb3VzRHJhZ1NpemUgPSBudWxsO1xuXG4gICAgICAgIHRoaXMucmVtb3ZlUG9zaXRpb25IaWdobGlnaHQoKTtcblxuICAgICAgICB0aGlzLmdyaWRzdGVyQ29tcG9uZW50LmlzUmVzaXppbmcgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLmdyaWRMaXN0LnB1bGxJdGVtc1RvTGVmdChpdGVtKTtcbiAgICAgICAgdGhpcy5kZWJvdW5jZVJlbmRlclN1YmplY3QubmV4dCgpO1xuXG4gICAgICAgIHRoaXMuZml4SXRlbXNQb3NpdGlvbnMoKTtcbiAgICB9XG5cbiAgICBvblN0YXJ0KGl0ZW06IEdyaWRMaXN0SXRlbSkge1xuICAgICAgICB0aGlzLmN1cnJlbnRFbGVtZW50ID0gaXRlbS4kZWxlbWVudDtcbiAgICAgICAgLy8gaXRlbUN0cmwuaXNEcmFnZ2luZyA9IHRydWU7XG4gICAgICAgIC8vIENyZWF0ZSBhIGRlZXAgY29weSBvZiB0aGUgaXRlbXM7IHdlIHVzZSB0aGVtIHRvIHJldmVydCB0aGUgaXRlbVxuICAgICAgICAvLyBwb3NpdGlvbnMgYWZ0ZXIgZWFjaCBkcmFnIGNoYW5nZSwgbWFraW5nIGFuIGVudGlyZSBkcmFnIG9wZXJhdGlvbiBsZXNzXG4gICAgICAgIC8vIGRpc3RydWN0YWJsZVxuICAgICAgICB0aGlzLmNvcHlJdGVtcygpO1xuXG4gICAgICAgIC8vIFNpbmNlIGRyYWdnaW5nIGFjdHVhbGx5IGFsdGVycyB0aGUgZ3JpZCwgd2UgbmVlZCB0byBlc3RhYmxpc2ggdGhlIG51bWJlclxuICAgICAgICAvLyBvZiBjb2xzICgrMSBleHRyYSkgYmVmb3JlIHRoZSBkcmFnIHN0YXJ0c1xuXG4gICAgICAgIHRoaXMuX21heEdyaWRDb2xzID0gdGhpcy5ncmlkTGlzdC5ncmlkLmxlbmd0aDtcblxuICAgICAgICB0aGlzLmdyaWRzdGVyQ29tcG9uZW50LmlzRHJhZ2dpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLmdyaWRzdGVyQ29tcG9uZW50LnVwZGF0ZUdyaWRzdGVyRWxlbWVudERhdGEoKTtcblxuICAgICAgICB0aGlzLnJlZnJlc2hMaW5lcygpO1xuICAgIH1cblxuICAgIG9uRHJhZyhpdGVtOiBHcmlkTGlzdEl0ZW0pIHtcbiAgICAgICAgY29uc3QgbmV3UG9zaXRpb24gPSB0aGlzLnNuYXBJdGVtUG9zaXRpb25Ub0dyaWQoaXRlbSk7XG5cbiAgICAgICAgaWYgKHRoaXMuZHJhZ1Bvc2l0aW9uQ2hhbmdlZChuZXdQb3NpdGlvbikpIHtcblxuICAgICAgICAgICAgLy8gUmVnZW5lcmF0ZSB0aGUgZ3JpZCB3aXRoIHRoZSBwb3NpdGlvbnMgZnJvbSB3aGVuIHRoZSBkcmFnIHN0YXJ0ZWRcbiAgICAgICAgICAgIHRoaXMucmVzdG9yZUNhY2hlZEl0ZW1zKCk7XG4gICAgICAgICAgICB0aGlzLmdyaWRMaXN0LmdlbmVyYXRlR3JpZCgpO1xuXG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzRHJhZ1Bvc2l0aW9uID0gbmV3UG9zaXRpb247XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRpcmVjdGlvbiA9PT0gJ25vbmUnICYmXG4gICAgICAgICAgICAgICAgIXRoaXMuZ3JpZExpc3QuY2hlY2tJdGVtQWJvdmVFbXB0eUFyZWEoaXRlbSwge3g6IG5ld1Bvc2l0aW9uWzBdLCB5OiBuZXdQb3NpdGlvblsxXX0pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTaW5jZSB0aGUgaXRlbXMgbGlzdCBpcyBhIGRlZXAgY29weSwgd2UgbmVlZCB0byBmZXRjaCB0aGUgaXRlbVxuICAgICAgICAgICAgLy8gY29ycmVzcG9uZGluZyB0byB0aGlzIGRyYWcgYWN0aW9uIGFnYWluXG4gICAgICAgICAgICB0aGlzLmdyaWRMaXN0Lm1vdmVJdGVtVG9Qb3NpdGlvbihpdGVtLCBuZXdQb3NpdGlvbik7XG5cbiAgICAgICAgICAgIC8vIFZpc3VhbGx5IHVwZGF0ZSBpdGVtIHBvc2l0aW9ucyBhbmQgaGlnaGxpZ2h0IHNoYXBlXG4gICAgICAgICAgICB0aGlzLmFwcGx5UG9zaXRpb25Ub0l0ZW1zKHRydWUpO1xuICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRQb3NpdGlvbkZvckl0ZW0oaXRlbSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjYW5jZWwoKSB7XG4gICAgICAgIHRoaXMucmVzdG9yZUNhY2hlZEl0ZW1zKCk7XG4gICAgICAgIHRoaXMucHJldmlvdXNEcmFnUG9zaXRpb24gPSBudWxsO1xuICAgICAgICB0aGlzLnVwZGF0ZU1heEl0ZW1TaXplKCk7XG4gICAgICAgIHRoaXMuYXBwbHlQb3NpdGlvblRvSXRlbXMoKTtcbiAgICAgICAgdGhpcy5yZW1vdmVQb3NpdGlvbkhpZ2hsaWdodCgpO1xuICAgICAgICB0aGlzLmN1cnJlbnRFbGVtZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmdyaWRzdGVyQ29tcG9uZW50LmlzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBvbkRyYWdPdXQgKGl0ZW06IEdyaWRMaXN0SXRlbSkge1xuXG4gICAgICAgIHRoaXMuY2FuY2VsKCk7XG5cbiAgICAgICAgY29uc3QgaWR4ID0gdGhpcy5pdGVtcy5pbmRleE9mKGl0ZW0pO1xuICAgICAgICBpZiAoaWR4ID49IDApIHtcbiAgICAgICAgICAgIHRoaXMuaXRlbXMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmdyaWRMaXN0LnB1bGxJdGVtc1RvTGVmdCgpO1xuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cblxuICAgIG9uU3RvcChpdGVtOiBHcmlkTGlzdEl0ZW0pIHtcbiAgICAgICAgdGhpcy5jdXJyZW50RWxlbWVudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy51cGRhdGVDYWNoZWRJdGVtcygpO1xuICAgICAgICB0aGlzLnByZXZpb3VzRHJhZ1Bvc2l0aW9uID0gbnVsbDtcblxuICAgICAgICB0aGlzLnJlbW92ZVBvc2l0aW9uSGlnaGxpZ2h0KCk7XG5cbiAgICAgICAgdGhpcy5ncmlkTGlzdC5wdWxsSXRlbXNUb0xlZnQoaXRlbSk7XG5cbiAgICAgICAgdGhpcy5ncmlkc3RlckNvbXBvbmVudC5pc0RyYWdnaW5nID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5yZWZyZXNoTGluZXMoKTtcbiAgICB9XG5cbiAgICBjYWxjdWxhdGVDZWxsU2l6ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kaXJlY3Rpb24gPT09ICdob3Jpem9udGFsJykge1xuICAgICAgICAgICAgdGhpcy5jZWxsSGVpZ2h0ID0gdGhpcy5jYWxjdWxhdGVDZWxsSGVpZ2h0KCk7XG4gICAgICAgICAgICB0aGlzLmNlbGxXaWR0aCA9IHRoaXMub3B0aW9ucy5jZWxsV2lkdGggfHwgdGhpcy5jZWxsSGVpZ2h0ICogdGhpcy5vcHRpb25zLndpZHRoSGVpZ2h0UmF0aW87XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNlbGxXaWR0aCA9IHRoaXMuY2FsY3VsYXRlQ2VsbFdpZHRoKCk7XG4gICAgICAgICAgICB0aGlzLmNlbGxIZWlnaHQgPSB0aGlzLm9wdGlvbnMuY2VsbEhlaWdodCB8fCB0aGlzLmNlbGxXaWR0aCAvIHRoaXMub3B0aW9ucy53aWR0aEhlaWdodFJhdGlvO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaGVpZ2h0VG9Gb250U2l6ZVJhdGlvKSB7XG4gICAgICAgICAgICB0aGlzLl9mb250U2l6ZSA9IHRoaXMuY2VsbEhlaWdodCAqIHRoaXMub3B0aW9ucy5oZWlnaHRUb0ZvbnRTaXplUmF0aW87XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhcHBseVBvc2l0aW9uVG9JdGVtcyhpbmNyZWFzZUdyaWRzdGVyU2l6ZT86IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuc2hyaW5rKSB7XG4gICAgICAgICAgICBpbmNyZWFzZUdyaWRzdGVyU2l6ZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVE9ETzogSW1wbGVtZW50IGdyb3VwIHNlcGFyYXRvcnNcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLml0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAvLyBEb24ndCBpbnRlcmZlcmUgd2l0aCB0aGUgcG9zaXRpb25zIG9mIHRoZSBkcmFnZ2VkIGl0ZW1zXG4gICAgICAgICAgICBpZiAodGhpcy5pc0N1cnJlbnRFbGVtZW50KHRoaXMuaXRlbXNbaV0uJGVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLml0ZW1zW2ldLmFwcGx5UG9zaXRpb24odGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjaGlsZCA9IDxIVE1MRWxlbWVudD50aGlzLmdyaWRzdGVyQ29tcG9uZW50LiRlbGVtZW50LmZpcnN0Q2hpbGQ7XG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgd2lkdGggb2YgdGhlIGVudGlyZSBncmlkIGNvbnRhaW5lciB3aXRoIGVub3VnaCByb29tIG9uIHRoZVxuICAgICAgICAvLyByaWdodCB0byBhbGxvdyBkcmFnZ2luZyBpdGVtcyB0byB0aGUgZW5kIG9mIHRoZSBncmlkLlxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRpcmVjdGlvbiA9PT0gJ2hvcml6b250YWwnKSB7XG4gICAgICAgICAgICBjb25zdCBpbmNyZWFzZVdpZHRoV2l0aCA9IChpbmNyZWFzZUdyaWRzdGVyU2l6ZSkgPyB0aGlzLm1heEl0ZW1XaWR0aCA6IDA7XG4gICAgICAgICAgICBjaGlsZC5zdHlsZS5oZWlnaHQgPSAnJztcbiAgICAgICAgICAgIGNoaWxkLnN0eWxlLndpZHRoID0gKCh0aGlzLmdyaWRMaXN0LmdyaWQubGVuZ3RoICsgaW5jcmVhc2VXaWR0aFdpdGgpICogdGhpcy5jZWxsV2lkdGgpICsgJ3B4JztcblxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZ3JpZExpc3QuZ3JpZC5sZW5ndGgpIHtcbiAgICAgICAgICAgIC8vIHRvZG86IGZpeCBtZVxuICAgICAgICAgICAgY29uc3Qgcm93SGVpZ2h0cyA9IHRoaXMuZ2V0Um93SGVpZ2h0cygpO1xuICAgICAgICAgICAgY29uc3Qgcm93VG9wcyA9IHRoaXMuZ2V0Um93VG9wcyhyb3dIZWlnaHRzKTtcbiAgICAgICAgICAgIGNvbnN0IGhlaWdodCA9IHJvd1RvcHNbcm93VG9wcy5sZW5ndGggLSAxXSArIHJvd0hlaWdodHNbcm93SGVpZ2h0cy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzSGVpZ2h0ID0gY2hpbGQuc3R5bGUuaGVpZ2h0O1xuICAgICAgICAgICAgY2hpbGQuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgJ3B4JztcbiAgICAgICAgICAgIGNoaWxkLnN0eWxlLndpZHRoID0gJyc7XG5cbiAgICAgICAgICAgIGlmIChwcmV2aW91c0hlaWdodCAhPT0gY2hpbGQuc3R5bGUuaGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoTGluZXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldFJvd0hlaWdodHMoKTogbnVtYmVyW10ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgdGhpcy5ncmlkTGlzdC5ncmlkLmxlbmd0aDsgcm93KyspIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKDApO1xuICAgICAgICAgICAgZm9yIChsZXQgY29sdW1uID0gMDsgY29sdW1uIDwgdGhpcy5ncmlkTGlzdC5ncmlkW3Jvd10ubGVuZ3RoOyBjb2x1bW4rKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLmdyaWRMaXN0LmdyaWRbcm93XVtjb2x1bW5dO1xuICAgICAgICAgICAgICAgIGlmIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhlaWdodCA9IGl0ZW0uY29udGVudEhlaWdodCAvIGl0ZW0uaDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0udmFyaWFibGVIZWlnaHQgJiYgaGVpZ2h0ID4gcmVzdWx0W3Jvd10pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtyb3ddID0gaGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlc3VsdFtyb3ddID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W3Jvd10gPSB0aGlzLmNlbGxIZWlnaHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBnZXRSb3dUb3BzKHJvd0hlaWdodHM6IG51bWJlcltdKTogbnVtYmVyW10ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICAgICAgbGV0IGxhc3RIZWlnaHQgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IHJvd0hlaWdodCBvZiByb3dIZWlnaHRzKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaChsYXN0SGVpZ2h0KTtcbiAgICAgICAgICAgIGxhc3RIZWlnaHQgKz0gcm93SGVpZ2h0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcmVmcmVzaExpbmVzKCkge1xuICAgICAgICBjb25zdCBjYW52YXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+dGhpcy5ncmlkc3RlckNvbXBvbmVudC4kYmFja2dyb3VuZEdyaWQubmF0aXZlRWxlbWVudDtcbiAgICAgICAgY2FudmFzLndpZHRoID0gY2FudmFzLm9mZnNldFdpZHRoO1xuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gY2FudmFzLm9mZnNldEhlaWdodDtcbiAgICAgICAgY29uc3QgY2FudmFzQ29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgIGNhbnZhc0NvbnRleHQuY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5saW5lcyAmJiB0aGlzLm9wdGlvbnMubGluZXMudmlzaWJsZSAmJlxuICAgICAgICAgICAgKHRoaXMuZ3JpZHN0ZXJDb21wb25lbnQuaXNEcmFnZ2luZyB8fCB0aGlzLmdyaWRzdGVyQ29tcG9uZW50LmlzUmVzaXppbmcgfHwgdGhpcy5vcHRpb25zLmxpbmVzLmFsd2F5cykpIHtcbiAgICAgICAgICAgIGNvbnN0IGxpbmVzQ29sb3IgPSB0aGlzLm9wdGlvbnMubGluZXMuY29sb3IgfHwgJyNkOGQ4ZDgnO1xuICAgICAgICAgICAgY29uc3QgbGluZXNCZ0NvbG9yID0gdGhpcy5vcHRpb25zLmxpbmVzLmJhY2tncm91bmRDb2xvciB8fCAndHJhbnNwYXJlbnQnO1xuICAgICAgICAgICAgY29uc3QgbGluZXNXaWR0aCA9IHRoaXMub3B0aW9ucy5saW5lcy53aWR0aCB8fCAxO1xuXG4gICAgICAgICAgICBjYW52YXNDb250ZXh0LmZpbGxTdHlsZSA9IGxpbmVzQmdDb2xvcjtcbiAgICAgICAgICAgIGNhbnZhc0NvbnRleHQuZmlsbFJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblxuICAgICAgICAgICAgY2FudmFzQ29udGV4dC5zdHJva2VTdHlsZSA9IGxpbmVzQ29sb3I7XG4gICAgICAgICAgICBjYW52YXNDb250ZXh0LmxpbmVXaWR0aCA9IGxpbmVzV2lkdGg7XG5cbiAgICAgICAgICAgIGNhbnZhc0NvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICAvLyBkcmF3IHJvdyBsaW5lc1xuICAgICAgICAgICAgY29uc3Qgcm93SGVpZ2h0cyA9IHRoaXMuZ2V0Um93SGVpZ2h0cygpO1xuICAgICAgICAgICAgY29uc3Qgcm93VG9wcyA9IHRoaXMuZ2V0Um93VG9wcyhyb3dIZWlnaHRzKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcm93VG9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNhbnZhc0NvbnRleHQubW92ZVRvKDAsIHJvd1RvcHNbaV0pO1xuICAgICAgICAgICAgICAgIGNhbnZhc0NvbnRleHQubGluZVRvKGNhbnZhcy53aWR0aCwgcm93VG9wc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBkcmF3IGNvbHVtbiBsaW5lc1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm9wdGlvbnMubGFuZXM7IGkrKykge1xuICAgICAgICAgICAgICAgIGNhbnZhc0NvbnRleHQubW92ZVRvKGkgKiB0aGlzLmNlbGxXaWR0aCwgMCk7XG4gICAgICAgICAgICAgICAgY2FudmFzQ29udGV4dC5saW5lVG8oaSAqIHRoaXMuY2VsbFdpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbnZhc0NvbnRleHQuc3Ryb2tlKCk7XG4gICAgICAgICAgICBjYW52YXNDb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW1vdmVJdGVtRnJvbUNhY2hlKGl0ZW06IEdyaWRMaXN0SXRlbSkge1xuICAgICAgICB0aGlzLl9pdGVtcyA9IHRoaXMuX2l0ZW1zXG4gICAgICAgICAgICAuZmlsdGVyKGNhY2hlZEl0ZW0gPT4gY2FjaGVkSXRlbS4kZWxlbWVudCAhPT0gaXRlbS4kZWxlbWVudCk7XG5cbiAgICAgICAgT2JqZWN0LmtleXModGhpcy5faXRlbXNNYXApXG4gICAgICAgICAgICAuZm9yRWFjaCgoYnJlYWtwb2ludDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5faXRlbXNNYXBbYnJlYWtwb2ludF0gPSB0aGlzLl9pdGVtc01hcFticmVha3BvaW50XVxuICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKGNhY2hlZEl0ZW0gPT4gY2FjaGVkSXRlbS4kZWxlbWVudCAhPT0gaXRlbS4kZWxlbWVudCk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNvcHlJdGVtcygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5faXRlbXMgPSB0aGlzLml0ZW1zXG4gICAgICAgICAgICAuZmlsdGVyKGl0ZW0gPT4gdGhpcy5pc1ZhbGlkR3JpZEl0ZW0oaXRlbSkpXG4gICAgICAgICAgICAubWFwKChpdGVtOiBHcmlkTGlzdEl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbS5jb3B5Rm9yQnJlYWtwb2ludChudWxsKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZ3JpZHN0ZXJPcHRpb25zLnJlc3BvbnNpdmVPcHRpb25zLmZvckVhY2goKG9wdGlvbnM6IElHcmlkc3Rlck9wdGlvbnMpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2l0ZW1zTWFwW29wdGlvbnMuYnJlYWtwb2ludF0gPSB0aGlzLml0ZW1zXG4gICAgICAgICAgICAgICAgLmZpbHRlcihpdGVtID0+IHRoaXMuaXNWYWxpZEdyaWRJdGVtKGl0ZW0pKVxuICAgICAgICAgICAgICAgIC5tYXAoKGl0ZW06IEdyaWRMaXN0SXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbS5jb3B5Rm9yQnJlYWtwb2ludChvcHRpb25zLmJyZWFrcG9pbnQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgbWF4SXRlbVdpZHRoIGFuZCBtYXhJdGVtSGVpZ2h0IHZhbGVzIGFjY29yZGluZyB0byBjdXJyZW50IHN0YXRlIG9mIGl0ZW1zXG4gICAgICovXG4gICAgcHJpdmF0ZSB1cGRhdGVNYXhJdGVtU2l6ZSgpIHtcbiAgICAgICAgdGhpcy5tYXhJdGVtV2lkdGggPSBNYXRoLm1heC5hcHBseShcbiAgICAgICAgICAgIG51bGwsIHRoaXMuaXRlbXMubWFwKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0udztcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgdGhpcy5tYXhJdGVtSGVpZ2h0ID0gTWF0aC5tYXguYXBwbHkoXG4gICAgICAgICAgICBudWxsLCB0aGlzLml0ZW1zLm1hcCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLmg7XG4gICAgICAgICAgICB9KSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIGl0ZW1zIHByb3BlcnRpZXMgb2YgcHJldmlvdXNseSBjYWNoZWQgaXRlbXNcbiAgICAgKi9cbiAgICBwcml2YXRlIHJlc3RvcmVDYWNoZWRJdGVtcygpIHtcbiAgICAgICAgY29uc3QgaXRlbXMgPSB0aGlzLm9wdGlvbnMuYnJlYWtwb2ludCA/IHRoaXMuX2l0ZW1zTWFwW3RoaXMub3B0aW9ucy5icmVha3BvaW50XSA6IHRoaXMuX2l0ZW1zO1xuXG4gICAgICAgIHRoaXMuaXRlbXNcbiAgICAgICAgICAgIC5maWx0ZXIoaXRlbSA9PiB0aGlzLmlzVmFsaWRHcmlkSXRlbShpdGVtKSlcbiAgICAgICAgICAgIC5mb3JFYWNoKChpdGVtOiBHcmlkTGlzdEl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjYWNoZWRJdGVtOiBHcmlkTGlzdEl0ZW0gPSBpdGVtcy5maWx0ZXIoY2FjaGVkSXRtID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhY2hlZEl0bS4kZWxlbWVudCA9PT0gaXRlbS4kZWxlbWVudDtcbiAgICAgICAgICAgICAgICB9KVswXTtcblxuICAgICAgICAgICAgICAgIGl0ZW0ueCA9IGNhY2hlZEl0ZW0ueDtcbiAgICAgICAgICAgICAgICBpdGVtLnkgPSBjYWNoZWRJdGVtLnk7XG5cbiAgICAgICAgICAgICAgICBpdGVtLncgPSBjYWNoZWRJdGVtLnc7XG4gICAgICAgICAgICAgICAgaXRlbS5oID0gY2FjaGVkSXRlbS5oO1xuICAgICAgICAgICAgICAgIGl0ZW0uYXV0b1NpemUgPSBjYWNoZWRJdGVtLmF1dG9TaXplO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSWYgaXRlbSBzaG91bGQgcmVhY3Qgb24gZ3JpZFxuICAgICAqIEBwYXJhbSBHcmlkTGlzdEl0ZW0gaXRlbVxuICAgICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICAgKi9cbiAgICBwcml2YXRlIGlzVmFsaWRHcmlkSXRlbShpdGVtOiBHcmlkTGlzdEl0ZW0pOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kaXJlY3Rpb24gPT09ICdub25lJykge1xuICAgICAgICAgICAgcmV0dXJuICEhaXRlbS5pdGVtQ29tcG9uZW50O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2FsY3VsYXRlQ2VsbFdpZHRoKCkge1xuICAgICAgICBjb25zdCBncmlkc3RlcldpZHRoID0gcGFyc2VGbG9hdCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLmdyaWRzdGVyQ29tcG9uZW50LiRlbGVtZW50KS53aWR0aCk7XG5cbiAgICAgICAgcmV0dXJuIGdyaWRzdGVyV2lkdGggLyB0aGlzLm9wdGlvbnMubGFuZXM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVDZWxsSGVpZ2h0KCkge1xuICAgICAgICBjb25zdCBncmlkc3RlckhlaWdodCA9IHBhcnNlRmxvYXQod2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5ncmlkc3RlckNvbXBvbmVudC4kZWxlbWVudCkuaGVpZ2h0KTtcblxuICAgICAgICByZXR1cm4gZ3JpZHN0ZXJIZWlnaHQgLyB0aGlzLm9wdGlvbnMubGFuZXM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhcHBseVNpemVUb0l0ZW1zKCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuaXRlbXNbaV0uYXBwbHlTaXplKCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaGVpZ2h0VG9Gb250U2l6ZVJhdGlvKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtc1tpXS4kZWxlbWVudC5zdHlsZVsnZm9udC1zaXplJ10gPSB0aGlzLl9mb250U2l6ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgaXNDdXJyZW50RWxlbWVudChlbGVtZW50OiBIVE1MRWxlbWVudCkge1xuICAgICAgICBpZiAoIXRoaXMuY3VycmVudEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxlbWVudCA9PT0gdGhpcy5jdXJyZW50RWxlbWVudDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNuYXBJdGVtU2l6ZVRvR3JpZChpdGVtOiBHcmlkTGlzdEl0ZW0pOiBbbnVtYmVyLCBudW1iZXJdIHtcbiAgICAgICAgY29uc3QgaXRlbVNpemUgPSB7XG4gICAgICAgICAgICB3aWR0aDogcGFyc2VJbnQoaXRlbS4kZWxlbWVudC5zdHlsZS53aWR0aCwgMTApIC0gMSxcbiAgICAgICAgICAgIGhlaWdodDogcGFyc2VJbnQoaXRlbS4kZWxlbWVudC5zdHlsZS5oZWlnaHQsIDEwKSAtIDFcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgY29sU2l6ZSA9IE1hdGgucm91bmQoaXRlbVNpemUud2lkdGggLyB0aGlzLmNlbGxXaWR0aCk7XG4gICAgICAgIGxldCByb3dTaXplID0gTWF0aC5yb3VuZChpdGVtU2l6ZS5oZWlnaHQgLyB0aGlzLmNlbGxIZWlnaHQpO1xuXG4gICAgICAgIC8vIEtlZXAgaXRlbSBtaW5pbXVtIDFcbiAgICAgICAgY29sU2l6ZSA9IE1hdGgubWF4KGNvbFNpemUsIDEpO1xuICAgICAgICByb3dTaXplID0gTWF0aC5tYXgocm93U2l6ZSwgMSk7XG5cbiAgICAgICAgLy8gY2hlY2sgaWYgZWxlbWVudCBpcyBwaW5uZWRcbiAgICAgICAgaWYgKHRoaXMuZ3JpZExpc3QuaXNPdmVyRml4ZWRBcmVhKGl0ZW0ueCwgaXRlbS55LCBjb2xTaXplLCByb3dTaXplLCBpdGVtKSkge1xuICAgICAgICAgICAgcmV0dXJuIFtpdGVtLncsIGl0ZW0uaF07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW2NvbFNpemUsIHJvd1NpemVdO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2VuZXJhdGVJdGVtUG9zaXRpb24oaXRlbTogR3JpZExpc3RJdGVtKTogeyB4OiBudW1iZXIsIHk6IG51bWJlciB9IHtcbiAgICAgICAgbGV0IHBvc2l0aW9uO1xuXG4gICAgICAgIGlmIChpdGVtLml0ZW1Qcm90b3R5cGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvb3JkcyA9IGl0ZW0uaXRlbVByb3RvdHlwZS5nZXRQb3NpdGlvblRvR3JpZHN0ZXIodGhpcyk7XG4gICAgICAgICAgICBwb3NpdGlvbiA9IHtcbiAgICAgICAgICAgICAgICB4OiBNYXRoLnJvdW5kKGNvb3Jkcy54IC8gdGhpcy5jZWxsV2lkdGgpLFxuICAgICAgICAgICAgICAgIHk6IE1hdGgucm91bmQoY29vcmRzLnkgLyB0aGlzLmNlbGxIZWlnaHQpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcG9zaXRpb24gPSB7XG4gICAgICAgICAgICAgICAgeDogTWF0aC5yb3VuZChpdGVtLnBvc2l0aW9uWCAvIHRoaXMuY2VsbFdpZHRoKSxcbiAgICAgICAgICAgICAgICB5OiBNYXRoLnJvdW5kKGl0ZW0ucG9zaXRpb25ZIC8gdGhpcy5jZWxsSGVpZ2h0KVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwb3NpdGlvbjtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNuYXBJdGVtUG9zaXRpb25Ub0dyaWQoaXRlbTogR3JpZExpc3RJdGVtKTogW251bWJlciwgbnVtYmVyXSB7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5nZW5lcmF0ZUl0ZW1Qb3NpdGlvbihpdGVtKTtcbiAgICAgICAgbGV0IGNvbCA9IHBvc2l0aW9uLng7XG4gICAgICAgIGxldCByb3cgPSBwb3NpdGlvbi55O1xuXG4gICAgICAgIC8vIEtlZXAgaXRlbSBwb3NpdGlvbiB3aXRoaW4gdGhlIGdyaWQgYW5kIGRvbid0IGxldCB0aGUgaXRlbSBjcmVhdGUgbW9yZVxuICAgICAgICAvLyB0aGFuIG9uZSBleHRyYSBjb2x1bW5cbiAgICAgICAgY29sID0gTWF0aC5tYXgoY29sLCAwKTtcbiAgICAgICAgcm93ID0gTWF0aC5tYXgocm93LCAwKTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRpcmVjdGlvbiA9PT0gJ2hvcml6b250YWwnKSB7XG4gICAgICAgICAgICBjb2wgPSBNYXRoLm1pbihjb2wsIHRoaXMuX21heEdyaWRDb2xzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbCA9IE1hdGgubWluKGNvbCwgTWF0aC5tYXgoMCwgdGhpcy5vcHRpb25zLmxhbmVzIC0gaXRlbS53KSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjaGVjayBpZiBlbGVtZW50IGlzIHBpbm5lZFxuICAgICAgICBpZiAodGhpcy5ncmlkTGlzdC5pc092ZXJGaXhlZEFyZWEoY29sLCByb3csIGl0ZW0udywgaXRlbS5oKSkge1xuICAgICAgICAgICAgcmV0dXJuIFtpdGVtLngsIGl0ZW0ueV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW2NvbCwgcm93XTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRyYWdTaXplQ2hhbmdlZChuZXdTaXplOiBbbnVtYmVyLCBudW1iZXJdKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghdGhpcy5wcmV2aW91c0RyYWdTaXplKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKG5ld1NpemVbMF0gIT09IHRoaXMucHJldmlvdXNEcmFnU2l6ZVswXSB8fFxuICAgICAgICAgICAgbmV3U2l6ZVsxXSAhPT0gdGhpcy5wcmV2aW91c0RyYWdTaXplWzFdKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRyYWdQb3NpdGlvbkNoYW5nZWQobmV3UG9zaXRpb246IFtudW1iZXIsIG51bWJlcl0pOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCF0aGlzLnByZXZpb3VzRHJhZ1Bvc2l0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKG5ld1Bvc2l0aW9uWzBdICE9PSB0aGlzLnByZXZpb3VzRHJhZ1Bvc2l0aW9uWzBdIHx8XG4gICAgICAgICAgICBuZXdQb3NpdGlvblsxXSAhPT0gdGhpcy5wcmV2aW91c0RyYWdQb3NpdGlvblsxXSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBoaWdobGlnaHRQb3NpdGlvbkZvckl0ZW0oaXRlbTogR3JpZExpc3RJdGVtKSB7XG4gICAgICAgIGNvbnN0IHNpemUgPSBpdGVtLmNhbGN1bGF0ZVNpemUodGhpcyk7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gaXRlbS5jYWxjdWxhdGVQb3NpdGlvbih0aGlzKTtcblxuICAgICAgICB0aGlzLiRwb3NpdGlvbkhpZ2hsaWdodC5zdHlsZS53aWR0aCA9IHNpemUud2lkdGggKyAncHgnO1xuICAgICAgICB0aGlzLiRwb3NpdGlvbkhpZ2hsaWdodC5zdHlsZS5oZWlnaHQgPSBzaXplLmhlaWdodCArICdweCc7XG4gICAgICAgIHRoaXMuJHBvc2l0aW9uSGlnaGxpZ2h0LnN0eWxlLmxlZnQgPSBwb3NpdGlvbi5sZWZ0ICsgJ3B4JztcbiAgICAgICAgdGhpcy4kcG9zaXRpb25IaWdobGlnaHQuc3R5bGUudG9wID0gcG9zaXRpb24udG9wICsgJ3B4JztcbiAgICAgICAgdGhpcy4kcG9zaXRpb25IaWdobGlnaHQuc3R5bGUuZGlzcGxheSA9ICcnO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaGVpZ2h0VG9Gb250U2l6ZVJhdGlvKSB7XG4gICAgICAgICAgICAoPGFueT50aGlzLiRwb3NpdGlvbkhpZ2hsaWdodC5zdHlsZSlbJ2ZvbnQtc2l6ZSddID0gdGhpcy5fZm9udFNpemU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgdXBkYXRlQ2FjaGVkSXRlbXMoKSB7XG4gICAgICAgIC8vIE5vdGlmeSB0aGUgdXNlciB3aXRoIHRoZSBpdGVtcyB0aGF0IGNoYW5nZWQgc2luY2UgdGhlIHByZXZpb3VzIHNuYXBzaG90XG4gICAgICAgIHRoaXMudHJpZ2dlck9uQ2hhbmdlKG51bGwpO1xuICAgICAgICB0aGlzLmdyaWRzdGVyT3B0aW9ucy5yZXNwb25zaXZlT3B0aW9ucy5mb3JFYWNoKChvcHRpb25zOiBJR3JpZHN0ZXJPcHRpb25zKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJPbkNoYW5nZShvcHRpb25zLmJyZWFrcG9pbnQpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmNvcHlJdGVtcygpO1xuICAgIH1cblxuICAgIHByaXZhdGUgdHJpZ2dlck9uQ2hhbmdlKGJyZWFrcG9pbnQ/OiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgaXRlbXMgPSBicmVha3BvaW50ID8gdGhpcy5faXRlbXNNYXBbYnJlYWtwb2ludF0gOiB0aGlzLl9pdGVtcztcbiAgICAgICAgY29uc3QgY2hhbmdlSXRlbXMgPSB0aGlzLmdyaWRMaXN0LmdldENoYW5nZWRJdGVtcyhpdGVtcyB8fCBbXSwgYnJlYWtwb2ludCk7XG5cbiAgICAgICAgY2hhbmdlSXRlbXNcbiAgICAgICAgICAgIC5maWx0ZXIoKGl0ZW1DaGFuZ2U6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtQ2hhbmdlLml0ZW0uaXRlbUNvbXBvbmVudDtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuZm9yRWFjaCgoaXRlbUNoYW5nZTogYW55KSA9PiB7XG5cbiAgICAgICAgICAgICAgICBpZiAoaXRlbUNoYW5nZS5jaGFuZ2VzLmluZGV4T2YoJ3gnKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1DaGFuZ2UuaXRlbS50cmlnZ2VyQ2hhbmdlWChicmVha3BvaW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW1DaGFuZ2UuY2hhbmdlcy5pbmRleE9mKCd5JykgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICBpdGVtQ2hhbmdlLml0ZW0udHJpZ2dlckNoYW5nZVkoYnJlYWtwb2ludCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChpdGVtQ2hhbmdlLmNoYW5nZXMuaW5kZXhPZigndycpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbUNoYW5nZS5pdGVtLnRyaWdnZXJDaGFuZ2VXKGJyZWFrcG9pbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaXRlbUNoYW5nZS5jaGFuZ2VzLmluZGV4T2YoJ2gnKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1DaGFuZ2UuaXRlbS50cmlnZ2VyQ2hhbmdlSChicmVha3BvaW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gc2hvdWxkIGJlIGNhbGxlZCBvbmx5IG9uY2UgKG5vdCBmb3IgZWFjaCBicmVha3BvaW50KVxuICAgICAgICAgICAgICAgIGl0ZW1DaGFuZ2UuaXRlbS5pdGVtQ29tcG9uZW50LmNoYW5nZS5lbWl0KHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbUNoYW5nZS5pdGVtLFxuICAgICAgICAgICAgICAgICAgICBvbGRWYWx1ZXM6IGl0ZW1DaGFuZ2Uub2xkVmFsdWVzIHx8IHt9LFxuICAgICAgICAgICAgICAgICAgICBpc05ldzogaXRlbUNoYW5nZS5pc05ldyxcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlczogaXRlbUNoYW5nZS5jaGFuZ2VzLFxuICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50OiBicmVha3BvaW50XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbW92ZVBvc2l0aW9uSGlnaGxpZ2h0KCkge1xuICAgICAgICB0aGlzLiRwb3NpdGlvbkhpZ2hsaWdodC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH1cblxufVxuIl19