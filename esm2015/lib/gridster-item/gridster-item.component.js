import { __decorate, __metadata, __param } from "tslib";
import { Component, OnInit, ElementRef, Inject, Input, Output, EventEmitter, SimpleChanges, OnChanges, OnDestroy, HostBinding, ChangeDetectionStrategy, AfterViewInit, NgZone, ViewEncapsulation, ViewChild } from '@angular/core';
import { GridsterService } from '../gridster.service';
import { GridListItem } from '../gridList/GridListItem';
import { Draggable } from '../utils/draggable';
import { GridList } from '../gridList/gridList';
import { utils } from '../utils/utils';
let GridsterItemComponent = class GridsterItemComponent {
    constructor(zone, elementRef, gridster) {
        this.zone = zone;
        this.xChange = new EventEmitter(true);
        this.yChange = new EventEmitter(true);
        this.xSmChange = new EventEmitter(true);
        this.ySmChange = new EventEmitter(true);
        this.xMdChange = new EventEmitter(true);
        this.yMdChange = new EventEmitter(true);
        this.xLgChange = new EventEmitter(true);
        this.yLgChange = new EventEmitter(true);
        this.xXlChange = new EventEmitter(true);
        this.yXlChange = new EventEmitter(true);
        this.wChange = new EventEmitter(true);
        this.hChange = new EventEmitter(true);
        this.wSmChange = new EventEmitter(true);
        this.hSmChange = new EventEmitter(true);
        this.wMdChange = new EventEmitter(true);
        this.hMdChange = new EventEmitter(true);
        this.wLgChange = new EventEmitter(true);
        this.hLgChange = new EventEmitter(true);
        this.wXlChange = new EventEmitter(true);
        this.hXlChange = new EventEmitter(true);
        this.change = new EventEmitter(true);
        this.start = new EventEmitter(true);
        this.end = new EventEmitter(true);
        this.dragAndDrop = true;
        this.resizable = true;
        this.options = {};
        this.variableHeight = false;
        this.isDragging = false;
        this.isResizing = false;
        this.defaultOptions = {
            minWidth: 1,
            minHeight: 1,
            maxWidth: Infinity,
            maxHeight: Infinity,
            defaultWidth: 1,
            defaultHeight: 1
        };
        this.subscriptions = [];
        this.dragSubscriptions = [];
        this.resizeSubscriptions = [];
        this.gridster = gridster;
        this.elementRef = elementRef;
        this.$element = elementRef.nativeElement;
        this.item = (new GridListItem()).setFromGridsterItem(this);
        // if gridster is initialized do not show animation on new grid-item construct
        if (this.gridster.isInitialized()) {
            this.preventAnimation();
        }
    }
    set positionX(value) {
        this._positionX = value;
    }
    get positionX() {
        return this._positionX;
    }
    set positionY(value) {
        this._positionY = value;
    }
    get positionY() {
        return this._positionY;
    }
    ngOnInit() {
        this.options = Object.assign(this.defaultOptions, this.options);
        this.w = this.w || this.options.defaultWidth;
        this.h = this.h || this.options.defaultHeight;
        this.wSm = this.wSm || this.w;
        this.hSm = this.hSm || this.h;
        this.wMd = this.wMd || this.w;
        this.hMd = this.hMd || this.h;
        this.wLg = this.wLg || this.w;
        this.hLg = this.hLg || this.h;
        this.wXl = this.wXl || this.w;
        this.hXl = this.hXl || this.h;
        if (this.gridster.isInitialized()) {
            this.setPositionsOnItem();
        }
        this.gridster.registerItem(this.item);
        this.gridster.calculateCellSize();
        this.item.applySize();
        this.item.applyPosition();
        if (this.gridster.options.dragAndDrop && this.dragAndDrop) {
            this.enableDragDrop();
        }
        if (this.gridster.isInitialized()) {
            this.gridster.render();
            this.gridster.updateCachedItems();
        }
    }
    ngAfterViewInit() {
        if (this.gridster.options.resizable && this.item.resizable) {
            this.enableResizable();
        }
        if (this.variableHeight) {
            const readySubscription = this.gridster.gridsterComponent.ready.subscribe(() => {
                this.gridster.gridList.resizeItem(this.item, { w: this.w, h: 1 });
                readySubscription.unsubscribe();
            });
            let lastOffsetHeight;
            const observer = new MutationObserver((mutations) => {
                const offsetHeight = this.item.contentHeight;
                if (offsetHeight !== lastOffsetHeight) {
                    for (const item of this.gridster.items) {
                        item.applySize();
                        item.applyPosition();
                    }
                }
                lastOffsetHeight = offsetHeight;
            });
            observer.observe(this.elementRef.nativeElement, {
                childList: true,
                subtree: true,
                attributes: true,
                characterData: true
            });
        }
    }
    ngOnChanges(changes) {
        if (!this.gridster.gridList) {
            return;
        }
        let rerender = false;
        ['w', ...Object.keys(GridListItem.W_PROPERTY_MAP).map(breakpoint => GridListItem.W_PROPERTY_MAP[breakpoint])]
            .filter(propName => changes[propName] && !changes[propName].isFirstChange())
            .forEach((propName) => {
            if (changes[propName].currentValue > this.options.maxWidth) {
                // @ts-ignore
                this[propName] = this.options.maxWidth;
                setTimeout(() => this[(propName + 'Change')].emit(this[propName]));
            }
            rerender = true;
        });
        ['h', ...Object.keys(GridListItem.H_PROPERTY_MAP).map(breakpoint => GridListItem.H_PROPERTY_MAP[breakpoint])]
            .filter(propName => changes[propName] && !changes[propName].isFirstChange())
            .forEach((propName) => {
            if (changes[propName].currentValue > this.options.maxHeight) {
                // @ts-ignore
                this[propName] = this.options.maxHeight;
                setTimeout(() => this[(propName + 'Change')].emit(this[propName]));
            }
            rerender = true;
        });
        ['x', 'y',
            ...Object.keys(GridListItem.X_PROPERTY_MAP).map(breakpoint => GridListItem.X_PROPERTY_MAP[breakpoint]),
            ...Object.keys(GridListItem.Y_PROPERTY_MAP).map(breakpoint => GridListItem.Y_PROPERTY_MAP[breakpoint])]
            .filter(propName => changes[propName] && !changes[propName].isFirstChange())
            .forEach((propName) => rerender = true);
        if (changes['dragAndDrop'] && !changes['dragAndDrop'].isFirstChange()) {
            if (changes['dragAndDrop'].currentValue && this.gridster.options.dragAndDrop) {
                this.enableDragDrop();
            }
            else {
                this.disableDraggable();
            }
        }
        if (changes['resizable'] && !changes['resizable'].isFirstChange()) {
            if (changes['resizable'].currentValue && this.gridster.options.resizable) {
                this.enableResizable();
            }
            else {
                this.disableResizable();
            }
        }
        if (rerender && this.gridster.gridsterComponent.isReady) {
            this.gridster.debounceRenderSubject.next();
        }
    }
    ngOnDestroy() {
        this.gridster.removeItem(this.item);
        this.gridster.itemRemoveSubject.next(this.item);
        this.subscriptions.forEach((sub) => {
            sub.unsubscribe();
        });
        this.disableDraggable();
        this.disableResizable();
    }
    updateElemenetPosition() {
        if (this.gridster.options.useCSSTransforms) {
            utils.setTransform(this.$element, { x: this._positionX, y: this._positionY });
        }
        else {
            utils.setCssElementPosition(this.$element, { x: this._positionX, y: this._positionY });
        }
    }
    setPositionsOnItem() {
        if (!this.item.hasPositions(this.gridster.options.breakpoint)) {
            this.setPositionsForGrid(this.gridster.options);
        }
        this.gridster.gridsterOptions.responsiveOptions
            .filter((options) => !this.item.hasPositions(options.breakpoint))
            .forEach((options) => this.setPositionsForGrid(options));
    }
    enableResizable() {
        if (this.resizeSubscriptions.length) {
            return;
        }
        this.zone.runOutsideAngular(() => {
            this.getResizeHandlers().forEach((handler) => {
                const direction = this.getResizeDirection(handler);
                if (this.hasResizableHandle(direction)) {
                    handler.style.display = 'block';
                }
                const draggable = new Draggable(handler, this.getResizableOptions());
                let startEvent;
                let startData;
                let cursorToElementPosition;
                const dragStartSub = draggable.dragStart
                    .subscribe((event) => {
                    this.zone.run(() => {
                        this.isResizing = true;
                        startEvent = event;
                        startData = this.createResizeStartObject(direction);
                        cursorToElementPosition = event.getRelativeCoordinates(this.$element);
                        this.gridster.onResizeStart(this.item);
                        this.onStart('resize');
                    });
                });
                const dragSub = draggable.dragMove
                    .subscribe((event) => {
                    const scrollData = this.gridster.gridsterScrollData;
                    this.resizeElement({
                        direction,
                        startData,
                        position: {
                            x: event.clientX - cursorToElementPosition.x - this.gridster.gridsterRect.left,
                            y: event.clientY - cursorToElementPosition.y - this.gridster.gridsterRect.top
                        },
                        startEvent,
                        moveEvent: event,
                        scrollDiffX: scrollData.scrollLeft - startData.scrollLeft,
                        scrollDiffY: scrollData.scrollTop - startData.scrollTop
                    });
                    this.gridster.onResizeDrag(this.item);
                });
                const dragStopSub = draggable.dragStop
                    .subscribe(() => {
                    this.zone.run(() => {
                        this.isResizing = false;
                        this.gridster.onResizeStop(this.item);
                        this.onEnd('resize');
                    });
                });
                this.resizeSubscriptions = this.resizeSubscriptions.concat([dragStartSub, dragSub, dragStopSub]);
            });
        });
    }
    disableResizable() {
        this.resizeSubscriptions.forEach((sub) => {
            sub.unsubscribe();
        });
        this.resizeSubscriptions = [];
        [].forEach.call(this.$element.querySelectorAll('.gridster-item-resizable-handler'), (handler) => {
            handler.style.display = '';
        });
    }
    enableDragDrop() {
        if (this.dragSubscriptions.length) {
            return;
        }
        this.zone.runOutsideAngular(() => {
            let cursorToElementPosition;
            const draggable = new Draggable(this.$element, this.getDraggableOptions());
            const dragStartSub = draggable.dragStart
                .subscribe((event) => {
                this.zone.run(() => {
                    this.gridster.onStart(this.item);
                    this.isDragging = true;
                    this.onStart('drag');
                    cursorToElementPosition = event.getRelativeCoordinates(this.$element);
                });
            });
            const dragSub = draggable.dragMove
                .subscribe((event) => {
                this.positionY = (event.clientY - cursorToElementPosition.y -
                    this.gridster.gridsterRect.top);
                this.positionX = (event.clientX - cursorToElementPosition.x -
                    this.gridster.gridsterRect.left);
                this.updateElemenetPosition();
                this.gridster.onDrag(this.item);
            });
            const dragStopSub = draggable.dragStop
                .subscribe(() => {
                this.zone.run(() => {
                    this.gridster.onStop(this.item);
                    this.gridster.debounceRenderSubject.next();
                    this.isDragging = false;
                    this.onEnd('drag');
                });
            });
            this.dragSubscriptions = this.dragSubscriptions.concat([dragStartSub, dragSub, dragStopSub]);
        });
    }
    disableDraggable() {
        this.dragSubscriptions.forEach((sub) => {
            sub.unsubscribe();
        });
        this.dragSubscriptions = [];
    }
    getResizeHandlers() {
        return [].filter.call(this.$element.children[0].children, (el) => {
            return el.classList.contains('gridster-item-resizable-handler');
        });
    }
    getDraggableOptions() {
        return Object.assign({ scrollDirection: this.gridster.options.direction }, this.gridster.draggableOptions);
    }
    getResizableOptions() {
        const resizableOptions = {};
        if (this.gridster.draggableOptions.scroll || this.gridster.draggableOptions.scroll === false) {
            resizableOptions.scroll = this.gridster.draggableOptions.scroll;
        }
        if (this.gridster.draggableOptions.scrollEdge) {
            resizableOptions.scrollEdge = this.gridster.draggableOptions.scrollEdge;
        }
        resizableOptions.scrollDirection = this.gridster.options.direction;
        return resizableOptions;
    }
    hasResizableHandle(direction) {
        const isItemResizable = this.gridster.options.resizable && this.item.resizable;
        const resizeHandles = this.gridster.options.resizeHandles;
        return isItemResizable && (!resizeHandles || (resizeHandles && !!resizeHandles[direction]));
    }
    setPositionsForGrid(options) {
        let x, y;
        const position = this.findPosition(options);
        x = options.direction === 'horizontal' ? position[0] : position[1];
        y = options.direction === 'horizontal' ? position[1] : position[0];
        this.item.setValueX(x, options.breakpoint);
        this.item.setValueY(y, options.breakpoint);
        setTimeout(() => {
            this.item.triggerChangeX(options.breakpoint);
            this.item.triggerChangeY(options.breakpoint);
        });
    }
    findPosition(options) {
        const gridList = new GridList(this.gridster.items.map(item => item.copyForBreakpoint(options.breakpoint)), options);
        return gridList.findPositionForItem(this.item, { x: 0, y: 0 });
    }
    createResizeStartObject(direction) {
        const scrollData = this.gridster.gridsterScrollData;
        return {
            top: this.positionY,
            left: this.positionX,
            height: parseInt(this.$element.style.height, 10),
            width: parseInt(this.$element.style.width, 10),
            minX: Math.max(this.item.x + this.item.w - this.options.maxWidth, 0),
            maxX: this.item.x + this.item.w - this.options.minWidth,
            minY: Math.max(this.item.y + this.item.h - this.options.maxHeight, 0),
            maxY: this.item.y + this.item.h - this.options.minHeight,
            minW: this.options.minWidth,
            maxW: Math.min(this.options.maxWidth, (this.gridster.options.direction === 'vertical' && direction.indexOf('w') < 0) ?
                this.gridster.options.lanes - this.item.x : this.options.maxWidth, direction.indexOf('w') >= 0 ?
                this.item.x + this.item.w : this.options.maxWidth),
            minH: this.options.minHeight,
            maxH: Math.min(this.options.maxHeight, (this.gridster.options.direction === 'horizontal' && direction.indexOf('n') < 0) ?
                this.gridster.options.lanes - this.item.y : this.options.maxHeight, direction.indexOf('n') >= 0 ?
                this.item.y + this.item.h : this.options.maxHeight),
            scrollLeft: scrollData.scrollLeft,
            scrollTop: scrollData.scrollTop
        };
    }
    onEnd(actionType) {
        this.end.emit({ action: actionType, item: this.item });
    }
    onStart(actionType) {
        this.start.emit({ action: actionType, item: this.item });
    }
    /**
     * Assign class for short while to prevent animation of grid item component
     */
    preventAnimation() {
        this.$element.classList.add('no-transition');
        setTimeout(() => {
            this.$element.classList.remove('no-transition');
        }, 500);
        return this;
    }
    getResizeDirection(handler) {
        for (let i = handler.classList.length - 1; i >= 0; i--) {
            if (handler.classList[i].match('handle-')) {
                return handler.classList[i].split('-')[1];
            }
        }
    }
    resizeElement(config) {
        // north
        if (config.direction.indexOf('n') >= 0) {
            this.resizeToNorth(config);
        }
        // west
        if (config.direction.indexOf('w') >= 0) {
            this.resizeToWest(config);
        }
        // east
        if (config.direction.indexOf('e') >= 0) {
            this.resizeToEast(config);
        }
        // south
        if (config.direction.indexOf('s') >= 0) {
            this.resizeToSouth(config);
        }
    }
    resizeToNorth(config) {
        const height = config.startData.height + config.startEvent.clientY -
            config.moveEvent.clientY - config.scrollDiffY;
        if (height < (config.startData.minH * this.gridster.cellHeight)) {
            this.setMinHeight('n', config);
        }
        else if (height > (config.startData.maxH * this.gridster.cellHeight)) {
            this.setMaxHeight('n', config);
        }
        else {
            this.positionY = config.position.y;
            this.$element.style.height = height + 'px';
        }
    }
    resizeToWest(config) {
        const width = config.startData.width + config.startEvent.clientX -
            config.moveEvent.clientX - config.scrollDiffX;
        if (width < (config.startData.minW * this.gridster.cellWidth)) {
            this.setMinWidth('w', config);
        }
        else if (width > (config.startData.maxW * this.gridster.cellWidth)) {
            this.setMaxWidth('w', config);
        }
        else {
            this.positionX = config.position.x;
            this.updateElemenetPosition();
            this.$element.style.width = width + 'px';
        }
    }
    resizeToEast(config) {
        const width = config.startData.width + config.moveEvent.clientX -
            config.startEvent.clientX + config.scrollDiffX;
        if (width > (config.startData.maxW * this.gridster.cellWidth)) {
            this.setMaxWidth('e', config);
        }
        else if (width < (config.startData.minW * this.gridster.cellWidth)) {
            this.setMinWidth('e', config);
        }
        else {
            this.$element.style.width = width + 'px';
        }
    }
    resizeToSouth(config) {
        const height = config.startData.height + config.moveEvent.clientY -
            config.startEvent.clientY + config.scrollDiffY;
        if (height > config.startData.maxH * this.gridster.cellHeight) {
            this.setMaxHeight('s', config);
        }
        else if (height < config.startData.minH * this.gridster.cellHeight) {
            this.setMinHeight('s', config);
        }
        else {
            this.$element.style.height = height + 'px';
        }
    }
    setMinHeight(direction, config) {
        if (direction === 'n') {
            this.$element.style.height = (config.startData.minH * this.gridster.cellHeight) + 'px';
            this.positionY = config.startData.maxY * this.gridster.cellHeight;
        }
        else {
            this.$element.style.height = (config.startData.minH * this.gridster.cellHeight) + 'px';
        }
    }
    setMinWidth(direction, config) {
        if (direction === 'w') {
            this.$element.style.width = (config.startData.minW * this.gridster.cellWidth) + 'px';
            this.positionX = config.startData.maxX * this.gridster.cellWidth;
            this.updateElemenetPosition();
        }
        else {
            this.$element.style.width = (config.startData.minW * this.gridster.cellWidth) + 'px';
        }
    }
    setMaxHeight(direction, config) {
        if (direction === 'n') {
            this.$element.style.height = (config.startData.maxH * this.gridster.cellHeight) + 'px';
            this.positionY = config.startData.minY * this.gridster.cellHeight;
        }
        else {
            this.$element.style.height = (config.startData.maxH * this.gridster.cellHeight) + 'px';
        }
    }
    setMaxWidth(direction, config) {
        if (direction === 'w') {
            this.$element.style.width = (config.startData.maxW * this.gridster.cellWidth) + 'px';
            this.positionX = config.startData.minX * this.gridster.cellWidth;
            this.updateElemenetPosition();
        }
        else {
            this.$element.style.width = (config.startData.maxW * this.gridster.cellWidth) + 'px';
        }
    }
};
GridsterItemComponent.ctorParameters = () => [
    { type: NgZone },
    { type: ElementRef, decorators: [{ type: Inject, args: [ElementRef,] }] },
    { type: GridsterService, decorators: [{ type: Inject, args: [GridsterService,] }] }
];
__decorate([
    Input(),
    __metadata("design:type", Number)
], GridsterItemComponent.prototype, "x", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], GridsterItemComponent.prototype, "xChange", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], GridsterItemComponent.prototype, "y", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], GridsterItemComponent.prototype, "yChange", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], GridsterItemComponent.prototype, "xSm", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], GridsterItemComponent.prototype, "xSmChange", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], GridsterItemComponent.prototype, "ySm", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], GridsterItemComponent.prototype, "ySmChange", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], GridsterItemComponent.prototype, "xMd", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], GridsterItemComponent.prototype, "xMdChange", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], GridsterItemComponent.prototype, "yMd", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], GridsterItemComponent.prototype, "yMdChange", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], GridsterItemComponent.prototype, "xLg", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], GridsterItemComponent.prototype, "xLgChange", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], GridsterItemComponent.prototype, "yLg", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], GridsterItemComponent.prototype, "yLgChange", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], GridsterItemComponent.prototype, "xXl", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], GridsterItemComponent.prototype, "xXlChange", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], GridsterItemComponent.prototype, "yXl", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], GridsterItemComponent.prototype, "yXlChange", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], GridsterItemComponent.prototype, "w", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], GridsterItemComponent.prototype, "wChange", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], GridsterItemComponent.prototype, "h", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], GridsterItemComponent.prototype, "hChange", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], GridsterItemComponent.prototype, "wSm", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], GridsterItemComponent.prototype, "wSmChange", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], GridsterItemComponent.prototype, "hSm", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], GridsterItemComponent.prototype, "hSmChange", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], GridsterItemComponent.prototype, "wMd", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], GridsterItemComponent.prototype, "wMdChange", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], GridsterItemComponent.prototype, "hMd", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], GridsterItemComponent.prototype, "hMdChange", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], GridsterItemComponent.prototype, "wLg", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], GridsterItemComponent.prototype, "wLgChange", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], GridsterItemComponent.prototype, "hLg", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], GridsterItemComponent.prototype, "hLgChange", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], GridsterItemComponent.prototype, "wXl", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], GridsterItemComponent.prototype, "wXlChange", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], GridsterItemComponent.prototype, "hXl", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], GridsterItemComponent.prototype, "hXlChange", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], GridsterItemComponent.prototype, "change", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], GridsterItemComponent.prototype, "start", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], GridsterItemComponent.prototype, "end", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], GridsterItemComponent.prototype, "dragAndDrop", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], GridsterItemComponent.prototype, "resizable", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], GridsterItemComponent.prototype, "options", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], GridsterItemComponent.prototype, "variableHeight", void 0);
__decorate([
    ViewChild('contentWrapper'),
    __metadata("design:type", ElementRef)
], GridsterItemComponent.prototype, "contentWrapper", void 0);
__decorate([
    HostBinding('class.is-dragging'),
    __metadata("design:type", Object)
], GridsterItemComponent.prototype, "isDragging", void 0);
__decorate([
    HostBinding('class.is-resizing'),
    __metadata("design:type", Object)
], GridsterItemComponent.prototype, "isResizing", void 0);
GridsterItemComponent = __decorate([
    Component({
        selector: 'ngx-gridster-item',
        template: `<div class="gridster-item-inner" [ngStyle]="{position: variableHeight ? 'relative' : ''}">
      <span #contentWrapper class="gridster-content-wrapper">
        <ng-content></ng-content>
      </span>
      <div class="gridster-item-resizable-handler handle-s"></div>
      <div class="gridster-item-resizable-handler handle-e"></div>
      <div class="gridster-item-resizable-handler handle-n"></div>
      <div class="gridster-item-resizable-handler handle-w"></div>
      <div class="gridster-item-resizable-handler handle-se"></div>
      <div class="gridster-item-resizable-handler handle-ne"></div>
      <div class="gridster-item-resizable-handler handle-sw"></div>
      <div class="gridster-item-resizable-handler handle-nw"></div>
    </div>`,
        changeDetection: ChangeDetectionStrategy.OnPush,
        encapsulation: ViewEncapsulation.None,
        styles: [`
    ngx-gridster-item {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        -webkit-transition: none;
        transition: none;
    }

    .gridster--ready ngx-gridster-item {
        transition: all 200ms ease;
        transition-property: left, top;
    }

    .gridster--ready.css-transform ngx-gridster-item  {
        transition-property: transform;
    }

    .gridster--ready ngx-gridster-item.is-dragging,
    .gridster--ready ngx-gridster-item.is-resizing {
        -webkit-transition: none;
        transition: none;
        z-index: 9999;
    }

    ngx-gridster-item.no-transition {
        -webkit-transition: none;
        transition: none;
    }
    ngx-gridster-item .gridster-item-resizable-handler {
        position: absolute;
        z-index: 2;
        display: none;
    }

    ngx-gridster-item .gridster-item-resizable-handler.handle-n {
      cursor: n-resize;
      height: 10px;
      right: 0;
      top: 0;
      left: 0;
    }

    ngx-gridster-item .gridster-item-resizable-handler.handle-e {
      cursor: e-resize;
      width: 10px;
      bottom: 0;
      right: 0;
      top: 0;
    }

    ngx-gridster-item .gridster-item-resizable-handler.handle-s {
      cursor: s-resize;
      height: 10px;
      right: 0;
      bottom: 0;
      left: 0;
    }

    ngx-gridster-item .gridster-item-resizable-handler.handle-w {
      cursor: w-resize;
      width: 10px;
      left: 0;
      top: 0;
      bottom: 0;
    }

    ngx-gridster-item .gridster-item-resizable-handler.handle-ne {
      cursor: ne-resize;
      width: 10px;
      height: 10px;
      right: 0;
      top: 0;
    }

    ngx-gridster-item .gridster-item-resizable-handler.handle-nw {
      cursor: nw-resize;
      width: 10px;
      height: 10px;
      left: 0;
      top: 0;
    }

    ngx-gridster-item .gridster-item-resizable-handler.handle-se {
      cursor: se-resize;
      width: 0;
      height: 0;
      right: 0;
      bottom: 0;
      border-style: solid;
      border-width: 0 0 10px 10px;
      border-color: transparent;
    }

    ngx-gridster-item .gridster-item-resizable-handler.handle-sw {
      cursor: sw-resize;
      width: 10px;
      height: 10px;
      left: 0;
      bottom: 0;
    }

    ngx-gridster-item:hover .gridster-item-resizable-handler.handle-se {
      border-color: transparent transparent #ccc
    }
    `]
    }),
    __param(1, Inject(ElementRef)),
    __param(2, Inject(GridsterService)),
    __metadata("design:paramtypes", [NgZone,
        ElementRef,
        GridsterService])
], GridsterItemComponent);
export { GridsterItemComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZHN0ZXItaXRlbS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyMmdyaWRzdGVyLyIsInNvdXJjZXMiOlsibGliL2dyaWRzdGVyLWl0ZW0vZ3JpZHN0ZXItaXRlbS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFDekQsWUFBWSxFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFDOUQsdUJBQXVCLEVBQUUsYUFBYSxFQUFFLE1BQU0sRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFHeEcsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRXRELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUV4RCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFL0MsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ2hELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQWdJdkMsSUFBYSxxQkFBcUIsR0FBbEMsTUFBYSxxQkFBcUI7SUEwRzlCLFlBQW9CLElBQVksRUFDQSxVQUFzQixFQUNqQixRQUF5QjtRQUYxQyxTQUFJLEdBQUosSUFBSSxDQUFRO1FBeEd0QixZQUFPLEdBQUcsSUFBSSxZQUFZLENBQVMsSUFBSSxDQUFDLENBQUM7UUFFekMsWUFBTyxHQUFHLElBQUksWUFBWSxDQUFTLElBQUksQ0FBQyxDQUFDO1FBR3pDLGNBQVMsR0FBRyxJQUFJLFlBQVksQ0FBUyxJQUFJLENBQUMsQ0FBQztRQUUzQyxjQUFTLEdBQUcsSUFBSSxZQUFZLENBQVMsSUFBSSxDQUFDLENBQUM7UUFHM0MsY0FBUyxHQUFHLElBQUksWUFBWSxDQUFT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QUFDO0lBZ0NELFFBQVE7UUFDSixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFaEUsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDO1FBQzdDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQztRQUM5QyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztRQUU5QixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLEVBQUU7WUFDL0IsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7U0FDN0I7UUFFRCxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVks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SUFBSTtpQkE3RzVCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztLQTJHUjtLQUdKLENBQUM7SUE0R2UsV0FBQSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUE7SUFDbEIsV0FBQSxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUE7cUNBRlYsTUFBTTtRQUNZLFVBQVU7UUFDUCxlQUFlO0dBNUdyRCxxQkFBcUIsQ0F5b0JqQztTQXpvQlkscUJBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBPbkluaXQsIEVsZW1lbnRSZWYsIEluamVjdCwgSW5wdXQsIE91dHB1dCxcbiAgICBFdmVudEVtaXR0ZXIsIFNpbXBsZUNoYW5nZXMsIE9uQ2hhbmdlcywgT25EZXN0cm95LCBIb3N0QmluZGluZyxcbiAgICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgQWZ0ZXJWaWV3SW5pdCwgTmdab25lLCBWaWV3RW5jYXBzdWxhdGlvbiwgVmlld0NoaWxkIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHsgR3JpZHN0ZXJTZXJ2aWNlIH0gZnJvbSAnLi4vZ3JpZHN0ZXIuc2VydmljZSc7XG5cbmltcG9ydCB7IEdyaWRMaXN0SXRlbSB9IGZyb20gJy4uL2dyaWRMaXN0L0dyaWRMaXN0SXRlbSc7XG5pbXBvcnQgeyBEcmFnZ2FibGVFdmVudCB9IGZyb20gJy4uL3V0aWxzL0RyYWdnYWJsZUV2ZW50JztcbmltcG9ydCB7IERyYWdnYWJsZSB9IGZyb20gJy4uL3V0aWxzL2RyYWdnYWJsZSc7XG5pbXBvcnQgeyBJR3JpZHN0ZXJPcHRpb25zIH0gZnJvbSAnLi4vSUdyaWRzdGVyT3B0aW9ucyc7XG5pbXBvcnQgeyBHcmlkTGlzdCB9IGZyb20gJy4uL2dyaWRMaXN0L2dyaWRMaXN0JztcbmltcG9ydCB7IHV0aWxzIH0gZnJvbSAnLi4vdXRpbHMvdXRpbHMnO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ25neC1ncmlkc3Rlci1pdGVtJyxcbiAgICB0ZW1wbGF0ZTogYDxkaXYgY2xhc3M9XCJncmlkc3Rlci1pdGVtLWlubmVyXCIgW25nU3R5bGVdPVwie3Bvc2l0aW9uOiB2YXJpYWJsZUhlaWdodCA/ICdyZWxhdGl2ZScgOiAnJ31cIj5cbiAgICAgIDxzcGFuICNjb250ZW50V3JhcHBlciBjbGFzcz1cImdyaWRzdGVyLWNvbnRlbnQtd3JhcHBlclwiPlxuICAgICAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XG4gICAgICA8L3NwYW4+XG4gICAgICA8ZGl2IGNsYXNzPVwiZ3JpZHN0ZXItaXRlbS1yZXNpemFibGUtaGFuZGxlciBoYW5kbGUtc1wiPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImdyaWRzdGVyLWl0ZW0tcmVzaXphYmxlLWhhbmRsZXIgaGFuZGxlLWVcIj48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJncmlkc3Rlci1pdGVtLXJlc2l6YWJsZS1oYW5kbGVyIGhhbmRsZS1uXCI+PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwiZ3JpZHN0ZXItaXRlbS1yZXNpemFibGUtaGFuZGxlciBoYW5kbGUtd1wiPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImdyaWRzdGVyLWl0ZW0tcmVzaXphYmxlLWhhbmRsZXIgaGFuZGxlLXNlXCI+PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwiZ3JpZHN0ZXItaXRlbS1yZXNpemFibGUtaGFuZGxlciBoYW5kbGUtbmVcIj48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJncmlkc3Rlci1pdGVtLXJlc2l6YWJsZS1oYW5kbGVyIGhhbmRsZS1zd1wiPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImdyaWRzdGVyLWl0ZW0tcmVzaXphYmxlLWhhbmRsZXIgaGFuZGxlLW53XCI+PC9kaXY+XG4gICAgPC9kaXY+YCxcbiAgICBzdHlsZXM6IFtgXG4gICAgbmd4LWdyaWRzdGVyLWl0ZW0ge1xuICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICB0b3A6IDA7XG4gICAgICAgIGxlZnQ6IDA7XG4gICAgICAgIHotaW5kZXg6IDE7XG4gICAgICAgIC13ZWJraXQtdHJhbnNpdGlvbjogbm9uZTtcbiAgICAgICAgdHJhbnNpdGlvbjogbm9uZTtcbiAgICB9XG5cbiAgICAuZ3JpZHN0ZXItLXJlYWR5IG5neC1ncmlkc3Rlci1pdGVtIHtcbiAgICAgICAgdHJhbnNpdGlvbjogYWxsIDIwMG1zIGVhc2U7XG4gICAgICAgIHRyYW5zaXRpb24tcHJvcGVydHk6IGxlZnQsIHRvcDtcbiAgICB9XG5cbiAgICAuZ3JpZHN0ZXItLXJlYWR5LmNzcy10cmFuc2Zvcm0gbmd4LWdyaWRzdGVyLWl0ZW0gIHtcbiAgICAgICAgdHJhbnNpdGlvbi1wcm9wZXJ0eTogdHJhbnNmb3JtO1xuICAgIH1cblxuICAgIC5ncmlkc3Rlci0tcmVhZHkgbmd4LWdyaWRzdGVyLWl0ZW0uaXMtZHJhZ2dpbmcsXG4gICAgLmdyaWRzdGVyLS1yZWFkeSBuZ3gtZ3JpZHN0ZXItaXRlbS5pcy1yZXNpemluZyB7XG4gICAgICAgIC13ZWJraXQtdHJhbnNpdGlvbjogbm9uZTtcbiAgICAgICAgdHJhbnNpdGlvbjogbm9uZTtcbiAgICAgICAgei1pbmRleDogOTk5OTtcbiAgICB9XG5cbiAgICBuZ3gtZ3JpZHN0ZXItaXRlbS5uby10cmFuc2l0aW9uIHtcbiAgICAgICAgLXdlYmtpdC10cmFuc2l0aW9uOiBub25lO1xuICAgICAgICB0cmFuc2l0aW9uOiBub25lO1xuICAgIH1cbiAgICBuZ3gtZ3JpZHN0ZXItaXRlbSAuZ3JpZHN0ZXItaXRlbS1yZXNpemFibGUtaGFuZGxlciB7XG4gICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgei1pbmRleDogMjtcbiAgICAgICAgZGlzcGxheTogbm9uZTtcbiAgICB9XG5cbiAgICBuZ3gtZ3JpZHN0ZXItaXRlbSAuZ3JpZHN0ZXItaXRlbS1yZXNpemFibGUtaGFuZGxlci5oYW5kbGUtbiB7XG4gICAgICBjdXJzb3I6IG4tcmVzaXplO1xuICAgICAgaGVpZ2h0OiAxMHB4O1xuICAgICAgcmlnaHQ6IDA7XG4gICAgICB0b3A6IDA7XG4gICAgICBsZWZ0OiAwO1xuICAgIH1cblxuICAgIG5neC1ncmlkc3Rlci1pdGVtIC5ncmlkc3Rlci1pdGVtLXJlc2l6YWJsZS1oYW5kbGVyLmhhbmRsZS1lIHtcbiAgICAgIGN1cnNvcjogZS1yZXNpemU7XG4gICAgICB3aWR0aDogMTBweDtcbiAgICAgIGJvdHRvbTogMDtcbiAgICAgIHJpZ2h0OiAwO1xuICAgICAgdG9wOiAwO1xuICAgIH1cblxuICAgIG5neC1ncmlkc3Rlci1pdGVtIC5ncmlkc3Rlci1pdGVtLXJlc2l6YWJsZS1oYW5kbGVyLmhhbmRsZS1zIHtcbiAgICAgIGN1cnNvcjogcy1yZXNpemU7XG4gICAgICBoZWlnaHQ6IDEwcHg7XG4gICAgICByaWdodDogMDtcbiAgICAgIGJvdHRvbTogMDtcbiAgICAgIGxlZnQ6IDA7XG4gICAgfVxuXG4gICAgbmd4LWdyaWRzdGVyLWl0ZW0gLmdyaWRzdGVyLWl0ZW0tcmVzaXphYmxlLWhhbmRsZXIuaGFuZGxlLXcge1xuICAgICAgY3Vyc29yOiB3LXJlc2l6ZTtcbiAgICAgIHdpZHRoOiAxMHB4O1xuICAgICAgbGVmdDogMDtcbiAgICAgIHRvcDogMDtcbiAgICAgIGJvdHRvbTogMDtcbiAgICB9XG5cbiAgICBuZ3gtZ3JpZHN0ZXItaXRlbSAuZ3JpZHN0ZXItaXRlbS1yZXNpemFibGUtaGFuZGxlci5oYW5kbGUtbmUge1xuICAgICAgY3Vyc29yOiBuZS1yZXNpemU7XG4gICAgICB3aWR0aDogMTBweDtcbiAgICAgIGhlaWdodDogMTBweDtcbiAgICAgIHJpZ2h0OiAwO1xuICAgICAgdG9wOiAwO1xuICAgIH1cblxuICAgIG5neC1ncmlkc3Rlci1pdGVtIC5ncmlkc3Rlci1pdGVtLXJlc2l6YWJsZS1oYW5kbGVyLmhhbmRsZS1udyB7XG4gICAgICBjdXJzb3I6IG53LXJlc2l6ZTtcbiAgICAgIHdpZHRoOiAxMHB4O1xuICAgICAgaGVpZ2h0OiAxMHB4O1xuICAgICAgbGVmdDogMDtcbiAgICAgIHRvcDogMDtcbiAgICB9XG5cbiAgICBuZ3gtZ3JpZHN0ZXItaXRlbSAuZ3JpZHN0ZXItaXRlbS1yZXNpemFibGUtaGFuZGxlci5oYW5kbGUtc2Uge1xuICAgICAgY3Vyc29yOiBzZS1yZXNpemU7XG4gICAgICB3aWR0aDogMDtcbiAgICAgIGhlaWdodDogMDtcbiAgICAgIHJpZ2h0OiAwO1xuICAgICAgYm90dG9tOiAwO1xuICAgICAgYm9yZGVyLXN0eWxlOiBzb2xpZDtcbiAgICAgIGJvcmRlci13aWR0aDogMCAwIDEwcHggMTBweDtcbiAgICAgIGJvcmRlci1jb2xvcjogdHJhbnNwYXJlbnQ7XG4gICAgfVxuXG4gICAgbmd4LWdyaWRzdGVyLWl0ZW0gLmdyaWRzdGVyLWl0ZW0tcmVzaXphYmxlLWhhbmRsZXIuaGFuZGxlLXN3IHtcbiAgICAgIGN1cnNvcjogc3ctcmVzaXplO1xuICAgICAgd2lkdGg6IDEwcHg7XG4gICAgICBoZWlnaHQ6IDEwcHg7XG4gICAgICBsZWZ0OiAwO1xuICAgICAgYm90dG9tOiAwO1xuICAgIH1cblxuICAgIG5neC1ncmlkc3Rlci1pdGVtOmhvdmVyIC5ncmlkc3Rlci1pdGVtLXJlc2l6YWJsZS1oYW5kbGVyLmhhbmRsZS1zZSB7XG4gICAgICBib3JkZXItY29sb3I6IHRyYW5zcGFyZW50IHRyYW5zcGFyZW50ICNjY2NcbiAgICB9XG4gICAgYF0sXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZVxufSlcbmV4cG9ydCBjbGFzcyBHcmlkc3Rlckl0ZW1Db21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcywgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcbiAgICBASW5wdXQoKSB4OiBudW1iZXI7XG4gICAgQE91dHB1dCgpIHhDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPG51bWJlcj4odHJ1ZSk7XG4gICAgQElucHV0KCkgeTogbnVtYmVyO1xuICAgIEBPdXRwdXQoKSB5Q2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxudW1iZXI+KHRydWUpO1xuXG4gICAgQElucHV0KCkgeFNtOiBudW1iZXI7XG4gICAgQE91dHB1dCgpIHhTbUNoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8bnVtYmVyPih0cnVlKTtcbiAgICBASW5wdXQoKSB5U206IG51bWJlcjtcbiAgICBAT3V0cHV0KCkgeVNtQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxudW1iZXI+KHRydWUpO1xuXG4gICAgQElucHV0KCkgeE1kOiBudW1iZXI7XG4gICAgQE91dHB1dCgpIHhNZENoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8bnVtYmVyPih0cnVlKTtcbiAgICBASW5wdXQoKSB5TWQ6IG51bWJlcjtcbiAgICBAT3V0cHV0KCkgeU1kQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxudW1iZXI+KHRydWUpO1xuXG4gICAgQElucHV0KCkgeExnOiBudW1iZXI7XG4gICAgQE91dHB1dCgpIHhMZ0NoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8bnVtYmVyPih0cnVlKTtcbiAgICBASW5wdXQoKSB5TGc6IG51bWJlcjtcbiAgICBAT3V0cHV0KCkgeUxnQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxudW1iZXI+KHRydWUpO1xuXG4gICAgQElucHV0KCkgeFhsOiBudW1iZXI7XG4gICAgQE91dHB1dCgpIHhYbENoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8bnVtYmVyPih0cnVlKTtcbiAgICBASW5wdXQoKSB5WGw6IG51bWJlcjtcbiAgICBAT3V0cHV0KCkgeVhsQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxudW1iZXI+KHRydWUpO1xuXG5cbiAgICBASW5wdXQoKSB3OiBudW1iZXI7XG4gICAgQE91dHB1dCgpIHdDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPG51bWJlcj4odHJ1ZSk7XG4gICAgQElucHV0KCkgaDogbnVtYmVyO1xuICAgIEBPdXRwdXQoKSBoQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxudW1iZXI+KHRydWUpO1xuXG4gICAgQElucHV0KCkgd1NtOiBudW1iZXI7XG4gICAgQE91dHB1dCgpIHdTbUNoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8bnVtYmVyPih0cnVlKTtcbiAgICBASW5wdXQoKSBoU206IG51bWJlcjtcbiAgICBAT3V0cHV0KCkgaFNtQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxudW1iZXI+KHRydWUpO1xuXG4gICAgQElucHV0KCkgd01kOiBudW1iZXI7XG4gICAgQE91dHB1dCgpIHdNZENoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8bnVtYmVyPih0cnVlKTtcbiAgICBASW5wdXQoKSBoTWQ6IG51bWJlcjtcbiAgICBAT3V0cHV0KCkgaE1kQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxudW1iZXI+KHRydWUpO1xuXG4gICAgQElucHV0KCkgd0xnOiBudW1iZXI7XG4gICAgQE91dHB1dCgpIHdMZ0NoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8bnVtYmVyPih0cnVlKTtcbiAgICBASW5wdXQoKSBoTGc6IG51bWJlcjtcbiAgICBAT3V0cHV0KCkgaExnQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxudW1iZXI+KHRydWUpO1xuXG4gICAgQElucHV0KCkgd1hsOiBudW1iZXI7XG4gICAgQE91dHB1dCgpIHdYbENoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8bnVtYmVyPih0cnVlKTtcbiAgICBASW5wdXQoKSBoWGw6IG51bWJlcjtcbiAgICBAT3V0cHV0KCkgaFhsQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxudW1iZXI+KHRydWUpO1xuXG4gICAgQE91dHB1dCgpIGNoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8YW55Pih0cnVlKTtcbiAgICBAT3V0cHV0KCkgc3RhcnQgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4odHJ1ZSk7XG4gICAgQE91dHB1dCgpIGVuZCA9IG5ldyBFdmVudEVtaXR0ZXI8YW55Pih0cnVlKTtcblxuICAgIEBJbnB1dCgpIGRyYWdBbmREcm9wID0gdHJ1ZTtcbiAgICBASW5wdXQoKSByZXNpemFibGUgPSB0cnVlO1xuXG4gICAgQElucHV0KCkgb3B0aW9uczogYW55ID0ge307XG5cbiAgICBASW5wdXQoKSB2YXJpYWJsZUhlaWdodCA9IGZhbHNlO1xuXG4gICAgQFZpZXdDaGlsZCgnY29udGVudFdyYXBwZXInKSBjb250ZW50V3JhcHBlcjogRWxlbWVudFJlZjtcblxuICAgIGF1dG9TaXplOiBib29sZWFuO1xuXG4gICAgQEhvc3RCaW5kaW5nKCdjbGFzcy5pcy1kcmFnZ2luZycpIGlzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICBASG9zdEJpbmRpbmcoJ2NsYXNzLmlzLXJlc2l6aW5nJykgaXNSZXNpemluZyA9IGZhbHNlO1xuXG4gICAgJGVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuICAgIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWY7XG4gICAgLyoqXG4gICAgICogR3JpZHN0ZXIgcHJvdmlkZXIgc2VydmljZVxuICAgICAqL1xuICAgIGdyaWRzdGVyOiBHcmlkc3RlclNlcnZpY2U7XG5cbiAgICBpdGVtOiBHcmlkTGlzdEl0ZW07XG5cbiAgICBzZXQgcG9zaXRpb25YKHZhbHVlOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5fcG9zaXRpb25YID0gdmFsdWU7XG4gICAgfVxuICAgIGdldCBwb3NpdGlvblgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wb3NpdGlvblg7XG4gICAgfVxuICAgIHNldCBwb3NpdGlvblkodmFsdWU6IG51bWJlcikge1xuICAgICAgICB0aGlzLl9wb3NpdGlvblkgPSB2YWx1ZTtcbiAgICB9XG4gICAgZ2V0IHBvc2l0aW9uWSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Bvc2l0aW9uWTtcbiAgICB9XG4gICAgcHJpdmF0ZSBfcG9zaXRpb25YOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBfcG9zaXRpb25ZOiBudW1iZXI7XG5cbiAgICBwcml2YXRlIGRlZmF1bHRPcHRpb25zOiBhbnkgPSB7XG4gICAgICAgIG1pbldpZHRoOiAxLFxuICAgICAgICBtaW5IZWlnaHQ6IDEsXG4gICAgICAgIG1heFdpZHRoOiBJbmZpbml0eSxcbiAgICAgICAgbWF4SGVpZ2h0OiBJbmZpbml0eSxcbiAgICAgICAgZGVmYXVsdFdpZHRoOiAxLFxuICAgICAgICBkZWZhdWx0SGVpZ2h0OiAxXG4gICAgfTtcbiAgICBwcml2YXRlIHN1YnNjcmlwdGlvbnM6IEFycmF5PFN1YnNjcmlwdGlvbj4gPSBbXTtcbiAgICBwcml2YXRlIGRyYWdTdWJzY3JpcHRpb25zOiBBcnJheTxTdWJzY3JpcHRpb24+ID0gW107XG4gICAgcHJpdmF0ZSByZXNpemVTdWJzY3JpcHRpb25zOiBBcnJheTxTdWJzY3JpcHRpb24+ID0gW107XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHpvbmU6IE5nWm9uZSxcbiAgICAgICAgICAgICAgICBASW5qZWN0KEVsZW1lbnRSZWYpIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgICAgICAgICAgICAgQEluamVjdChHcmlkc3RlclNlcnZpY2UpIGdyaWRzdGVyOiBHcmlkc3RlclNlcnZpY2UpIHtcblxuICAgICAgICB0aGlzLmdyaWRzdGVyID0gZ3JpZHN0ZXI7XG4gICAgICAgIHRoaXMuZWxlbWVudFJlZiA9IGVsZW1lbnRSZWY7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgICAgICAgdGhpcy5pdGVtID0gKG5ldyBHcmlkTGlzdEl0ZW0oKSkuc2V0RnJvbUdyaWRzdGVySXRlbSh0aGlzKTtcblxuICAgICAgICAvLyBpZiBncmlkc3RlciBpcyBpbml0aWFsaXplZCBkbyBub3Qgc2hvdyBhbmltYXRpb24gb24gbmV3IGdyaWQtaXRlbSBjb25zdHJ1Y3RcbiAgICAgICAgaWYgKHRoaXMuZ3JpZHN0ZXIuaXNJbml0aWFsaXplZCgpKSB7XG4gICAgICAgICAgICB0aGlzLnByZXZlbnRBbmltYXRpb24oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG5nT25Jbml0KCkge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHRoaXMuZGVmYXVsdE9wdGlvbnMsIHRoaXMub3B0aW9ucyk7XG5cbiAgICAgICAgdGhpcy53ID0gdGhpcy53IHx8IHRoaXMub3B0aW9ucy5kZWZhdWx0V2lkdGg7XG4gICAgICAgIHRoaXMuaCA9IHRoaXMuaCB8fCB0aGlzLm9wdGlvbnMuZGVmYXVsdEhlaWdodDtcbiAgICAgICAgdGhpcy53U20gPSB0aGlzLndTbSB8fCB0aGlzLnc7XG4gICAgICAgIHRoaXMuaFNtID0gdGhpcy5oU20gfHwgdGhpcy5oO1xuICAgICAgICB0aGlzLndNZCA9IHRoaXMud01kIHx8IHRoaXMudztcbiAgICAgICAgdGhpcy5oTWQgPSB0aGlzLmhNZCB8fCB0aGlzLmg7XG4gICAgICAgIHRoaXMud0xnID0gdGhpcy53TGcgfHwgdGhpcy53O1xuICAgICAgICB0aGlzLmhMZyA9IHRoaXMuaExnIHx8IHRoaXMuaDtcbiAgICAgICAgdGhpcy53WGwgPSB0aGlzLndYbCB8fCB0aGlzLnc7XG4gICAgICAgIHRoaXMuaFhsID0gdGhpcy5oWGwgfHwgdGhpcy5oO1xuXG4gICAgICAgIGlmICh0aGlzLmdyaWRzdGVyLmlzSW5pdGlhbGl6ZWQoKSkge1xuICAgICAgICAgICAgdGhpcy5zZXRQb3NpdGlvbnNPbkl0ZW0oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZ3JpZHN0ZXIucmVnaXN0ZXJJdGVtKHRoaXMuaXRlbSk7XG5cbiAgICAgICAgdGhpcy5ncmlkc3Rlci5jYWxjdWxhdGVDZWxsU2l6ZSgpO1xuICAgICAgICB0aGlzLml0ZW0uYXBwbHlTaXplKCk7XG4gICAgICAgIHRoaXMuaXRlbS5hcHBseVBvc2l0aW9uKCk7XG5cbiAgICAgICAgaWYgKHRoaXMuZ3JpZHN0ZXIub3B0aW9ucy5kcmFnQW5kRHJvcCAmJiB0aGlzLmRyYWdBbmREcm9wKSB7XG4gICAgICAgICAgICB0aGlzLmVuYWJsZURyYWdEcm9wKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5ncmlkc3Rlci5pc0luaXRpYWxpemVkKCkpIHtcbiAgICAgICAgICAgIHRoaXMuZ3JpZHN0ZXIucmVuZGVyKCk7XG4gICAgICAgICAgICB0aGlzLmdyaWRzdGVyLnVwZGF0ZUNhY2hlZEl0ZW1zKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgICAgIGlmICh0aGlzLmdyaWRzdGVyLm9wdGlvbnMucmVzaXphYmxlICYmIHRoaXMuaXRlbS5yZXNpemFibGUpIHtcbiAgICAgICAgICAgIHRoaXMuZW5hYmxlUmVzaXphYmxlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy52YXJpYWJsZUhlaWdodCkge1xuICAgICAgICAgICAgY29uc3QgcmVhZHlTdWJzY3JpcHRpb24gPSB0aGlzLmdyaWRzdGVyLmdyaWRzdGVyQ29tcG9uZW50LnJlYWR5LnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5ncmlkc3Rlci5ncmlkTGlzdC5yZXNpemVJdGVtKHRoaXMuaXRlbSwgeyB3OiB0aGlzLncsIGg6IDEgfSk7XG4gICAgICAgICAgICAgICAgcmVhZHlTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGV0IGxhc3RPZmZzZXRIZWlnaHQ6IG51bWJlcjtcbiAgICAgICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9ucykgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9mZnNldEhlaWdodCA9IHRoaXMuaXRlbS5jb250ZW50SGVpZ2h0O1xuICAgICAgICAgICAgICAgIGlmIChvZmZzZXRIZWlnaHQgIT09IGxhc3RPZmZzZXRIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHRoaXMuZ3JpZHN0ZXIuaXRlbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uYXBwbHlTaXplKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmFwcGx5UG9zaXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsYXN0T2Zmc2V0SGVpZ2h0ID0gb2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCB7XG4gICAgICAgICAgICAgICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgICAgICAgICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICAgICAgICAgICAgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjaGFyYWN0ZXJEYXRhOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICAgICAgaWYgKCF0aGlzLmdyaWRzdGVyLmdyaWRMaXN0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHJlcmVuZGVyID0gZmFsc2U7XG5cbiAgICAgICAgWyd3JywgLi4uT2JqZWN0LmtleXMoR3JpZExpc3RJdGVtLldfUFJPUEVSVFlfTUFQKS5tYXAoYnJlYWtwb2ludCA9PiBHcmlkTGlzdEl0ZW0uV19QUk9QRVJUWV9NQVBbYnJlYWtwb2ludF0pXVxuICAgICAgICAuZmlsdGVyKHByb3BOYW1lID0+IGNoYW5nZXNbcHJvcE5hbWVdICYmICFjaGFuZ2VzW3Byb3BOYW1lXS5pc0ZpcnN0Q2hhbmdlKCkpXG4gICAgICAgIC5mb3JFYWNoKChwcm9wTmFtZToga2V5b2YgR3JpZHN0ZXJJdGVtQ29tcG9uZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoY2hhbmdlc1twcm9wTmFtZV0uY3VycmVudFZhbHVlID4gdGhpcy5vcHRpb25zLm1heFdpZHRoKSB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgIHRoaXNbcHJvcE5hbWVdID0gdGhpcy5vcHRpb25zLm1heFdpZHRoO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpc1s8a2V5b2YgR3JpZHN0ZXJJdGVtQ29tcG9uZW50Pihwcm9wTmFtZSArICdDaGFuZ2UnKV0uZW1pdCh0aGlzW3Byb3BOYW1lXSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVyZW5kZXIgPSB0cnVlO1xuICAgICAgICB9KTtcblxuICAgICAgICBbJ2gnLCAuLi5PYmplY3Qua2V5cyhHcmlkTGlzdEl0ZW0uSF9QUk9QRVJUWV9NQVApLm1hcChicmVha3BvaW50ID0+IEdyaWRMaXN0SXRlbS5IX1BST1BFUlRZX01BUFticmVha3BvaW50XSldXG4gICAgICAgICAgICAuZmlsdGVyKHByb3BOYW1lID0+IGNoYW5nZXNbcHJvcE5hbWVdICYmICFjaGFuZ2VzW3Byb3BOYW1lXS5pc0ZpcnN0Q2hhbmdlKCkpXG4gICAgICAgICAgICAuZm9yRWFjaCgocHJvcE5hbWU6IGtleW9mIEdyaWRzdGVySXRlbUNvbXBvbmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChjaGFuZ2VzW3Byb3BOYW1lXS5jdXJyZW50VmFsdWUgPiB0aGlzLm9wdGlvbnMubWF4SGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgdGhpc1twcm9wTmFtZV0gPSB0aGlzLm9wdGlvbnMubWF4SGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXNbPGtleW9mIEdyaWRzdGVySXRlbUNvbXBvbmVudD4ocHJvcE5hbWUgKyAnQ2hhbmdlJyldLmVtaXQodGhpc1twcm9wTmFtZV0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVyZW5kZXIgPSB0cnVlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgWyd4JywgJ3knLFxuICAgICAgICAuLi5PYmplY3Qua2V5cyhHcmlkTGlzdEl0ZW0uWF9QUk9QRVJUWV9NQVApLm1hcChicmVha3BvaW50ID0+IEdyaWRMaXN0SXRlbS5YX1BST1BFUlRZX01BUFticmVha3BvaW50XSksXG4gICAgICAgIC4uLk9iamVjdC5rZXlzKEdyaWRMaXN0SXRlbS5ZX1BST1BFUlRZX01BUCkubWFwKGJyZWFrcG9pbnQgPT4gR3JpZExpc3RJdGVtLllfUFJPUEVSVFlfTUFQW2JyZWFrcG9pbnRdKV1cbiAgICAgICAgICAgIC5maWx0ZXIocHJvcE5hbWUgPT4gY2hhbmdlc1twcm9wTmFtZV0gJiYgIWNoYW5nZXNbcHJvcE5hbWVdLmlzRmlyc3RDaGFuZ2UoKSlcbiAgICAgICAgICAgIC5mb3JFYWNoKChwcm9wTmFtZTogc3RyaW5nKSA9PiByZXJlbmRlciA9IHRydWUpO1xuXG4gICAgICAgIGlmIChjaGFuZ2VzWydkcmFnQW5kRHJvcCddICYmICFjaGFuZ2VzWydkcmFnQW5kRHJvcCddLmlzRmlyc3RDaGFuZ2UoKSkge1xuICAgICAgICAgICAgaWYgKGNoYW5nZXNbJ2RyYWdBbmREcm9wJ10uY3VycmVudFZhbHVlICYmIHRoaXMuZ3JpZHN0ZXIub3B0aW9ucy5kcmFnQW5kRHJvcCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZW5hYmxlRHJhZ0Ryb3AoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNhYmxlRHJhZ2dhYmxlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoYW5nZXNbJ3Jlc2l6YWJsZSddICYmICFjaGFuZ2VzWydyZXNpemFibGUnXS5pc0ZpcnN0Q2hhbmdlKCkpIHtcbiAgICAgICAgICAgIGlmIChjaGFuZ2VzWydyZXNpemFibGUnXS5jdXJyZW50VmFsdWUgJiYgdGhpcy5ncmlkc3Rlci5vcHRpb25zLnJlc2l6YWJsZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZW5hYmxlUmVzaXphYmxlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzYWJsZVJlc2l6YWJsZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlcmVuZGVyICYmIHRoaXMuZ3JpZHN0ZXIuZ3JpZHN0ZXJDb21wb25lbnQuaXNSZWFkeSkge1xuICAgICAgICAgICAgdGhpcy5ncmlkc3Rlci5kZWJvdW5jZVJlbmRlclN1YmplY3QubmV4dCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbmdPbkRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMuZ3JpZHN0ZXIucmVtb3ZlSXRlbSh0aGlzLml0ZW0pO1xuICAgICAgICB0aGlzLmdyaWRzdGVyLml0ZW1SZW1vdmVTdWJqZWN0Lm5leHQodGhpcy5pdGVtKTtcblxuICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZm9yRWFjaCgoc3ViOiBTdWJzY3JpcHRpb24pID0+IHtcbiAgICAgICAgICAgIHN1Yi51bnN1YnNjcmliZSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5kaXNhYmxlRHJhZ2dhYmxlKCk7XG4gICAgICAgIHRoaXMuZGlzYWJsZVJlc2l6YWJsZSgpO1xuICAgIH1cblxuICAgIHVwZGF0ZUVsZW1lbmV0UG9zaXRpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmdyaWRzdGVyLm9wdGlvbnMudXNlQ1NTVHJhbnNmb3Jtcykge1xuICAgICAgICAgICAgdXRpbHMuc2V0VHJhbnNmb3JtKHRoaXMuJGVsZW1lbnQsIHt4OiB0aGlzLl9wb3NpdGlvblgsIHk6IHRoaXMuX3Bvc2l0aW9uWX0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdXRpbHMuc2V0Q3NzRWxlbWVudFBvc2l0aW9uKHRoaXMuJGVsZW1lbnQsIHt4OiB0aGlzLl9wb3NpdGlvblgsIHk6IHRoaXMuX3Bvc2l0aW9uWX0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0UG9zaXRpb25zT25JdGVtKCkge1xuICAgICAgICBpZiAoIXRoaXMuaXRlbS5oYXNQb3NpdGlvbnModGhpcy5ncmlkc3Rlci5vcHRpb25zLmJyZWFrcG9pbnQpKSB7XG4gICAgICAgICAgICB0aGlzLnNldFBvc2l0aW9uc0ZvckdyaWQodGhpcy5ncmlkc3Rlci5vcHRpb25zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZ3JpZHN0ZXIuZ3JpZHN0ZXJPcHRpb25zLnJlc3BvbnNpdmVPcHRpb25zXG4gICAgICAgICAgICAuZmlsdGVyKChvcHRpb25zOiBJR3JpZHN0ZXJPcHRpb25zKSA9PiAhdGhpcy5pdGVtLmhhc1Bvc2l0aW9ucyhvcHRpb25zLmJyZWFrcG9pbnQpKVxuICAgICAgICAgICAgLmZvckVhY2goKG9wdGlvbnM6IElHcmlkc3Rlck9wdGlvbnMpID0+IHRoaXMuc2V0UG9zaXRpb25zRm9yR3JpZChvcHRpb25zKSk7XG4gICAgfVxuXG4gICAgcHVibGljIGVuYWJsZVJlc2l6YWJsZSgpIHtcbiAgICAgICAgaWYgKHRoaXMucmVzaXplU3Vic2NyaXB0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmdldFJlc2l6ZUhhbmRsZXJzKCkuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IHRoaXMuZ2V0UmVzaXplRGlyZWN0aW9uKGhhbmRsZXIpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaGFzUmVzaXphYmxlSGFuZGxlKGRpcmVjdGlvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBkcmFnZ2FibGUgPSBuZXcgRHJhZ2dhYmxlKGhhbmRsZXIsIHRoaXMuZ2V0UmVzaXphYmxlT3B0aW9ucygpKTtcblxuICAgICAgICAgICAgICAgIGxldCBzdGFydEV2ZW50OiBEcmFnZ2FibGVFdmVudDtcbiAgICAgICAgICAgICAgICBsZXQgc3RhcnREYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIHRvcDogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICBtaW5YOiBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgIG1heFg6IG51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgbWluWTogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICBtYXhZOiBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgIG1pblc6IG51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgbWF4VzogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICBtaW5IOiBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgIG1heEg6IG51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsTGVmdDogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICBzY3JvbGxUb3A6IG51bWJlclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgbGV0IGN1cnNvclRvRWxlbWVudFBvc2l0aW9uOiB7IHg6IG51bWJlciwgeTogbnVtYmVyIH07XG5cbiAgICAgICAgICAgICAgICBjb25zdCBkcmFnU3RhcnRTdWIgPSBkcmFnZ2FibGUuZHJhZ1N0YXJ0XG4gICAgICAgICAgICAgICAgICAgIC5zdWJzY3JpYmUoKGV2ZW50OiBEcmFnZ2FibGVFdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy56b25lLnJ1bigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1Jlc2l6aW5nID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0RXZlbnQgPSBldmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydERhdGEgPSB0aGlzLmNyZWF0ZVJlc2l6ZVN0YXJ0T2JqZWN0KGRpcmVjdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yVG9FbGVtZW50UG9zaXRpb24gPSBldmVudC5nZXRSZWxhdGl2ZUNvb3JkaW5hdGVzKHRoaXMuJGVsZW1lbnQpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncmlkc3Rlci5vblJlc2l6ZVN0YXJ0KHRoaXMuaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vblN0YXJ0KCdyZXNpemUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGRyYWdTdWIgPSBkcmFnZ2FibGUuZHJhZ01vdmVcbiAgICAgICAgICAgICAgICAgICAgLnN1YnNjcmliZSgoZXZlbnQ6IERyYWdnYWJsZUV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzY3JvbGxEYXRhID0gdGhpcy5ncmlkc3Rlci5ncmlkc3RlclNjcm9sbERhdGE7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVzaXplRWxlbWVudCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0RGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBldmVudC5jbGllbnRYIC0gY3Vyc29yVG9FbGVtZW50UG9zaXRpb24ueCAtIHRoaXMuZ3JpZHN0ZXIuZ3JpZHN0ZXJSZWN0LmxlZnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IGV2ZW50LmNsaWVudFkgLSBjdXJzb3JUb0VsZW1lbnRQb3NpdGlvbi55IC0gdGhpcy5ncmlkc3Rlci5ncmlkc3RlclJlY3QudG9wXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydEV2ZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vdmVFdmVudDogZXZlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsRGlmZlg6IHNjcm9sbERhdGEuc2Nyb2xsTGVmdCAtIHN0YXJ0RGF0YS5zY3JvbGxMZWZ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbERpZmZZOiBzY3JvbGxEYXRhLnNjcm9sbFRvcCAtIHN0YXJ0RGF0YS5zY3JvbGxUb3BcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyaWRzdGVyLm9uUmVzaXplRHJhZyh0aGlzLml0ZW0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGRyYWdTdG9wU3ViID0gZHJhZ2dhYmxlLmRyYWdTdG9wXG4gICAgICAgICAgICAgICAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy56b25lLnJ1bigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1Jlc2l6aW5nID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyaWRzdGVyLm9uUmVzaXplU3RvcCh0aGlzLml0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25FbmQoJ3Jlc2l6ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5yZXNpemVTdWJzY3JpcHRpb25zID0gdGhpcy5yZXNpemVTdWJzY3JpcHRpb25zLmNvbmNhdChbZHJhZ1N0YXJ0U3ViLCBkcmFnU3ViLCBkcmFnU3RvcFN1Yl0pO1xuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGRpc2FibGVSZXNpemFibGUoKSB7XG4gICAgICAgIHRoaXMucmVzaXplU3Vic2NyaXB0aW9ucy5mb3JFYWNoKChzdWI6IFN1YnNjcmlwdGlvbikgPT4ge1xuICAgICAgICAgICAgc3ViLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnJlc2l6ZVN1YnNjcmlwdGlvbnMgPSBbXTtcblxuICAgICAgICBbXS5mb3JFYWNoLmNhbGwodGhpcy4kZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZ3JpZHN0ZXItaXRlbS1yZXNpemFibGUtaGFuZGxlcicpLCAoaGFuZGxlcjogSFRNTEVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgIGhhbmRsZXIuc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZW5hYmxlRHJhZ0Ryb3AoKSB7XG4gICAgICAgIGlmICh0aGlzLmRyYWdTdWJzY3JpcHRpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgICBsZXQgY3Vyc29yVG9FbGVtZW50UG9zaXRpb246IHsgeDogbnVtYmVyLCB5OiBudW1iZXIgfTtcblxuICAgICAgICAgICAgY29uc3QgZHJhZ2dhYmxlID0gbmV3IERyYWdnYWJsZSh0aGlzLiRlbGVtZW50LCB0aGlzLmdldERyYWdnYWJsZU9wdGlvbnMoKSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGRyYWdTdGFydFN1YiA9IGRyYWdnYWJsZS5kcmFnU3RhcnRcbiAgICAgICAgICAgICAgICAuc3Vic2NyaWJlKChldmVudDogRHJhZ2dhYmxlRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy56b25lLnJ1bigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyaWRzdGVyLm9uU3RhcnQodGhpcy5pdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNEcmFnZ2luZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uU3RhcnQoJ2RyYWcnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yVG9FbGVtZW50UG9zaXRpb24gPSBldmVudC5nZXRSZWxhdGl2ZUNvb3JkaW5hdGVzKHRoaXMuJGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY29uc3QgZHJhZ1N1YiA9IGRyYWdnYWJsZS5kcmFnTW92ZVxuICAgICAgICAgICAgICAgIC5zdWJzY3JpYmUoKGV2ZW50OiBEcmFnZ2FibGVFdmVudCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb25ZID0gKGV2ZW50LmNsaWVudFkgLSBjdXJzb3JUb0VsZW1lbnRQb3NpdGlvbi55IC1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JpZHN0ZXIuZ3JpZHN0ZXJSZWN0LnRvcCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb25YID0gKGV2ZW50LmNsaWVudFggLSBjdXJzb3JUb0VsZW1lbnRQb3NpdGlvbi54IC1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JpZHN0ZXIuZ3JpZHN0ZXJSZWN0LmxlZnQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUVsZW1lbmV0UG9zaXRpb24oKTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdyaWRzdGVyLm9uRHJhZyh0aGlzLml0ZW0pO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBkcmFnU3RvcFN1YiA9IGRyYWdnYWJsZS5kcmFnU3RvcFxuICAgICAgICAgICAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnpvbmUucnVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JpZHN0ZXIub25TdG9wKHRoaXMuaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyaWRzdGVyLmRlYm91bmNlUmVuZGVyU3ViamVjdC5uZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25FbmQoJ2RyYWcnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuZHJhZ1N1YnNjcmlwdGlvbnMgPSB0aGlzLmRyYWdTdWJzY3JpcHRpb25zLmNvbmNhdChbZHJhZ1N0YXJ0U3ViLCBkcmFnU3ViLCBkcmFnU3RvcFN1Yl0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZGlzYWJsZURyYWdnYWJsZSgpIHtcbiAgICAgICAgdGhpcy5kcmFnU3Vic2NyaXB0aW9ucy5mb3JFYWNoKChzdWI6IFN1YnNjcmlwdGlvbikgPT4ge1xuICAgICAgICAgICAgc3ViLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmRyYWdTdWJzY3JpcHRpb25zID0gW107XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRSZXNpemVIYW5kbGVycygpOiBIVE1MRWxlbWVudFtdICB7XG4gICAgICAgIHJldHVybiBbXS5maWx0ZXIuY2FsbCh0aGlzLiRlbGVtZW50LmNoaWxkcmVuWzBdLmNoaWxkcmVuLCAoZWw6IEhUTUxFbGVtZW50KSA9PiB7XG5cbiAgICAgICAgICAgIHJldHVybiBlbC5jbGFzc0xpc3QuY29udGFpbnMoJ2dyaWRzdGVyLWl0ZW0tcmVzaXphYmxlLWhhbmRsZXInKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXREcmFnZ2FibGVPcHRpb25zKCkge1xuICAgICAgICByZXR1cm4geyBzY3JvbGxEaXJlY3Rpb246IHRoaXMuZ3JpZHN0ZXIub3B0aW9ucy5kaXJlY3Rpb24sIC4uLnRoaXMuZ3JpZHN0ZXIuZHJhZ2dhYmxlT3B0aW9ucyB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0UmVzaXphYmxlT3B0aW9ucygpIHtcbiAgICAgICAgY29uc3QgcmVzaXphYmxlT3B0aW9uczogYW55ID0ge307XG5cbiAgICAgICAgaWYgKHRoaXMuZ3JpZHN0ZXIuZHJhZ2dhYmxlT3B0aW9ucy5zY3JvbGwgfHwgdGhpcy5ncmlkc3Rlci5kcmFnZ2FibGVPcHRpb25zLnNjcm9sbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJlc2l6YWJsZU9wdGlvbnMuc2Nyb2xsID0gdGhpcy5ncmlkc3Rlci5kcmFnZ2FibGVPcHRpb25zLnNjcm9sbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5ncmlkc3Rlci5kcmFnZ2FibGVPcHRpb25zLnNjcm9sbEVkZ2UpIHtcbiAgICAgICAgICAgIHJlc2l6YWJsZU9wdGlvbnMuc2Nyb2xsRWRnZSA9IHRoaXMuZ3JpZHN0ZXIuZHJhZ2dhYmxlT3B0aW9ucy5zY3JvbGxFZGdlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzaXphYmxlT3B0aW9ucy5zY3JvbGxEaXJlY3Rpb24gPSB0aGlzLmdyaWRzdGVyLm9wdGlvbnMuZGlyZWN0aW9uO1xuXG4gICAgICAgIHJldHVybiByZXNpemFibGVPcHRpb25zO1xuICAgIH1cblxuICAgIHByaXZhdGUgaGFzUmVzaXphYmxlSGFuZGxlKGRpcmVjdGlvbjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IGlzSXRlbVJlc2l6YWJsZSA9IHRoaXMuZ3JpZHN0ZXIub3B0aW9ucy5yZXNpemFibGUgJiYgdGhpcy5pdGVtLnJlc2l6YWJsZTtcbiAgICAgICAgY29uc3QgcmVzaXplSGFuZGxlcyA9IHRoaXMuZ3JpZHN0ZXIub3B0aW9ucy5yZXNpemVIYW5kbGVzO1xuXG4gICAgICAgIHJldHVybiBpc0l0ZW1SZXNpemFibGUgJiYgKCFyZXNpemVIYW5kbGVzIHx8IChyZXNpemVIYW5kbGVzICYmICEhKDxhbnk+cmVzaXplSGFuZGxlcylbZGlyZWN0aW9uXSkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2V0UG9zaXRpb25zRm9yR3JpZChvcHRpb25zOiBJR3JpZHN0ZXJPcHRpb25zKSB7XG4gICAgICAgIGxldCB4LCB5O1xuXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5maW5kUG9zaXRpb24ob3B0aW9ucyk7XG4gICAgICAgIHggPSBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ2hvcml6b250YWwnID8gcG9zaXRpb25bMF0gOiBwb3NpdGlvblsxXTtcbiAgICAgICAgeSA9IG9wdGlvbnMuZGlyZWN0aW9uID09PSAnaG9yaXpvbnRhbCcgPyBwb3NpdGlvblsxXSA6IHBvc2l0aW9uWzBdO1xuXG4gICAgICAgIHRoaXMuaXRlbS5zZXRWYWx1ZVgoeCwgb3B0aW9ucy5icmVha3BvaW50KTtcbiAgICAgICAgdGhpcy5pdGVtLnNldFZhbHVlWSh5LCBvcHRpb25zLmJyZWFrcG9pbnQpO1xuXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5pdGVtLnRyaWdnZXJDaGFuZ2VYKG9wdGlvbnMuYnJlYWtwb2ludCk7XG4gICAgICAgICAgICB0aGlzLml0ZW0udHJpZ2dlckNoYW5nZVkob3B0aW9ucy5icmVha3BvaW50KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmaW5kUG9zaXRpb24ob3B0aW9uczogSUdyaWRzdGVyT3B0aW9ucyk6IEFycmF5PG51bWJlcj4ge1xuICAgICAgICBjb25zdCBncmlkTGlzdCA9IG5ldyBHcmlkTGlzdChcbiAgICAgICAgICAgIHRoaXMuZ3JpZHN0ZXIuaXRlbXMubWFwKGl0ZW0gPT4gaXRlbS5jb3B5Rm9yQnJlYWtwb2ludChvcHRpb25zLmJyZWFrcG9pbnQpKSxcbiAgICAgICAgICAgIG9wdGlvbnNcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gZ3JpZExpc3QuZmluZFBvc2l0aW9uRm9ySXRlbSh0aGlzLml0ZW0sIHt4OiAwLCB5OiAwfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjcmVhdGVSZXNpemVTdGFydE9iamVjdChkaXJlY3Rpb246IHN0cmluZykge1xuICAgICAgICBjb25zdCBzY3JvbGxEYXRhID0gdGhpcy5ncmlkc3Rlci5ncmlkc3RlclNjcm9sbERhdGE7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRvcDogdGhpcy5wb3NpdGlvblksXG4gICAgICAgICAgICBsZWZ0OiB0aGlzLnBvc2l0aW9uWCxcbiAgICAgICAgICAgIGhlaWdodDogcGFyc2VJbnQodGhpcy4kZWxlbWVudC5zdHlsZS5oZWlnaHQsIDEwKSxcbiAgICAgICAgICAgIHdpZHRoOiBwYXJzZUludCh0aGlzLiRlbGVtZW50LnN0eWxlLndpZHRoLCAxMCksXG4gICAgICAgICAgICBtaW5YOiBNYXRoLm1heCh0aGlzLml0ZW0ueCArIHRoaXMuaXRlbS53IC0gdGhpcy5vcHRpb25zLm1heFdpZHRoLCAwKSxcbiAgICAgICAgICAgIG1heFg6IHRoaXMuaXRlbS54ICsgdGhpcy5pdGVtLncgLSB0aGlzLm9wdGlvbnMubWluV2lkdGgsXG4gICAgICAgICAgICBtaW5ZOiBNYXRoLm1heCh0aGlzLml0ZW0ueSArIHRoaXMuaXRlbS5oIC0gdGhpcy5vcHRpb25zLm1heEhlaWdodCwgMCksXG4gICAgICAgICAgICBtYXhZOiB0aGlzLml0ZW0ueSArIHRoaXMuaXRlbS5oIC0gdGhpcy5vcHRpb25zLm1pbkhlaWdodCxcbiAgICAgICAgICAgIG1pblc6IHRoaXMub3B0aW9ucy5taW5XaWR0aCxcbiAgICAgICAgICAgIG1heFc6IE1hdGgubWluKFxuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5tYXhXaWR0aCxcbiAgICAgICAgICAgICAgICAodGhpcy5ncmlkc3Rlci5vcHRpb25zLmRpcmVjdGlvbiA9PT0gJ3ZlcnRpY2FsJyAmJiBkaXJlY3Rpb24uaW5kZXhPZigndycpIDwgMCkgP1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JpZHN0ZXIub3B0aW9ucy5sYW5lcyAtIHRoaXMuaXRlbS54IDogdGhpcy5vcHRpb25zLm1heFdpZHRoLFxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbi5pbmRleE9mKCd3JykgPj0gMCA/XG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtLnggKyB0aGlzLml0ZW0udyA6IHRoaXMub3B0aW9ucy5tYXhXaWR0aFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIG1pbkg6IHRoaXMub3B0aW9ucy5taW5IZWlnaHQsXG4gICAgICAgICAgICBtYXhIOiBNYXRoLm1pbihcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMubWF4SGVpZ2h0LFxuICAgICAgICAgICAgICAgICh0aGlzLmdyaWRzdGVyLm9wdGlvbnMuZGlyZWN0aW9uID09PSAnaG9yaXpvbnRhbCcgJiYgZGlyZWN0aW9uLmluZGV4T2YoJ24nKSA8IDApID9cbiAgICAgICAgICAgICAgICB0aGlzLmdyaWRzdGVyLm9wdGlvbnMubGFuZXMgLSB0aGlzLml0ZW0ueSA6IHRoaXMub3B0aW9ucy5tYXhIZWlnaHQsXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uLmluZGV4T2YoJ24nKSA+PSAwID9cbiAgICAgICAgICAgICAgICB0aGlzLml0ZW0ueSArIHRoaXMuaXRlbS5oIDogdGhpcy5vcHRpb25zLm1heEhlaWdodFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIHNjcm9sbExlZnQ6IHNjcm9sbERhdGEuc2Nyb2xsTGVmdCxcbiAgICAgICAgICAgIHNjcm9sbFRvcDogc2Nyb2xsRGF0YS5zY3JvbGxUb3BcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRW5kKGFjdGlvblR5cGU6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICB0aGlzLmVuZC5lbWl0KHthY3Rpb246IGFjdGlvblR5cGUsIGl0ZW06IHRoaXMuaXRlbX0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25TdGFydChhY3Rpb25UeXBlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5zdGFydC5lbWl0KHthY3Rpb246IGFjdGlvblR5cGUsIGl0ZW06IHRoaXMuaXRlbX0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFzc2lnbiBjbGFzcyBmb3Igc2hvcnQgd2hpbGUgdG8gcHJldmVudCBhbmltYXRpb24gb2YgZ3JpZCBpdGVtIGNvbXBvbmVudFxuICAgICAqL1xuICAgIHByaXZhdGUgcHJldmVudEFuaW1hdGlvbigpOiBHcmlkc3Rlckl0ZW1Db21wb25lbnQge1xuICAgICAgICB0aGlzLiRlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ25vLXRyYW5zaXRpb24nKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ25vLXRyYW5zaXRpb24nKTtcbiAgICAgICAgfSwgNTAwKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFJlc2l6ZURpcmVjdGlvbihoYW5kbGVyOiBFbGVtZW50KTogc3RyaW5nIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IGhhbmRsZXIuY2xhc3NMaXN0Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBpZiAoaGFuZGxlci5jbGFzc0xpc3RbaV0ubWF0Y2goJ2hhbmRsZS0nKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBoYW5kbGVyLmNsYXNzTGlzdFtpXS5zcGxpdCgnLScpWzFdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZXNpemVFbGVtZW50KGNvbmZpZzogYW55KTogdm9pZCB7XG4gICAgICAgIC8vIG5vcnRoXG4gICAgICAgIGlmIChjb25maWcuZGlyZWN0aW9uLmluZGV4T2YoJ24nKSA+PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnJlc2l6ZVRvTm9ydGgoY29uZmlnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyB3ZXN0XG4gICAgICAgIGlmIChjb25maWcuZGlyZWN0aW9uLmluZGV4T2YoJ3cnKSA+PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnJlc2l6ZVRvV2VzdChjb25maWcpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGVhc3RcbiAgICAgICAgaWYgKGNvbmZpZy5kaXJlY3Rpb24uaW5kZXhPZignZScpID49IDApIHtcbiAgICAgICAgICAgIHRoaXMucmVzaXplVG9FYXN0KGNvbmZpZyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gc291dGhcbiAgICAgICAgaWYgKGNvbmZpZy5kaXJlY3Rpb24uaW5kZXhPZigncycpID49IDApIHtcbiAgICAgICAgICAgIHRoaXMucmVzaXplVG9Tb3V0aChjb25maWcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZXNpemVUb05vcnRoKGNvbmZpZzogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGhlaWdodCA9IGNvbmZpZy5zdGFydERhdGEuaGVpZ2h0ICsgY29uZmlnLnN0YXJ0RXZlbnQuY2xpZW50WSAtXG4gICAgICAgICAgICBjb25maWcubW92ZUV2ZW50LmNsaWVudFkgLSBjb25maWcuc2Nyb2xsRGlmZlk7XG5cbiAgICAgICAgaWYgKGhlaWdodCA8IChjb25maWcuc3RhcnREYXRhLm1pbkggKiB0aGlzLmdyaWRzdGVyLmNlbGxIZWlnaHQpKSB7XG4gICAgICAgICAgICB0aGlzLnNldE1pbkhlaWdodCgnbicsIGNvbmZpZyk7XG4gICAgICAgIH0gZWxzZSBpZiAoaGVpZ2h0ID4gKGNvbmZpZy5zdGFydERhdGEubWF4SCAqIHRoaXMuZ3JpZHN0ZXIuY2VsbEhlaWdodCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0TWF4SGVpZ2h0KCduJywgY29uZmlnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb25ZID0gY29uZmlnLnBvc2l0aW9uLnk7XG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LnN0eWxlLmhlaWdodCA9IGhlaWdodCArICdweCc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHJlc2l6ZVRvV2VzdChjb25maWc6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zdCB3aWR0aCA9IGNvbmZpZy5zdGFydERhdGEud2lkdGggKyBjb25maWcuc3RhcnRFdmVudC5jbGllbnRYIC1cbiAgICAgICAgICAgIGNvbmZpZy5tb3ZlRXZlbnQuY2xpZW50WCAtIGNvbmZpZy5zY3JvbGxEaWZmWDtcblxuICAgICAgICBpZiAod2lkdGggPCAoY29uZmlnLnN0YXJ0RGF0YS5taW5XICogdGhpcy5ncmlkc3Rlci5jZWxsV2lkdGgpKSB7XG4gICAgICAgICAgICB0aGlzLnNldE1pbldpZHRoKCd3JywgY29uZmlnKTtcbiAgICAgICAgfSBlbHNlIGlmICh3aWR0aCA+IChjb25maWcuc3RhcnREYXRhLm1heFcgKiB0aGlzLmdyaWRzdGVyLmNlbGxXaWR0aCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0TWF4V2lkdGgoJ3cnLCBjb25maWcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvblggPSBjb25maWcucG9zaXRpb24ueDtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRWxlbWVuZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5zdHlsZS53aWR0aCA9IHdpZHRoICsgJ3B4JztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcmVzaXplVG9FYXN0KGNvbmZpZzogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHdpZHRoID0gY29uZmlnLnN0YXJ0RGF0YS53aWR0aCArIGNvbmZpZy5tb3ZlRXZlbnQuY2xpZW50WCAtXG4gICAgICAgICAgICBjb25maWcuc3RhcnRFdmVudC5jbGllbnRYICsgY29uZmlnLnNjcm9sbERpZmZYO1xuXG4gICAgICAgIGlmICh3aWR0aCA+IChjb25maWcuc3RhcnREYXRhLm1heFcgKiB0aGlzLmdyaWRzdGVyLmNlbGxXaWR0aCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0TWF4V2lkdGgoJ2UnLCBjb25maWcpO1xuICAgICAgICB9IGVsc2UgaWYgKHdpZHRoIDwgKGNvbmZpZy5zdGFydERhdGEubWluVyAqIHRoaXMuZ3JpZHN0ZXIuY2VsbFdpZHRoKSkge1xuICAgICAgICAgICAgdGhpcy5zZXRNaW5XaWR0aCgnZScsIGNvbmZpZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LnN0eWxlLndpZHRoID0gd2lkdGggKyAncHgnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZXNpemVUb1NvdXRoKGNvbmZpZzogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGhlaWdodCA9IGNvbmZpZy5zdGFydERhdGEuaGVpZ2h0ICsgY29uZmlnLm1vdmVFdmVudC5jbGllbnRZIC1cbiAgICAgICAgICAgIGNvbmZpZy5zdGFydEV2ZW50LmNsaWVudFkgKyBjb25maWcuc2Nyb2xsRGlmZlk7XG5cbiAgICAgICAgaWYgKGhlaWdodCA+IGNvbmZpZy5zdGFydERhdGEubWF4SCAqIHRoaXMuZ3JpZHN0ZXIuY2VsbEhlaWdodCkge1xuICAgICAgICAgICAgdGhpcy5zZXRNYXhIZWlnaHQoJ3MnLCBjb25maWcpO1xuICAgICAgICB9IGVsc2UgaWYgKGhlaWdodCA8IGNvbmZpZy5zdGFydERhdGEubWluSCAqIHRoaXMuZ3JpZHN0ZXIuY2VsbEhlaWdodCkge1xuICAgICAgICAgICAgdGhpcy5zZXRNaW5IZWlnaHQoJ3MnLCBjb25maWcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyAncHgnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXRNaW5IZWlnaHQoZGlyZWN0aW9uOiBzdHJpbmcsIGNvbmZpZzogYW55KTogdm9pZCB7XG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT09ICduJykge1xuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5zdHlsZS5oZWlnaHQgPSAoY29uZmlnLnN0YXJ0RGF0YS5taW5IICogdGhpcy5ncmlkc3Rlci5jZWxsSGVpZ2h0KSArICdweCc7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uWSA9IGNvbmZpZy5zdGFydERhdGEubWF4WSAqIHRoaXMuZ3JpZHN0ZXIuY2VsbEhlaWdodDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gKGNvbmZpZy5zdGFydERhdGEubWluSCAqIHRoaXMuZ3JpZHN0ZXIuY2VsbEhlaWdodCkgKyAncHgnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXRNaW5XaWR0aChkaXJlY3Rpb246IHN0cmluZywgY29uZmlnOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ3cnKSB7XG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LnN0eWxlLndpZHRoID0gKGNvbmZpZy5zdGFydERhdGEubWluVyAqIHRoaXMuZ3JpZHN0ZXIuY2VsbFdpZHRoKSArICdweCc7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uWCA9IGNvbmZpZy5zdGFydERhdGEubWF4WCAqIHRoaXMuZ3JpZHN0ZXIuY2VsbFdpZHRoO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVFbGVtZW5ldFBvc2l0aW9uKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LnN0eWxlLndpZHRoID0gKGNvbmZpZy5zdGFydERhdGEubWluVyAqIHRoaXMuZ3JpZHN0ZXIuY2VsbFdpZHRoKSArICdweCc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHNldE1heEhlaWdodChkaXJlY3Rpb246IHN0cmluZywgY29uZmlnOiBhbnkpOiB2b2lkIHtcblxuICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAnbicpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gKGNvbmZpZy5zdGFydERhdGEubWF4SCAqIHRoaXMuZ3JpZHN0ZXIuY2VsbEhlaWdodCkgKyAncHgnO1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvblkgPSBjb25maWcuc3RhcnREYXRhLm1pblkgKiB0aGlzLmdyaWRzdGVyLmNlbGxIZWlnaHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LnN0eWxlLmhlaWdodCA9IChjb25maWcuc3RhcnREYXRhLm1heEggKiB0aGlzLmdyaWRzdGVyLmNlbGxIZWlnaHQpICsgJ3B4JztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc2V0TWF4V2lkdGgoZGlyZWN0aW9uOiBzdHJpbmcsIGNvbmZpZzogYW55KTogdm9pZCB7XG5cbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ3cnKSB7XG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LnN0eWxlLndpZHRoID0gKGNvbmZpZy5zdGFydERhdGEubWF4VyAqIHRoaXMuZ3JpZHN0ZXIuY2VsbFdpZHRoKSArICdweCc7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uWCA9IGNvbmZpZy5zdGFydERhdGEubWluWCAqIHRoaXMuZ3JpZHN0ZXIuY2VsbFdpZHRoO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVFbGVtZW5ldFBvc2l0aW9uKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LnN0eWxlLndpZHRoID0gKGNvbmZpZy5zdGFydERhdGEubWF4VyAqIHRoaXMuZ3JpZHN0ZXIuY2VsbFdpZHRoKSArICdweCc7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=