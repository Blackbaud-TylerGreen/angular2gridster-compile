import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { GridList } from './gridList/gridList';
let GridsterService = class GridsterService {
    constructor() {
        this.items = [];
        this._items = [];
        this._itemsMap = {};
        this.disabledItems = [];
        this.debounceRenderSubject = new Subject();
        this.itemRemoveSubject = new Subject();
        this.isInit = false;
        this.itemRemoveSubject.pipe(debounceTime(0)).subscribe(() => {
            this.gridList.pullItemsToLeft();
            this.render();
            this.updateCachedItems();
        });
        this.debounceRenderSubject.pipe(debounceTime(0)).subscribe(() => this.render());
    }
    isInitialized() {
        return this.isInit;
    }
    /**
     * Must be called before init
     * @param item
     */
    registerItem(item) {
        this.items.push(item);
        return item;
    }
    init(gridsterComponent) {
        this.gridsterComponent = gridsterComponent;
        this.draggableOptions = gridsterComponent.draggableOptions;
        this.gridsterOptions = gridsterComponent.gridsterOptions;
    }
    start() {
        this.updateMaxItemSize();
        // Used to highlight a position an element will land on upon drop
        if (this.$positionHighlight) {
            this.removePositionHighlight();
        }
        this.initGridList();
        this.isInit = true;
        setTimeout(() => {
            this.copyItems();
            this.fixItemsPositions();
            this.gridsterComponent.reflowGridster(true);
            this.gridsterComponent.setReady();
        });
    }
    initGridList() {
        // Create instance of GridList (decoupled lib for handling the grid
        // positioning and sorting post-drag and dropping)
        this.gridList = new GridList(this.items, this.options);
    }
    render() {
        this.updateMaxItemSize();
        this.gridList.generateGrid();
        this.applySizeToItems();
        this.applyPositionToItems();
        this.refreshLines();
    }
    reflow() {
        this.calculateCellSize();
        this.render();
    }
    fixItemsPositions() {
        if (this.options.responsiveSizes) {
            this.gridList.fixItemsPositions(this.options);
        }
        else {
            this.gridList.fixItemsPositions(this.gridsterOptions.basicOptions);
            this.gridsterOptions.responsiveOptions.forEach((options) => {
                this.gridList.fixItemsPositions(options);
            });
        }
        this.updateCachedItems();
    }
    removeItem(item) {
        const idx = this.items.indexOf(item);
        if (idx >= 0) {
            this.items.splice(this.items.indexOf(item), 1);
        }
        this.gridList.deleteItemPositionFromGrid(item);
        this.removeItemFromCache(item);
    }
    onResizeStart(item) {
        this.currentElement = item.$element;
        this.copyItems();
        this._maxGridCols = this.gridList.grid.length;
        this.highlightPositionForItem(item);
        this.gridsterComponent.isResizing = true;
        this.refreshLines();
    }
    onResizeDrag(item) {
        const newSize = this.snapItemSizeToGrid(item);
        const sizeChanged = this.dragSizeChanged(newSize);
        const newPosition = this.snapItemPositionToGrid(item);
        const positionChanged = this.dragPositionChanged(newPosition);
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
    }
    onResizeStop(item) {
        this.currentElement = undefined;
        this.updateCachedItems();
        this.previousDragSize = null;
        this.removePositionHighlight();
        this.gridsterComponent.isResizing = false;
        this.gridList.pullItemsToLeft(item);
        this.debounceRenderSubject.next();
        this.fixItemsPositions();
    }
    onStart(item) {
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
    }
    onDrag(item) {
        const newPosition = this.snapItemPositionToGrid(item);
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
    }
    cancel() {
        this.restoreCachedItems();
        this.previousDragPosition = null;
        this.updateMaxItemSize();
        this.applyPositionToItems();
        this.removePositionHighlight();
        this.currentElement = undefined;
        this.gridsterComponent.isDragging = false;
    }
    onDragOut(item) {
        this.cancel();
        const idx = this.items.indexOf(item);
        if (idx >= 0) {
            this.items.splice(idx, 1);
        }
        this.gridList.pullItemsToLeft();
        this.render();
    }
    onStop(item) {
        this.currentElement = undefined;
        this.updateCachedItems();
        this.previousDragPosition = null;
        this.removePositionHighlight();
        this.gridList.pullItemsToLeft(item);
        this.gridsterComponent.isDragging = false;
        this.refreshLines();
    }
    calculateCellSize() {
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
    }
    applyPositionToItems(increaseGridsterSize) {
        if (!this.options.shrink) {
            increaseGridsterSize = true;
        }
        // TODO: Implement group separators
        for (let i = 0; i < this.items.length; i++) {
            // Don't interfere with the positions of the dragged items
            if (this.isCurrentElement(this.items[i].$element)) {
                continue;
            }
            this.items[i].applyPosition(this);
        }
        const child = this.gridsterComponent.$element.firstChild;
        // Update the width of the entire grid container with enough room on the
        // right to allow dragging items to the end of the grid.
        if (this.options.direction === 'horizontal') {
            const increaseWidthWith = (increaseGridsterSize) ? this.maxItemWidth : 0;
            child.style.height = '';
            child.style.width = ((this.gridList.grid.length + increaseWidthWith) * this.cellWidth) + 'px';
        }
        else if (this.gridList.grid.length) {
            // todo: fix me
            const rowHeights = this.getRowHeights();
            const rowTops = this.getRowTops(rowHeights);
            const height = rowTops[rowTops.length - 1] + rowHeights[rowHeights.length - 1];
            const previousHeight = child.style.height;
            child.style.height = height + 'px';
            child.style.width = '';
            if (previousHeight !== child.style.height) {
                this.refreshLines();
            }
        }
    }
    getRowHeights() {
        const result = [];
        for (let row = 0; row < this.gridList.grid.length; row++) {
            result.push(0);
            for (let column = 0; column < this.gridList.grid[row].length; column++) {
                const item = this.gridList.grid[row][column];
                if (item) {
                    const height = item.contentHeight / item.h;
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
    }
    getRowTops(rowHeights) {
        const result = [];
        let lastHeight = 0;
        for (const rowHeight of rowHeights) {
            result.push(lastHeight);
            lastHeight += rowHeight;
        }
        return result;
    }
    refreshLines() {
        const canvas = this.gridsterComponent.$backgroundGrid.nativeElement;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        const canvasContext = canvas.getContext('2d');
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        if (this.options.lines && this.options.lines.visible &&
            (this.gridsterComponent.isDragging || this.gridsterComponent.isResizing || this.options.lines.always)) {
            const linesColor = this.options.lines.color || '#d8d8d8';
            const linesBgColor = this.options.lines.backgroundColor || 'transparent';
            const linesWidth = this.options.lines.width || 1;
            canvasContext.fillStyle = linesBgColor;
            canvasContext.fillRect(0, 0, canvas.width, canvas.height);
            canvasContext.strokeStyle = linesColor;
            canvasContext.lineWidth = linesWidth;
            canvasContext.beginPath();
            // draw row lines
            const rowHeights = this.getRowHeights();
            const rowTops = this.getRowTops(rowHeights);
            for (let i = 0; i < rowTops.length; i++) {
                canvasContext.moveTo(0, rowTops[i]);
                canvasContext.lineTo(canvas.width, rowTops[i]);
            }
            // draw column lines
            for (let i = 0; i < this.options.lanes; i++) {
                canvasContext.moveTo(i * this.cellWidth, 0);
                canvasContext.lineTo(i * this.cellWidth, canvas.height);
            }
            canvasContext.stroke();
            canvasContext.closePath();
        }
    }
    removeItemFromCache(item) {
        this._items = this._items
            .filter(cachedItem => cachedItem.$element !== item.$element);
        Object.keys(this._itemsMap)
            .forEach((breakpoint) => {
            this._itemsMap[breakpoint] = this._itemsMap[breakpoint]
                .filter(cachedItem => cachedItem.$element !== item.$element);
        });
    }
    copyItems() {
        this._items = this.items
            .filter(item => this.isValidGridItem(item))
            .map((item) => {
            return item.copyForBreakpoint(null);
        });
        this.gridsterOptions.responsiveOptions.forEach((options) => {
            this._itemsMap[options.breakpoint] = this.items
                .filter(item => this.isValidGridItem(item))
                .map((item) => {
                return item.copyForBreakpoint(options.breakpoint);
            });
        });
    }
    /**
     * Update maxItemWidth and maxItemHeight vales according to current state of items
     */
    updateMaxItemSize() {
        this.maxItemWidth = Math.max.apply(null, this.items.map((item) => {
            return item.w;
        }));
        this.maxItemHeight = Math.max.apply(null, this.items.map((item) => {
            return item.h;
        }));
    }
    /**
     * Update items properties of previously cached items
     */
    restoreCachedItems() {
        const items = this.options.breakpoint ? this._itemsMap[this.options.breakpoint] : this._items;
        this.items
            .filter(item => this.isValidGridItem(item))
            .forEach((item) => {
            const cachedItem = items.filter(cachedItm => {
                return cachedItm.$element === item.$element;
            })[0];
            item.x = cachedItem.x;
            item.y = cachedItem.y;
            item.w = cachedItem.w;
            item.h = cachedItem.h;
            item.autoSize = cachedItem.autoSize;
        });
    }
    /**
     * If item should react on grid
     * @param GridListItem item
     * @returns boolean
     */
    isValidGridItem(item) {
        if (this.options.direction === 'none') {
            return !!item.itemComponent;
        }
        return true;
    }
    calculateCellWidth() {
        const gridsterWidth = parseFloat(window.getComputedStyle(this.gridsterComponent.$element).width);
        return gridsterWidth / this.options.lanes;
    }
    calculateCellHeight() {
        const gridsterHeight = parseFloat(window.getComputedStyle(this.gridsterComponent.$element).height);
        return gridsterHeight / this.options.lanes;
    }
    applySizeToItems() {
        for (let i = 0; i < this.items.length; i++) {
            this.items[i].applySize();
            if (this.options.heightToFontSizeRatio) {
                this.items[i].$element.style['font-size'] = this._fontSize;
            }
        }
    }
    isCurrentElement(element) {
        if (!this.currentElement) {
            return false;
        }
        return element === this.currentElement;
    }
    snapItemSizeToGrid(item) {
        const itemSize = {
            width: parseInt(item.$element.style.width, 10) - 1,
            height: parseInt(item.$element.style.height, 10) - 1
        };
        let colSize = Math.round(itemSize.width / this.cellWidth);
        let rowSize = Math.round(itemSize.height / this.cellHeight);
        // Keep item minimum 1
        colSize = Math.max(colSize, 1);
        rowSize = Math.max(rowSize, 1);
        // check if element is pinned
        if (this.gridList.isOverFixedArea(item.x, item.y, colSize, rowSize, item)) {
            return [item.w, item.h];
        }
        return [colSize, rowSize];
    }
    generateItemPosition(item) {
        let position;
        if (item.itemPrototype) {
            const coords = item.itemPrototype.getPositionToGridster(this);
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
    }
    snapItemPositionToGrid(item) {
        const position = this.generateItemPosition(item);
        let col = position.x;
        let row = position.y;
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
    }
    dragSizeChanged(newSize) {
        if (!this.previousDragSize) {
            return true;
        }
        return (newSize[0] !== this.previousDragSize[0] ||
            newSize[1] !== this.previousDragSize[1]);
    }
    dragPositionChanged(newPosition) {
        if (!this.previousDragPosition) {
            return true;
        }
        return (newPosition[0] !== this.previousDragPosition[0] ||
            newPosition[1] !== this.previousDragPosition[1]);
    }
    highlightPositionForItem(item) {
        const size = item.calculateSize(this);
        const position = item.calculatePosition(this);
        this.$positionHighlight.style.width = size.width + 'px';
        this.$positionHighlight.style.height = size.height + 'px';
        this.$positionHighlight.style.left = position.left + 'px';
        this.$positionHighlight.style.top = position.top + 'px';
        this.$positionHighlight.style.display = '';
        if (this.options.heightToFontSizeRatio) {
            this.$positionHighlight.style['font-size'] = this._fontSize;
        }
    }
    updateCachedItems() {
        // Notify the user with the items that changed since the previous snapshot
        this.triggerOnChange(null);
        this.gridsterOptions.responsiveOptions.forEach((options) => {
            this.triggerOnChange(options.breakpoint);
        });
        this.copyItems();
    }
    triggerOnChange(breakpoint) {
        const items = breakpoint ? this._itemsMap[breakpoint] : this._items;
        const changeItems = this.gridList.getChangedItems(items || [], breakpoint);
        changeItems
            .filter((itemChange) => {
            return itemChange.item.itemComponent;
        })
            .forEach((itemChange) => {
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
    }
    removePositionHighlight() {
        this.$positionHighlight.style.display = 'none';
    }
};
GridsterService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], GridsterService);
export { GridsterService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZHN0ZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXIyZ3JpZHN0ZXIvIiwic291cmNlcyI6WyJsaWIvZ3JpZHN0ZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQy9CLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUU5QyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFRL0MsSUFBYSxlQUFlLEdBQTVCLE1BQWEsZUFBZTtJQTJDeEI7UUF0Q0EsVUFBSyxHQUF3QixFQUFFLENBQUM7UUFDaEMsV0FBTSxHQUF3QixFQUFFLENBQUM7UUFDakMsY0FBUyxHQUFrRCxFQUFFLENBQUM7UUFDOUQsa0JBQWEsR0FBd0IsRUFBRSxDQUFDO1FBWXhDLDBCQUFxQixHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7UUFVL0Isc0JBQWlCLEdBQTBCLElBQUksT0FBTyxFQUFFLENBQUM7UUFXeEQsV0FBTSxHQUFHLEtBQUssQ0FBQztRQUduQixJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDeEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUNoQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDZCxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUM3QixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ3BG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QyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7Z0JBQ3RDLElBQUksRUFBRSxVQUFVLENBQUMsSUFBSTtnQkFDckIsU0FBUyxFQUFFLFVBQVUsQ0FBQyxTQUFTLElBQUksRUFBRTtnQkFDckMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxLQUFLO2dCQUN2QixPQUFPLEVBQUUsVUFBVSxDQUFDLE9BQU87Z0JBQzNCLFVBQVUsRUFBRSxVQUFVO2FBQ3pCLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUVPLHVCQUF1QjtRQUMzQixJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7SUFDbkQsQ0FBQztDQUVKLENBQUE7QUE3bkJZLGVBQWU7SUFEM0IsVUFBVSxFQUFFOztHQUNBLGVBQWUsQ0E2bkIzQjtTQTduQlksZUFBZSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGRlYm91bmNlVGltZSB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHsgR3JpZExpc3QgfSBmcm9tICcuL2dyaWRMaXN0L2dyaWRMaXN0JztcbmltcG9ydCB7IElHcmlkc3Rlck9wdGlvbnMgfSBmcm9tICcuL0lHcmlkc3Rlck9wdGlvbnMnO1xuaW1wb3J0IHsgSUdyaWRzdGVyRHJhZ2dhYmxlT3B0aW9ucyB9IGZyb20gJy4vSUdyaWRzdGVyRHJhZ2dhYmxlT3B0aW9ucyc7XG5pbXBvcnQgeyBHcmlkTGlzdEl0ZW0gfSBmcm9tICcuL2dyaWRMaXN0L0dyaWRMaXN0SXRlbSc7XG5pbXBvcnQgeyBHcmlkc3RlckNvbXBvbmVudCB9IGZyb20gJy4vZ3JpZHN0ZXIuY29tcG9uZW50JztcbmltcG9ydCB7IEdyaWRzdGVyT3B0aW9ucyB9IGZyb20gJy4vR3JpZHN0ZXJPcHRpb25zJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEdyaWRzdGVyU2VydmljZSB7XG4gICAgJGVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuXG4gICAgZ3JpZExpc3Q6IEdyaWRMaXN0O1xuXG4gICAgaXRlbXM6IEFycmF5PEdyaWRMaXN0SXRlbT4gPSBbXTtcbiAgICBfaXRlbXM6IEFycmF5PEdyaWRMaXN0SXRlbT4gPSBbXTtcbiAgICBfaXRlbXNNYXA6IHsgW2JyZWFrcG9pbnQ6IHN0cmluZ106IEFycmF5PEdyaWRMaXN0SXRlbT4gfSA9IHt9O1xuICAgIGRpc2FibGVkSXRlbXM6IEFycmF5PEdyaWRMaXN0SXRlbT4gPSBbXTtcblxuICAgIG9wdGlvbnM6IElHcmlkc3Rlck9wdGlvbnM7XG4gICAgZHJhZ2dhYmxlT3B0aW9uczogSUdyaWRzdGVyRHJhZ2dhYmxlT3B0aW9ucztcblxuICAgIGdyaWRzdGVyUmVjdDogQ2xpZW50UmVjdDtcbiAgICBncmlkc3RlclNjcm9sbERhdGE6IHsgc2Nyb2xsVG9wOiBudW1iZXIsIHNjcm9sbExlZnQ6IG51bWJlciB9O1xuXG4gICAgZ3JpZHN0ZXJPcHRpb25zOiBHcmlkc3Rlck9wdGlvbnM7XG5cbiAgICBncmlkc3RlckNvbXBvbmVudDogR3JpZHN0ZXJDb21wb25lbnQ7XG5cbiAgICBkZWJvdW5jZVJlbmRlclN1YmplY3QgPSBuZXcgU3ViamVjdCgpO1xuXG4gICAgcHVibGljICRwb3NpdGlvbkhpZ2hsaWdodDogSFRNTEVsZW1lbnQ7XG5cbiAgICBwdWJsaWMgbWF4SXRlbVdpZHRoOiBudW1iZXI7XG4gICAgcHVibGljIG1heEl0ZW1IZWlnaHQ6IG51bWJlcjtcblxuICAgIHB1YmxpYyBjZWxsV2lkdGg6IG51bWJlcjtcbiAgICBwdWJsaWMgY2VsbEhlaWdodDogbnVtYmVyO1xuXG4gICAgcHVibGljIGl0ZW1SZW1vdmVTdWJqZWN0OiBTdWJqZWN0PEdyaWRMaXN0SXRlbT4gPSBuZXcgU3ViamVjdCgpO1xuXG4gICAgcHJpdmF0ZSBfZm9udFNpemU6IG51bWJlcjtcblxuICAgIHByaXZhdGUgcHJldmlvdXNEcmFnUG9zaXRpb246IEFycmF5PG51bWJlcj47XG4gICAgcHJpdmF0ZSBwcmV2aW91c0RyYWdTaXplOiBBcnJheTxudW1iZXI+O1xuXG4gICAgcHJpdmF0ZSBjdXJyZW50RWxlbWVudDogSFRNTEVsZW1lbnQ7XG5cbiAgICBwcml2YXRlIF9tYXhHcmlkQ29sczogbnVtYmVyO1xuXG4gICAgcHJpdmF0ZSBpc0luaXQgPSBmYWxzZTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLml0ZW1SZW1vdmVTdWJqZWN0LnBpcGUoZGVib3VuY2VUaW1lKDApKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5ncmlkTGlzdC5wdWxsSXRlbXNUb0xlZnQoKTtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUNhY2hlZEl0ZW1zKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZGVib3VuY2VSZW5kZXJTdWJqZWN0LnBpcGUoZGVib3VuY2VUaW1lKDApKS5zdWJzY3JpYmUoKCkgPT4gdGhpcy5yZW5kZXIoKSk7XG4gICAgfVxuXG4gICAgaXNJbml0aWFsaXplZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNJbml0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE11c3QgYmUgY2FsbGVkIGJlZm9yZSBpbml0XG4gICAgICogQHBhcmFtIGl0ZW1cbiAgICAgKi9cbiAgICByZWdpc3Rlckl0ZW0oaXRlbTogR3JpZExpc3RJdGVtKSB7XG5cbiAgICAgICAgdGhpcy5pdGVtcy5wdXNoKGl0ZW0pO1xuICAgICAgICByZXR1cm4gaXRlbTtcbiAgICB9XG5cbiAgICBpbml0KGdyaWRzdGVyQ29tcG9uZW50OiBHcmlkc3RlckNvbXBvbmVudCkge1xuXG4gICAgICAgIHRoaXMuZ3JpZHN0ZXJDb21wb25lbnQgPSBncmlkc3RlckNvbXBvbmVudDtcblxuICAgICAgICB0aGlzLmRyYWdnYWJsZU9wdGlvbnMgPSBncmlkc3RlckNvbXBvbmVudC5kcmFnZ2FibGVPcHRpb25zO1xuXG4gICAgICAgIHRoaXMuZ3JpZHN0ZXJPcHRpb25zID0gZ3JpZHN0ZXJDb21wb25lbnQuZ3JpZHN0ZXJPcHRpb25zO1xuICAgIH1cblxuICAgIHN0YXJ0KCkge1xuICAgICAgICB0aGlzLnVwZGF0ZU1heEl0ZW1TaXplKCk7XG5cbiAgICAgICAgLy8gVXNlZCB0byBoaWdobGlnaHQgYSBwb3NpdGlvbiBhbiBlbGVtZW50IHdpbGwgbGFuZCBvbiB1cG9uIGRyb3BcbiAgICAgICAgaWYgKHRoaXMuJHBvc2l0aW9uSGlnaGxpZ2h0KSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZVBvc2l0aW9uSGlnaGxpZ2h0KCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmluaXRHcmlkTGlzdCgpO1xuXG4gICAgICAgIHRoaXMuaXNJbml0ID0gdHJ1ZTtcblxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY29weUl0ZW1zKCk7XG4gICAgICAgICAgICB0aGlzLmZpeEl0ZW1zUG9zaXRpb25zKCk7XG5cbiAgICAgICAgICAgIHRoaXMuZ3JpZHN0ZXJDb21wb25lbnQucmVmbG93R3JpZHN0ZXIodHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLmdyaWRzdGVyQ29tcG9uZW50LnNldFJlYWR5KCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGluaXRHcmlkTGlzdCgpIHtcbiAgICAgICAgLy8gQ3JlYXRlIGluc3RhbmNlIG9mIEdyaWRMaXN0IChkZWNvdXBsZWQgbGliIGZvciBoYW5kbGluZyB0aGUgZ3JpZFxuICAgICAgICAvLyBwb3NpdGlvbmluZyBhbmQgc29ydGluZyBwb3N0LWRyYWcgYW5kIGRyb3BwaW5nKVxuICAgICAgICB0aGlzLmdyaWRMaXN0ID0gbmV3IEdyaWRMaXN0KHRoaXMuaXRlbXMsIHRoaXMub3B0aW9ucyk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICB0aGlzLnVwZGF0ZU1heEl0ZW1TaXplKCk7XG4gICAgICAgIHRoaXMuZ3JpZExpc3QuZ2VuZXJhdGVHcmlkKCk7XG4gICAgICAgIHRoaXMuYXBwbHlTaXplVG9JdGVtcygpO1xuICAgICAgICB0aGlzLmFwcGx5UG9zaXRpb25Ub0l0ZW1zKCk7XG4gICAgICAgIHRoaXMucmVmcmVzaExpbmVzKCk7XG4gICAgfVxuXG4gICAgcmVmbG93KCkge1xuICAgICAgICB0aGlzLmNhbGN1bGF0ZUNlbGxTaXplKCk7XG4gICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgfVxuXG4gICAgZml4SXRlbXNQb3NpdGlvbnMoKSB7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmVzcG9uc2l2ZVNpemVzKSB7XG4gICAgICAgICAgICB0aGlzLmdyaWRMaXN0LmZpeEl0ZW1zUG9zaXRpb25zKHRoaXMub3B0aW9ucyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmdyaWRMaXN0LmZpeEl0ZW1zUG9zaXRpb25zKHRoaXMuZ3JpZHN0ZXJPcHRpb25zLmJhc2ljT3B0aW9ucyk7XG4gICAgICAgICAgICB0aGlzLmdyaWRzdGVyT3B0aW9ucy5yZXNwb25zaXZlT3B0aW9ucy5mb3JFYWNoKChvcHRpb25zOiBJR3JpZHN0ZXJPcHRpb25zKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5ncmlkTGlzdC5maXhJdGVtc1Bvc2l0aW9ucyhvcHRpb25zKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy51cGRhdGVDYWNoZWRJdGVtcygpO1xuICAgIH1cblxuICAgIHJlbW92ZUl0ZW0oaXRlbTogR3JpZExpc3RJdGVtKSB7XG4gICAgICAgIGNvbnN0IGlkeCA9IHRoaXMuaXRlbXMuaW5kZXhPZihpdGVtKTtcblxuICAgICAgICBpZiAoaWR4ID49IDApIHtcbiAgICAgICAgICAgIHRoaXMuaXRlbXMuc3BsaWNlKHRoaXMuaXRlbXMuaW5kZXhPZihpdGVtKSwgMSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmdyaWRMaXN0LmRlbGV0ZUl0ZW1Qb3NpdGlvbkZyb21HcmlkKGl0ZW0pO1xuICAgICAgICB0aGlzLnJlbW92ZUl0ZW1Gcm9tQ2FjaGUoaXRlbSk7XG4gICAgfVxuXG4gICAgb25SZXNpemVTdGFydChpdGVtOiBHcmlkTGlzdEl0ZW0pIHtcbiAgICAgICAgdGhpcy5jdXJyZW50RWxlbWVudCA9IGl0ZW0uJGVsZW1lbnQ7XG5cbiAgICAgICAgdGhpcy5jb3B5SXRlbXMoKTtcblxuICAgICAgICB0aGlzLl9tYXhHcmlkQ29scyA9IHRoaXMuZ3JpZExpc3QuZ3JpZC5sZW5ndGg7XG5cbiAgICAgICAgdGhpcy5oaWdobGlnaHRQb3NpdGlvbkZvckl0ZW0oaXRlbSk7XG5cbiAgICAgICAgdGhpcy5ncmlkc3RlckNvbXBvbmVudC5pc1Jlc2l6aW5nID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLnJlZnJlc2hMaW5lcygpO1xuICAgIH1cblxuICAgIG9uUmVzaXplRHJhZyhpdGVtOiBHcmlkTGlzdEl0ZW0pIHtcbiAgICAgICAgY29uc3QgbmV3U2l6ZSA9IHRoaXMuc25hcEl0ZW1TaXplVG9HcmlkKGl0ZW0pO1xuICAgICAgICBjb25zdCBzaXplQ2hhbmdlZCA9IHRoaXMuZHJhZ1NpemVDaGFuZ2VkKG5ld1NpemUpO1xuICAgICAgICBjb25zdCBuZXdQb3NpdGlvbiA9IHRoaXMuc25hcEl0ZW1Qb3NpdGlvblRvR3JpZChpdGVtKTtcbiAgICAgICAgY29uc3QgcG9zaXRpb25DaGFuZ2VkID0gdGhpcy5kcmFnUG9zaXRpb25DaGFuZ2VkKG5ld1Bvc2l0aW9uKTtcblxuICAgICAgICBpZiAoc2l6ZUNoYW5nZWQgfHwgcG9zaXRpb25DaGFuZ2VkKSB7XG4gICAgICAgICAgICAvLyBSZWdlbmVyYXRlIHRoZSBncmlkIHdpdGggdGhlIHBvc2l0aW9ucyBmcm9tIHdoZW4gdGhlIGRyYWcgc3RhcnRlZFxuICAgICAgICAgICAgdGhpcy5yZXN0b3JlQ2FjaGVkSXRlbXMoKTtcbiAgICAgICAgICAgIHRoaXMuZ3JpZExpc3QuZ2VuZXJhdGVHcmlkKCk7XG5cbiAgICAgICAgICAgIHRoaXMucHJldmlvdXNEcmFnUG9zaXRpb24gPSBuZXdQb3NpdGlvbjtcbiAgICAgICAgICAgIHRoaXMucHJldmlvdXNEcmFnU2l6ZSA9IG5ld1NpemU7XG5cbiAgICAgICAgICAgIHRoaXMuZ3JpZExpc3QubW92ZUFuZFJlc2l6ZShpdGVtLCBuZXdQb3NpdGlvbiwge3c6IG5ld1NpemVbMF0sIGg6IG5ld1NpemVbMV19KTtcblxuICAgICAgICAgICAgLy8gVmlzdWFsbHkgdXBkYXRlIGl0ZW0gcG9zaXRpb25zIGFuZCBoaWdobGlnaHQgc2hhcGVcbiAgICAgICAgICAgIHRoaXMuYXBwbHlQb3NpdGlvblRvSXRlbXModHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLmFwcGx5U2l6ZVRvSXRlbXMoKTtcbiAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0UG9zaXRpb25Gb3JJdGVtKGl0ZW0pO1xuICAgICAgICAgICAgdGhpcy5yZWZyZXNoTGluZXMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uUmVzaXplU3RvcChpdGVtOiBHcmlkTGlzdEl0ZW0pIHtcbiAgICAgICAgdGhpcy5jdXJyZW50RWxlbWVudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy51cGRhdGVDYWNoZWRJdGVtcygpO1xuICAgICAgICB0aGlzLnByZXZpb3VzRHJhZ1NpemUgPSBudWxsO1xuXG4gICAgICAgIHRoaXMucmVtb3ZlUG9zaXRpb25IaWdobGlnaHQoKTtcblxuICAgICAgICB0aGlzLmdyaWRzdGVyQ29tcG9uZW50LmlzUmVzaXppbmcgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLmdyaWRMaXN0LnB1bGxJdGVtc1RvTGVmdChpdGVtKTtcbiAgICAgICAgdGhpcy5kZWJvdW5jZVJlbmRlclN1YmplY3QubmV4dCgpO1xuXG4gICAgICAgIHRoaXMuZml4SXRlbXNQb3NpdGlvbnMoKTtcbiAgICB9XG5cbiAgICBvblN0YXJ0KGl0ZW06IEdyaWRMaXN0SXRlbSkge1xuICAgICAgICB0aGlzLmN1cnJlbnRFbGVtZW50ID0gaXRlbS4kZWxlbWVudDtcbiAgICAgICAgLy8gaXRlbUN0cmwuaXNEcmFnZ2luZyA9IHRydWU7XG4gICAgICAgIC8vIENyZWF0ZSBhIGRlZXAgY29weSBvZiB0aGUgaXRlbXM7IHdlIHVzZSB0aGVtIHRvIHJldmVydCB0aGUgaXRlbVxuICAgICAgICAvLyBwb3NpdGlvbnMgYWZ0ZXIgZWFjaCBkcmFnIGNoYW5nZSwgbWFraW5nIGFuIGVudGlyZSBkcmFnIG9wZXJhdGlvbiBsZXNzXG4gICAgICAgIC8vIGRpc3RydWN0YWJsZVxuICAgICAgICB0aGlzLmNvcHlJdGVtcygpO1xuXG4gICAgICAgIC8vIFNpbmNlIGRyYWdnaW5nIGFjdHVhbGx5IGFsdGVycyB0aGUgZ3JpZCwgd2UgbmVlZCB0byBlc3RhYmxpc2ggdGhlIG51bWJlclxuICAgICAgICAvLyBvZiBjb2xzICgrMSBleHRyYSkgYmVmb3JlIHRoZSBkcmFnIHN0YXJ0c1xuXG4gICAgICAgIHRoaXMuX21heEdyaWRDb2xzID0gdGhpcy5ncmlkTGlzdC5ncmlkLmxlbmd0aDtcblxuICAgICAgICB0aGlzLmdyaWRzdGVyQ29tcG9uZW50LmlzRHJhZ2dpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLmdyaWRzdGVyQ29tcG9uZW50LnVwZGF0ZUdyaWRzdGVyRWxlbWVudERhdGEoKTtcblxuICAgICAgICB0aGlzLnJlZnJlc2hMaW5lcygpO1xuICAgIH1cblxuICAgIG9uRHJhZyhpdGVtOiBHcmlkTGlzdEl0ZW0pIHtcbiAgICAgICAgY29uc3QgbmV3UG9zaXRpb24gPSB0aGlzLnNuYXBJdGVtUG9zaXRpb25Ub0dyaWQoaXRlbSk7XG5cbiAgICAgICAgaWYgKHRoaXMuZHJhZ1Bvc2l0aW9uQ2hhbmdlZChuZXdQb3NpdGlvbikpIHtcblxuICAgICAgICAgICAgLy8gUmVnZW5lcmF0ZSB0aGUgZ3JpZCB3aXRoIHRoZSBwb3NpdGlvbnMgZnJvbSB3aGVuIHRoZSBkcmFnIHN0YXJ0ZWRcbiAgICAgICAgICAgIHRoaXMucmVzdG9yZUNhY2hlZEl0ZW1zKCk7XG4gICAgICAgICAgICB0aGlzLmdyaWRMaXN0LmdlbmVyYXRlR3JpZCgpO1xuXG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzRHJhZ1Bvc2l0aW9uID0gbmV3UG9zaXRpb247XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRpcmVjdGlvbiA9PT0gJ25vbmUnICYmXG4gICAgICAgICAgICAgICAgIXRoaXMuZ3JpZExpc3QuY2hlY2tJdGVtQWJvdmVFbXB0eUFyZWEoaXRlbSwge3g6IG5ld1Bvc2l0aW9uWzBdLCB5OiBuZXdQb3NpdGlvblsxXX0pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTaW5jZSB0aGUgaXRlbXMgbGlzdCBpcyBhIGRlZXAgY29weSwgd2UgbmVlZCB0byBmZXRjaCB0aGUgaXRlbVxuICAgICAgICAgICAgLy8gY29ycmVzcG9uZGluZyB0byB0aGlzIGRyYWcgYWN0aW9uIGFnYWluXG4gICAgICAgICAgICB0aGlzLmdyaWRMaXN0Lm1vdmVJdGVtVG9Qb3NpdGlvbihpdGVtLCBuZXdQb3NpdGlvbik7XG5cbiAgICAgICAgICAgIC8vIFZpc3VhbGx5IHVwZGF0ZSBpdGVtIHBvc2l0aW9ucyBhbmQgaGlnaGxpZ2h0IHNoYXBlXG4gICAgICAgICAgICB0aGlzLmFwcGx5UG9zaXRpb25Ub0l0ZW1zKHRydWUpO1xuICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRQb3NpdGlvbkZvckl0ZW0oaXRlbSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjYW5jZWwoKSB7XG4gICAgICAgIHRoaXMucmVzdG9yZUNhY2hlZEl0ZW1zKCk7XG4gICAgICAgIHRoaXMucHJldmlvdXNEcmFnUG9zaXRpb24gPSBudWxsO1xuICAgICAgICB0aGlzLnVwZGF0ZU1heEl0ZW1TaXplKCk7XG4gICAgICAgIHRoaXMuYXBwbHlQb3NpdGlvblRvSXRlbXMoKTtcbiAgICAgICAgdGhpcy5yZW1vdmVQb3NpdGlvbkhpZ2hsaWdodCgpO1xuICAgICAgICB0aGlzLmN1cnJlbnRFbGVtZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmdyaWRzdGVyQ29tcG9uZW50LmlzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBvbkRyYWdPdXQgKGl0ZW06IEdyaWRMaXN0SXRlbSkge1xuXG4gICAgICAgIHRoaXMuY2FuY2VsKCk7XG5cbiAgICAgICAgY29uc3QgaWR4ID0gdGhpcy5pdGVtcy5pbmRleE9mKGl0ZW0pO1xuICAgICAgICBpZiAoaWR4ID49IDApIHtcbiAgICAgICAgICAgIHRoaXMuaXRlbXMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmdyaWRMaXN0LnB1bGxJdGVtc1RvTGVmdCgpO1xuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cblxuICAgIG9uU3RvcChpdGVtOiBHcmlkTGlzdEl0ZW0pIHtcbiAgICAgICAgdGhpcy5jdXJyZW50RWxlbWVudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy51cGRhdGVDYWNoZWRJdGVtcygpO1xuICAgICAgICB0aGlzLnByZXZpb3VzRHJhZ1Bvc2l0aW9uID0gbnVsbDtcblxuICAgICAgICB0aGlzLnJlbW92ZVBvc2l0aW9uSGlnaGxpZ2h0KCk7XG5cbiAgICAgICAgdGhpcy5ncmlkTGlzdC5wdWxsSXRlbXNUb0xlZnQoaXRlbSk7XG5cbiAgICAgICAgdGhpcy5ncmlkc3RlckNvbXBvbmVudC5pc0RyYWdnaW5nID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5yZWZyZXNoTGluZXMoKTtcbiAgICB9XG5cbiAgICBjYWxjdWxhdGVDZWxsU2l6ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kaXJlY3Rpb24gPT09ICdob3Jpem9udGFsJykge1xuICAgICAgICAgICAgdGhpcy5jZWxsSGVpZ2h0ID0gdGhpcy5jYWxjdWxhdGVDZWxsSGVpZ2h0KCk7XG4gICAgICAgICAgICB0aGlzLmNlbGxXaWR0aCA9IHRoaXMub3B0aW9ucy5jZWxsV2lkdGggfHwgdGhpcy5jZWxsSGVpZ2h0ICogdGhpcy5vcHRpb25zLndpZHRoSGVpZ2h0UmF0aW87XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNlbGxXaWR0aCA9IHRoaXMuY2FsY3VsYXRlQ2VsbFdpZHRoKCk7XG4gICAgICAgICAgICB0aGlzLmNlbGxIZWlnaHQgPSB0aGlzLm9wdGlvbnMuY2VsbEhlaWdodCB8fCB0aGlzLmNlbGxXaWR0aCAvIHRoaXMub3B0aW9ucy53aWR0aEhlaWdodFJhdGlvO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaGVpZ2h0VG9Gb250U2l6ZVJhdGlvKSB7XG4gICAgICAgICAgICB0aGlzLl9mb250U2l6ZSA9IHRoaXMuY2VsbEhlaWdodCAqIHRoaXMub3B0aW9ucy5oZWlnaHRUb0ZvbnRTaXplUmF0aW87XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhcHBseVBvc2l0aW9uVG9JdGVtcyhpbmNyZWFzZUdyaWRzdGVyU2l6ZT86IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuc2hyaW5rKSB7XG4gICAgICAgICAgICBpbmNyZWFzZUdyaWRzdGVyU2l6ZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVE9ETzogSW1wbGVtZW50IGdyb3VwIHNlcGFyYXRvcnNcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLml0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAvLyBEb24ndCBpbnRlcmZlcmUgd2l0aCB0aGUgcG9zaXRpb25zIG9mIHRoZSBkcmFnZ2VkIGl0ZW1zXG4gICAgICAgICAgICBpZiAodGhpcy5pc0N1cnJlbnRFbGVtZW50KHRoaXMuaXRlbXNbaV0uJGVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLml0ZW1zW2ldLmFwcGx5UG9zaXRpb24odGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjaGlsZCA9IDxIVE1MRWxlbWVudD50aGlzLmdyaWRzdGVyQ29tcG9uZW50LiRlbGVtZW50LmZpcnN0Q2hpbGQ7XG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgd2lkdGggb2YgdGhlIGVudGlyZSBncmlkIGNvbnRhaW5lciB3aXRoIGVub3VnaCByb29tIG9uIHRoZVxuICAgICAgICAvLyByaWdodCB0byBhbGxvdyBkcmFnZ2luZyBpdGVtcyB0byB0aGUgZW5kIG9mIHRoZSBncmlkLlxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRpcmVjdGlvbiA9PT0gJ2hvcml6b250YWwnKSB7XG4gICAgICAgICAgICBjb25zdCBpbmNyZWFzZVdpZHRoV2l0aCA9IChpbmNyZWFzZUdyaWRzdGVyU2l6ZSkgPyB0aGlzLm1heEl0ZW1XaWR0aCA6IDA7XG4gICAgICAgICAgICBjaGlsZC5zdHlsZS5oZWlnaHQgPSAnJztcbiAgICAgICAgICAgIGNoaWxkLnN0eWxlLndpZHRoID0gKCh0aGlzLmdyaWRMaXN0LmdyaWQubGVuZ3RoICsgaW5jcmVhc2VXaWR0aFdpdGgpICogdGhpcy5jZWxsV2lkdGgpICsgJ3B4JztcblxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZ3JpZExpc3QuZ3JpZC5sZW5ndGgpIHtcbiAgICAgICAgICAgIC8vIHRvZG86IGZpeCBtZVxuICAgICAgICAgICAgY29uc3Qgcm93SGVpZ2h0cyA9IHRoaXMuZ2V0Um93SGVpZ2h0cygpO1xuICAgICAgICAgICAgY29uc3Qgcm93VG9wcyA9IHRoaXMuZ2V0Um93VG9wcyhyb3dIZWlnaHRzKTtcbiAgICAgICAgICAgIGNvbnN0IGhlaWdodCA9IHJvd1RvcHNbcm93VG9wcy5sZW5ndGggLSAxXSArIHJvd0hlaWdodHNbcm93SGVpZ2h0cy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzSGVpZ2h0ID0gY2hpbGQuc3R5bGUuaGVpZ2h0O1xuICAgICAgICAgICAgY2hpbGQuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgJ3B4JztcbiAgICAgICAgICAgIGNoaWxkLnN0eWxlLndpZHRoID0gJyc7XG5cbiAgICAgICAgICAgIGlmIChwcmV2aW91c0hlaWdodCAhPT0gY2hpbGQuc3R5bGUuaGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoTGluZXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldFJvd0hlaWdodHMoKTogbnVtYmVyW10ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgdGhpcy5ncmlkTGlzdC5ncmlkLmxlbmd0aDsgcm93KyspIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKDApO1xuICAgICAgICAgICAgZm9yIChsZXQgY29sdW1uID0gMDsgY29sdW1uIDwgdGhpcy5ncmlkTGlzdC5ncmlkW3Jvd10ubGVuZ3RoOyBjb2x1bW4rKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLmdyaWRMaXN0LmdyaWRbcm93XVtjb2x1bW5dO1xuICAgICAgICAgICAgICAgIGlmIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhlaWdodCA9IGl0ZW0uY29udGVudEhlaWdodCAvIGl0ZW0uaDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0udmFyaWFibGVIZWlnaHQgJiYgaGVpZ2h0ID4gcmVzdWx0W3Jvd10pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtyb3ddID0gaGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlc3VsdFtyb3ddID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W3Jvd10gPSB0aGlzLmNlbGxIZWlnaHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBnZXRSb3dUb3BzKHJvd0hlaWdodHM6IG51bWJlcltdKTogbnVtYmVyW10ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICAgICAgbGV0IGxhc3RIZWlnaHQgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IHJvd0hlaWdodCBvZiByb3dIZWlnaHRzKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaChsYXN0SGVpZ2h0KTtcbiAgICAgICAgICAgIGxhc3RIZWlnaHQgKz0gcm93SGVpZ2h0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcmVmcmVzaExpbmVzKCkge1xuICAgICAgICBjb25zdCBjYW52YXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+dGhpcy5ncmlkc3RlckNvbXBvbmVudC4kYmFja2dyb3VuZEdyaWQubmF0aXZlRWxlbWVudDtcbiAgICAgICAgY2FudmFzLndpZHRoID0gY2FudmFzLm9mZnNldFdpZHRoO1xuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gY2FudmFzLm9mZnNldEhlaWdodDtcbiAgICAgICAgY29uc3QgY2FudmFzQ29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgIGNhbnZhc0NvbnRleHQuY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5saW5lcyAmJiB0aGlzLm9wdGlvbnMubGluZXMudmlzaWJsZSAmJlxuICAgICAgICAgICAgKHRoaXMuZ3JpZHN0ZXJDb21wb25lbnQuaXNEcmFnZ2luZyB8fCB0aGlzLmdyaWRzdGVyQ29tcG9uZW50LmlzUmVzaXppbmcgfHwgdGhpcy5vcHRpb25zLmxpbmVzLmFsd2F5cykpIHtcbiAgICAgICAgICAgIGNvbnN0IGxpbmVzQ29sb3IgPSB0aGlzLm9wdGlvbnMubGluZXMuY29sb3IgfHwgJyNkOGQ4ZDgnO1xuICAgICAgICAgICAgY29uc3QgbGluZXNCZ0NvbG9yID0gdGhpcy5vcHRpb25zLmxpbmVzLmJhY2tncm91bmRDb2xvciB8fCAndHJhbnNwYXJlbnQnO1xuICAgICAgICAgICAgY29uc3QgbGluZXNXaWR0aCA9IHRoaXMub3B0aW9ucy5saW5lcy53aWR0aCB8fCAxO1xuXG4gICAgICAgICAgICBjYW52YXNDb250ZXh0LmZpbGxTdHlsZSA9IGxpbmVzQmdDb2xvcjtcbiAgICAgICAgICAgIGNhbnZhc0NvbnRleHQuZmlsbFJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblxuICAgICAgICAgICAgY2FudmFzQ29udGV4dC5zdHJva2VTdHlsZSA9IGxpbmVzQ29sb3I7XG4gICAgICAgICAgICBjYW52YXNDb250ZXh0LmxpbmVXaWR0aCA9IGxpbmVzV2lkdGg7XG5cbiAgICAgICAgICAgIGNhbnZhc0NvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICAvLyBkcmF3IHJvdyBsaW5lc1xuICAgICAgICAgICAgY29uc3Qgcm93SGVpZ2h0cyA9IHRoaXMuZ2V0Um93SGVpZ2h0cygpO1xuICAgICAgICAgICAgY29uc3Qgcm93VG9wcyA9IHRoaXMuZ2V0Um93VG9wcyhyb3dIZWlnaHRzKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcm93VG9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNhbnZhc0NvbnRleHQubW92ZVRvKDAsIHJvd1RvcHNbaV0pO1xuICAgICAgICAgICAgICAgIGNhbnZhc0NvbnRleHQubGluZVRvKGNhbnZhcy53aWR0aCwgcm93VG9wc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBkcmF3IGNvbHVtbiBsaW5lc1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm9wdGlvbnMubGFuZXM7IGkrKykge1xuICAgICAgICAgICAgICAgIGNhbnZhc0NvbnRleHQubW92ZVRvKGkgKiB0aGlzLmNlbGxXaWR0aCwgMCk7XG4gICAgICAgICAgICAgICAgY2FudmFzQ29udGV4dC5saW5lVG8oaSAqIHRoaXMuY2VsbFdpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbnZhc0NvbnRleHQuc3Ryb2tlKCk7XG4gICAgICAgICAgICBjYW52YXNDb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW1vdmVJdGVtRnJvbUNhY2hlKGl0ZW06IEdyaWRMaXN0SXRlbSkge1xuICAgICAgICB0aGlzLl9pdGVtcyA9IHRoaXMuX2l0ZW1zXG4gICAgICAgICAgICAuZmlsdGVyKGNhY2hlZEl0ZW0gPT4gY2FjaGVkSXRlbS4kZWxlbWVudCAhPT0gaXRlbS4kZWxlbWVudCk7XG5cbiAgICAgICAgT2JqZWN0LmtleXModGhpcy5faXRlbXNNYXApXG4gICAgICAgICAgICAuZm9yRWFjaCgoYnJlYWtwb2ludDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5faXRlbXNNYXBbYnJlYWtwb2ludF0gPSB0aGlzLl9pdGVtc01hcFticmVha3BvaW50XVxuICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKGNhY2hlZEl0ZW0gPT4gY2FjaGVkSXRlbS4kZWxlbWVudCAhPT0gaXRlbS4kZWxlbWVudCk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNvcHlJdGVtcygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5faXRlbXMgPSB0aGlzLml0ZW1zXG4gICAgICAgICAgICAuZmlsdGVyKGl0ZW0gPT4gdGhpcy5pc1ZhbGlkR3JpZEl0ZW0oaXRlbSkpXG4gICAgICAgICAgICAubWFwKChpdGVtOiBHcmlkTGlzdEl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbS5jb3B5Rm9yQnJlYWtwb2ludChudWxsKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZ3JpZHN0ZXJPcHRpb25zLnJlc3BvbnNpdmVPcHRpb25zLmZvckVhY2goKG9wdGlvbnM6IElHcmlkc3Rlck9wdGlvbnMpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2l0ZW1zTWFwW29wdGlvbnMuYnJlYWtwb2ludF0gPSB0aGlzLml0ZW1zXG4gICAgICAgICAgICAgICAgLmZpbHRlcihpdGVtID0+IHRoaXMuaXNWYWxpZEdyaWRJdGVtKGl0ZW0pKVxuICAgICAgICAgICAgICAgIC5tYXAoKGl0ZW06IEdyaWRMaXN0SXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbS5jb3B5Rm9yQnJlYWtwb2ludChvcHRpb25zLmJyZWFrcG9pbnQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgbWF4SXRlbVdpZHRoIGFuZCBtYXhJdGVtSGVpZ2h0IHZhbGVzIGFjY29yZGluZyB0byBjdXJyZW50IHN0YXRlIG9mIGl0ZW1zXG4gICAgICovXG4gICAgcHJpdmF0ZSB1cGRhdGVNYXhJdGVtU2l6ZSgpIHtcbiAgICAgICAgdGhpcy5tYXhJdGVtV2lkdGggPSBNYXRoLm1heC5hcHBseShcbiAgICAgICAgICAgIG51bGwsIHRoaXMuaXRlbXMubWFwKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0udztcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgdGhpcy5tYXhJdGVtSGVpZ2h0ID0gTWF0aC5tYXguYXBwbHkoXG4gICAgICAgICAgICBudWxsLCB0aGlzLml0ZW1zLm1hcCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLmg7XG4gICAgICAgICAgICB9KSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIGl0ZW1zIHByb3BlcnRpZXMgb2YgcHJldmlvdXNseSBjYWNoZWQgaXRlbXNcbiAgICAgKi9cbiAgICBwcml2YXRlIHJlc3RvcmVDYWNoZWRJdGVtcygpIHtcbiAgICAgICAgY29uc3QgaXRlbXMgPSB0aGlzLm9wdGlvbnMuYnJlYWtwb2ludCA/IHRoaXMuX2l0ZW1zTWFwW3RoaXMub3B0aW9ucy5icmVha3BvaW50XSA6IHRoaXMuX2l0ZW1zO1xuXG4gICAgICAgIHRoaXMuaXRlbXNcbiAgICAgICAgICAgIC5maWx0ZXIoaXRlbSA9PiB0aGlzLmlzVmFsaWRHcmlkSXRlbShpdGVtKSlcbiAgICAgICAgICAgIC5mb3JFYWNoKChpdGVtOiBHcmlkTGlzdEl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjYWNoZWRJdGVtOiBHcmlkTGlzdEl0ZW0gPSBpdGVtcy5maWx0ZXIoY2FjaGVkSXRtID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhY2hlZEl0bS4kZWxlbWVudCA9PT0gaXRlbS4kZWxlbWVudDtcbiAgICAgICAgICAgICAgICB9KVswXTtcblxuICAgICAgICAgICAgICAgIGl0ZW0ueCA9IGNhY2hlZEl0ZW0ueDtcbiAgICAgICAgICAgICAgICBpdGVtLnkgPSBjYWNoZWRJdGVtLnk7XG5cbiAgICAgICAgICAgICAgICBpdGVtLncgPSBjYWNoZWRJdGVtLnc7XG4gICAgICAgICAgICAgICAgaXRlbS5oID0gY2FjaGVkSXRlbS5oO1xuICAgICAgICAgICAgICAgIGl0ZW0uYXV0b1NpemUgPSBjYWNoZWRJdGVtLmF1dG9TaXplO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSWYgaXRlbSBzaG91bGQgcmVhY3Qgb24gZ3JpZFxuICAgICAqIEBwYXJhbSBHcmlkTGlzdEl0ZW0gaXRlbVxuICAgICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICAgKi9cbiAgICBwcml2YXRlIGlzVmFsaWRHcmlkSXRlbShpdGVtOiBHcmlkTGlzdEl0ZW0pOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kaXJlY3Rpb24gPT09ICdub25lJykge1xuICAgICAgICAgICAgcmV0dXJuICEhaXRlbS5pdGVtQ29tcG9uZW50O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2FsY3VsYXRlQ2VsbFdpZHRoKCkge1xuICAgICAgICBjb25zdCBncmlkc3RlcldpZHRoID0gcGFyc2VGbG9hdCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLmdyaWRzdGVyQ29tcG9uZW50LiRlbGVtZW50KS53aWR0aCk7XG5cbiAgICAgICAgcmV0dXJuIGdyaWRzdGVyV2lkdGggLyB0aGlzLm9wdGlvbnMubGFuZXM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVDZWxsSGVpZ2h0KCkge1xuICAgICAgICBjb25zdCBncmlkc3RlckhlaWdodCA9IHBhcnNlRmxvYXQod2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5ncmlkc3RlckNvbXBvbmVudC4kZWxlbWVudCkuaGVpZ2h0KTtcblxuICAgICAgICByZXR1cm4gZ3JpZHN0ZXJIZWlnaHQgLyB0aGlzLm9wdGlvbnMubGFuZXM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhcHBseVNpemVUb0l0ZW1zKCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuaXRlbXNbaV0uYXBwbHlTaXplKCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaGVpZ2h0VG9Gb250U2l6ZVJhdGlvKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtc1tpXS4kZWxlbWVudC5zdHlsZVsnZm9udC1zaXplJ10gPSB0aGlzLl9mb250U2l6ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgaXNDdXJyZW50RWxlbWVudChlbGVtZW50OiBIVE1MRWxlbWVudCkge1xuICAgICAgICBpZiAoIXRoaXMuY3VycmVudEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxlbWVudCA9PT0gdGhpcy5jdXJyZW50RWxlbWVudDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNuYXBJdGVtU2l6ZVRvR3JpZChpdGVtOiBHcmlkTGlzdEl0ZW0pOiBbbnVtYmVyLCBudW1iZXJdIHtcbiAgICAgICAgY29uc3QgaXRlbVNpemUgPSB7XG4gICAgICAgICAgICB3aWR0aDogcGFyc2VJbnQoaXRlbS4kZWxlbWVudC5zdHlsZS53aWR0aCwgMTApIC0gMSxcbiAgICAgICAgICAgIGhlaWdodDogcGFyc2VJbnQoaXRlbS4kZWxlbWVudC5zdHlsZS5oZWlnaHQsIDEwKSAtIDFcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgY29sU2l6ZSA9IE1hdGgucm91bmQoaXRlbVNpemUud2lkdGggLyB0aGlzLmNlbGxXaWR0aCk7XG4gICAgICAgIGxldCByb3dTaXplID0gTWF0aC5yb3VuZChpdGVtU2l6ZS5oZWlnaHQgLyB0aGlzLmNlbGxIZWlnaHQpO1xuXG4gICAgICAgIC8vIEtlZXAgaXRlbSBtaW5pbXVtIDFcbiAgICAgICAgY29sU2l6ZSA9IE1hdGgubWF4KGNvbFNpemUsIDEpO1xuICAgICAgICByb3dTaXplID0gTWF0aC5tYXgocm93U2l6ZSwgMSk7XG5cbiAgICAgICAgLy8gY2hlY2sgaWYgZWxlbWVudCBpcyBwaW5uZWRcbiAgICAgICAgaWYgKHRoaXMuZ3JpZExpc3QuaXNPdmVyRml4ZWRBcmVhKGl0ZW0ueCwgaXRlbS55LCBjb2xTaXplLCByb3dTaXplLCBpdGVtKSkge1xuICAgICAgICAgICAgcmV0dXJuIFtpdGVtLncsIGl0ZW0uaF07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW2NvbFNpemUsIHJvd1NpemVdO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2VuZXJhdGVJdGVtUG9zaXRpb24oaXRlbTogR3JpZExpc3RJdGVtKTogeyB4OiBudW1iZXIsIHk6IG51bWJlciB9IHtcbiAgICAgICAgbGV0IHBvc2l0aW9uO1xuXG4gICAgICAgIGlmIChpdGVtLml0ZW1Qcm90b3R5cGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvb3JkcyA9IGl0ZW0uaXRlbVByb3RvdHlwZS5nZXRQb3NpdGlvblRvR3JpZHN0ZXIodGhpcyk7XG4gICAgICAgICAgICBwb3NpdGlvbiA9IHtcbiAgICAgICAgICAgICAgICB4OiBNYXRoLnJvdW5kKGNvb3Jkcy54IC8gdGhpcy5jZWxsV2lkdGgpLFxuICAgICAgICAgICAgICAgIHk6IE1hdGgucm91bmQoY29vcmRzLnkgLyB0aGlzLmNlbGxIZWlnaHQpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcG9zaXRpb24gPSB7XG4gICAgICAgICAgICAgICAgeDogTWF0aC5yb3VuZChpdGVtLnBvc2l0aW9uWCAvIHRoaXMuY2VsbFdpZHRoKSxcbiAgICAgICAgICAgICAgICB5OiBNYXRoLnJvdW5kKGl0ZW0ucG9zaXRpb25ZIC8gdGhpcy5jZWxsSGVpZ2h0KVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwb3NpdGlvbjtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNuYXBJdGVtUG9zaXRpb25Ub0dyaWQoaXRlbTogR3JpZExpc3RJdGVtKTogW251bWJlciwgbnVtYmVyXSB7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5nZW5lcmF0ZUl0ZW1Qb3NpdGlvbihpdGVtKTtcbiAgICAgICAgbGV0IGNvbCA9IHBvc2l0aW9uLng7XG4gICAgICAgIGxldCByb3cgPSBwb3NpdGlvbi55O1xuXG4gICAgICAgIC8vIEtlZXAgaXRlbSBwb3NpdGlvbiB3aXRoaW4gdGhlIGdyaWQgYW5kIGRvbid0IGxldCB0aGUgaXRlbSBjcmVhdGUgbW9yZVxuICAgICAgICAvLyB0aGFuIG9uZSBleHRyYSBjb2x1bW5cbiAgICAgICAgY29sID0gTWF0aC5tYXgoY29sLCAwKTtcbiAgICAgICAgcm93ID0gTWF0aC5tYXgocm93LCAwKTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRpcmVjdGlvbiA9PT0gJ2hvcml6b250YWwnKSB7XG4gICAgICAgICAgICBjb2wgPSBNYXRoLm1pbihjb2wsIHRoaXMuX21heEdyaWRDb2xzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbCA9IE1hdGgubWluKGNvbCwgTWF0aC5tYXgoMCwgdGhpcy5vcHRpb25zLmxhbmVzIC0gaXRlbS53KSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjaGVjayBpZiBlbGVtZW50IGlzIHBpbm5lZFxuICAgICAgICBpZiAodGhpcy5ncmlkTGlzdC5pc092ZXJGaXhlZEFyZWEoY29sLCByb3csIGl0ZW0udywgaXRlbS5oKSkge1xuICAgICAgICAgICAgcmV0dXJuIFtpdGVtLngsIGl0ZW0ueV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW2NvbCwgcm93XTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRyYWdTaXplQ2hhbmdlZChuZXdTaXplOiBbbnVtYmVyLCBudW1iZXJdKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghdGhpcy5wcmV2aW91c0RyYWdTaXplKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKG5ld1NpemVbMF0gIT09IHRoaXMucHJldmlvdXNEcmFnU2l6ZVswXSB8fFxuICAgICAgICAgICAgbmV3U2l6ZVsxXSAhPT0gdGhpcy5wcmV2aW91c0RyYWdTaXplWzFdKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRyYWdQb3NpdGlvbkNoYW5nZWQobmV3UG9zaXRpb246IFtudW1iZXIsIG51bWJlcl0pOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCF0aGlzLnByZXZpb3VzRHJhZ1Bvc2l0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKG5ld1Bvc2l0aW9uWzBdICE9PSB0aGlzLnByZXZpb3VzRHJhZ1Bvc2l0aW9uWzBdIHx8XG4gICAgICAgICAgICBuZXdQb3NpdGlvblsxXSAhPT0gdGhpcy5wcmV2aW91c0RyYWdQb3NpdGlvblsxXSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBoaWdobGlnaHRQb3NpdGlvbkZvckl0ZW0oaXRlbTogR3JpZExpc3RJdGVtKSB7XG4gICAgICAgIGNvbnN0IHNpemUgPSBpdGVtLmNhbGN1bGF0ZVNpemUodGhpcyk7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gaXRlbS5jYWxjdWxhdGVQb3NpdGlvbih0aGlzKTtcblxuICAgICAgICB0aGlzLiRwb3NpdGlvbkhpZ2hsaWdodC5zdHlsZS53aWR0aCA9IHNpemUud2lkdGggKyAncHgnO1xuICAgICAgICB0aGlzLiRwb3NpdGlvbkhpZ2hsaWdodC5zdHlsZS5oZWlnaHQgPSBzaXplLmhlaWdodCArICdweCc7XG4gICAgICAgIHRoaXMuJHBvc2l0aW9uSGlnaGxpZ2h0LnN0eWxlLmxlZnQgPSBwb3NpdGlvbi5sZWZ0ICsgJ3B4JztcbiAgICAgICAgdGhpcy4kcG9zaXRpb25IaWdobGlnaHQuc3R5bGUudG9wID0gcG9zaXRpb24udG9wICsgJ3B4JztcbiAgICAgICAgdGhpcy4kcG9zaXRpb25IaWdobGlnaHQuc3R5bGUuZGlzcGxheSA9ICcnO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaGVpZ2h0VG9Gb250U2l6ZVJhdGlvKSB7XG4gICAgICAgICAgICAoPGFueT50aGlzLiRwb3NpdGlvbkhpZ2hsaWdodC5zdHlsZSlbJ2ZvbnQtc2l6ZSddID0gdGhpcy5fZm9udFNpemU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgdXBkYXRlQ2FjaGVkSXRlbXMoKSB7XG4gICAgICAgIC8vIE5vdGlmeSB0aGUgdXNlciB3aXRoIHRoZSBpdGVtcyB0aGF0IGNoYW5nZWQgc2luY2UgdGhlIHByZXZpb3VzIHNuYXBzaG90XG4gICAgICAgIHRoaXMudHJpZ2dlck9uQ2hhbmdlKG51bGwpO1xuICAgICAgICB0aGlzLmdyaWRzdGVyT3B0aW9ucy5yZXNwb25zaXZlT3B0aW9ucy5mb3JFYWNoKChvcHRpb25zOiBJR3JpZHN0ZXJPcHRpb25zKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJPbkNoYW5nZShvcHRpb25zLmJyZWFrcG9pbnQpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmNvcHlJdGVtcygpO1xuICAgIH1cblxuICAgIHByaXZhdGUgdHJpZ2dlck9uQ2hhbmdlKGJyZWFrcG9pbnQ/OiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgaXRlbXMgPSBicmVha3BvaW50ID8gdGhpcy5faXRlbXNNYXBbYnJlYWtwb2ludF0gOiB0aGlzLl9pdGVtcztcbiAgICAgICAgY29uc3QgY2hhbmdlSXRlbXMgPSB0aGlzLmdyaWRMaXN0LmdldENoYW5nZWRJdGVtcyhpdGVtcyB8fCBbXSwgYnJlYWtwb2ludCk7XG5cbiAgICAgICAgY2hhbmdlSXRlbXNcbiAgICAgICAgICAgIC5maWx0ZXIoKGl0ZW1DaGFuZ2U6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtQ2hhbmdlLml0ZW0uaXRlbUNvbXBvbmVudDtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuZm9yRWFjaCgoaXRlbUNoYW5nZTogYW55KSA9PiB7XG5cbiAgICAgICAgICAgICAgICBpZiAoaXRlbUNoYW5nZS5jaGFuZ2VzLmluZGV4T2YoJ3gnKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1DaGFuZ2UuaXRlbS50cmlnZ2VyQ2hhbmdlWChicmVha3BvaW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW1DaGFuZ2UuY2hhbmdlcy5pbmRleE9mKCd5JykgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICBpdGVtQ2hhbmdlLml0ZW0udHJpZ2dlckNoYW5nZVkoYnJlYWtwb2ludCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChpdGVtQ2hhbmdlLmNoYW5nZXMuaW5kZXhPZigndycpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbUNoYW5nZS5pdGVtLnRyaWdnZXJDaGFuZ2VXKGJyZWFrcG9pbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaXRlbUNoYW5nZS5jaGFuZ2VzLmluZGV4T2YoJ2gnKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1DaGFuZ2UuaXRlbS50cmlnZ2VyQ2hhbmdlSChicmVha3BvaW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gc2hvdWxkIGJlIGNhbGxlZCBvbmx5IG9uY2UgKG5vdCBmb3IgZWFjaCBicmVha3BvaW50KVxuICAgICAgICAgICAgICAgIGl0ZW1DaGFuZ2UuaXRlbS5pdGVtQ29tcG9uZW50LmNoYW5nZS5lbWl0KHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbUNoYW5nZS5pdGVtLFxuICAgICAgICAgICAgICAgICAgICBvbGRWYWx1ZXM6IGl0ZW1DaGFuZ2Uub2xkVmFsdWVzIHx8IHt9LFxuICAgICAgICAgICAgICAgICAgICBpc05ldzogaXRlbUNoYW5nZS5pc05ldyxcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlczogaXRlbUNoYW5nZS5jaGFuZ2VzLFxuICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50OiBicmVha3BvaW50XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbW92ZVBvc2l0aW9uSGlnaGxpZ2h0KCkge1xuICAgICAgICB0aGlzLiRwb3NpdGlvbkhpZ2hsaWdodC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH1cblxufVxuIl19