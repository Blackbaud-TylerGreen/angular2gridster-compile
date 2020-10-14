import { __decorate, __metadata } from "tslib";
import { Directive, ElementRef, Input, Output, EventEmitter, OnInit, OnDestroy, NgZone } from '@angular/core';
import { fromEvent } from 'rxjs';
import { GridsterPrototypeService } from './gridster-prototype.service';
import { GridListItem } from '../gridList/GridListItem';
import { Draggable } from '../utils/draggable';
import { utils } from '../utils/utils';
var GridsterItemPrototypeDirective = /** @class */ (function () {
    function GridsterItemPrototypeDirective(zone, elementRef, gridsterPrototype) {
        this.zone = zone;
        this.elementRef = elementRef;
        this.gridsterPrototype = gridsterPrototype;
        this.drop = new EventEmitter();
        this.start = new EventEmitter();
        this.cancel = new EventEmitter();
        this.enter = new EventEmitter();
        this.out = new EventEmitter();
        this.config = {};
        this.x = 0;
        this.y = 0;
        this.variableHeight = false;
        this.variableHeightContainToRow = false;
        this.autoSize = false;
        this.isDragging = false;
        this.subscribtions = [];
        this.item = (new GridListItem()).setFromGridsterItemPrototype(this);
    }
    Object.defineProperty(GridsterItemPrototypeDirective.prototype, "dragAndDrop", {
        // must be set to true because of item dragAndDrop configuration
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridsterItemPrototypeDirective.prototype, "gridster", {
        get: function () {
            return this.dragContextGridster;
        },
        enumerable: true,
        configurable: true
    });
    GridsterItemPrototypeDirective.prototype.ngOnInit = function () {
        var _this = this;
        this.wSm = this.wSm || this.w;
        this.hSm = this.hSm || this.h;
        this.wMd = this.wMd || this.w;
        this.hMd = this.hMd || this.h;
        this.wLg = this.wLg || this.w;
        this.hLg = this.hLg || this.h;
        this.wXl = this.wXl || this.w;
        this.hXl = this.hXl || this.h;
        this.zone.runOutsideAngular(function () {
            _this.enableDragDrop();
        });
    };
    GridsterItemPrototypeDirective.prototype.ngOnDestroy = function () {
        this.subscribtions.forEach(function (sub) {
            sub.unsubscribe();
        });
    };
    GridsterItemPrototypeDirective.prototype.onDrop = function (gridster) {
        if (!this.config.helper) {
            this.$element.parentNode.removeChild(this.$element);
        }
        this.drop.emit({
            item: this.item,
            gridster: gridster
        });
    };
    GridsterItemPrototypeDirective.prototype.onCancel = function () {
        this.cancel.emit({ item: this.item });
    };
    GridsterItemPrototypeDirective.prototype.onEnter = function (gridster) {
        this.enter.emit({
            item: this.item,
            gridster: gridster
        });
    };
    GridsterItemPrototypeDirective.prototype.onOver = function (gridster) { };
    GridsterItemPrototypeDirective.prototype.onOut = function (gridster) {
        this.out.emit({
            item: this.item,
            gridster: gridster
        });
    };
    GridsterItemPrototypeDirective.prototype.getPositionToGridster = function (gridster) {
        var relativeContainerCoords = this.getContainerCoordsToGridster(gridster);
        return {
            y: this.positionY - relativeContainerCoords.top,
            x: this.positionX - relativeContainerCoords.left
        };
    };
    GridsterItemPrototypeDirective.prototype.setDragContextGridster = function (gridster) {
        this.dragContextGridster = gridster;
    };
    GridsterItemPrototypeDirective.prototype.getContainerCoordsToGridster = function (gridster) {
        return {
            left: gridster.gridsterRect.left - this.parentRect.left,
            top: gridster.gridsterRect.top - this.parentRect.top
        };
    };
    GridsterItemPrototypeDirective.prototype.enableDragDrop = function () {
        var _this = this;
        var cursorToElementPosition;
        var draggable = new Draggable(this.elementRef.nativeElement);
        var dragStartSub = draggable.dragStart
            .subscribe(function (event) {
            _this.zone.run(function () {
                _this.$element = _this.provideDragElement();
                _this.containerRectange = _this.$element.parentElement.getBoundingClientRect();
                _this.updateParentElementData();
                _this.onStart(event);
                cursorToElementPosition = event.getRelativeCoordinates(_this.$element);
            });
        });
        var dragSub = draggable.dragMove
            .subscribe(function (event) {
            _this.setElementPosition(_this.$element, {
                x: event.clientX - cursorToElementPosition.x - _this.parentRect.left,
                y: event.clientY - cursorToElementPosition.y - _this.parentRect.top
            });
            _this.onDrag(event);
        });
        var dragStopSub = draggable.dragStop
            .subscribe(function (event) {
            _this.zone.run(function () {
                _this.onStop(event);
                _this.$element = null;
            });
        });
        var scrollSub = fromEvent(document, 'scroll')
            .subscribe(function () {
            if (_this.$element) {
                _this.updateParentElementData();
            }
        });
        this.subscribtions = this.subscribtions.concat([dragStartSub, dragSub, dragStopSub, scrollSub]);
    };
    GridsterItemPrototypeDirective.prototype.setElementPosition = function (element, position) {
        this.positionX = position.x;
        this.positionY = position.y;
        utils.setCssElementPosition(element, position);
    };
    GridsterItemPrototypeDirective.prototype.updateParentElementData = function () {
        this.parentRect = this.$element.parentElement.getBoundingClientRect();
        this.parentOffset = {
            left: this.$element.parentElement.offsetLeft,
            top: this.$element.parentElement.offsetTop
        };
    };
    GridsterItemPrototypeDirective.prototype.onStart = function (event) {
        this.isDragging = true;
        this.$element.style.pointerEvents = 'none';
        this.$element.style.position = 'absolute';
        this.gridsterPrototype.dragItemStart(this, event);
        this.start.emit({ item: this.item });
    };
    GridsterItemPrototypeDirective.prototype.onDrag = function (event) {
        this.gridsterPrototype.updatePrototypePosition(this, event);
    };
    GridsterItemPrototypeDirective.prototype.onStop = function (event) {
        this.gridsterPrototype.dragItemStop(this, event);
        this.isDragging = false;
        this.$element.style.pointerEvents = 'auto';
        this.$element.style.position = '';
        utils.resetCSSElementPosition(this.$element);
        if (this.config.helper) {
            this.$element.parentNode.removeChild(this.$element);
        }
    };
    GridsterItemPrototypeDirective.prototype.provideDragElement = function () {
        var dragElement = this.elementRef.nativeElement;
        if (this.config.helper) {
            dragElement = (dragElement).cloneNode(true);
            document.body.appendChild(this.fixStylesForBodyHelper(dragElement));
        }
        else {
            this.fixStylesForRelativeElement(dragElement);
        }
        return dragElement;
    };
    GridsterItemPrototypeDirective.prototype.fixStylesForRelativeElement = function (el) {
        if (window.getComputedStyle(el).position === 'absolute') {
            return el;
        }
        var rect = this.elementRef.nativeElement.getBoundingClientRect();
        this.containerRectange = el.parentElement.getBoundingClientRect();
        el.style.position = 'absolute';
        this.setElementPosition(el, {
            x: rect.left - this.containerRectange.left,
            y: rect.top - this.containerRectange.top
        });
        return el;
    };
    /**
     * When element is cloned and append to body it should have position absolute and coords set by original
     * relative prototype element position.
     */
    GridsterItemPrototypeDirective.prototype.fixStylesForBodyHelper = function (el) {
        var bodyRect = document.body.getBoundingClientRect();
        var rect = this.elementRef.nativeElement.getBoundingClientRect();
        el.style.position = 'absolute';
        this.setElementPosition(el, {
            x: rect.left - bodyRect.left,
            y: rect.top - bodyRect.top
        });
        return el;
    };
    GridsterItemPrototypeDirective.ctorParameters = function () { return [
        { type: NgZone },
        { type: ElementRef },
        { type: GridsterPrototypeService }
    ]; };
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], GridsterItemPrototypeDirective.prototype, "drop", void 0);
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], GridsterItemPrototypeDirective.prototype, "start", void 0);
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], GridsterItemPrototypeDirective.prototype, "cancel", void 0);
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], GridsterItemPrototypeDirective.prototype, "enter", void 0);
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], GridsterItemPrototypeDirective.prototype, "out", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], GridsterItemPrototypeDirective.prototype, "data", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], GridsterItemPrototypeDirective.prototype, "config", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], GridsterItemPrototypeDirective.prototype, "w", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], GridsterItemPrototypeDirective.prototype, "wSm", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], GridsterItemPrototypeDirective.prototype, "wMd", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], GridsterItemPrototypeDirective.prototype, "wLg", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], GridsterItemPrototypeDirective.prototype, "wXl", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], GridsterItemPrototypeDirective.prototype, "h", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], GridsterItemPrototypeDirective.prototype, "hSm", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], GridsterItemPrototypeDirective.prototype, "hMd", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], GridsterItemPrototypeDirective.prototype, "hLg", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], GridsterItemPrototypeDirective.prototype, "hXl", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], GridsterItemPrototypeDirective.prototype, "variableHeight", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], GridsterItemPrototypeDirective.prototype, "variableHeightContainToRow", void 0);
    GridsterItemPrototypeDirective = __decorate([
        Directive({
            selector: '[ngxGridsterItemPrototype]'
        }),
        __metadata("design:paramtypes", [NgZone,
            ElementRef,
            GridsterPrototypeService])
    ], GridsterItemPrototypeDirective);
    return GridsterItemPrototypeDirective;
}());
export { GridsterItemPrototypeDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZHN0ZXItaXRlbS1wcm90b3R5cGUuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhcjJncmlkc3Rlci8iLCJzb3VyY2VzIjpbImxpYi9ncmlkc3Rlci1wcm90b3R5cGUvZ3JpZHN0ZXItaXRlbS1wcm90b3R5cGUuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUMxRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDakMsT0FBTyxFQUE0QixTQUFTLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFM0QsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDeEUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBR3hELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUMvQyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFLdkM7SUFnRUksd0NBQW9CLElBQVksRUFDWixVQUFzQixFQUN0QixpQkFBMkM7UUFGM0MsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUNaLGVBQVUsR0FBVixVQUFVLENBQVk7UUFDdEIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUEwQjtRQWpFckQsU0FBSSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFDMUIsVUFBSyxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFDM0IsV0FBTSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFDNUIsVUFBSyxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFDM0IsUUFBRyxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFHMUIsV0FBTSxHQUFRLEVBQUUsQ0FBQztRQUVuQixNQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ04sTUFBQyxHQUFHLENBQUMsQ0FBQztRQVlKLG1CQUFjLEdBQVksS0FBSyxDQUFDO1FBQ2hDLCtCQUEwQixHQUFZLEtBQUssQ0FBQztRQUtyRCxhQUFRLEdBQUcsS0FBSyxDQUFDO1FBY2pCLGVBQVUsR0FBRyxLQUFLLENBQUM7UUFVWCxrQkFBYSxHQUF3QixFQUFFLENBQUM7UUFlNUMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksWUFBWSxFQUFFLENBQUMsQ0FBQyw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4RSxDQUFDO0lBYkQsc0JBQUksdURBQVc7UUFEZixnRUFBZ0U7YUFDaEU7WUFDSSxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDOzs7T0FBQTtJQUVELHNCQUFJLG9EQUFRO2FBQVo7WUFDSSxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQztRQUNwQyxDQUFDOzs7T0FBQTtJQVNELGlEQUFRLEdBQVI7UUFBQSxpQkFZQztRQVhHLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUM7WUFDeEIsS0FBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQzFCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELG9EQUFXLEdBQVg7UUFDSSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFDLEdBQWlCO1lBQ3pDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN0QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCwrQ0FBTSxHQUFOLFVBQVEsUUFBeUI7UUFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQ3JCLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDdkQ7UUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztZQUNYLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNmLFFBQVEsRUFBRSxRQUFRO1NBQ3JCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxpREFBUSxHQUFSO1FBQ0ksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBQyxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVELGdEQUFPLEdBQVAsVUFBUyxRQUF5QjtRQUM5QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztZQUNaLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNmLFFBQVEsRUFBRSxRQUFRO1NBQ3JCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCwrQ0FBTSxHQUFOLFVBQVEsUUFBeUIsSUFBUyxDQUFDO0lBRTNDLDhDQUFLLEdBQUwsVUFBTyxRQUF5QjtRQUM1QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztZQUNWLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNmLFFBQVEsRUFBRSxRQUFRO1NBQ3JCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCw4REFBcUIsR0FBckIsVUFBc0IsUUFBeUI7UUFDM0MsSUFBTSx1QkFBdUIsR0FBRyxJQUFJLENBQUMsNEJBQTRCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFNUUsT0FBTztZQUNILENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxHQUFHLHVCQUF1QixDQUFDLEdBQUc7WUFDL0MsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLEdBQUcsdUJBQXVCLENBQUMsSUFBSTtTQUNuRCxDQUFDO0lBQ04sQ0FBQztJQUVELCtEQUFzQixHQUF0QixVQUF1QixRQUF5QjtRQUM1QyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsUUFBUSxDQUFDO0lBQ3hDLENBQUM7SUFFTyxxRUFBNEIsR0FBcEMsVUFBcUMsUUFBeUI7UUFDMUQsT0FBTztZQUNILElBQUksRUFBRSxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUk7WUFDdkQsR0FBRyxFQUFFLFFBQVEsQ0FBQyxZQUFZLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRztTQUN2RCxDQUFDO0lBQ04sQ0FBQztJQUVPLHVEQUFjLEdBQXRCO1FBQUEsaUJBMkNDO1FBMUNHLElBQUksdUJBQWlELENBQUM7UUFDdEQsSUFBTSxTQUFTLEdBQUcsSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUUvRCxJQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsU0FBUzthQUNuQyxTQUFTLENBQUMsVUFBQyxLQUFxQjtZQUM3QixLQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztnQkFDVixLQUFJLENBQUMsUUFBUSxHQUFHLEtBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO2dCQUMxQyxLQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMscUJBQXFCLEVBQUUsQ0FBQztnQkFDN0UsS0FBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7Z0JBQy9CLEtBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBRXBCLHVCQUF1QixHQUFHLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxLQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDMUUsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVQLElBQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxRQUFRO2FBQzdCLFNBQVMsQ0FBQyxVQUFDLEtBQXFCO1lBRTdCLEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNuQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE9BQU8sR0FBRyx1QkFBdUIsQ0FBQyxDQUFDLEdBQUksS0FBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJO2dCQUNwRSxDQUFDLEVBQUUsS0FBSyxDQUFDLE9BQU8sR0FBRyx1QkFBdUIsQ0FBQyxDQUFDLEdBQUksS0FBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHO2FBQ3RFLENBQUMsQ0FBQztZQUVILEtBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUM7UUFFUCxJQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsUUFBUTthQUNqQyxTQUFTLENBQUMsVUFBQyxLQUFxQjtZQUM3QixLQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztnQkFDVixLQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNuQixLQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztZQUN6QixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRVAsSUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUM7YUFDMUMsU0FBUyxDQUFDO1lBQ1AsSUFBSSxLQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNmLEtBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO2FBQ2xDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFUCxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUNwRyxDQUFDO0lBRU8sMkRBQWtCLEdBQTFCLFVBQTJCLE9BQW9CLEVBQUUsUUFBZ0M7UUFDN0UsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUM1QixLQUFLLENBQUMscUJBQXFCLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFTyxnRUFBdUIsR0FBL0I7UUFDSSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDdEUsSUFBSSxDQUFDLFlBQVksR0FBRztZQUNoQixJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsVUFBVTtZQUM1QyxHQUFHLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsU0FBUztTQUM3QyxDQUFDO0lBQ04sQ0FBQztJQUVPLGdEQUFPLEdBQWYsVUFBaUIsS0FBcUI7UUFDbEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFFdkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQztRQUMzQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDO1FBRTFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRWxELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFTywrQ0FBTSxHQUFkLFVBQWdCLEtBQXFCO1FBQ2pDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUVPLCtDQUFNLEdBQWQsVUFBZ0IsS0FBcUI7UUFDakMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFakQsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFDeEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQztRQUMzQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ2xDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFN0MsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUNwQixJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3ZEO0lBQ0wsQ0FBQztJQUVPLDJEQUFrQixHQUExQjtRQUNJLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDO1FBRWhELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFDcEIsV0FBVyxHQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRWpELFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1NBQ3ZFO2FBQU07WUFDSCxJQUFJLENBQUMsMkJBQTJCLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDakQ7UUFFRCxPQUFPLFdBQVcsQ0FBQztJQUN2QixDQUFDO0lBRU8sb0VBQTJCLEdBQW5DLFVBQW9DLEVBQWU7UUFDL0MsSUFBSSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxLQUFLLFVBQVUsRUFBRTtZQUNyRCxPQUFPLEVBQUUsQ0FBQztTQUNiO1FBQ0QsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUNuRSxJQUFJLENBQUMsaUJBQWlCLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBRWxFLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQztRQUMvQixJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxFQUFFO1lBQ3hCLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJO1lBQzFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHO1NBQzNDLENBQUMsQ0FBQztRQUVILE9BQU8sRUFBRSxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7T0FHRztJQUNLLCtEQUFzQixHQUE5QixVQUFnQyxFQUFlO1FBQzNDLElBQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUN2RCxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBRW5FLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQztRQUMvQixJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxFQUFFO1lBQ3hCLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJO1lBQzVCLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxHQUFHO1NBQzdCLENBQUMsQ0FBQztRQUVILE9BQU8sRUFBRSxDQUFDO0lBQ2QsQ0FBQzs7Z0JBbE55QixNQUFNO2dCQUNBLFVBQVU7Z0JBQ0gsd0JBQXdCOztJQWpFckQ7UUFBVCxNQUFNLEVBQUU7O2dFQUEyQjtJQUMxQjtRQUFULE1BQU0sRUFBRTs7aUVBQTRCO0lBQzNCO1FBQVQsTUFBTSxFQUFFOztrRUFBNkI7SUFDNUI7UUFBVCxNQUFNLEVBQUU7O2lFQUE0QjtJQUMzQjtRQUFULE1BQU0sRUFBRTs7K0RBQTBCO0lBRTFCO1FBQVIsS0FBSyxFQUFFOztnRUFBVztJQUNWO1FBQVIsS0FBSyxFQUFFOztrRUFBa0I7SUFJakI7UUFBUixLQUFLLEVBQUU7OzZEQUFXO0lBQ1Y7UUFBUixLQUFLLEVBQUU7OytEQUFhO0lBQ1o7UUFBUixLQUFLLEVBQUU7OytEQUFhO0lBQ1o7UUFBUixLQUFLLEVBQUU7OytEQUFhO0lBQ1o7UUFBUixLQUFLLEVBQUU7OytEQUFhO0lBQ1o7UUFBUixLQUFLLEVBQUU7OzZEQUFXO0lBQ1Y7UUFBUixLQUFLLEVBQUU7OytEQUFhO0lBQ1o7UUFBUixLQUFLLEVBQUU7OytEQUFhO0lBQ1o7UUFBUixLQUFLLEVBQUU7OytEQUFhO0lBQ1o7UUFBUixLQUFLLEVBQUU7OytEQUFhO0lBRVo7UUFBUixLQUFLLEVBQUU7OzBFQUFpQztJQUNoQztRQUFSLEtBQUssRUFBRTs7c0ZBQTZDO0lBeEI1Qyw4QkFBOEI7UUFIMUMsU0FBUyxDQUFDO1lBQ1AsUUFBUSxFQUFFLDRCQUE0QjtTQUN6QyxDQUFDO3lDQWlFNEIsTUFBTTtZQUNBLFVBQVU7WUFDSCx3QkFBd0I7T0FsRXRELDhCQUE4QixDQW9SMUM7SUFBRCxxQ0FBQztDQUFBLEFBcFJELElBb1JDO1NBcFJZLDhCQUE4QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgRWxlbWVudFJlZiwgSW5wdXQsIE91dHB1dCwgRXZlbnRFbWl0dGVyLCBPbkluaXQsIE9uRGVzdHJveSxcbiAgICBOZ1pvbmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgU3Vic2NyaXB0aW9uLCBmcm9tRXZlbnQgfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHsgR3JpZHN0ZXJQcm90b3R5cGVTZXJ2aWNlIH0gZnJvbSAnLi9ncmlkc3Rlci1wcm90b3R5cGUuc2VydmljZSc7XG5pbXBvcnQgeyBHcmlkTGlzdEl0ZW0gfSBmcm9tICcuLi9ncmlkTGlzdC9HcmlkTGlzdEl0ZW0nO1xuaW1wb3J0IHsgR3JpZHN0ZXJTZXJ2aWNlIH0gZnJvbSAnLi4vZ3JpZHN0ZXIuc2VydmljZSc7XG5pbXBvcnQgeyBEcmFnZ2FibGVFdmVudCB9IGZyb20gJy4uL3V0aWxzL0RyYWdnYWJsZUV2ZW50JztcbmltcG9ydCB7IERyYWdnYWJsZSB9IGZyb20gJy4uL3V0aWxzL2RyYWdnYWJsZSc7XG5pbXBvcnQgeyB1dGlscyB9IGZyb20gJy4uL3V0aWxzL3V0aWxzJztcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbbmd4R3JpZHN0ZXJJdGVtUHJvdG90eXBlXSdcbn0pXG5leHBvcnQgY2xhc3MgR3JpZHN0ZXJJdGVtUHJvdG90eXBlRGlyZWN0aXZlIGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICAgIEBPdXRwdXQoKSBkcm9wID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIEBPdXRwdXQoKSBzdGFydCA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICBAT3V0cHV0KCkgY2FuY2VsID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIEBPdXRwdXQoKSBlbnRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICBAT3V0cHV0KCkgb3V0ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gICAgQElucHV0KCkgZGF0YTogYW55O1xuICAgIEBJbnB1dCgpIGNvbmZpZzogYW55ID0ge307XG5cbiAgICBwdWJsaWMgeCA9IDA7XG4gICAgcHVibGljIHkgPSAwO1xuICAgIEBJbnB1dCgpIHc6IG51bWJlcjtcbiAgICBASW5wdXQoKSB3U206IG51bWJlcjtcbiAgICBASW5wdXQoKSB3TWQ6IG51bWJlcjtcbiAgICBASW5wdXQoKSB3TGc6IG51bWJlcjtcbiAgICBASW5wdXQoKSB3WGw6IG51bWJlcjtcbiAgICBASW5wdXQoKSBoOiBudW1iZXI7XG4gICAgQElucHV0KCkgaFNtOiBudW1iZXI7XG4gICAgQElucHV0KCkgaE1kOiBudW1iZXI7XG4gICAgQElucHV0KCkgaExnOiBudW1iZXI7XG4gICAgQElucHV0KCkgaFhsOiBudW1iZXI7XG5cbiAgICBASW5wdXQoKSB2YXJpYWJsZUhlaWdodDogYm9vbGVhbiA9IGZhbHNlO1xuICAgIEBJbnB1dCgpIHZhcmlhYmxlSGVpZ2h0Q29udGFpblRvUm93OiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBwb3NpdGlvblg6IG51bWJlcjtcbiAgICBwb3NpdGlvblk6IG51bWJlcjtcblxuICAgIGF1dG9TaXplID0gZmFsc2U7XG5cbiAgICAkZWxlbWVudDogSFRNTEVsZW1lbnQ7XG5cbiAgICAvKipcbiAgICAgKiBNb3VzZSBkcmFnIG9ic2VydmFibGVcbiAgICAgKi9cbiAgICBkcmFnOiBPYnNlcnZhYmxlPGFueT47XG5cbiAgICAvKipcbiAgICAgKiBTdWJzY3JpYnRpb24gZm9yIGRyYWcgb2JzZXJ2YWJsZVxuICAgICAqL1xuICAgIGRyYWdTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjtcblxuICAgIGlzRHJhZ2dpbmcgPSBmYWxzZTtcblxuICAgIGl0ZW06IEdyaWRMaXN0SXRlbTtcblxuICAgIGNvbnRhaW5lclJlY3RhbmdlOiBDbGllbnRSZWN0O1xuXG4gICAgcHJpdmF0ZSBkcmFnQ29udGV4dEdyaWRzdGVyOiBHcmlkc3RlclNlcnZpY2U7XG4gICAgcHJpdmF0ZSBwYXJlbnRSZWN0OiBDbGllbnRSZWN0O1xuICAgIHByaXZhdGUgcGFyZW50T2Zmc2V0OiB7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn07XG5cbiAgICBwcml2YXRlIHN1YnNjcmlidGlvbnM6IEFycmF5PFN1YnNjcmlwdGlvbj4gPSBbXTtcblxuICAgIC8vIG11c3QgYmUgc2V0IHRvIHRydWUgYmVjYXVzZSBvZiBpdGVtIGRyYWdBbmREcm9wIGNvbmZpZ3VyYXRpb25cbiAgICBnZXQgZHJhZ0FuZERyb3AoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGdldCBncmlkc3RlcigpOiBHcmlkc3RlclNlcnZpY2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5kcmFnQ29udGV4dEdyaWRzdGVyO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgem9uZTogTmdab25lLFxuICAgICAgICAgICAgICAgIHByaXZhdGUgZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgICAgICAgICAgICAgICBwcml2YXRlIGdyaWRzdGVyUHJvdG90eXBlOiBHcmlkc3RlclByb3RvdHlwZVNlcnZpY2UpIHtcblxuICAgICAgICB0aGlzLml0ZW0gPSAobmV3IEdyaWRMaXN0SXRlbSgpKS5zZXRGcm9tR3JpZHN0ZXJJdGVtUHJvdG90eXBlKHRoaXMpO1xuICAgIH1cblxuICAgIG5nT25Jbml0KCkge1xuICAgICAgICB0aGlzLndTbSA9IHRoaXMud1NtIHx8IHRoaXMudztcbiAgICAgICAgdGhpcy5oU20gPSB0aGlzLmhTbSB8fCB0aGlzLmg7XG4gICAgICAgIHRoaXMud01kID0gdGhpcy53TWQgfHwgdGhpcy53O1xuICAgICAgICB0aGlzLmhNZCA9IHRoaXMuaE1kIHx8IHRoaXMuaDtcbiAgICAgICAgdGhpcy53TGcgPSB0aGlzLndMZyB8fCB0aGlzLnc7XG4gICAgICAgIHRoaXMuaExnID0gdGhpcy5oTGcgfHwgdGhpcy5oO1xuICAgICAgICB0aGlzLndYbCA9IHRoaXMud1hsIHx8IHRoaXMudztcbiAgICAgICAgdGhpcy5oWGwgPSB0aGlzLmhYbCB8fCB0aGlzLmg7XG4gICAgICAgIHRoaXMuem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmVuYWJsZURyYWdEcm9wKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG5nT25EZXN0cm95KCkge1xuICAgICAgICB0aGlzLnN1YnNjcmlidGlvbnMuZm9yRWFjaCgoc3ViOiBTdWJzY3JpcHRpb24pID0+IHtcbiAgICAgICAgICAgIHN1Yi51bnN1YnNjcmliZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvbkRyb3AgKGdyaWRzdGVyOiBHcmlkc3RlclNlcnZpY2UpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLmNvbmZpZy5oZWxwZXIpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLiRlbGVtZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZHJvcC5lbWl0KHtcbiAgICAgICAgICAgIGl0ZW06IHRoaXMuaXRlbSxcbiAgICAgICAgICAgIGdyaWRzdGVyOiBncmlkc3RlclxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvbkNhbmNlbCAoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY2FuY2VsLmVtaXQoe2l0ZW06IHRoaXMuaXRlbX0pO1xuICAgIH1cblxuICAgIG9uRW50ZXIgKGdyaWRzdGVyOiBHcmlkc3RlclNlcnZpY2UpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5lbnRlci5lbWl0KHtcbiAgICAgICAgICAgIGl0ZW06IHRoaXMuaXRlbSxcbiAgICAgICAgICAgIGdyaWRzdGVyOiBncmlkc3RlclxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvbk92ZXIgKGdyaWRzdGVyOiBHcmlkc3RlclNlcnZpY2UpOiB2b2lkIHt9XG5cbiAgICBvbk91dCAoZ3JpZHN0ZXI6IEdyaWRzdGVyU2VydmljZSk6IHZvaWQge1xuICAgICAgICB0aGlzLm91dC5lbWl0KHtcbiAgICAgICAgICAgIGl0ZW06IHRoaXMuaXRlbSxcbiAgICAgICAgICAgIGdyaWRzdGVyOiBncmlkc3RlclxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRQb3NpdGlvblRvR3JpZHN0ZXIoZ3JpZHN0ZXI6IEdyaWRzdGVyU2VydmljZSkge1xuICAgICAgICBjb25zdCByZWxhdGl2ZUNvbnRhaW5lckNvb3JkcyA9IHRoaXMuZ2V0Q29udGFpbmVyQ29vcmRzVG9Hcmlkc3Rlcihncmlkc3Rlcik7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHk6IHRoaXMucG9zaXRpb25ZIC0gcmVsYXRpdmVDb250YWluZXJDb29yZHMudG9wLFxuICAgICAgICAgICAgeDogdGhpcy5wb3NpdGlvblggLSByZWxhdGl2ZUNvbnRhaW5lckNvb3Jkcy5sZWZ0XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgc2V0RHJhZ0NvbnRleHRHcmlkc3Rlcihncmlkc3RlcjogR3JpZHN0ZXJTZXJ2aWNlKSB7XG4gICAgICAgIHRoaXMuZHJhZ0NvbnRleHRHcmlkc3RlciA9IGdyaWRzdGVyO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29udGFpbmVyQ29vcmRzVG9Hcmlkc3Rlcihncmlkc3RlcjogR3JpZHN0ZXJTZXJ2aWNlKToge3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXJ9IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxlZnQ6IGdyaWRzdGVyLmdyaWRzdGVyUmVjdC5sZWZ0IC0gdGhpcy5wYXJlbnRSZWN0LmxlZnQsXG4gICAgICAgICAgICB0b3A6IGdyaWRzdGVyLmdyaWRzdGVyUmVjdC50b3AgLSB0aGlzLnBhcmVudFJlY3QudG9wXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBlbmFibGVEcmFnRHJvcCgpIHtcbiAgICAgICAgbGV0IGN1cnNvclRvRWxlbWVudFBvc2l0aW9uOiB7IHg6IG51bWJlciwgeTogbnVtYmVyIH07XG4gICAgICAgIGNvbnN0IGRyYWdnYWJsZSA9IG5ldyBEcmFnZ2FibGUodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpO1xuXG4gICAgICAgIGNvbnN0IGRyYWdTdGFydFN1YiA9IGRyYWdnYWJsZS5kcmFnU3RhcnRcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoKGV2ZW50OiBEcmFnZ2FibGVFdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuem9uZS5ydW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50ID0gdGhpcy5wcm92aWRlRHJhZ0VsZW1lbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250YWluZXJSZWN0YW5nZSA9IHRoaXMuJGVsZW1lbnQucGFyZW50RWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVQYXJlbnRFbGVtZW50RGF0YSgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uU3RhcnQoZXZlbnQpO1xuXG4gICAgICAgICAgICAgICAgICAgIGN1cnNvclRvRWxlbWVudFBvc2l0aW9uID0gZXZlbnQuZ2V0UmVsYXRpdmVDb29yZGluYXRlcyh0aGlzLiRlbGVtZW50KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGRyYWdTdWIgPSBkcmFnZ2FibGUuZHJhZ01vdmVcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoKGV2ZW50OiBEcmFnZ2FibGVFdmVudCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRFbGVtZW50UG9zaXRpb24odGhpcy4kZWxlbWVudCwge1xuICAgICAgICAgICAgICAgICAgICB4OiBldmVudC5jbGllbnRYIC0gY3Vyc29yVG9FbGVtZW50UG9zaXRpb24ueCAgLSB0aGlzLnBhcmVudFJlY3QubGVmdCxcbiAgICAgICAgICAgICAgICAgICAgeTogZXZlbnQuY2xpZW50WSAtIGN1cnNvclRvRWxlbWVudFBvc2l0aW9uLnkgIC0gdGhpcy5wYXJlbnRSZWN0LnRvcFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5vbkRyYWcoZXZlbnQpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgZHJhZ1N0b3BTdWIgPSBkcmFnZ2FibGUuZHJhZ1N0b3BcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoKGV2ZW50OiBEcmFnZ2FibGVFdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuem9uZS5ydW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uU3RvcChldmVudCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3Qgc2Nyb2xsU3ViID0gZnJvbUV2ZW50KGRvY3VtZW50LCAnc2Nyb2xsJylcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLiRlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlUGFyZW50RWxlbWVudERhdGEoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnN1YnNjcmlidGlvbnMgPSB0aGlzLnN1YnNjcmlidGlvbnMuY29uY2F0KFtkcmFnU3RhcnRTdWIsIGRyYWdTdWIsIGRyYWdTdG9wU3ViLCBzY3JvbGxTdWJdKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNldEVsZW1lbnRQb3NpdGlvbihlbGVtZW50OiBIVE1MRWxlbWVudCwgcG9zaXRpb246IHt4OiBudW1iZXIsIHk6IG51bWJlcn0pIHtcbiAgICAgICAgdGhpcy5wb3NpdGlvblggPSBwb3NpdGlvbi54O1xuICAgICAgICB0aGlzLnBvc2l0aW9uWSA9IHBvc2l0aW9uLnk7XG4gICAgICAgIHV0aWxzLnNldENzc0VsZW1lbnRQb3NpdGlvbihlbGVtZW50LCBwb3NpdGlvbik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB1cGRhdGVQYXJlbnRFbGVtZW50RGF0YSgpIHtcbiAgICAgICAgdGhpcy5wYXJlbnRSZWN0ID0gdGhpcy4kZWxlbWVudC5wYXJlbnRFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICB0aGlzLnBhcmVudE9mZnNldCA9IHtcbiAgICAgICAgICAgIGxlZnQ6IHRoaXMuJGVsZW1lbnQucGFyZW50RWxlbWVudC5vZmZzZXRMZWZ0LFxuICAgICAgICAgICAgdG9wOiB0aGlzLiRlbGVtZW50LnBhcmVudEVsZW1lbnQub2Zmc2V0VG9wXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblN0YXJ0IChldmVudDogRHJhZ2dhYmxlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5pc0RyYWdnaW5nID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLiRlbGVtZW50LnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnbm9uZSc7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuXG4gICAgICAgIHRoaXMuZ3JpZHN0ZXJQcm90b3R5cGUuZHJhZ0l0ZW1TdGFydCh0aGlzLCBldmVudCk7XG5cbiAgICAgICAgdGhpcy5zdGFydC5lbWl0KHtpdGVtOiB0aGlzLml0ZW19KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRHJhZyAoZXZlbnQ6IERyYWdnYWJsZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIHRoaXMuZ3JpZHN0ZXJQcm90b3R5cGUudXBkYXRlUHJvdG90eXBlUG9zaXRpb24odGhpcywgZXZlbnQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25TdG9wIChldmVudDogRHJhZ2dhYmxlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5ncmlkc3RlclByb3RvdHlwZS5kcmFnSXRlbVN0b3AodGhpcywgZXZlbnQpO1xuXG4gICAgICAgIHRoaXMuaXNEcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLiRlbGVtZW50LnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnYXV0byc7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnJztcbiAgICAgICAgdXRpbHMucmVzZXRDU1NFbGVtZW50UG9zaXRpb24odGhpcy4kZWxlbWVudCk7XG5cbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLmhlbHBlcikge1xuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuJGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwcm92aWRlRHJhZ0VsZW1lbnQgKCk6IEhUTUxFbGVtZW50IHtcbiAgICAgICAgbGV0IGRyYWdFbGVtZW50ID0gdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLmhlbHBlcikge1xuICAgICAgICAgICAgZHJhZ0VsZW1lbnQgPSA8YW55PihkcmFnRWxlbWVudCkuY2xvbmVOb2RlKHRydWUpO1xuXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuZml4U3R5bGVzRm9yQm9keUhlbHBlcihkcmFnRWxlbWVudCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5maXhTdHlsZXNGb3JSZWxhdGl2ZUVsZW1lbnQoZHJhZ0VsZW1lbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRyYWdFbGVtZW50O1xuICAgIH1cblxuICAgIHByaXZhdGUgZml4U3R5bGVzRm9yUmVsYXRpdmVFbGVtZW50KGVsOiBIVE1MRWxlbWVudCkge1xuICAgICAgICBpZiAod2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwpLnBvc2l0aW9uID09PSAnYWJzb2x1dGUnKSB7XG4gICAgICAgICAgICByZXR1cm4gZWw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVjdCA9IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICB0aGlzLmNvbnRhaW5lclJlY3RhbmdlID0gZWwucGFyZW50RWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICBlbC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgIHRoaXMuc2V0RWxlbWVudFBvc2l0aW9uKGVsLCB7XG4gICAgICAgICAgICB4OiByZWN0LmxlZnQgLSB0aGlzLmNvbnRhaW5lclJlY3RhbmdlLmxlZnQsXG4gICAgICAgICAgICB5OiByZWN0LnRvcCAtIHRoaXMuY29udGFpbmVyUmVjdGFuZ2UudG9wXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXaGVuIGVsZW1lbnQgaXMgY2xvbmVkIGFuZCBhcHBlbmQgdG8gYm9keSBpdCBzaG91bGQgaGF2ZSBwb3NpdGlvbiBhYnNvbHV0ZSBhbmQgY29vcmRzIHNldCBieSBvcmlnaW5hbFxuICAgICAqIHJlbGF0aXZlIHByb3RvdHlwZSBlbGVtZW50IHBvc2l0aW9uLlxuICAgICAqL1xuICAgIHByaXZhdGUgZml4U3R5bGVzRm9yQm9keUhlbHBlciAoZWw6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IGJvZHlSZWN0ID0gZG9jdW1lbnQuYm9keS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY29uc3QgcmVjdCA9IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAgIGVsLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgdGhpcy5zZXRFbGVtZW50UG9zaXRpb24oZWwsIHtcbiAgICAgICAgICAgIHg6IHJlY3QubGVmdCAtIGJvZHlSZWN0LmxlZnQsXG4gICAgICAgICAgICB5OiByZWN0LnRvcCAtIGJvZHlSZWN0LnRvcFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZWw7XG4gICAgfVxuXG59XG4iXX0=