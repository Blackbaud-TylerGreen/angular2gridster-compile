import { __assign, __decorate, __metadata, __param, __read, __spread, __values } from "tslib";
import { Component, OnInit, ElementRef, Inject, Input, Output, EventEmitter, SimpleChanges, OnChanges, OnDestroy, HostBinding, ChangeDetectionStrategy, AfterViewInit, NgZone, ViewEncapsulation, ViewChild } from '@angular/core';
import { GridsterService } from '../gridster.service';
import { GridListItem } from '../gridList/GridListItem';
import { Draggable } from '../utils/draggable';
import { GridList } from '../gridList/gridList';
import { utils } from '../utils/utils';
var GridsterItemComponent = /** @class */ (function () {
    function GridsterItemComponent(zone, elementRef, gridster) {
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
    Object.defineProperty(GridsterItemComponent.prototype, "positionX", {
        get: function () {
            return this._positionX;
        },
        set: function (value) {
            this._positionX = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridsterItemComponent.prototype, "positionY", {
        get: function () {
            return this._positionY;
        },
        set: function (value) {
            this._positionY = value;
        },
        enumerable: true,
        configurable: true
    });
    GridsterItemComponent.prototype.ngOnInit = function () {
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
    };
    GridsterItemComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        if (this.gridster.options.resizable && this.item.resizable) {
            this.enableResizable();
        }
        if (this.variableHeight) {
            var readySubscription_1 = this.gridster.gridsterComponent.ready.subscribe(function () {
                _this.gridster.gridList.resizeItem(_this.item, { w: _this.w, h: 1 });
                readySubscription_1.unsubscribe();
            });
            var lastOffsetHeight_1;
            var observer = new MutationObserver(function (mutations) {
                var e_1, _a;
                var offsetHeight = _this.item.contentHeight;
                if (offsetHeight !== lastOffsetHeight_1) {
                    try {
                        for (var _b = __values(_this.gridster.items), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var item = _c.value;
                            item.applySize();
                            item.applyPosition();
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
                lastOffsetHeight_1 = offsetHeight;
            });
            observer.observe(this.elementRef.nativeElement, {
                childList: true,
                subtree: true,
                attributes: true,
                characterData: true
            });
        }
    };
    GridsterItemComponent.prototype.ngOnChanges = function (changes) {
        var _this = this;
        if (!this.gridster.gridList) {
            return;
        }
        var rerender = false;
        __spread(['w'], Object.keys(GridListItem.W_PROPERTY_MAP).map(function (breakpoint) { return GridListItem.W_PROPERTY_MAP[breakpoint]; })).filter(function (propName) { return changes[propName] && !changes[propName].isFirstChange(); })
            .forEach(function (propName) {
            if (changes[propName].currentValue > _this.options.maxWidth) {
                // @ts-ignore
                _this[propName] = _this.options.maxWidth;
                setTimeout(function () { return _this[(propName + 'Change')].emit(_this[propName]); });
            }
            rerender = true;
        });
        __spread(['h'], Object.keys(GridListItem.H_PROPERTY_MAP).map(function (breakpoint) { return GridListItem.H_PROPERTY_MAP[breakpoint]; })).filter(function (propName) { return changes[propName] && !changes[propName].isFirstChange(); })
            .forEach(function (propName) {
            if (changes[propName].currentValue > _this.options.maxHeight) {
                // @ts-ignore
                _this[propName] = _this.options.maxHeight;
                setTimeout(function () { return _this[(propName + 'Change')].emit(_this[propName]); });
            }
            rerender = true;
        });
        __spread(['x', 'y'], Object.keys(GridListItem.X_PROPERTY_MAP).map(function (breakpoint) { return GridListItem.X_PROPERTY_MAP[breakpoint]; }), Object.keys(GridListItem.Y_PROPERTY_MAP).map(function (breakpoint) { return GridListItem.Y_PROPERTY_MAP[breakpoint]; })).filter(function (propName) { return changes[propName] && !changes[propName].isFirstChange(); })
            .forEach(function (propName) { return rerender = true; });
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
    };
    GridsterItemComponent.prototype.ngOnDestroy = function () {
        this.gridster.removeItem(this.item);
        this.gridster.itemRemoveSubject.next(this.item);
        this.subscriptions.forEach(function (sub) {
            sub.unsubscribe();
        });
        this.disableDraggable();
        this.disableResizable();
    };
    GridsterItemComponent.prototype.updateElemenetPosition = function () {
        if (this.gridster.options.useCSSTransforms) {
            utils.setTransform(this.$element, { x: this._positionX, y: this._positionY });
        }
        else {
            utils.setCssElementPosition(this.$element, { x: this._positionX, y: this._positionY });
        }
    };
    GridsterItemComponent.prototype.setPositionsOnItem = function () {
        var _this = this;
        if (!this.item.hasPositions(this.gridster.options.breakpoint)) {
            this.setPositionsForGrid(this.gridster.options);
        }
        this.gridster.gridsterOptions.responsiveOptions
            .filter(function (options) { return !_this.item.hasPositions(options.breakpoint); })
            .forEach(function (options) { return _this.setPositionsForGrid(options); });
    };
    GridsterItemComponent.prototype.enableResizable = function () {
        var _this = this;
        if (this.resizeSubscriptions.length) {
            return;
        }
        this.zone.runOutsideAngular(function () {
            _this.getResizeHandlers().forEach(function (handler) {
                var direction = _this.getResizeDirection(handler);
                if (_this.hasResizableHandle(direction)) {
                    handler.style.display = 'block';
                }
                var draggable = new Draggable(handler, _this.getResizableOptions());
                var startEvent;
                var startData;
                var cursorToElementPosition;
                var dragStartSub = draggable.dragStart
                    .subscribe(function (event) {
                    _this.zone.run(function () {
                        _this.isResizing = true;
                        startEvent = event;
                        startData = _this.createResizeStartObject(direction);
                        cursorToElementPosition = event.getRelativeCoordinates(_this.$element);
                        _this.gridster.onResizeStart(_this.item);
                        _this.onStart('resize');
                    });
                });
                var dragSub = draggable.dragMove
                    .subscribe(function (event) {
                    var scrollData = _this.gridster.gridsterScrollData;
                    _this.resizeElement({
                        direction: direction,
                        startData: startData,
                        position: {
                            x: event.clientX - cursorToElementPosition.x - _this.gridster.gridsterRect.left,
                            y: event.clientY - cursorToElementPosition.y - _this.gridster.gridsterRect.top
                        },
                        startEvent: startEvent,
                        moveEvent: event,
                        scrollDiffX: scrollData.scrollLeft - startData.scrollLeft,
                        scrollDiffY: scrollData.scrollTop - startData.scrollTop
                    });
                    _this.gridster.onResizeDrag(_this.item);
                });
                var dragStopSub = draggable.dragStop
                    .subscribe(function () {
                    _this.zone.run(function () {
                        _this.isResizing = false;
                        _this.gridster.onResizeStop(_this.item);
                        _this.onEnd('resize');
                    });
                });
                _this.resizeSubscriptions = _this.resizeSubscriptions.concat([dragStartSub, dragSub, dragStopSub]);
            });
        });
    };
    GridsterItemComponent.prototype.disableResizable = function () {
        this.resizeSubscriptions.forEach(function (sub) {
            sub.unsubscribe();
        });
        this.resizeSubscriptions = [];
        [].forEach.call(this.$element.querySelectorAll('.gridster-item-resizable-handler'), function (handler) {
            handler.style.display = '';
        });
    };
    GridsterItemComponent.prototype.enableDragDrop = function () {
        var _this = this;
        if (this.dragSubscriptions.length) {
            return;
        }
        this.zone.runOutsideAngular(function () {
            var cursorToElementPosition;
            var draggable = new Draggable(_this.$element, _this.getDraggableOptions());
            var dragStartSub = draggable.dragStart
                .subscribe(function (event) {
                _this.zone.run(function () {
                    _this.gridster.onStart(_this.item);
                    _this.isDragging = true;
                    _this.onStart('drag');
                    cursorToElementPosition = event.getRelativeCoordinates(_this.$element);
                });
            });
            var dragSub = draggable.dragMove
                .subscribe(function (event) {
                _this.positionY = (event.clientY - cursorToElementPosition.y -
                    _this.gridster.gridsterRect.top);
                _this.positionX = (event.clientX - cursorToElementPosition.x -
                    _this.gridster.gridsterRect.left);
                _this.updateElemenetPosition();
                _this.gridster.onDrag(_this.item);
            });
            var dragStopSub = draggable.dragStop
                .subscribe(function () {
                _this.zone.run(function () {
                    _this.gridster.onStop(_this.item);
                    _this.gridster.debounceRenderSubject.next();
                    _this.isDragging = false;
                    _this.onEnd('drag');
                });
            });
            _this.dragSubscriptions = _this.dragSubscriptions.concat([dragStartSub, dragSub, dragStopSub]);
        });
    };
    GridsterItemComponent.prototype.disableDraggable = function () {
        this.dragSubscriptions.forEach(function (sub) {
            sub.unsubscribe();
        });
        this.dragSubscriptions = [];
    };
    GridsterItemComponent.prototype.getResizeHandlers = function () {
        return [].filter.call(this.$element.children[0].children, function (el) {
            return el.classList.contains('gridster-item-resizable-handler');
        });
    };
    GridsterItemComponent.prototype.getDraggableOptions = function () {
        return __assign({ scrollDirection: this.gridster.options.direction }, this.gridster.draggableOptions);
    };
    GridsterItemComponent.prototype.getResizableOptions = function () {
        var resizableOptions = {};
        if (this.gridster.draggableOptions.scroll || this.gridster.draggableOptions.scroll === false) {
            resizableOptions.scroll = this.gridster.draggableOptions.scroll;
        }
        if (this.gridster.draggableOptions.scrollEdge) {
            resizableOptions.scrollEdge = this.gridster.draggableOptions.scrollEdge;
        }
        resizableOptions.scrollDirection = this.gridster.options.direction;
        return resizableOptions;
    };
    GridsterItemComponent.prototype.hasResizableHandle = function (direction) {
        var isItemResizable = this.gridster.options.resizable && this.item.resizable;
        var resizeHandles = this.gridster.options.resizeHandles;
        return isItemResizable && (!resizeHandles || (resizeHandles && !!resizeHandles[direction]));
    };
    GridsterItemComponent.prototype.setPositionsForGrid = function (options) {
        var _this = this;
        var x, y;
        var position = this.findPosition(options);
        x = options.direction === 'horizontal' ? position[0] : position[1];
        y = options.direction === 'horizontal' ? position[1] : position[0];
        this.item.setValueX(x, options.breakpoint);
        this.item.setValueY(y, options.breakpoint);
        setTimeout(function () {
            _this.item.triggerChangeX(options.breakpoint);
            _this.item.triggerChangeY(options.breakpoint);
        });
    };
    GridsterItemComponent.prototype.findPosition = function (options) {
        var gridList = new GridList(this.gridster.items.map(function (item) { return item.copyForBreakpoint(options.breakpoint); }), options);
        return gridList.findPositionForItem(this.item, { x: 0, y: 0 });
    };
    GridsterItemComponent.prototype.createResizeStartObject = function (direction) {
        var scrollData = this.gridster.gridsterScrollData;
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
    };
    GridsterItemComponent.prototype.onEnd = function (actionType) {
        this.end.emit({ action: actionType, item: this.item });
    };
    GridsterItemComponent.prototype.onStart = function (actionType) {
        this.start.emit({ action: actionType, item: this.item });
    };
    /**
     * Assign class for short while to prevent animation of grid item component
     */
    GridsterItemComponent.prototype.preventAnimation = function () {
        var _this = this;
        this.$element.classList.add('no-transition');
        setTimeout(function () {
            _this.$element.classList.remove('no-transition');
        }, 500);
        return this;
    };
    GridsterItemComponent.prototype.getResizeDirection = function (handler) {
        for (var i = handler.classList.length - 1; i >= 0; i--) {
            if (handler.classList[i].match('handle-')) {
                return handler.classList[i].split('-')[1];
            }
        }
    };
    GridsterItemComponent.prototype.resizeElement = function (config) {
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
    };
    GridsterItemComponent.prototype.resizeToNorth = function (config) {
        var height = config.startData.height + config.startEvent.clientY -
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
    };
    GridsterItemComponent.prototype.resizeToWest = function (config) {
        var width = config.startData.width + config.startEvent.clientX -
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
    };
    GridsterItemComponent.prototype.resizeToEast = function (config) {
        var width = config.startData.width + config.moveEvent.clientX -
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
    };
    GridsterItemComponent.prototype.resizeToSouth = function (config) {
        var height = config.startData.height + config.moveEvent.clientY -
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
    };
    GridsterItemComponent.prototype.setMinHeight = function (direction, config) {
        if (direction === 'n') {
            this.$element.style.height = (config.startData.minH * this.gridster.cellHeight) + 'px';
            this.positionY = config.startData.maxY * this.gridster.cellHeight;
        }
        else {
            this.$element.style.height = (config.startData.minH * this.gridster.cellHeight) + 'px';
        }
    };
    GridsterItemComponent.prototype.setMinWidth = function (direction, config) {
        if (direction === 'w') {
            this.$element.style.width = (config.startData.minW * this.gridster.cellWidth) + 'px';
            this.positionX = config.startData.maxX * this.gridster.cellWidth;
            this.updateElemenetPosition();
        }
        else {
            this.$element.style.width = (config.startData.minW * this.gridster.cellWidth) + 'px';
        }
    };
    GridsterItemComponent.prototype.setMaxHeight = function (direction, config) {
        if (direction === 'n') {
            this.$element.style.height = (config.startData.maxH * this.gridster.cellHeight) + 'px';
            this.positionY = config.startData.minY * this.gridster.cellHeight;
        }
        else {
            this.$element.style.height = (config.startData.maxH * this.gridster.cellHeight) + 'px';
        }
    };
    GridsterItemComponent.prototype.setMaxWidth = function (direction, config) {
        if (direction === 'w') {
            this.$element.style.width = (config.startData.maxW * this.gridster.cellWidth) + 'px';
            this.positionX = config.startData.minX * this.gridster.cellWidth;
            this.updateElemenetPosition();
        }
        else {
            this.$element.style.width = (config.startData.maxW * this.gridster.cellWidth) + 'px';
        }
    };
    GridsterItemComponent.ctorParameters = function () { return [
        { type: NgZone },
        { type: ElementRef, decorators: [{ type: Inject, args: [ElementRef,] }] },
        { type: GridsterService, decorators: [{ type: Inject, args: [GridsterService,] }] }
    ]; };
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
            template: "<div class=\"gridster-item-inner\" [ngStyle]=\"{position: variableHeight ? 'relative' : ''}\">\n      <span #contentWrapper class=\"gridster-content-wrapper\">\n        <ng-content></ng-content>\n      </span>\n      <div class=\"gridster-item-resizable-handler handle-s\"></div>\n      <div class=\"gridster-item-resizable-handler handle-e\"></div>\n      <div class=\"gridster-item-resizable-handler handle-n\"></div>\n      <div class=\"gridster-item-resizable-handler handle-w\"></div>\n      <div class=\"gridster-item-resizable-handler handle-se\"></div>\n      <div class=\"gridster-item-resizable-handler handle-ne\"></div>\n      <div class=\"gridster-item-resizable-handler handle-sw\"></div>\n      <div class=\"gridster-item-resizable-handler handle-nw\"></div>\n    </div>",
            changeDetection: ChangeDetectionStrategy.OnPush,
            encapsulation: ViewEncapsulation.None,
            styles: ["\n    ngx-gridster-item {\n        display: block;\n        position: absolute;\n        top: 0;\n        left: 0;\n        z-index: 1;\n        -webkit-transition: none;\n        transition: none;\n    }\n\n    .gridster--ready ngx-gridster-item {\n        transition: all 200ms ease;\n        transition-property: left, top;\n    }\n\n    .gridster--ready.css-transform ngx-gridster-item  {\n        transition-property: transform;\n    }\n\n    .gridster--ready ngx-gridster-item.is-dragging,\n    .gridster--ready ngx-gridster-item.is-resizing {\n        -webkit-transition: none;\n        transition: none;\n        z-index: 9999;\n    }\n\n    ngx-gridster-item.no-transition {\n        -webkit-transition: none;\n        transition: none;\n    }\n    ngx-gridster-item .gridster-item-resizable-handler {\n        position: absolute;\n        z-index: 2;\n        display: none;\n    }\n\n    ngx-gridster-item .gridster-item-resizable-handler.handle-n {\n      cursor: n-resize;\n      height: 10px;\n      right: 0;\n      top: 0;\n      left: 0;\n    }\n\n    ngx-gridster-item .gridster-item-resizable-handler.handle-e {\n      cursor: e-resize;\n      width: 10px;\n      bottom: 0;\n      right: 0;\n      top: 0;\n    }\n\n    ngx-gridster-item .gridster-item-resizable-handler.handle-s {\n      cursor: s-resize;\n      height: 10px;\n      right: 0;\n      bottom: 0;\n      left: 0;\n    }\n\n    ngx-gridster-item .gridster-item-resizable-handler.handle-w {\n      cursor: w-resize;\n      width: 10px;\n      left: 0;\n      top: 0;\n      bottom: 0;\n    }\n\n    ngx-gridster-item .gridster-item-resizable-handler.handle-ne {\n      cursor: ne-resize;\n      width: 10px;\n      height: 10px;\n      right: 0;\n      top: 0;\n    }\n\n    ngx-gridster-item .gridster-item-resizable-handler.handle-nw {\n      cursor: nw-resize;\n      width: 10px;\n      height: 10px;\n      left: 0;\n      top: 0;\n    }\n\n    ngx-gridster-item .gridster-item-resizable-handler.handle-se {\n      cursor: se-resize;\n      width: 0;\n      height: 0;\n      right: 0;\n      bottom: 0;\n      border-style: solid;\n      border-width: 0 0 10px 10px;\n      border-color: transparent;\n    }\n\n    ngx-gridster-item .gridster-item-resizable-handler.handle-sw {\n      cursor: sw-resize;\n      width: 10px;\n      height: 10px;\n      left: 0;\n      bottom: 0;\n    }\n\n    ngx-gridster-item:hover .gridster-item-resizable-handler.handle-se {\n      border-color: transparent transparent #ccc\n    }\n    "]
        }),
        __param(1, Inject(ElementRef)),
        __param(2, Inject(GridsterService)),
        __metadata("design:paramtypes", [NgZone,
            ElementRef,
            GridsterService])
    ], GridsterItemComponent);
    return GridsterItemComponent;
}());
export { GridsterItemComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZHN0ZXItaXRlbS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyMmdyaWRzdGVyLyIsInNvdXJjZXMiOlsibGliL2dyaWRzdGVyLWl0ZW0vZ3JpZHN0ZXItaXRlbS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFDekQsWUFBWSxFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFDOUQsdUJBQXVCLEVBQUUsYUFBYSxFQUFFLE1BQU0sRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFHeEcsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRXRELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUV4RCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFL0MsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ2hELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQWdJdkM7SUEwR0ksK0JBQW9CLElBQVksRUFDQSxVQUFzQixFQUNqQixRQUF5QjtRQUYxQyxTQUFJLEdBQUosSUFBSSxDQUFRO1FBeEd0QixZQUFPLEdBQUcsSUFBSSxZQUFZLENBQVMsSUFBSSxDQUFDLENBQUM7UUFFekMsWUFBTyxHQUFHLElBQUksWUFBWSxDQUFTLElBQUksQ0FBQyxDQUFDO1FBR3pDLGNBQVMsR0FBRyxJQUFJLFlBQVksQ0FBUyxJQUFJLENBQUMsQ0FBQztRQUUzQyxjQUFTLEdBQUcsSUFBSSxZQUFZLENBQVMsSUFBSSxDQUFDLENBQUM7UUFHM0MsY0FBUyxHQUFHLElBQUksWUFBWSxDQUFTLElBQUksQ0FBQyxDQUFDO1FBRTNDLGNBQVMsR0FB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QUFHLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDN0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDbEM7YUFBTSxJQUFJLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDcEUsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDbEM7YUFBTTtZQUNILElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUM7U0FDOUM7SUFDTCxDQUFDO0lBRU8sNENBQVksR0FBcEIsVUFBcUIsTUFBVztRQUM1QixJQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU87WUFDNUQsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUVsRCxJQUFJLEtBQUssR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDM0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDakM7YUFBTSxJQUFJLEtBQUssR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDbEUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDakM7YUFBTTtZQUNILElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7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LG1CQUFtQixDQUFDOzs2REFBb0I7SUFwRTVDLHFCQUFxQjtRQTlIakMsU0FBUyxDQUFDO1lBQ1AsUUFBUSxFQUFFLG1CQUFtQjtZQUM3QixRQUFRLEVBQUUsbXhCQVlIO1lBNkdQLGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNO1lBQy9DLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO3FCQTdHNUIsbzlFQTJHUjtTQUdKLENBQUM7UUE0R2UsV0FBQSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUE7UUFDbEIsV0FBQSxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUE7eUNBRlYsTUFBTTtZQUNZLFVBQVU7WUFDUCxlQUFlO09BNUdyRCxxQkFBcUIsQ0F5b0JqQztJQUFELDRCQUFDO0NBQUEsQUF6b0JELElBeW9CQztTQXpvQlkscUJBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBPbkluaXQsIEVsZW1lbnRSZWYsIEluamVjdCwgSW5wdXQsIE91dHB1dCxcbiAgICBFdmVudEVtaXR0ZXIsIFNpbXBsZUNoYW5nZXMsIE9uQ2hhbmdlcywgT25EZXN0cm95LCBIb3N0QmluZGluZyxcbiAgICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgQWZ0ZXJWaWV3SW5pdCwgTmdab25lLCBWaWV3RW5jYXBzdWxhdGlvbiwgVmlld0NoaWxkIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHsgR3JpZHN0ZXJTZXJ2aWNlIH0gZnJvbSAnLi4vZ3JpZHN0ZXIuc2VydmljZSc7XG5cbmltcG9ydCB7IEdyaWRMaXN0SXRlbSB9IGZyb20gJy4uL2dyaWRMaXN0L0dyaWRMaXN0SXRlbSc7XG5pbXBvcnQgeyBEcmFnZ2FibGVFdmVudCB9IGZyb20gJy4uL3V0aWxzL0RyYWdnYWJsZUV2ZW50JztcbmltcG9ydCB7IERyYWdnYWJsZSB9IGZyb20gJy4uL3V0aWxzL2RyYWdnYWJsZSc7XG5pbXBvcnQgeyBJR3JpZHN0ZXJPcHRpb25zIH0gZnJvbSAnLi4vSUdyaWRzdGVyT3B0aW9ucyc7XG5pbXBvcnQgeyBHcmlkTGlzdCB9IGZyb20gJy4uL2dyaWRMaXN0L2dyaWRMaXN0JztcbmltcG9ydCB7IHV0aWxzIH0gZnJvbSAnLi4vdXRpbHMvdXRpbHMnO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ25neC1ncmlkc3Rlci1pdGVtJyxcbiAgICB0ZW1wbGF0ZTogYDxkaXYgY2xhc3M9XCJncmlkc3Rlci1pdGVtLWlubmVyXCIgW25nU3R5bGVdPVwie3Bvc2l0aW9uOiB2YXJpYWJsZUhlaWdodCA/ICdyZWxhdGl2ZScgOiAnJ31cIj5cbiAgICAgIDxzcGFuICNjb250ZW50V3JhcHBlciBjbGFzcz1cImdyaWRzdGVyLWNvbnRlbnQtd3JhcHBlclwiPlxuICAgICAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XG4gICAgICA8L3NwYW4+XG4gICAgICA8ZGl2IGNsYXNzPVwiZ3JpZHN0ZXItaXRlbS1yZXNpemFibGUtaGFuZGxlciBoYW5kbGUtc1wiPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImdyaWRzdGVyLWl0ZW0tcmVzaXphYmxlLWhhbmRsZXIgaGFuZGxlLWVcIj48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJncmlkc3Rlci1pdGVtLXJlc2l6YWJsZS1oYW5kbGVyIGhhbmRsZS1uXCI+PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwiZ3JpZHN0ZXItaXRlbS1yZXNpemFibGUtaGFuZGxlciBoYW5kbGUtd1wiPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImdyaWRzdGVyLWl0ZW0tcmVzaXphYmxlLWhhbmRsZXIgaGFuZGxlLXNlXCI+PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwiZ3JpZHN0ZXItaXRlbS1yZXNpemFibGUtaGFuZGxlciBoYW5kbGUtbmVcIj48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJncmlkc3Rlci1pdGVtLXJlc2l6YWJsZS1oYW5kbGVyIGhhbmRsZS1zd1wiPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImdyaWRzdGVyLWl0ZW0tcmVzaXphYmxlLWhhbmRsZXIgaGFuZGxlLW53XCI+PC9kaXY+XG4gICAgPC9kaXY+YCxcbiAgICBzdHlsZXM6IFtgXG4gICAgbmd4LWdyaWRzdGVyLWl0ZW0ge1xuICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICB0b3A6IDA7XG4gICAgICAgIGxlZnQ6IDA7XG4gICAgICAgIHotaW5kZXg6IDE7XG4gICAgICAgIC13ZWJraXQtdHJhbnNpdGlvbjogbm9uZTtcbiAgICAgICAgdHJhbnNpdGlvbjogbm9uZTtcbiAgICB9XG5cbiAgICAuZ3JpZHN0ZXItLXJlYWR5IG5neC1ncmlkc3Rlci1pdGVtIHtcbiAgICAgICAgdHJhbnNpdGlvbjogYWxsIDIwMG1zIGVhc2U7XG4gICAgICAgIHRyYW5zaXRpb24tcHJvcGVydHk6IGxlZnQsIHRvcDtcbiAgICB9XG5cbiAgICAuZ3JpZHN0ZXItLXJlYWR5LmNzcy10cmFuc2Zvcm0gbmd4LWdyaWRzdGVyLWl0ZW0gIHtcbiAgICAgICAgdHJhbnNpdGlvbi1wcm9wZXJ0eTogdHJhbnNmb3JtO1xuICAgIH1cblxuICAgIC5ncmlkc3Rlci0tcmVhZHkgbmd4LWdyaWRzdGVyLWl0ZW0uaXMtZHJhZ2dpbmcsXG4gICAgLmdyaWRzdGVyLS1yZWFkeSBuZ3gtZ3JpZHN0ZXItaXRlbS5pcy1yZXNpemluZyB7XG4gICAgICAgIC13ZWJraXQtdHJhbnNpdGlvbjogbm9uZTtcbiAgICAgICAgdHJhbnNpdGlvbjogbm9uZTtcbiAgICAgICAgei1pbmRleDogOTk5OTtcbiAgICB9XG5cbiAgICBuZ3gtZ3JpZHN0ZXItaXRlbS5uby10cmFuc2l0aW9uIHtcbiAgICAgICAgLXdlYmtpdC10cmFuc2l0aW9uOiBub25lO1xuICAgICAgICB0cmFuc2l0aW9uOiBub25lO1xuICAgIH1cbiAgICBuZ3gtZ3JpZHN0ZXItaXRlbSAuZ3JpZHN0ZXItaXRlbS1yZXNpemFibGUtaGFuZGxlciB7XG4gICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgei1pbmRleDogMjtcbiAgICAgICAgZGlzcGxheTogbm9uZTtcbiAgICB9XG5cbiAgICBuZ3gtZ3JpZHN0ZXItaXRlbSAuZ3JpZHN0ZXItaXRlbS1yZXNpemFibGUtaGFuZGxlci5oYW5kbGUtbiB7XG4gICAgICBjdXJzb3I6IG4tcmVzaXplO1xuICAgICAgaGVpZ2h0OiAxMHB4O1xuICAgICAgcmlnaHQ6IDA7XG4gICAgICB0b3A6IDA7XG4gICAgICBsZWZ0OiAwO1xuICAgIH1cblxuICAgIG5neC1ncmlkc3Rlci1pdGVtIC5ncmlkc3Rlci1pdGVtLXJlc2l6YWJsZS1oYW5kbGVyLmhhbmRsZS1lIHtcbiAgICAgIGN1cnNvcjogZS1yZXNpemU7XG4gICAgICB3aWR0aDogMTBweDtcbiAgICAgIGJvdHRvbTogMDtcbiAgICAgIHJpZ2h0OiAwO1xuICAgICAgdG9wOiAwO1xuICAgIH1cblxuICAgIG5neC1ncmlkc3Rlci1pdGVtIC5ncmlkc3Rlci1pdGVtLXJlc2l6YWJsZS1oYW5kbGVyLmhhbmRsZS1zIHtcbiAgICAgIGN1cnNvcjogcy1yZXNpemU7XG4gICAgICBoZWlnaHQ6IDEwcHg7XG4gICAgICByaWdodDogMDtcbiAgICAgIGJvdHRvbTogMDtcbiAgICAgIGxlZnQ6IDA7XG4gICAgfVxuXG4gICAgbmd4LWdyaWRzdGVyLWl0ZW0gLmdyaWRzdGVyLWl0ZW0tcmVzaXphYmxlLWhhbmRsZXIuaGFuZGxlLXcge1xuICAgICAgY3Vyc29yOiB3LXJlc2l6ZTtcbiAgICAgIHdpZHRoOiAxMHB4O1xuICAgICAgbGVmdDogMDtcbiAgICAgIHRvcDogMDtcbiAgICAgIGJvdHRvbTogMDtcbiAgICB9XG5cbiAgICBuZ3gtZ3JpZHN0ZXItaXRlbSAuZ3JpZHN0ZXItaXRlbS1yZXNpemFibGUtaGFuZGxlci5oYW5kbGUtbmUge1xuICAgICAgY3Vyc29yOiBuZS1yZXNpemU7XG4gICAgICB3aWR0aDogMTBweDtcbiAgICAgIGhlaWdodDogMTBweDtcbiAgICAgIHJpZ2h0OiAwO1xuICAgICAgdG9wOiAwO1xuICAgIH1cblxuICAgIG5neC1ncmlkc3Rlci1pdGVtIC5ncmlkc3Rlci1pdGVtLXJlc2l6YWJsZS1oYW5kbGVyLmhhbmRsZS1udyB7XG4gICAgICBjdXJzb3I6IG53LXJlc2l6ZTtcbiAgICAgIHdpZHRoOiAxMHB4O1xuICAgICAgaGVpZ2h0OiAxMHB4O1xuICAgICAgbGVmdDogMDtcbiAgICAgIHRvcDogMDtcbiAgICB9XG5cbiAgICBuZ3gtZ3JpZHN0ZXItaXRlbSAuZ3JpZHN0ZXItaXRlbS1yZXNpemFibGUtaGFuZGxlci5oYW5kbGUtc2Uge1xuICAgICAgY3Vyc29yOiBzZS1yZXNpemU7XG4gICAgICB3aWR0aDogMDtcbiAgICAgIGhlaWdodDogMDtcbiAgICAgIHJpZ2h0OiAwO1xuICAgICAgYm90dG9tOiAwO1xuICAgICAgYm9yZGVyLXN0eWxlOiBzb2xpZDtcbiAgICAgIGJvcmRlci13aWR0aDogMCAwIDEwcHggMTBweDtcbiAgICAgIGJvcmRlci1jb2xvcjogdHJhbnNwYXJlbnQ7XG4gICAgfVxuXG4gICAgbmd4LWdyaWRzdGVyLWl0ZW0gLmdyaWRzdGVyLWl0ZW0tcmVzaXphYmxlLWhhbmRsZXIuaGFuZGxlLXN3IHtcbiAgICAgIGN1cnNvcjogc3ctcmVzaXplO1xuICAgICAgd2lkdGg6IDEwcHg7XG4gICAgICBoZWlnaHQ6IDEwcHg7XG4gICAgICBsZWZ0OiAwO1xuICAgICAgYm90dG9tOiAwO1xuICAgIH1cblxuICAgIG5neC1ncmlkc3Rlci1pdGVtOmhvdmVyIC5ncmlkc3Rlci1pdGVtLXJlc2l6YWJsZS1oYW5kbGVyLmhhbmRsZS1zZSB7XG4gICAgICBib3JkZXItY29sb3I6IHRyYW5zcGFyZW50IHRyYW5zcGFyZW50ICNjY2NcbiAgICB9XG4gICAgYF0sXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZVxufSlcbmV4cG9ydCBjbGFzcyBHcmlkc3Rlckl0ZW1Db21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcywgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcbiAgICBASW5wdXQoKSB4OiBudW1iZXI7XG4gICAgQE91dHB1dCgpIHhDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPG51bWJlcj4odHJ1ZSk7XG4gICAgQElucHV0KCkgeTogbnVtYmVyO1xuICAgIEBPdXRwdXQoKSB5Q2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxudW1iZXI+KHRydWUpO1xuXG4gICAgQElucHV0KCkgeFNtOiBudW1iZXI7XG4gICAgQE91dHB1dCgpIHhTbUNoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8bnVtYmVyPih0cnVlKTtcbiAgICBASW5wdXQoKSB5U206IG51bWJlcjtcbiAgICBAT3V0cHV0KCkgeVNtQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxudW1iZXI+KHRydWUpO1xuXG4gICAgQElucHV0KCkgeE1kOiBudW1iZXI7XG4gICAgQE91dHB1dCgpIHhNZENoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8bnVtYmVyPih0cnVlKTtcbiAgICBASW5wdXQoKSB5TWQ6IG51bWJlcjtcbiAgICBAT3V0cHV0KCkgeU1kQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxudW1iZXI+KHRydWUpO1xuXG4gICAgQElucHV0KCkgeExnOiBudW1iZXI7XG4gICAgQE91dHB1dCgpIHhMZ0NoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8bnVtYmVyPih0cnVlKTtcbiAgICBASW5wdXQoKSB5TGc6IG51bWJlcjtcbiAgICBAT3V0cHV0KCkgeUxnQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxudW1iZXI+KHRydWUpO1xuXG4gICAgQElucHV0KCkgeFhsOiBudW1iZXI7XG4gICAgQE91dHB1dCgpIHhYbENoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8bnVtYmVyPih0cnVlKTtcbiAgICBASW5wdXQoKSB5WGw6IG51bWJlcjtcbiAgICBAT3V0cHV0KCkgeVhsQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxudW1iZXI+KHRydWUpO1xuXG5cbiAgICBASW5wdXQoKSB3OiBudW1iZXI7XG4gICAgQE91dHB1dCgpIHdDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPG51bWJlcj4odHJ1ZSk7XG4gICAgQElucHV0KCkgaDogbnVtYmVyO1xuICAgIEBPdXRwdXQoKSBoQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxudW1iZXI+KHRydWUpO1xuXG4gICAgQElucHV0KCkgd1NtOiBudW1iZXI7XG4gICAgQE91dHB1dCgpIHdTbUNoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8bnVtYmVyPih0cnVlKTtcbiAgICBASW5wdXQoKSBoU206IG51bWJlcjtcbiAgICBAT3V0cHV0KCkgaFNtQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxudW1iZXI+KHRydWUpO1xuXG4gICAgQElucHV0KCkgd01kOiBudW1iZXI7XG4gICAgQE91dHB1dCgpIHdNZENoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8bnVtYmVyPih0cnVlKTtcbiAgICBASW5wdXQoKSBoTWQ6IG51bWJlcjtcbiAgICBAT3V0cHV0KCkgaE1kQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxudW1iZXI+KHRydWUpO1xuXG4gICAgQElucHV0KCkgd0xnOiBudW1iZXI7XG4gICAgQE91dHB1dCgpIHdMZ0NoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8bnVtYmVyPih0cnVlKTtcbiAgICBASW5wdXQoKSBoTGc6IG51bWJlcjtcbiAgICBAT3V0cHV0KCkgaExnQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxudW1iZXI+KHRydWUpO1xuXG4gICAgQElucHV0KCkgd1hsOiBudW1iZXI7XG4gICAgQE91dHB1dCgpIHdYbENoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8bnVtYmVyPih0cnVlKTtcbiAgICBASW5wdXQoKSBoWGw6IG51bWJlcjtcbiAgICBAT3V0cHV0KCkgaFhsQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxudW1iZXI+KHRydWUpO1xuXG4gICAgQE91dHB1dCgpIGNoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8YW55Pih0cnVlKTtcbiAgICBAT3V0cHV0KCkgc3RhcnQgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4odHJ1ZSk7XG4gICAgQE91dHB1dCgpIGVuZCA9IG5ldyBFdmVudEVtaXR0ZXI8YW55Pih0cnVlKTtcblxuICAgIEBJbnB1dCgpIGRyYWdBbmREcm9wID0gdHJ1ZTtcbiAgICBASW5wdXQoKSByZXNpemFibGUgPSB0cnVlO1xuXG4gICAgQElucHV0KCkgb3B0aW9uczogYW55ID0ge307XG5cbiAgICBASW5wdXQoKSB2YXJpYWJsZUhlaWdodCA9IGZhbHNlO1xuXG4gICAgQFZpZXdDaGlsZCgnY29udGVudFdyYXBwZXInKSBjb250ZW50V3JhcHBlcjogRWxlbWVudFJlZjtcblxuICAgIGF1dG9TaXplOiBib29sZWFuO1xuXG4gICAgQEhvc3RCaW5kaW5nKCdjbGFzcy5pcy1kcmFnZ2luZycpIGlzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICBASG9zdEJpbmRpbmcoJ2NsYXNzLmlzLXJlc2l6aW5nJykgaXNSZXNpemluZyA9IGZhbHNlO1xuXG4gICAgJGVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuICAgIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWY7XG4gICAgLyoqXG4gICAgICogR3JpZHN0ZXIgcHJvdmlkZXIgc2VydmljZVxuICAgICAqL1xuICAgIGdyaWRzdGVyOiBHcmlkc3RlclNlcnZpY2U7XG5cbiAgICBpdGVtOiBHcmlkTGlzdEl0ZW07XG5cbiAgICBzZXQgcG9zaXRpb25YKHZhbHVlOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5fcG9zaXRpb25YID0gdmFsdWU7XG4gICAgfVxuICAgIGdldCBwb3NpdGlvblgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wb3NpdGlvblg7XG4gICAgfVxuICAgIHNldCBwb3NpdGlvblkodmFsdWU6IG51bWJlcikge1xuICAgICAgICB0aGlzLl9wb3NpdGlvblkgPSB2YWx1ZTtcbiAgICB9XG4gICAgZ2V0IHBvc2l0aW9uWSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Bvc2l0aW9uWTtcbiAgICB9XG4gICAgcHJpdmF0ZSBfcG9zaXRpb25YOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBfcG9zaXRpb25ZOiBudW1iZXI7XG5cbiAgICBwcml2YXRlIGRlZmF1bHRPcHRpb25zOiBhbnkgPSB7XG4gICAgICAgIG1pbldpZHRoOiAxLFxuICAgICAgICBtaW5IZWlnaHQ6IDEsXG4gICAgICAgIG1heFdpZHRoOiBJbmZpbml0eSxcbiAgICAgICAgbWF4SGVpZ2h0OiBJbmZpbml0eSxcbiAgICAgICAgZGVmYXVsdFdpZHRoOiAxLFxuICAgICAgICBkZWZhdWx0SGVpZ2h0OiAxXG4gICAgfTtcbiAgICBwcml2YXRlIHN1YnNjcmlwdGlvbnM6IEFycmF5PFN1YnNjcmlwdGlvbj4gPSBbXTtcbiAgICBwcml2YXRlIGRyYWdTdWJzY3JpcHRpb25zOiBBcnJheTxTdWJzY3JpcHRpb24+ID0gW107XG4gICAgcHJpdmF0ZSByZXNpemVTdWJzY3JpcHRpb25zOiBBcnJheTxTdWJzY3JpcHRpb24+ID0gW107XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHpvbmU6IE5nWm9uZSxcbiAgICAgICAgICAgICAgICBASW5qZWN0KEVsZW1lbnRSZWYpIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgICAgICAgICAgICAgQEluamVjdChHcmlkc3RlclNlcnZpY2UpIGdyaWRzdGVyOiBHcmlkc3RlclNlcnZpY2UpIHtcblxuICAgICAgICB0aGlzLmdyaWRzdGVyID0gZ3JpZHN0ZXI7XG4gICAgICAgIHRoaXMuZWxlbWVudFJlZiA9IGVsZW1lbnRSZWY7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgICAgICAgdGhpcy5pdGVtID0gKG5ldyBHcmlkTGlzdEl0ZW0oKSkuc2V0RnJvbUdyaWRzdGVySXRlbSh0aGlzKTtcblxuICAgICAgICAvLyBpZiBncmlkc3RlciBpcyBpbml0aWFsaXplZCBkbyBub3Qgc2hvdyBhbmltYXRpb24gb24gbmV3IGdyaWQtaXRlbSBjb25zdHJ1Y3RcbiAgICAgICAgaWYgKHRoaXMuZ3JpZHN0ZXIuaXNJbml0aWFsaXplZCgpKSB7XG4gICAgICAgICAgICB0aGlzLnByZXZlbnRBbmltYXRpb24oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG5nT25Jbml0KCkge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHRoaXMuZGVmYXVsdE9wdGlvbnMsIHRoaXMub3B0aW9ucyk7XG5cbiAgICAgICAgdGhpcy53ID0gdGhpcy53IHx8IHRoaXMub3B0aW9ucy5kZWZhdWx0V2lkdGg7XG4gICAgICAgIHRoaXMuaCA9IHRoaXMuaCB8fCB0aGlzLm9wdGlvbnMuZGVmYXVsdEhlaWdodDtcbiAgICAgICAgdGhpcy53U20gPSB0aGlzLndTbSB8fCB0aGlzLnc7XG4gICAgICAgIHRoaXMuaFNtID0gdGhpcy5oU20gfHwgdGhpcy5oO1xuICAgICAgICB0aGlzLndNZCA9IHRoaXMud01kIHx8IHRoaXMudztcbiAgICAgICAgdGhpcy5oTWQgPSB0aGlzLmhNZCB8fCB0aGlzLmg7XG4gICAgICAgIHRoaXMud0xnID0gdGhpcy53TGcgfHwgdGhpcy53O1xuICAgICAgICB0aGlzLmhMZyA9IHRoaXMuaExnIHx8IHRoaXMuaDtcbiAgICAgICAgdGhpcy53WGwgPSB0aGlzLndYbCB8fCB0aGlzLnc7XG4gICAgICAgIHRoaXMuaFhsID0gdGhpcy5oWGwgfHwgdGhpcy5oO1xuXG4gICAgICAgIGlmICh0aGlzLmdyaWRzdGVyLmlzSW5pdGlhbGl6ZWQoKSkge1xuICAgICAgICAgICAgdGhpcy5zZXRQb3NpdGlvbnNPbkl0ZW0oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZ3JpZHN0ZXIucmVnaXN0ZXJJdGVtKHRoaXMuaXRlbSk7XG5cbiAgICAgICAgdGhpcy5ncmlkc3Rlci5jYWxjdWxhdGVDZWxsU2l6ZSgpO1xuICAgICAgICB0aGlzLml0ZW0uYXBwbHlTaXplKCk7XG4gICAgICAgIHRoaXMuaXRlbS5hcHBseVBvc2l0aW9uKCk7XG5cbiAgICAgICAgaWYgKHRoaXMuZ3JpZHN0ZXIub3B0aW9ucy5kcmFnQW5kRHJvcCAmJiB0aGlzLmRyYWdBbmREcm9wKSB7XG4gICAgICAgICAgICB0aGlzLmVuYWJsZURyYWdEcm9wKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5ncmlkc3Rlci5pc0luaXRpYWxpemVkKCkpIHtcbiAgICAgICAgICAgIHRoaXMuZ3JpZHN0ZXIucmVuZGVyKCk7XG4gICAgICAgICAgICB0aGlzLmdyaWRzdGVyLnVwZGF0ZUNhY2hlZEl0ZW1zKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgICAgIGlmICh0aGlzLmdyaWRzdGVyLm9wdGlvbnMucmVzaXphYmxlICYmIHRoaXMuaXRlbS5yZXNpemFibGUpIHtcbiAgICAgICAgICAgIHRoaXMuZW5hYmxlUmVzaXphYmxlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy52YXJpYWJsZUhlaWdodCkge1xuICAgICAgICAgICAgY29uc3QgcmVhZHlTdWJzY3JpcHRpb24gPSB0aGlzLmdyaWRzdGVyLmdyaWRzdGVyQ29tcG9uZW50LnJlYWR5LnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5ncmlkc3Rlci5ncmlkTGlzdC5yZXNpemVJdGVtKHRoaXMuaXRlbSwgeyB3OiB0aGlzLncsIGg6IDEgfSk7XG4gICAgICAgICAgICAgICAgcmVhZHlTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGV0IGxhc3RPZmZzZXRIZWlnaHQ6IG51bWJlcjtcbiAgICAgICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9ucykgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9mZnNldEhlaWdodCA9IHRoaXMuaXRlbS5jb250ZW50SGVpZ2h0O1xuICAgICAgICAgICAgICAgIGlmIChvZmZzZXRIZWlnaHQgIT09IGxhc3RPZmZzZXRIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHRoaXMuZ3JpZHN0ZXIuaXRlbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uYXBwbHlTaXplKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmFwcGx5UG9zaXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsYXN0T2Zmc2V0SGVpZ2h0ID0gb2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCB7XG4gICAgICAgICAgICAgICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgICAgICAgICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICAgICAgICAgICAgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjaGFyYWN0ZXJEYXRhOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICAgICAgaWYgKCF0aGlzLmdyaWRzdGVyLmdyaWRMaXN0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHJlcmVuZGVyID0gZmFsc2U7XG5cbiAgICAgICAgWyd3JywgLi4uT2JqZWN0LmtleXMoR3JpZExpc3RJdGVtLldfUFJPUEVSVFlfTUFQKS5tYXAoYnJlYWtwb2ludCA9PiBHcmlkTGlzdEl0ZW0uV19QUk9QRVJUWV9NQVBbYnJlYWtwb2ludF0pXVxuICAgICAgICAuZmlsdGVyKHByb3BOYW1lID0+IGNoYW5nZXNbcHJvcE5hbWVdICYmICFjaGFuZ2VzW3Byb3BOYW1lXS5pc0ZpcnN0Q2hhbmdlKCkpXG4gICAgICAgIC5mb3JFYWNoKChwcm9wTmFtZToga2V5b2YgR3JpZHN0ZXJJdGVtQ29tcG9uZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoY2hhbmdlc1twcm9wTmFtZV0uY3VycmVudFZhbHVlID4gdGhpcy5vcHRpb25zLm1heFdpZHRoKSB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgIHRoaXNbcHJvcE5hbWVdID0gdGhpcy5vcHRpb25zLm1heFdpZHRoO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpc1s8a2V5b2YgR3JpZHN0ZXJJdGVtQ29tcG9uZW50Pihwcm9wTmFtZSArICdDaGFuZ2UnKV0uZW1pdCh0aGlzW3Byb3BOYW1lXSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVyZW5kZXIgPSB0cnVlO1xuICAgICAgICB9KTtcblxuICAgICAgICBbJ2gnLCAuLi5PYmplY3Qua2V5cyhHcmlkTGlzdEl0ZW0uSF9QUk9QRVJUWV9NQVApLm1hcChicmVha3BvaW50ID0+IEdyaWRMaXN0SXRlbS5IX1BST1BFUlRZX01BUFticmVha3BvaW50XSldXG4gICAgICAgICAgICAuZmlsdGVyKHByb3BOYW1lID0+IGNoYW5nZXNbcHJvcE5hbWVdICYmICFjaGFuZ2VzW3Byb3BOYW1lXS5pc0ZpcnN0Q2hhbmdlKCkpXG4gICAgICAgICAgICAuZm9yRWFjaCgocHJvcE5hbWU6IGtleW9mIEdyaWRzdGVySXRlbUNvbXBvbmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChjaGFuZ2VzW3Byb3BOYW1lXS5jdXJyZW50VmFsdWUgPiB0aGlzLm9wdGlvbnMubWF4SGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgdGhpc1twcm9wTmFtZV0gPSB0aGlzLm9wdGlvbnMubWF4SGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXNbPGtleW9mIEdyaWRzdGVySXRlbUNvbXBvbmVudD4ocHJvcE5hbWUgKyAnQ2hhbmdlJyldLmVtaXQodGhpc1twcm9wTmFtZV0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVyZW5kZXIgPSB0cnVlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgWyd4JywgJ3knLFxuICAgICAgICAuLi5PYmplY3Qua2V5cyhHcmlkTGlzdEl0ZW0uWF9QUk9QRVJUWV9NQVApLm1hcChicmVha3BvaW50ID0+IEdyaWRMaXN0SXRlbS5YX1BST1BFUlRZX01BUFticmVha3BvaW50XSksXG4gICAgICAgIC4uLk9iamVjdC5rZXlzKEdyaWRMaXN0SXRlbS5ZX1BST1BFUlRZX01BUCkubWFwKGJyZWFrcG9pbnQgPT4gR3JpZExpc3RJdGVtLllfUFJPUEVSVFlfTUFQW2JyZWFrcG9pbnRdKV1cbiAgICAgICAgICAgIC5maWx0ZXIocHJvcE5hbWUgPT4gY2hhbmdlc1twcm9wTmFtZV0gJiYgIWNoYW5nZXNbcHJvcE5hbWVdLmlzRmlyc3RDaGFuZ2UoKSlcbiAgICAgICAgICAgIC5mb3JFYWNoKChwcm9wTmFtZTogc3RyaW5nKSA9PiByZXJlbmRlciA9IHRydWUpO1xuXG4gICAgICAgIGlmIChjaGFuZ2VzWydkcmFnQW5kRHJvcCddICYmICFjaGFuZ2VzWydkcmFnQW5kRHJvcCddLmlzRmlyc3RDaGFuZ2UoKSkge1xuICAgICAgICAgICAgaWYgKGNoYW5nZXNbJ2RyYWdBbmREcm9wJ10uY3VycmVudFZhbHVlICYmIHRoaXMuZ3JpZHN0ZXIub3B0aW9ucy5kcmFnQW5kRHJvcCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZW5hYmxlRHJhZ0Ryb3AoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNhYmxlRHJhZ2dhYmxlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoYW5nZXNbJ3Jlc2l6YWJsZSddICYmICFjaGFuZ2VzWydyZXNpemFibGUnXS5pc0ZpcnN0Q2hhbmdlKCkpIHtcbiAgICAgICAgICAgIGlmIChjaGFuZ2VzWydyZXNpemFibGUnXS5jdXJyZW50VmFsdWUgJiYgdGhpcy5ncmlkc3Rlci5vcHRpb25zLnJlc2l6YWJsZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZW5hYmxlUmVzaXphYmxlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzYWJsZVJlc2l6YWJsZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlcmVuZGVyICYmIHRoaXMuZ3JpZHN0ZXIuZ3JpZHN0ZXJDb21wb25lbnQuaXNSZWFkeSkge1xuICAgICAgICAgICAgdGhpcy5ncmlkc3Rlci5kZWJvdW5jZVJlbmRlclN1YmplY3QubmV4dCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbmdPbkRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMuZ3JpZHN0ZXIucmVtb3ZlSXRlbSh0aGlzLml0ZW0pO1xuICAgICAgICB0aGlzLmdyaWRzdGVyLml0ZW1SZW1vdmVTdWJqZWN0Lm5leHQodGhpcy5pdGVtKTtcblxuICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZm9yRWFjaCgoc3ViOiBTdWJzY3JpcHRpb24pID0+IHtcbiAgICAgICAgICAgIHN1Yi51bnN1YnNjcmliZSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5kaXNhYmxlRHJhZ2dhYmxlKCk7XG4gICAgICAgIHRoaXMuZGlzYWJsZVJlc2l6YWJsZSgpO1xuICAgIH1cblxuICAgIHVwZGF0ZUVsZW1lbmV0UG9zaXRpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmdyaWRzdGVyLm9wdGlvbnMudXNlQ1NTVHJhbnNmb3Jtcykge1xuICAgICAgICAgICAgdXRpbHMuc2V0VHJhbnNmb3JtKHRoaXMuJGVsZW1lbnQsIHt4OiB0aGlzLl9wb3NpdGlvblgsIHk6IHRoaXMuX3Bvc2l0aW9uWX0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdXRpbHMuc2V0Q3NzRWxlbWVudFBvc2l0aW9uKHRoaXMuJGVsZW1lbnQsIHt4OiB0aGlzLl9wb3NpdGlvblgsIHk6IHRoaXMuX3Bvc2l0aW9uWX0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0UG9zaXRpb25zT25JdGVtKCkge1xuICAgICAgICBpZiAoIXRoaXMuaXRlbS5oYXNQb3NpdGlvbnModGhpcy5ncmlkc3Rlci5vcHRpb25zLmJyZWFrcG9pbnQpKSB7XG4gICAgICAgICAgICB0aGlzLnNldFBvc2l0aW9uc0ZvckdyaWQodGhpcy5ncmlkc3Rlci5vcHRpb25zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZ3JpZHN0ZXIuZ3JpZHN0ZXJPcHRpb25zLnJlc3BvbnNpdmVPcHRpb25zXG4gICAgICAgICAgICAuZmlsdGVyKChvcHRpb25zOiBJR3JpZHN0ZXJPcHRpb25zKSA9PiAhdGhpcy5pdGVtLmhhc1Bvc2l0aW9ucyhvcHRpb25zLmJyZWFrcG9pbnQpKVxuICAgICAgICAgICAgLmZvckVhY2goKG9wdGlvbnM6IElHcmlkc3Rlck9wdGlvbnMpID0+IHRoaXMuc2V0UG9zaXRpb25zRm9yR3JpZChvcHRpb25zKSk7XG4gICAgfVxuXG4gICAgcHVibGljIGVuYWJsZVJlc2l6YWJsZSgpIHtcbiAgICAgICAgaWYgKHRoaXMucmVzaXplU3Vic2NyaXB0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmdldFJlc2l6ZUhhbmRsZXJzKCkuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IHRoaXMuZ2V0UmVzaXplRGlyZWN0aW9uKGhhbmRsZXIpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaGFzUmVzaXphYmxlSGFuZGxlKGRpcmVjdGlvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBkcmFnZ2FibGUgPSBuZXcgRHJhZ2dhYmxlKGhhbmRsZXIsIHRoaXMuZ2V0UmVzaXphYmxlT3B0aW9ucygpKTtcblxuICAgICAgICAgICAgICAgIGxldCBzdGFydEV2ZW50OiBEcmFnZ2FibGVFdmVudDtcbiAgICAgICAgICAgICAgICBsZXQgc3RhcnREYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIHRvcDogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICBtaW5YOiBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgIG1heFg6IG51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgbWluWTogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICBtYXhZOiBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgIG1pblc6IG51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgbWF4VzogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICBtaW5IOiBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgIG1heEg6IG51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsTGVmdDogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICBzY3JvbGxUb3A6IG51bWJlclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgbGV0IGN1cnNvclRvRWxlbWVudFBvc2l0aW9uOiB7IHg6IG51bWJlciwgeTogbnVtYmVyIH07XG5cbiAgICAgICAgICAgICAgICBjb25zdCBkcmFnU3RhcnRTdWIgPSBkcmFnZ2FibGUuZHJhZ1N0YXJ0XG4gICAgICAgICAgICAgICAgICAgIC5zdWJzY3JpYmUoKGV2ZW50OiBEcmFnZ2FibGVFdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy56b25lLnJ1bigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1Jlc2l6aW5nID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0RXZlbnQgPSBldmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydERhdGEgPSB0aGlzLmNyZWF0ZVJlc2l6ZVN0YXJ0T2JqZWN0KGRpcmVjdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yVG9FbGVtZW50UG9zaXRpb24gPSBldmVudC5nZXRSZWxhdGl2ZUNvb3JkaW5hdGVzKHRoaXMuJGVsZW1lbnQpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncmlkc3Rlci5vblJlc2l6ZVN0YXJ0KHRoaXMuaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vblN0YXJ0KCdyZXNpemUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGRyYWdTdWIgPSBkcmFnZ2FibGUuZHJhZ01vdmVcbiAgICAgICAgICAgICAgICAgICAgLnN1YnNjcmliZSgoZXZlbnQ6IERyYWdnYWJsZUV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzY3JvbGxEYXRhID0gdGhpcy5ncmlkc3Rlci5ncmlkc3RlclNjcm9sbERhdGE7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVzaXplRWxlbWVudCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0RGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBldmVudC5jbGllbnRYIC0gY3Vyc29yVG9FbGVtZW50UG9zaXRpb24ueCAtIHRoaXMuZ3JpZHN0ZXIuZ3JpZHN0ZXJSZWN0LmxlZnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IGV2ZW50LmNsaWVudFkgLSBjdXJzb3JUb0VsZW1lbnRQb3NpdGlvbi55IC0gdGhpcy5ncmlkc3Rlci5ncmlkc3RlclJlY3QudG9wXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydEV2ZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vdmVFdmVudDogZXZlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsRGlmZlg6IHNjcm9sbERhdGEuc2Nyb2xsTGVmdCAtIHN0YXJ0RGF0YS5zY3JvbGxMZWZ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbERpZmZZOiBzY3JvbGxEYXRhLnNjcm9sbFRvcCAtIHN0YXJ0RGF0YS5zY3JvbGxUb3BcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyaWRzdGVyLm9uUmVzaXplRHJhZyh0aGlzLml0ZW0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGRyYWdTdG9wU3ViID0gZHJhZ2dhYmxlLmRyYWdTdG9wXG4gICAgICAgICAgICAgICAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy56b25lLnJ1bigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1Jlc2l6aW5nID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyaWRzdGVyLm9uUmVzaXplU3RvcCh0aGlzLml0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25FbmQoJ3Jlc2l6ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5yZXNpemVTdWJzY3JpcHRpb25zID0gdGhpcy5yZXNpemVTdWJzY3JpcHRpb25zLmNvbmNhdChbZHJhZ1N0YXJ0U3ViLCBkcmFnU3ViLCBkcmFnU3RvcFN1Yl0pO1xuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGRpc2FibGVSZXNpemFibGUoKSB7XG4gICAgICAgIHRoaXMucmVzaXplU3Vic2NyaXB0aW9ucy5mb3JFYWNoKChzdWI6IFN1YnNjcmlwdGlvbikgPT4ge1xuICAgICAgICAgICAgc3ViLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnJlc2l6ZVN1YnNjcmlwdGlvbnMgPSBbXTtcblxuICAgICAgICBbXS5mb3JFYWNoLmNhbGwodGhpcy4kZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZ3JpZHN0ZXItaXRlbS1yZXNpemFibGUtaGFuZGxlcicpLCAoaGFuZGxlcjogSFRNTEVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgIGhhbmRsZXIuc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZW5hYmxlRHJhZ0Ryb3AoKSB7XG4gICAgICAgIGlmICh0aGlzLmRyYWdTdWJzY3JpcHRpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgICBsZXQgY3Vyc29yVG9FbGVtZW50UG9zaXRpb246IHsgeDogbnVtYmVyLCB5OiBudW1iZXIgfTtcblxuICAgICAgICAgICAgY29uc3QgZHJhZ2dhYmxlID0gbmV3IERyYWdnYWJsZSh0aGlzLiRlbGVtZW50LCB0aGlzLmdldERyYWdnYWJsZU9wdGlvbnMoKSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGRyYWdTdGFydFN1YiA9IGRyYWdnYWJsZS5kcmFnU3RhcnRcbiAgICAgICAgICAgICAgICAuc3Vic2NyaWJlKChldmVudDogRHJhZ2dhYmxlRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy56b25lLnJ1bigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyaWRzdGVyLm9uU3RhcnQodGhpcy5pdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNEcmFnZ2luZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uU3RhcnQoJ2RyYWcnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yVG9FbGVtZW50UG9zaXRpb24gPSBldmVudC5nZXRSZWxhdGl2ZUNvb3JkaW5hdGVzKHRoaXMuJGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY29uc3QgZHJhZ1N1YiA9IGRyYWdnYWJsZS5kcmFnTW92ZVxuICAgICAgICAgICAgICAgIC5zdWJzY3JpYmUoKGV2ZW50OiBEcmFnZ2FibGVFdmVudCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb25ZID0gKGV2ZW50LmNsaWVudFkgLSBjdXJzb3JUb0VsZW1lbnRQb3NpdGlvbi55IC1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JpZHN0ZXIuZ3JpZHN0ZXJSZWN0LnRvcCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb25YID0gKGV2ZW50LmNsaWVudFggLSBjdXJzb3JUb0VsZW1lbnRQb3NpdGlvbi54IC1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JpZHN0ZXIuZ3JpZHN0ZXJSZWN0LmxlZnQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUVsZW1lbmV0UG9zaXRpb24oKTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdyaWRzdGVyLm9uRHJhZyh0aGlzLml0ZW0pO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBkcmFnU3RvcFN1YiA9IGRyYWdnYWJsZS5kcmFnU3RvcFxuICAgICAgICAgICAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnpvbmUucnVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JpZHN0ZXIub25TdG9wKHRoaXMuaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyaWRzdGVyLmRlYm91bmNlUmVuZGVyU3ViamVjdC5uZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25FbmQoJ2RyYWcnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuZHJhZ1N1YnNjcmlwdGlvbnMgPSB0aGlzLmRyYWdTdWJzY3JpcHRpb25zLmNvbmNhdChbZHJhZ1N0YXJ0U3ViLCBkcmFnU3ViLCBkcmFnU3RvcFN1Yl0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZGlzYWJsZURyYWdnYWJsZSgpIHtcbiAgICAgICAgdGhpcy5kcmFnU3Vic2NyaXB0aW9ucy5mb3JFYWNoKChzdWI6IFN1YnNjcmlwdGlvbikgPT4ge1xuICAgICAgICAgICAgc3ViLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmRyYWdTdWJzY3JpcHRpb25zID0gW107XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRSZXNpemVIYW5kbGVycygpOiBIVE1MRWxlbWVudFtdICB7XG4gICAgICAgIHJldHVybiBbXS5maWx0ZXIuY2FsbCh0aGlzLiRlbGVtZW50LmNoaWxkcmVuWzBdLmNoaWxkcmVuLCAoZWw6IEhUTUxFbGVtZW50KSA9PiB7XG5cbiAgICAgICAgICAgIHJldHVybiBlbC5jbGFzc0xpc3QuY29udGFpbnMoJ2dyaWRzdGVyLWl0ZW0tcmVzaXphYmxlLWhhbmRsZXInKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXREcmFnZ2FibGVPcHRpb25zKCkge1xuICAgICAgICByZXR1cm4geyBzY3JvbGxEaXJlY3Rpb246IHRoaXMuZ3JpZHN0ZXIub3B0aW9ucy5kaXJlY3Rpb24sIC4uLnRoaXMuZ3JpZHN0ZXIuZHJhZ2dhYmxlT3B0aW9ucyB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0UmVzaXphYmxlT3B0aW9ucygpIHtcbiAgICAgICAgY29uc3QgcmVzaXphYmxlT3B0aW9uczogYW55ID0ge307XG5cbiAgICAgICAgaWYgKHRoaXMuZ3JpZHN0ZXIuZHJhZ2dhYmxlT3B0aW9ucy5zY3JvbGwgfHwgdGhpcy5ncmlkc3Rlci5kcmFnZ2FibGVPcHRpb25zLnNjcm9sbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJlc2l6YWJsZU9wdGlvbnMuc2Nyb2xsID0gdGhpcy5ncmlkc3Rlci5kcmFnZ2FibGVPcHRpb25zLnNjcm9sbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5ncmlkc3Rlci5kcmFnZ2FibGVPcHRpb25zLnNjcm9sbEVkZ2UpIHtcbiAgICAgICAgICAgIHJlc2l6YWJsZU9wdGlvbnMuc2Nyb2xsRWRnZSA9IHRoaXMuZ3JpZHN0ZXIuZHJhZ2dhYmxlT3B0aW9ucy5zY3JvbGxFZGdlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzaXphYmxlT3B0aW9ucy5zY3JvbGxEaXJlY3Rpb24gPSB0aGlzLmdyaWRzdGVyLm9wdGlvbnMuZGlyZWN0aW9uO1xuXG4gICAgICAgIHJldHVybiByZXNpemFibGVPcHRpb25zO1xuICAgIH1cblxuICAgIHByaXZhdGUgaGFzUmVzaXphYmxlSGFuZGxlKGRpcmVjdGlvbjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IGlzSXRlbVJlc2l6YWJsZSA9IHRoaXMuZ3JpZHN0ZXIub3B0aW9ucy5yZXNpemFibGUgJiYgdGhpcy5pdGVtLnJlc2l6YWJsZTtcbiAgICAgICAgY29uc3QgcmVzaXplSGFuZGxlcyA9IHRoaXMuZ3JpZHN0ZXIub3B0aW9ucy5yZXNpemVIYW5kbGVzO1xuXG4gICAgICAgIHJldHVybiBpc0l0ZW1SZXNpemFibGUgJiYgKCFyZXNpemVIYW5kbGVzIHx8IChyZXNpemVIYW5kbGVzICYmICEhKDxhbnk+cmVzaXplSGFuZGxlcylbZGlyZWN0aW9uXSkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2V0UG9zaXRpb25zRm9yR3JpZChvcHRpb25zOiBJR3JpZHN0ZXJPcHRpb25zKSB7XG4gICAgICAgIGxldCB4LCB5O1xuXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5maW5kUG9zaXRpb24ob3B0aW9ucyk7XG4gICAgICAgIHggPSBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ2hvcml6b250YWwnID8gcG9zaXRpb25bMF0gOiBwb3NpdGlvblsxXTtcbiAgICAgICAgeSA9IG9wdGlvbnMuZGlyZWN0aW9uID09PSAnaG9yaXpvbnRhbCcgPyBwb3NpdGlvblsxXSA6IHBvc2l0aW9uWzBdO1xuXG4gICAgICAgIHRoaXMuaXRlbS5zZXRWYWx1ZVgoeCwgb3B0aW9ucy5icmVha3BvaW50KTtcbiAgICAgICAgdGhpcy5pdGVtLnNldFZhbHVlWSh5LCBvcHRpb25zLmJyZWFrcG9pbnQpO1xuXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5pdGVtLnRyaWdnZXJDaGFuZ2VYKG9wdGlvbnMuYnJlYWtwb2ludCk7XG4gICAgICAgICAgICB0aGlzLml0ZW0udHJpZ2dlckNoYW5nZVkob3B0aW9ucy5icmVha3BvaW50KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmaW5kUG9zaXRpb24ob3B0aW9uczogSUdyaWRzdGVyT3B0aW9ucyk6IEFycmF5PG51bWJlcj4ge1xuICAgICAgICBjb25zdCBncmlkTGlzdCA9IG5ldyBHcmlkTGlzdChcbiAgICAgICAgICAgIHRoaXMuZ3JpZHN0ZXIuaXRlbXMubWFwKGl0ZW0gPT4gaXRlbS5jb3B5Rm9yQnJlYWtwb2ludChvcHRpb25zLmJyZWFrcG9pbnQpKSxcbiAgICAgICAgICAgIG9wdGlvbnNcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gZ3JpZExpc3QuZmluZFBvc2l0aW9uRm9ySXRlbSh0aGlzLml0ZW0sIHt4OiAwLCB5OiAwfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjcmVhdGVSZXNpemVTdGFydE9iamVjdChkaXJlY3Rpb246IHN0cmluZykge1xuICAgICAgICBjb25zdCBzY3JvbGxEYXRhID0gdGhpcy5ncmlkc3Rlci5ncmlkc3RlclNjcm9sbERhdGE7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRvcDogdGhpcy5wb3NpdGlvblksXG4gICAgICAgICAgICBsZWZ0OiB0aGlzLnBvc2l0aW9uWCxcbiAgICAgICAgICAgIGhlaWdodDogcGFyc2VJbnQodGhpcy4kZWxlbWVudC5zdHlsZS5oZWlnaHQsIDEwKSxcbiAgICAgICAgICAgIHdpZHRoOiBwYXJzZUludCh0aGlzLiRlbGVtZW50LnN0eWxlLndpZHRoLCAxMCksXG4gICAgICAgICAgICBtaW5YOiBNYXRoLm1heCh0aGlzLml0ZW0ueCArIHRoaXMuaXRlbS53IC0gdGhpcy5vcHRpb25zLm1heFdpZHRoLCAwKSxcbiAgICAgICAgICAgIG1heFg6IHRoaXMuaXRlbS54ICsgdGhpcy5pdGVtLncgLSB0aGlzLm9wdGlvbnMubWluV2lkdGgsXG4gICAgICAgICAgICBtaW5ZOiBNYXRoLm1heCh0aGlzLml0ZW0ueSArIHRoaXMuaXRlbS5oIC0gdGhpcy5vcHRpb25zLm1heEhlaWdodCwgMCksXG4gICAgICAgICAgICBtYXhZOiB0aGlzLml0ZW0ueSArIHRoaXMuaXRlbS5oIC0gdGhpcy5vcHRpb25zLm1pbkhlaWdodCxcbiAgICAgICAgICAgIG1pblc6IHRoaXMub3B0aW9ucy5taW5XaWR0aCxcbiAgICAgICAgICAgIG1heFc6IE1hdGgubWluKFxuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5tYXhXaWR0aCxcbiAgICAgICAgICAgICAgICAodGhpcy5ncmlkc3Rlci5vcHRpb25zLmRpcmVjdGlvbiA9PT0gJ3ZlcnRpY2FsJyAmJiBkaXJlY3Rpb24uaW5kZXhPZigndycpIDwgMCkgP1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JpZHN0ZXIub3B0aW9ucy5sYW5lcyAtIHRoaXMuaXRlbS54IDogdGhpcy5vcHRpb25zLm1heFdpZHRoLFxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbi5pbmRleE9mKCd3JykgPj0gMCA/XG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtLnggKyB0aGlzLml0ZW0udyA6IHRoaXMub3B0aW9ucy5tYXhXaWR0aFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIG1pbkg6IHRoaXMub3B0aW9ucy5taW5IZWlnaHQsXG4gICAgICAgICAgICBtYXhIOiBNYXRoLm1pbihcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMubWF4SGVpZ2h0LFxuICAgICAgICAgICAgICAgICh0aGlzLmdyaWRzdGVyLm9wdGlvbnMuZGlyZWN0aW9uID09PSAnaG9yaXpvbnRhbCcgJiYgZGlyZWN0aW9uLmluZGV4T2YoJ24nKSA8IDApID9cbiAgICAgICAgICAgICAgICB0aGlzLmdyaWRzdGVyLm9wdGlvbnMubGFuZXMgLSB0aGlzLml0ZW0ueSA6IHRoaXMub3B0aW9ucy5tYXhIZWlnaHQsXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uLmluZGV4T2YoJ24nKSA+PSAwID9cbiAgICAgICAgICAgICAgICB0aGlzLml0ZW0ueSArIHRoaXMuaXRlbS5oIDogdGhpcy5vcHRpb25zLm1heEhlaWdodFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIHNjcm9sbExlZnQ6IHNjcm9sbERhdGEuc2Nyb2xsTGVmdCxcbiAgICAgICAgICAgIHNjcm9sbFRvcDogc2Nyb2xsRGF0YS5zY3JvbGxUb3BcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRW5kKGFjdGlvblR5cGU6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICB0aGlzLmVuZC5lbWl0KHthY3Rpb246IGFjdGlvblR5cGUsIGl0ZW06IHRoaXMuaXRlbX0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25TdGFydChhY3Rpb25UeXBlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5zdGFydC5lbWl0KHthY3Rpb246IGFjdGlvblR5cGUsIGl0ZW06IHRoaXMuaXRlbX0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFzc2lnbiBjbGFzcyBmb3Igc2hvcnQgd2hpbGUgdG8gcHJldmVudCBhbmltYXRpb24gb2YgZ3JpZCBpdGVtIGNvbXBvbmVudFxuICAgICAqL1xuICAgIHByaXZhdGUgcHJldmVudEFuaW1hdGlvbigpOiBHcmlkc3Rlckl0ZW1Db21wb25lbnQge1xuICAgICAgICB0aGlzLiRlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ25vLXRyYW5zaXRpb24nKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ25vLXRyYW5zaXRpb24nKTtcbiAgICAgICAgfSwgNTAwKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFJlc2l6ZURpcmVjdGlvbihoYW5kbGVyOiBFbGVtZW50KTogc3RyaW5nIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IGhhbmRsZXIuY2xhc3NMaXN0Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBpZiAoaGFuZGxlci5jbGFzc0xpc3RbaV0ubWF0Y2goJ2hhbmRsZS0nKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBoYW5kbGVyLmNsYXNzTGlzdFtpXS5zcGxpdCgnLScpWzFdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZXNpemVFbGVtZW50KGNvbmZpZzogYW55KTogdm9pZCB7XG4gICAgICAgIC8vIG5vcnRoXG4gICAgICAgIGlmIChjb25maWcuZGlyZWN0aW9uLmluZGV4T2YoJ24nKSA+PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnJlc2l6ZVRvTm9ydGgoY29uZmlnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyB3ZXN0XG4gICAgICAgIGlmIChjb25maWcuZGlyZWN0aW9uLmluZGV4T2YoJ3cnKSA+PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnJlc2l6ZVRvV2VzdChjb25maWcpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGVhc3RcbiAgICAgICAgaWYgKGNvbmZpZy5kaXJlY3Rpb24uaW5kZXhPZignZScpID49IDApIHtcbiAgICAgICAgICAgIHRoaXMucmVzaXplVG9FYXN0KGNvbmZpZyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gc291dGhcbiAgICAgICAgaWYgKGNvbmZpZy5kaXJlY3Rpb24uaW5kZXhPZigncycpID49IDApIHtcbiAgICAgICAgICAgIHRoaXMucmVzaXplVG9Tb3V0aChjb25maWcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZXNpemVUb05vcnRoKGNvbmZpZzogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGhlaWdodCA9IGNvbmZpZy5zdGFydERhdGEuaGVpZ2h0ICsgY29uZmlnLnN0YXJ0RXZlbnQuY2xpZW50WSAtXG4gICAgICAgICAgICBjb25maWcubW92ZUV2ZW50LmNsaWVudFkgLSBjb25maWcuc2Nyb2xsRGlmZlk7XG5cbiAgICAgICAgaWYgKGhlaWdodCA8IChjb25maWcuc3RhcnREYXRhLm1pbkggKiB0aGlzLmdyaWRzdGVyLmNlbGxIZWlnaHQpKSB7XG4gICAgICAgICAgICB0aGlzLnNldE1pbkhlaWdodCgnbicsIGNvbmZpZyk7XG4gICAgICAgIH0gZWxzZSBpZiAoaGVpZ2h0ID4gKGNvbmZpZy5zdGFydERhdGEubWF4SCAqIHRoaXMuZ3JpZHN0ZXIuY2VsbEhlaWdodCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0TWF4SGVpZ2h0KCduJywgY29uZmlnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb25ZID0gY29uZmlnLnBvc2l0aW9uLnk7XG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LnN0eWxlLmhlaWdodCA9IGhlaWdodCArICdweCc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHJlc2l6ZVRvV2VzdChjb25maWc6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zdCB3aWR0aCA9IGNvbmZpZy5zdGFydERhdGEud2lkdGggKyBjb25maWcuc3RhcnRFdmVudC5jbGllbnRYIC1cbiAgICAgICAgICAgIGNvbmZpZy5tb3ZlRXZlbnQuY2xpZW50WCAtIGNvbmZpZy5zY3JvbGxEaWZmWDtcblxuICAgICAgICBpZiAod2lkdGggPCAoY29uZmlnLnN0YXJ0RGF0YS5taW5XICogdGhpcy5ncmlkc3Rlci5jZWxsV2lkdGgpKSB7XG4gICAgICAgICAgICB0aGlzLnNldE1pbldpZHRoKCd3JywgY29uZmlnKTtcbiAgICAgICAgfSBlbHNlIGlmICh3aWR0aCA+IChjb25maWcuc3RhcnREYXRhLm1heFcgKiB0aGlzLmdyaWRzdGVyLmNlbGxXaWR0aCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0TWF4V2lkdGgoJ3cnLCBjb25maWcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvblggPSBjb25maWcucG9zaXRpb24ueDtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRWxlbWVuZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5zdHlsZS53aWR0aCA9IHdpZHRoICsgJ3B4JztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcmVzaXplVG9FYXN0KGNvbmZpZzogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHdpZHRoID0gY29uZmlnLnN0YXJ0RGF0YS53aWR0aCArIGNvbmZpZy5tb3ZlRXZlbnQuY2xpZW50WCAtXG4gICAgICAgICAgICBjb25maWcuc3RhcnRFdmVudC5jbGllbnRYICsgY29uZmlnLnNjcm9sbERpZmZYO1xuXG4gICAgICAgIGlmICh3aWR0aCA+IChjb25maWcuc3RhcnREYXRhLm1heFcgKiB0aGlzLmdyaWRzdGVyLmNlbGxXaWR0aCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0TWF4V2lkdGgoJ2UnLCBjb25maWcpO1xuICAgICAgICB9IGVsc2UgaWYgKHdpZHRoIDwgKGNvbmZpZy5zdGFydERhdGEubWluVyAqIHRoaXMuZ3JpZHN0ZXIuY2VsbFdpZHRoKSkge1xuICAgICAgICAgICAgdGhpcy5zZXRNaW5XaWR0aCgnZScsIGNvbmZpZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LnN0eWxlLndpZHRoID0gd2lkdGggKyAncHgnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZXNpemVUb1NvdXRoKGNvbmZpZzogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGhlaWdodCA9IGNvbmZpZy5zdGFydERhdGEuaGVpZ2h0ICsgY29uZmlnLm1vdmVFdmVudC5jbGllbnRZIC1cbiAgICAgICAgICAgIGNvbmZpZy5zdGFydEV2ZW50LmNsaWVudFkgKyBjb25maWcuc2Nyb2xsRGlmZlk7XG5cbiAgICAgICAgaWYgKGhlaWdodCA+IGNvbmZpZy5zdGFydERhdGEubWF4SCAqIHRoaXMuZ3JpZHN0ZXIuY2VsbEhlaWdodCkge1xuICAgICAgICAgICAgdGhpcy5zZXRNYXhIZWlnaHQoJ3MnLCBjb25maWcpO1xuICAgICAgICB9IGVsc2UgaWYgKGhlaWdodCA8IGNvbmZpZy5zdGFydERhdGEubWluSCAqIHRoaXMuZ3JpZHN0ZXIuY2VsbEhlaWdodCkge1xuICAgICAgICAgICAgdGhpcy5zZXRNaW5IZWlnaHQoJ3MnLCBjb25maWcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyAncHgnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXRNaW5IZWlnaHQoZGlyZWN0aW9uOiBzdHJpbmcsIGNvbmZpZzogYW55KTogdm9pZCB7XG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT09ICduJykge1xuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5zdHlsZS5oZWlnaHQgPSAoY29uZmlnLnN0YXJ0RGF0YS5taW5IICogdGhpcy5ncmlkc3Rlci5jZWxsSGVpZ2h0KSArICdweCc7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uWSA9IGNvbmZpZy5zdGFydERhdGEubWF4WSAqIHRoaXMuZ3JpZHN0ZXIuY2VsbEhlaWdodDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gKGNvbmZpZy5zdGFydERhdGEubWluSCAqIHRoaXMuZ3JpZHN0ZXIuY2VsbEhlaWdodCkgKyAncHgnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXRNaW5XaWR0aChkaXJlY3Rpb246IHN0cmluZywgY29uZmlnOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ3cnKSB7XG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LnN0eWxlLndpZHRoID0gKGNvbmZpZy5zdGFydERhdGEubWluVyAqIHRoaXMuZ3JpZHN0ZXIuY2VsbFdpZHRoKSArICdweCc7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uWCA9IGNvbmZpZy5zdGFydERhdGEubWF4WCAqIHRoaXMuZ3JpZHN0ZXIuY2VsbFdpZHRoO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVFbGVtZW5ldFBvc2l0aW9uKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LnN0eWxlLndpZHRoID0gKGNvbmZpZy5zdGFydERhdGEubWluVyAqIHRoaXMuZ3JpZHN0ZXIuY2VsbFdpZHRoKSArICdweCc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHNldE1heEhlaWdodChkaXJlY3Rpb246IHN0cmluZywgY29uZmlnOiBhbnkpOiB2b2lkIHtcblxuICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAnbicpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gKGNvbmZpZy5zdGFydERhdGEubWF4SCAqIHRoaXMuZ3JpZHN0ZXIuY2VsbEhlaWdodCkgKyAncHgnO1xuICAgICAgICAgICAgdGhpcy5wb3NpdGlvblkgPSBjb25maWcuc3RhcnREYXRhLm1pblkgKiB0aGlzLmdyaWRzdGVyLmNlbGxIZWlnaHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LnN0eWxlLmhlaWdodCA9IChjb25maWcuc3RhcnREYXRhLm1heEggKiB0aGlzLmdyaWRzdGVyLmNlbGxIZWlnaHQpICsgJ3B4JztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc2V0TWF4V2lkdGgoZGlyZWN0aW9uOiBzdHJpbmcsIGNvbmZpZzogYW55KTogdm9pZCB7XG5cbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ3cnKSB7XG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LnN0eWxlLndpZHRoID0gKGNvbmZpZy5zdGFydERhdGEubWF4VyAqIHRoaXMuZ3JpZHN0ZXIuY2VsbFdpZHRoKSArICdweCc7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uWCA9IGNvbmZpZy5zdGFydERhdGEubWluWCAqIHRoaXMuZ3JpZHN0ZXIuY2VsbFdpZHRoO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVFbGVtZW5ldFBvc2l0aW9uKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LnN0eWxlLndpZHRoID0gKGNvbmZpZy5zdGFydERhdGEubWF4VyAqIHRoaXMuZ3JpZHN0ZXIuY2VsbFdpZHRoKSArICdweCc7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=