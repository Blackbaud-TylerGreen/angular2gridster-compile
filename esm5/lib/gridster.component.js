import { __decorate, __metadata } from "tslib";
import { Component, OnInit, AfterContentInit, OnDestroy, ElementRef, ViewChild, NgZone, Input, Output, EventEmitter, ChangeDetectionStrategy, HostBinding, ViewEncapsulation } from '@angular/core';
import { Subscription, fromEvent } from 'rxjs';
import { debounceTime, filter, publish } from 'rxjs/operators';
import { utils } from './utils/utils';
import { GridsterService } from './gridster.service';
import { GridsterPrototypeService } from './gridster-prototype/gridster-prototype.service';
import { GridsterOptions } from './GridsterOptions';
var GridsterComponent = /** @class */ (function () {
    function GridsterComponent(zone, elementRef, gridster, gridsterPrototype) {
        this.zone = zone;
        this.gridsterPrototype = gridsterPrototype;
        this.optionsChange = new EventEmitter();
        this.ready = new EventEmitter();
        this.reflow = new EventEmitter();
        this.prototypeDrop = new EventEmitter();
        this.prototypeEnter = new EventEmitter();
        this.prototypeOut = new EventEmitter();
        this.isDragging = false;
        this.isResizing = false;
        this.isReady = false;
        this.isPrototypeEntered = false;
        this.isDisabled = false;
        this.subscription = new Subscription();
        this.gridster = gridster;
        this.$element = elementRef.nativeElement;
    }
    GridsterComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.gridsterOptions = new GridsterOptions(this.options, this.$element);
        if (this.options.useCSSTransforms) {
            this.$element.classList.add('css-transform');
        }
        this.subscription.add(this.gridsterOptions.change.subscribe(function (options) {
            _this.gridster.options = options;
            if (_this.gridster.gridList) {
                _this.gridster.gridList.options = options;
            }
            setTimeout(function () { return _this.optionsChange.emit(options); });
        }));
        this.gridster.init(this);
        this.subscription.add(fromEvent(window, 'resize')
            .pipe(debounceTime(this.gridster.options.responsiveDebounce || 0), filter(function () { return _this.gridster.options.responsiveView; }))
            .subscribe(function () { return _this.reload(); }));
        this.zone.runOutsideAngular(function () {
            _this.subscription.add(fromEvent(document, 'scroll', { passive: true }).subscribe(function () {
                return _this.updateGridsterElementData();
            }));
            var scrollableContainer = utils.getScrollableContainer(_this.$element);
            if (scrollableContainer) {
                _this.subscription.add(fromEvent(scrollableContainer, 'scroll', { passive: true })
                    .subscribe(function () {
                    return _this.updateGridsterElementData();
                }));
            }
        });
        var scrollableContainer = utils.getScrollableContainer(this.$element);
        if (scrollableContainer) {
            this.subscription.add(fromEvent(scrollableContainer, 'scroll', { passive: true })
                .subscribe(function () {
                return _this.updateGridsterElementData();
            }));
        }
    };
    GridsterComponent.prototype.ngAfterContentInit = function () {
        this.gridster.start();
        this.updateGridsterElementData();
        this.connectGridsterPrototype();
        this.gridster.$positionHighlight = this.$positionHighlight.nativeElement;
    };
    GridsterComponent.prototype.ngOnDestroy = function () {
        this.subscription.unsubscribe();
    };
    /**
     * Change gridster config option and rebuild
     * @param string name
     * @param any value
     * @return GridsterComponent
     */
    GridsterComponent.prototype.setOption = function (name, value) {
        if (name === 'dragAndDrop') {
            if (value) {
                this.enableDraggable();
            }
            else {
                this.disableDraggable();
            }
        }
        if (name === 'resizable') {
            if (value) {
                this.enableResizable();
            }
            else {
                this.disableResizable();
            }
        }
        if (name === 'lanes') {
            this.gridster.options.lanes = value;
            this.gridster.gridList.fixItemsPositions(this.gridster.options);
            this.reflowGridster();
        }
        if (name === 'direction') {
            this.gridster.options.direction = value;
            this.gridster.gridList.pullItemsToLeft();
        }
        if (name === 'widthHeightRatio') {
            this.gridster.options.widthHeightRatio = parseFloat(value || 1);
        }
        if (name === 'responsiveView') {
            this.gridster.options.responsiveView = !!value;
        }
        this.gridster.gridList.setOption(name, value);
        return this;
    };
    GridsterComponent.prototype.reload = function () {
        var _this = this;
        setTimeout(function () {
            _this.gridster.fixItemsPositions();
            _this.reflowGridster();
        });
        return this;
    };
    GridsterComponent.prototype.reflowGridster = function (isInit) {
        if (isInit === void 0) { isInit = false; }
        this.gridster.reflow();
        this.reflow.emit({
            isInit: isInit,
            gridsterComponent: this
        });
    };
    GridsterComponent.prototype.updateGridsterElementData = function () {
        this.gridster.gridsterScrollData = this.getScrollPositionFromParents(this.$element);
        this.gridster.gridsterRect = this.$element.getBoundingClientRect();
    };
    GridsterComponent.prototype.setReady = function () {
        var _this = this;
        setTimeout(function () { return (_this.isReady = true); });
        this.ready.emit();
    };
    GridsterComponent.prototype.adjustItemsHeightToContent = function (scrollableItemElementSelector) {
        var _this = this;
        if (scrollableItemElementSelector === void 0) { scrollableItemElementSelector = '.gridster-item-inner'; }
        this.gridster.items
            // convert each item to object with information about content height and scroll height
            .map(function (item) {
            var scrollEl = item.$element.querySelector(scrollableItemElementSelector);
            var contentEl = scrollEl.lastElementChild;
            var scrollElDistance = utils.getRelativeCoordinates(scrollEl, item.$element);
            var scrollElRect = scrollEl.getBoundingClientRect();
            var contentRect = contentEl.getBoundingClientRect();
            return {
                item: item,
                contentHeight: contentRect.bottom - scrollElRect.top,
                scrollElDistance: scrollElDistance
            };
        })
            // calculate required height in lanes amount and update item "h"
            .forEach(function (data) {
            data.item.h = Math.ceil(((data.contentHeight /
                (_this.gridster.cellHeight - data.scrollElDistance.top))));
        });
        this.gridster.fixItemsPositions();
        this.gridster.reflow();
    };
    GridsterComponent.prototype.disable = function (item) {
        var itemIdx = this.gridster.items.indexOf(item.itemComponent);
        this.isDisabled = true;
        if (itemIdx >= 0) {
            delete this.gridster.items[this.gridster.items.indexOf(item.itemComponent)];
        }
        this.gridster.onDragOut(item);
    };
    GridsterComponent.prototype.enable = function () {
        this.isDisabled = false;
    };
    GridsterComponent.prototype.getScrollPositionFromParents = function (element, data) {
        if (data === void 0) { data = { scrollTop: 0, scrollLeft: 0 }; }
        if (element.parentElement && element.parentElement !== document.body) {
            data.scrollTop += element.parentElement.scrollTop;
            data.scrollLeft += element.parentElement.scrollLeft;
            return this.getScrollPositionFromParents(element.parentElement, data);
        }
        return {
            scrollTop: data.scrollTop,
            scrollLeft: data.scrollLeft
        };
    };
    /**
     * Connect gridster prototype item to gridster dragging hooks (onStart, onDrag, onStop).
     */
    GridsterComponent.prototype.connectGridsterPrototype = function () {
        var _this = this;
        this.gridsterPrototype.observeDropOut(this.gridster).subscribe();
        var dropOverObservable = (this.gridsterPrototype
            .observeDropOver(this.gridster)
            .pipe(publish()));
        var dragObservable = this.gridsterPrototype.observeDragOver(this.gridster);
        dragObservable.dragOver
            .pipe(filter(function () { return !_this.isDisabled; }))
            .subscribe(function (prototype) {
            if (!_this.isPrototypeEntered) {
                return;
            }
            _this.gridster.onDrag(prototype.item);
        });
        dragObservable.dragEnter
            .pipe(filter(function () { return !_this.isDisabled; }))
            .subscribe(function (prototype) {
            _this.isPrototypeEntered = true;
            if (_this.gridster.items.indexOf(prototype.item) < 0) {
                _this.gridster.items.push(prototype.item);
            }
            _this.gridster.onStart(prototype.item);
            prototype.setDragContextGridster(_this.gridster);
            if (_this.parent) {
                _this.parent.disable(prototype.item);
            }
            _this.prototypeEnter.emit({ item: prototype.item });
        });
        dragObservable.dragOut
            .pipe(filter(function () { return !_this.isDisabled; }))
            .subscribe(function (prototype) {
            if (!_this.isPrototypeEntered) {
                return;
            }
            _this.gridster.onDragOut(prototype.item);
            _this.isPrototypeEntered = false;
            _this.prototypeOut.emit({ item: prototype.item });
            if (_this.parent) {
                _this.parent.enable();
                _this.parent.isPrototypeEntered = true;
                if (_this.parent.gridster.items.indexOf(prototype.item) < 0) {
                    _this.parent.gridster.items.push(prototype.item);
                }
                _this.parent.gridster.onStart(prototype.item);
                prototype.setDragContextGridster(_this.parent.gridster);
                // timeout is needed to be sure that "enter" event is fired after "out"
                setTimeout(function () {
                    _this.parent.prototypeEnter.emit({
                        item: prototype.item
                    });
                    prototype.onEnter(_this.parent.gridster);
                });
            }
        });
        dropOverObservable
            .pipe(filter(function () { return !_this.isDisabled; }))
            .subscribe(function (data) {
            if (!_this.isPrototypeEntered) {
                return;
            }
            _this.gridster.onStop(data.item.item);
            _this.gridster.removeItem(data.item.item);
            _this.isPrototypeEntered = false;
            if (_this.parent) {
                _this.parent.enable();
            }
            _this.prototypeDrop.emit({ item: data.item.item });
        });
        dropOverObservable.connect();
    };
    GridsterComponent.prototype.enableDraggable = function () {
        this.gridster.options.dragAndDrop = true;
        this.gridster.items
            .filter(function (item) { return item.itemComponent && item.itemComponent.dragAndDrop; })
            .forEach(function (item) {
            return item.itemComponent.enableDragDrop();
        });
    };
    GridsterComponent.prototype.disableDraggable = function () {
        this.gridster.options.dragAndDrop = false;
        this.gridster.items
            .filter(function (item) { return item.itemComponent; })
            .forEach(function (item) {
            return item.itemComponent.disableDraggable();
        });
    };
    GridsterComponent.prototype.enableResizable = function () {
        this.gridster.options.resizable = true;
        this.gridster.items
            .filter(function (item) { return item.itemComponent && item.itemComponent.resizable; })
            .forEach(function (item) {
            return item.itemComponent.enableResizable();
        });
    };
    GridsterComponent.prototype.disableResizable = function () {
        this.gridster.options.resizable = false;
        this.gridster.items.forEach(function (item) {
            return item.itemComponent.disableResizable();
        });
    };
    GridsterComponent.ctorParameters = function () { return [
        { type: NgZone },
        { type: ElementRef },
        { type: GridsterService },
        { type: GridsterPrototypeService }
    ]; };
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], GridsterComponent.prototype, "options", void 0);
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], GridsterComponent.prototype, "optionsChange", void 0);
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], GridsterComponent.prototype, "ready", void 0);
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], GridsterComponent.prototype, "reflow", void 0);
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], GridsterComponent.prototype, "prototypeDrop", void 0);
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], GridsterComponent.prototype, "prototypeEnter", void 0);
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], GridsterComponent.prototype, "prototypeOut", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], GridsterComponent.prototype, "draggableOptions", void 0);
    __decorate([
        Input(),
        __metadata("design:type", GridsterComponent)
    ], GridsterComponent.prototype, "parent", void 0);
    __decorate([
        ViewChild('positionHighlight', { static: true }),
        __metadata("design:type", Object)
    ], GridsterComponent.prototype, "$positionHighlight", void 0);
    __decorate([
        ViewChild('backgroundGrid'),
        __metadata("design:type", Object)
    ], GridsterComponent.prototype, "$backgroundGrid", void 0);
    __decorate([
        HostBinding('class.gridster--dragging'),
        __metadata("design:type", Object)
    ], GridsterComponent.prototype, "isDragging", void 0);
    __decorate([
        HostBinding('class.gridster--resizing'),
        __metadata("design:type", Object)
    ], GridsterComponent.prototype, "isResizing", void 0);
    __decorate([
        HostBinding('class.gridster--ready'),
        __metadata("design:type", Object)
    ], GridsterComponent.prototype, "isReady", void 0);
    GridsterComponent = __decorate([
        Component({
            selector: 'ngx-gridster',
            template: "<div class=\"gridster-container\">\n      <canvas class=\"gridster-background-grid\" #backgroundGrid></canvas>\n      <ng-content></ng-content>\n      <div class=\"position-highlight\" style=\"display:none;\" #positionHighlight>\n        <div class=\"inner\"></div>\n      </div>\n    </div>",
            providers: [GridsterService],
            changeDetection: ChangeDetectionStrategy.OnPush,
            encapsulation: ViewEncapsulation.None,
            styles: ["\n            ngx-gridster {\n                position: relative;\n                display: block;\n                left: 0;\n                width: 100%;\n            }\n\n            ngx-gridster.gridster--dragging {\n                -moz-user-select: none;\n                -khtml-user-select: none;\n                -webkit-user-select: none;\n                -ms-user-select: none;\n                user-select: none;\n            }\n\n            ngx-gridster .gridster-container {\n                position: relative;\n                width: 100%;\n                list-style: none;\n                -webkit-transition: width 0.2s, height 0.2s;\n                transition: width 0.2s, height 0.2s;\n            }\n\n    ngx-gridster .position-highlight {\n        display: block;\n        position: absolute;\n        z-index: 1;\n    }\n\n    ngx-gridster .gridster-background-grid {\n        z-index: 0;\n        position: relative;\n        width: 100%;\n        height: 100%\n    }\n    "]
        }),
        __metadata("design:paramtypes", [NgZone,
            ElementRef,
            GridsterService,
            GridsterPrototypeService])
    ], GridsterComponent);
    return GridsterComponent;
}());
export { GridsterComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZHN0ZXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhcjJncmlkc3Rlci8iLCJzb3VyY2VzIjpbImxpYi9ncmlkc3Rlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFDSCxTQUFTLEVBQ1QsTUFBTSxFQUNOLGdCQUFnQixFQUNoQixTQUFTLEVBQ1QsVUFBVSxFQUNWLFNBQVMsRUFDVCxNQUFNLEVBQ04sS0FBSyxFQUNMLE1BQU0sRUFDTixZQUFZLEVBQ1osdUJBQXVCLEVBQ3ZCLFdBQVcsRUFDWCxpQkFBaUIsRUFDcEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUVILFlBQVksRUFDWixTQUFTLEVBRVosTUFBTSxNQUFNLENBQUM7QUFDZCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUUvRCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUdyRCxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxpREFBaUQsQ0FBQztBQUczRixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFxRHBEO0lBeUJJLDJCQUNZLElBQVksRUFDcEIsVUFBc0IsRUFDdEIsUUFBeUIsRUFDakIsaUJBQTJDO1FBSDNDLFNBQUksR0FBSixJQUFJLENBQVE7UUFHWixzQkFBaUIsR0FBakIsaUJBQWlCLENBQTBCO1FBM0J0QyxrQkFBYSxHQUFHLElBQUksWUFBWSxFQUFPLENBQUM7UUFDeEMsVUFBSyxHQUFHLElBQUksWUFBWSxFQUFPLENBQUM7UUFDaEMsV0FBTSxHQUFHLElBQUksWUFBWSxFQUFPLENBQUM7UUFDakMsa0JBQWEsR0FBRyxJQUFJLFlBQVksRUFBd0IsQ0FBQztRQUN6RCxtQkFBYyxHQUFHLElBQUksWUFBWSxFQUF3QixD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UUFBVCxNQUFNLEVBQUU7OzJEQUFnRTtJQUNoRTtRQUFSLEtBQUssRUFBRTs7K0RBQW9EO0lBQ25EO1FBQVIsS0FBSyxFQUFFO2tDQUFnQixpQkFBaUI7cURBQUM7SUFFUTtRQUFqRCxTQUFTLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUM7O2lFQUFvQjtJQUN4QztRQUE1QixTQUFTLENBQUMsZ0JBQWdCLENBQUM7OzhEQUE2QjtJQUNoQjtRQUF4QyxXQUFXLENBQUMsMEJBQTBCLENBQUM7O3lEQUFvQjtJQUNuQjtRQUF4QyxXQUFXLENBQUMsMEJBQTBCLENBQUM7O3lEQUFvQjtJQUV0QjtRQUFyQyxXQUFXLENBQUMsdUJBQXVCLENBQUM7O3NEQUF3QjtJQWhCcEQsaUJBQWlCO1FBbkQ3QixTQUFTLENBQUM7WUFDUCxRQUFRLEVBQUUsY0FBYztZQUN4QixRQUFRLEVBQUUscVNBTUg7WUF1Q1AsU0FBUyxFQUFFLENBQUMsZUFBZSxDQUFDO1lBQzVCLGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNO1lBQy9DLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO3FCQXZDakMseStCQW9DSDtTQUlKLENBQUM7eUNBMkJvQixNQUFNO1lBQ1IsVUFBVTtZQUNaLGVBQWU7WUFDRSx3QkFBd0I7T0E3QjlDLGlCQUFpQixDQTJYN0I7SUFBRCx3QkFBQztDQUFBLEFBM1hELElBMlhDO1NBM1hZLGlCQUFpQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgQ29tcG9uZW50LFxuICAgIE9uSW5pdCxcbiAgICBBZnRlckNvbnRlbnRJbml0LFxuICAgIE9uRGVzdHJveSxcbiAgICBFbGVtZW50UmVmLFxuICAgIFZpZXdDaGlsZCxcbiAgICBOZ1pvbmUsXG4gICAgSW5wdXQsXG4gICAgT3V0cHV0LFxuICAgIEV2ZW50RW1pdHRlcixcbiAgICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgICBIb3N0QmluZGluZyxcbiAgICBWaWV3RW5jYXBzdWxhdGlvblxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7XG4gICAgT2JzZXJ2YWJsZSxcbiAgICBTdWJzY3JpcHRpb24sXG4gICAgZnJvbUV2ZW50LFxuICAgIENvbm5lY3RhYmxlT2JzZXJ2YWJsZVxufSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGRlYm91bmNlVGltZSwgZmlsdGVyLCBwdWJsaXNoIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQgeyB1dGlscyB9IGZyb20gJy4vdXRpbHMvdXRpbHMnO1xuaW1wb3J0IHsgR3JpZHN0ZXJTZXJ2aWNlIH0gZnJvbSAnLi9ncmlkc3Rlci5zZXJ2aWNlJztcbmltcG9ydCB7IElHcmlkc3Rlck9wdGlvbnMgfSBmcm9tICcuL0lHcmlkc3Rlck9wdGlvbnMnO1xuaW1wb3J0IHsgSUdyaWRzdGVyRHJhZ2dhYmxlT3B0aW9ucyB9IGZyb20gJy4vSUdyaWRzdGVyRHJhZ2dhYmxlT3B0aW9ucyc7XG5pbXBvcnQgeyBHcmlkc3RlclByb3RvdHlwZVNlcnZpY2UgfSBmcm9tICcuL2dyaWRzdGVyLXByb3RvdHlwZS9ncmlkc3Rlci1wcm90b3R5cGUuc2VydmljZSc7XG5pbXBvcnQgeyBHcmlkc3Rlckl0ZW1Qcm90b3R5cGVEaXJlY3RpdmUgfSBmcm9tICcuL2dyaWRzdGVyLXByb3RvdHlwZS9ncmlkc3Rlci1pdGVtLXByb3RvdHlwZS5kaXJlY3RpdmUnO1xuaW1wb3J0IHsgR3JpZExpc3RJdGVtIH0gZnJvbSAnLi9ncmlkTGlzdC9HcmlkTGlzdEl0ZW0nO1xuaW1wb3J0IHsgR3JpZHN0ZXJPcHRpb25zIH0gZnJvbSAnLi9Hcmlkc3Rlck9wdGlvbnMnO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ25neC1ncmlkc3RlcicsXG4gICAgdGVtcGxhdGU6IGA8ZGl2IGNsYXNzPVwiZ3JpZHN0ZXItY29udGFpbmVyXCI+XG4gICAgICA8Y2FudmFzIGNsYXNzPVwiZ3JpZHN0ZXItYmFja2dyb3VuZC1ncmlkXCIgI2JhY2tncm91bmRHcmlkPjwvY2FudmFzPlxuICAgICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxuICAgICAgPGRpdiBjbGFzcz1cInBvc2l0aW9uLWhpZ2hsaWdodFwiIHN0eWxlPVwiZGlzcGxheTpub25lO1wiICNwb3NpdGlvbkhpZ2hsaWdodD5cbiAgICAgICAgPGRpdiBjbGFzcz1cImlubmVyXCI+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5gLFxuICAgIHN0eWxlczogW1xuICAgICAgICBgXG4gICAgICAgICAgICBuZ3gtZ3JpZHN0ZXIge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgICAgICAgICBsZWZ0OiAwO1xuICAgICAgICAgICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBuZ3gtZ3JpZHN0ZXIuZ3JpZHN0ZXItLWRyYWdnaW5nIHtcbiAgICAgICAgICAgICAgICAtbW96LXVzZXItc2VsZWN0OiBub25lO1xuICAgICAgICAgICAgICAgIC1raHRtbC11c2VyLXNlbGVjdDogbm9uZTtcbiAgICAgICAgICAgICAgICAtd2Via2l0LXVzZXItc2VsZWN0OiBub25lO1xuICAgICAgICAgICAgICAgIC1tcy11c2VyLXNlbGVjdDogbm9uZTtcbiAgICAgICAgICAgICAgICB1c2VyLXNlbGVjdDogbm9uZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbmd4LWdyaWRzdGVyIC5ncmlkc3Rlci1jb250YWluZXIge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgICAgICAgICBsaXN0LXN0eWxlOiBub25lO1xuICAgICAgICAgICAgICAgIC13ZWJraXQtdHJhbnNpdGlvbjogd2lkdGggMC4ycywgaGVpZ2h0IDAuMnM7XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogd2lkdGggMC4ycywgaGVpZ2h0IDAuMnM7XG4gICAgICAgICAgICB9XG5cbiAgICBuZ3gtZ3JpZHN0ZXIgLnBvc2l0aW9uLWhpZ2hsaWdodCB7XG4gICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgIHotaW5kZXg6IDE7XG4gICAgfVxuXG4gICAgbmd4LWdyaWRzdGVyIC5ncmlkc3Rlci1iYWNrZ3JvdW5kLWdyaWQge1xuICAgICAgICB6LWluZGV4OiAwO1xuICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICBoZWlnaHQ6IDEwMCVcbiAgICB9XG4gICAgYF0sXG4gICAgcHJvdmlkZXJzOiBbR3JpZHN0ZXJTZXJ2aWNlXSxcbiAgICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lXG59KVxuZXhwb3J0IGNsYXNzIEdyaWRzdGVyQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBBZnRlckNvbnRlbnRJbml0LCBPbkRlc3Ryb3kge1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvcHRpb25zOiBJR3JpZHN0ZXJPcHRpb25zO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgb3B0aW9uc0NoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcmVhZHkgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHJlZmxvdyA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcHJvdG90eXBlRHJvcCA9IG5ldyBFdmVudEVtaXR0ZXI8e2l0ZW06IEdyaWRMaXN0SXRlbX0+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBwcm90b3R5cGVFbnRlciA9IG5ldyBFdmVudEVtaXR0ZXI8e2l0ZW06IEdyaWRMaXN0SXRlbX0+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBwcm90b3R5cGVPdXQgPSBuZXcgRXZlbnRFbWl0dGVyPHtpdGVtOiBHcmlkTGlzdEl0ZW19PigpO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkcmFnZ2FibGVPcHRpb25zOiBJR3JpZHN0ZXJEcmFnZ2FibGVPcHRpb25zO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYXJlbnQ6IEdyaWRzdGVyQ29tcG9uZW50O1xuXG4gICAgQFZpZXdDaGlsZCgncG9zaXRpb25IaWdobGlnaHQnLCB7IHN0YXRpYzogdHJ1ZSB9KSAkcG9zaXRpb25IaWdobGlnaHQ7XG4gICAgQFZpZXdDaGlsZCgnYmFja2dyb3VuZEdyaWQnKSBwdWJsaWMgJGJhY2tncm91bmRHcmlkOiBhbnk7XG4gICAgQEhvc3RCaW5kaW5nKCdjbGFzcy5ncmlkc3Rlci0tZHJhZ2dpbmcnKSBpc0RyYWdnaW5nID0gZmFsc2U7XG4gICAgQEhvc3RCaW5kaW5nKCdjbGFzcy5ncmlkc3Rlci0tcmVzaXppbmcnKSBpc1Jlc2l6aW5nID0gZmFsc2U7XG5cbiAgICBASG9zdEJpbmRpbmcoJ2NsYXNzLmdyaWRzdGVyLS1yZWFkeScpIHB1YmxpYyBpc1JlYWR5ID0gZmFsc2U7XG4gICAgcHVibGljIGdyaWRzdGVyOiBHcmlkc3RlclNlcnZpY2U7XG4gICAgcHVibGljICRlbGVtZW50OiBIVE1MRWxlbWVudDtcblxuICAgIHB1YmxpYyBncmlkc3Rlck9wdGlvbnM6IEdyaWRzdGVyT3B0aW9ucztcbiAgICBwdWJsaWMgaXNQcm90b3R5cGVFbnRlcmVkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBpc0Rpc2FibGVkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBzdWJzY3JpcHRpb24gPSBuZXcgU3Vic2NyaXB0aW9uKCk7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSB6b25lOiBOZ1pvbmUsXG4gICAgICAgIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgICAgIGdyaWRzdGVyOiBHcmlkc3RlclNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgZ3JpZHN0ZXJQcm90b3R5cGU6IEdyaWRzdGVyUHJvdG90eXBlU2VydmljZVxuICAgICkge1xuICAgICAgICB0aGlzLmdyaWRzdGVyID0gZ3JpZHN0ZXI7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgfVxuXG4gICAgbmdPbkluaXQoKSB7XG4gICAgICAgIHRoaXMuZ3JpZHN0ZXJPcHRpb25zID0gbmV3IEdyaWRzdGVyT3B0aW9ucyh0aGlzLm9wdGlvbnMsIHRoaXMuJGVsZW1lbnQpO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMudXNlQ1NTVHJhbnNmb3Jtcykge1xuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdjc3MtdHJhbnNmb3JtJyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbi5hZGQoXG4gICAgICAgICAgICB0aGlzLmdyaWRzdGVyT3B0aW9ucy5jaGFuZ2Uuc3Vic2NyaWJlKG9wdGlvbnMgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JpZHN0ZXIub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZ3JpZHN0ZXIuZ3JpZExpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ncmlkc3Rlci5ncmlkTGlzdC5vcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLm9wdGlvbnNDaGFuZ2UuZW1pdChvcHRpb25zKSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMuZ3JpZHN0ZXIuaW5pdCh0aGlzKTtcblxuICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbi5hZGQoXG4gICAgICAgICAgICBmcm9tRXZlbnQod2luZG93LCAncmVzaXplJylcbiAgICAgICAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgICAgICAgICAgZGVib3VuY2VUaW1lKHRoaXMuZ3JpZHN0ZXIub3B0aW9ucy5yZXNwb25zaXZlRGVib3VuY2UgfHwgMCksXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcigoKSA9PiB0aGlzLmdyaWRzdGVyLm9wdGlvbnMucmVzcG9uc2l2ZVZpZXcpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIC5zdWJzY3JpYmUoKCkgPT4gdGhpcy5yZWxvYWQoKSlcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLnpvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zdWJzY3JpcHRpb24uYWRkKFxuICAgICAgICAgICAgICAgIGZyb21FdmVudChkb2N1bWVudCwgJ3Njcm9sbCcsIHsgcGFzc2l2ZTogdHJ1ZSB9KS5zdWJzY3JpYmUoKCkgPT5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVHcmlkc3RlckVsZW1lbnREYXRhKClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc3Qgc2Nyb2xsYWJsZUNvbnRhaW5lciA9IHV0aWxzLmdldFNjcm9sbGFibGVDb250YWluZXIodGhpcy4kZWxlbWVudCk7XG4gICAgICAgICAgICBpZiAoc2Nyb2xsYWJsZUNvbnRhaW5lcikge1xuICAgICAgICAgICAgICAgIHRoaXMuc3Vic2NyaXB0aW9uLmFkZChcbiAgICAgICAgICAgICAgICAgICAgZnJvbUV2ZW50KHNjcm9sbGFibGVDb250YWluZXIsICdzY3JvbGwnLCB7IHBhc3NpdmU6IHRydWUgfSlcbiAgICAgICAgICAgICAgICAgICAgLnN1YnNjcmliZSgoKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVHcmlkc3RlckVsZW1lbnREYXRhKClcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBzY3JvbGxhYmxlQ29udGFpbmVyID0gdXRpbHMuZ2V0U2Nyb2xsYWJsZUNvbnRhaW5lcih0aGlzLiRlbGVtZW50KTtcbiAgICAgICAgaWYgKHNjcm9sbGFibGVDb250YWluZXIpIHtcbiAgICAgICAgICAgIHRoaXMuc3Vic2NyaXB0aW9uLmFkZChcbiAgICAgICAgICAgICAgICBmcm9tRXZlbnQoc2Nyb2xsYWJsZUNvbnRhaW5lciwgJ3Njcm9sbCcsIHsgcGFzc2l2ZTogdHJ1ZSB9KVxuICAgICAgICAgICAgICAgIC5zdWJzY3JpYmUoKCkgPT5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVHcmlkc3RlckVsZW1lbnREYXRhKClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgICAgICB0aGlzLmdyaWRzdGVyLnN0YXJ0KCk7XG5cbiAgICAgICAgdGhpcy51cGRhdGVHcmlkc3RlckVsZW1lbnREYXRhKCk7XG5cbiAgICAgICAgdGhpcy5jb25uZWN0R3JpZHN0ZXJQcm90b3R5cGUoKTtcblxuICAgICAgICB0aGlzLmdyaWRzdGVyLiRwb3NpdGlvbkhpZ2hsaWdodCA9IHRoaXMuJHBvc2l0aW9uSGlnaGxpZ2h0Lm5hdGl2ZUVsZW1lbnQ7XG4gICAgfVxuXG4gICAgbmdPbkRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMuc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hhbmdlIGdyaWRzdGVyIGNvbmZpZyBvcHRpb24gYW5kIHJlYnVpbGRcbiAgICAgKiBAcGFyYW0gc3RyaW5nIG5hbWVcbiAgICAgKiBAcGFyYW0gYW55IHZhbHVlXG4gICAgICogQHJldHVybiBHcmlkc3RlckNvbXBvbmVudFxuICAgICAqL1xuICAgIHNldE9wdGlvbihuYW1lOiBrZXlvZiBJR3JpZHN0ZXJPcHRpb25zLCB2YWx1ZTogYW55KSB7XG4gICAgICAgIGlmIChuYW1lID09PSAnZHJhZ0FuZERyb3AnKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVuYWJsZURyYWdnYWJsZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc2FibGVEcmFnZ2FibGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAobmFtZSA9PT0gJ3Jlc2l6YWJsZScpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZW5hYmxlUmVzaXphYmxlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzYWJsZVJlc2l6YWJsZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChuYW1lID09PSAnbGFuZXMnKSB7XG4gICAgICAgICAgICB0aGlzLmdyaWRzdGVyLm9wdGlvbnMubGFuZXMgPSB2YWx1ZTtcblxuICAgICAgICAgICAgdGhpcy5ncmlkc3Rlci5ncmlkTGlzdC5maXhJdGVtc1Bvc2l0aW9ucyh0aGlzLmdyaWRzdGVyLm9wdGlvbnMpO1xuICAgICAgICAgICAgdGhpcy5yZWZsb3dHcmlkc3RlcigpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuYW1lID09PSAnZGlyZWN0aW9uJykge1xuICAgICAgICAgICAgdGhpcy5ncmlkc3Rlci5vcHRpb25zLmRpcmVjdGlvbiA9IHZhbHVlO1xuICAgICAgICAgICAgdGhpcy5ncmlkc3Rlci5ncmlkTGlzdC5wdWxsSXRlbXNUb0xlZnQoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobmFtZSA9PT0gJ3dpZHRoSGVpZ2h0UmF0aW8nKSB7XG4gICAgICAgICAgICB0aGlzLmdyaWRzdGVyLm9wdGlvbnMud2lkdGhIZWlnaHRSYXRpbyA9IHBhcnNlRmxvYXQodmFsdWUgfHwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5hbWUgPT09ICdyZXNwb25zaXZlVmlldycpIHtcbiAgICAgICAgICAgIHRoaXMuZ3JpZHN0ZXIub3B0aW9ucy5yZXNwb25zaXZlVmlldyA9ICEhdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ncmlkc3Rlci5ncmlkTGlzdC5zZXRPcHRpb24obmFtZSwgdmFsdWUpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHJlbG9hZCgpIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmdyaWRzdGVyLmZpeEl0ZW1zUG9zaXRpb25zKCk7XG4gICAgICAgICAgICB0aGlzLnJlZmxvd0dyaWRzdGVyKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHJlZmxvd0dyaWRzdGVyKGlzSW5pdCA9IGZhbHNlKSB7XG4gICAgICAgIHRoaXMuZ3JpZHN0ZXIucmVmbG93KCk7XG4gICAgICAgIHRoaXMucmVmbG93LmVtaXQoe1xuICAgICAgICAgICAgaXNJbml0OiBpc0luaXQsXG4gICAgICAgICAgICBncmlkc3RlckNvbXBvbmVudDogdGhpc1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB1cGRhdGVHcmlkc3RlckVsZW1lbnREYXRhKCkge1xuICAgICAgICB0aGlzLmdyaWRzdGVyLmdyaWRzdGVyU2Nyb2xsRGF0YSA9IHRoaXMuZ2V0U2Nyb2xsUG9zaXRpb25Gcm9tUGFyZW50cyhcbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5ncmlkc3Rlci5ncmlkc3RlclJlY3QgPSB0aGlzLiRlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIH1cblxuICAgIHNldFJlYWR5KCkge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+ICh0aGlzLmlzUmVhZHkgPSB0cnVlKSk7XG4gICAgICAgIHRoaXMucmVhZHkuZW1pdCgpO1xuICAgIH1cblxuICAgIGFkanVzdEl0ZW1zSGVpZ2h0VG9Db250ZW50KFxuICAgICAgICBzY3JvbGxhYmxlSXRlbUVsZW1lbnRTZWxlY3Rvcjogc3RyaW5nID0gJy5ncmlkc3Rlci1pdGVtLWlubmVyJ1xuICAgICkge1xuICAgICAgICB0aGlzLmdyaWRzdGVyLml0ZW1zXG4gICAgICAgICAgICAvLyBjb252ZXJ0IGVhY2ggaXRlbSB0byBvYmplY3Qgd2l0aCBpbmZvcm1hdGlvbiBhYm91dCBjb250ZW50IGhlaWdodCBhbmQgc2Nyb2xsIGhlaWdodFxuICAgICAgICAgICAgLm1hcCgoaXRlbTogR3JpZExpc3RJdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2Nyb2xsRWwgPSBpdGVtLiRlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbGFibGVJdGVtRWxlbWVudFNlbGVjdG9yXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50RWwgPSBzY3JvbGxFbC5sYXN0RWxlbWVudENoaWxkO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNjcm9sbEVsRGlzdGFuY2UgPSB1dGlscy5nZXRSZWxhdGl2ZUNvb3JkaW5hdGVzKFxuICAgICAgICAgICAgICAgICAgICBzY3JvbGxFbCxcbiAgICAgICAgICAgICAgICAgICAgaXRlbS4kZWxlbWVudFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2Nyb2xsRWxSZWN0ID0gc2Nyb2xsRWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAgICAgY29uc3QgY29udGVudFJlY3QgPSBjb250ZW50RWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBpdGVtLFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50SGVpZ2h0OiBjb250ZW50UmVjdC5ib3R0b20gLSBzY3JvbGxFbFJlY3QudG9wLFxuICAgICAgICAgICAgICAgICAgICBzY3JvbGxFbERpc3RhbmNlXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAvLyBjYWxjdWxhdGUgcmVxdWlyZWQgaGVpZ2h0IGluIGxhbmVzIGFtb3VudCBhbmQgdXBkYXRlIGl0ZW0gXCJoXCJcbiAgICAgICAgICAgIC5mb3JFYWNoKGRhdGEgPT4ge1xuICAgICAgICAgICAgICAgIGRhdGEuaXRlbS5oID0gTWF0aC5jZWlsKDxhbnk+KFxuICAgICAgICAgICAgICAgICAgICAoZGF0YS5jb250ZW50SGVpZ2h0IC9cbiAgICAgICAgICAgICAgICAgICAgICAgICh0aGlzLmdyaWRzdGVyLmNlbGxIZWlnaHQgLSBkYXRhLnNjcm9sbEVsRGlzdGFuY2UudG9wKSlcbiAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZ3JpZHN0ZXIuZml4SXRlbXNQb3NpdGlvbnMoKTtcbiAgICAgICAgdGhpcy5ncmlkc3Rlci5yZWZsb3coKTtcbiAgICB9XG5cbiAgICBkaXNhYmxlKGl0ZW06IGFueSkge1xuICAgICAgICBjb25zdCBpdGVtSWR4ID0gdGhpcy5ncmlkc3Rlci5pdGVtcy5pbmRleE9mKGl0ZW0uaXRlbUNvbXBvbmVudCk7XG5cbiAgICAgICAgdGhpcy5pc0Rpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgaWYgKGl0ZW1JZHggPj0gMCkge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuZ3JpZHN0ZXIuaXRlbXNbXG4gICAgICAgICAgICAgICAgdGhpcy5ncmlkc3Rlci5pdGVtcy5pbmRleE9mKGl0ZW0uaXRlbUNvbXBvbmVudClcbiAgICAgICAgICAgIF07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ncmlkc3Rlci5vbkRyYWdPdXQoaXRlbSk7XG4gICAgfVxuXG4gICAgZW5hYmxlKCkge1xuICAgICAgICB0aGlzLmlzRGlzYWJsZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFNjcm9sbFBvc2l0aW9uRnJvbVBhcmVudHMoXG4gICAgICAgIGVsZW1lbnQ6IEVsZW1lbnQsXG4gICAgICAgIGRhdGEgPSB7IHNjcm9sbFRvcDogMCwgc2Nyb2xsTGVmdDogMCB9XG4gICAgKTogeyBzY3JvbGxUb3A6IG51bWJlcjsgc2Nyb2xsTGVmdDogbnVtYmVyIH0ge1xuICAgICAgICBpZiAoZWxlbWVudC5wYXJlbnRFbGVtZW50ICYmIGVsZW1lbnQucGFyZW50RWxlbWVudCAhPT0gZG9jdW1lbnQuYm9keSkge1xuICAgICAgICAgICAgZGF0YS5zY3JvbGxUb3AgKz0gZWxlbWVudC5wYXJlbnRFbGVtZW50LnNjcm9sbFRvcDtcbiAgICAgICAgICAgIGRhdGEuc2Nyb2xsTGVmdCArPSBlbGVtZW50LnBhcmVudEVsZW1lbnQuc2Nyb2xsTGVmdDtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U2Nyb2xsUG9zaXRpb25Gcm9tUGFyZW50cyhcbiAgICAgICAgICAgICAgICBlbGVtZW50LnBhcmVudEVsZW1lbnQsXG4gICAgICAgICAgICAgICAgZGF0YVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzY3JvbGxUb3A6IGRhdGEuc2Nyb2xsVG9wLFxuICAgICAgICAgICAgc2Nyb2xsTGVmdDogZGF0YS5zY3JvbGxMZWZ0XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29ubmVjdCBncmlkc3RlciBwcm90b3R5cGUgaXRlbSB0byBncmlkc3RlciBkcmFnZ2luZyBob29rcyAob25TdGFydCwgb25EcmFnLCBvblN0b3ApLlxuICAgICAqL1xuICAgIHByaXZhdGUgY29ubmVjdEdyaWRzdGVyUHJvdG90eXBlKCkge1xuICAgICAgICB0aGlzLmdyaWRzdGVyUHJvdG90eXBlLm9ic2VydmVEcm9wT3V0KHRoaXMuZ3JpZHN0ZXIpLnN1YnNjcmliZSgpO1xuXG4gICAgICAgIGNvbnN0IGRyb3BPdmVyT2JzZXJ2YWJsZSA9IDxDb25uZWN0YWJsZU9ic2VydmFibGU8YW55Pj4oXG4gICAgICAgICAgICB0aGlzLmdyaWRzdGVyUHJvdG90eXBlXG4gICAgICAgICAgICAgICAgLm9ic2VydmVEcm9wT3Zlcih0aGlzLmdyaWRzdGVyKVxuICAgICAgICAgICAgICAgIC5waXBlKHB1Ymxpc2goKSlcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBkcmFnT2JzZXJ2YWJsZSA9IHRoaXMuZ3JpZHN0ZXJQcm90b3R5cGUub2JzZXJ2ZURyYWdPdmVyKFxuICAgICAgICAgICAgdGhpcy5ncmlkc3RlclxuICAgICAgICApO1xuXG4gICAgICAgIGRyYWdPYnNlcnZhYmxlLmRyYWdPdmVyXG4gICAgICAgICAgICAucGlwZShmaWx0ZXIoKCkgPT4gIXRoaXMuaXNEaXNhYmxlZCkpXG4gICAgICAgICAgICAuc3Vic2NyaWJlKChwcm90b3R5cGU6IEdyaWRzdGVySXRlbVByb3RvdHlwZURpcmVjdGl2ZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5pc1Byb3RvdHlwZUVudGVyZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmdyaWRzdGVyLm9uRHJhZyhwcm90b3R5cGUuaXRlbSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBkcmFnT2JzZXJ2YWJsZS5kcmFnRW50ZXJcbiAgICAgICAgICAgIC5waXBlKGZpbHRlcigoKSA9PiAhdGhpcy5pc0Rpc2FibGVkKSlcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoKHByb3RvdHlwZTogR3JpZHN0ZXJJdGVtUHJvdG90eXBlRGlyZWN0aXZlKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc1Byb3RvdHlwZUVudGVyZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZ3JpZHN0ZXIuaXRlbXMuaW5kZXhPZihwcm90b3R5cGUuaXRlbSkgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JpZHN0ZXIuaXRlbXMucHVzaChwcm90b3R5cGUuaXRlbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuZ3JpZHN0ZXIub25TdGFydChwcm90b3R5cGUuaXRlbSk7XG4gICAgICAgICAgICAgICAgcHJvdG90eXBlLnNldERyYWdDb250ZXh0R3JpZHN0ZXIodGhpcy5ncmlkc3Rlcik7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZGlzYWJsZShwcm90b3R5cGUuaXRlbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMucHJvdG90eXBlRW50ZXIuZW1pdCh7IGl0ZW06IHByb3RvdHlwZS5pdGVtIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgZHJhZ09ic2VydmFibGUuZHJhZ091dFxuICAgICAgICAgICAgLnBpcGUoZmlsdGVyKCgpID0+ICF0aGlzLmlzRGlzYWJsZWQpKVxuICAgICAgICAgICAgLnN1YnNjcmliZSgocHJvdG90eXBlOiBHcmlkc3Rlckl0ZW1Qcm90b3R5cGVEaXJlY3RpdmUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuaXNQcm90b3R5cGVFbnRlcmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5ncmlkc3Rlci5vbkRyYWdPdXQocHJvdG90eXBlLml0ZW0pO1xuICAgICAgICAgICAgICAgIHRoaXMuaXNQcm90b3R5cGVFbnRlcmVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnByb3RvdHlwZU91dC5lbWl0KHsgaXRlbTogcHJvdG90eXBlLml0ZW0gfSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW5hYmxlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuaXNQcm90b3R5cGVFbnRlcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZ3JpZHN0ZXIuaXRlbXMuaW5kZXhPZihwcm90b3R5cGUuaXRlbSkgPCAwXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZ3JpZHN0ZXIuaXRlbXMucHVzaChwcm90b3R5cGUuaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZ3JpZHN0ZXIub25TdGFydChwcm90b3R5cGUuaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIHByb3RvdHlwZS5zZXREcmFnQ29udGV4dEdyaWRzdGVyKHRoaXMucGFyZW50LmdyaWRzdGVyKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gdGltZW91dCBpcyBuZWVkZWQgdG8gYmUgc3VyZSB0aGF0IFwiZW50ZXJcIiBldmVudCBpcyBmaXJlZCBhZnRlciBcIm91dFwiXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQucHJvdG90eXBlRW50ZXIuZW1pdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogcHJvdG90eXBlLml0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvdG90eXBlLm9uRW50ZXIodGhpcy5wYXJlbnQuZ3JpZHN0ZXIpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBkcm9wT3Zlck9ic2VydmFibGVcbiAgICAgICAgICAgIC5waXBlKGZpbHRlcigoKSA9PiAhdGhpcy5pc0Rpc2FibGVkKSlcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoKGRhdGE6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5pc1Byb3RvdHlwZUVudGVyZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuZ3JpZHN0ZXIub25TdG9wKGRhdGEuaXRlbS5pdGVtKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdyaWRzdGVyLnJlbW92ZUl0ZW0oZGF0YS5pdGVtLml0ZW0pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5pc1Byb3RvdHlwZUVudGVyZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW5hYmxlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMucHJvdG90eXBlRHJvcC5lbWl0KHsgaXRlbTogZGF0YS5pdGVtLml0ZW0gfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBkcm9wT3Zlck9ic2VydmFibGUuY29ubmVjdCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZW5hYmxlRHJhZ2dhYmxlKCkge1xuICAgICAgICB0aGlzLmdyaWRzdGVyLm9wdGlvbnMuZHJhZ0FuZERyb3AgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMuZ3JpZHN0ZXIuaXRlbXNcbiAgICAgICAgICAgIC5maWx0ZXIoXG4gICAgICAgICAgICAgICAgaXRlbSA9PiBpdGVtLml0ZW1Db21wb25lbnQgJiYgaXRlbS5pdGVtQ29tcG9uZW50LmRyYWdBbmREcm9wXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAuZm9yRWFjaCgoaXRlbTogR3JpZExpc3RJdGVtKSA9PlxuICAgICAgICAgICAgICAgIGl0ZW0uaXRlbUNvbXBvbmVudC5lbmFibGVEcmFnRHJvcCgpXG4gICAgICAgICAgICApO1xuICAgIH1cblxuICAgIHByaXZhdGUgZGlzYWJsZURyYWdnYWJsZSgpIHtcbiAgICAgICAgdGhpcy5ncmlkc3Rlci5vcHRpb25zLmRyYWdBbmREcm9wID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5ncmlkc3Rlci5pdGVtc1xuICAgICAgICAgICAgLmZpbHRlcihpdGVtID0+IGl0ZW0uaXRlbUNvbXBvbmVudClcbiAgICAgICAgICAgIC5mb3JFYWNoKChpdGVtOiBHcmlkTGlzdEl0ZW0pID0+XG4gICAgICAgICAgICAgICAgaXRlbS5pdGVtQ29tcG9uZW50LmRpc2FibGVEcmFnZ2FibGUoKVxuICAgICAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGVuYWJsZVJlc2l6YWJsZSgpIHtcbiAgICAgICAgdGhpcy5ncmlkc3Rlci5vcHRpb25zLnJlc2l6YWJsZSA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5ncmlkc3Rlci5pdGVtc1xuICAgICAgICAgICAgLmZpbHRlcihpdGVtID0+IGl0ZW0uaXRlbUNvbXBvbmVudCAmJiBpdGVtLml0ZW1Db21wb25lbnQucmVzaXphYmxlKVxuICAgICAgICAgICAgLmZvckVhY2goKGl0ZW06IEdyaWRMaXN0SXRlbSkgPT5cbiAgICAgICAgICAgICAgICBpdGVtLml0ZW1Db21wb25lbnQuZW5hYmxlUmVzaXphYmxlKClcbiAgICAgICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkaXNhYmxlUmVzaXphYmxlKCkge1xuICAgICAgICB0aGlzLmdyaWRzdGVyLm9wdGlvbnMucmVzaXphYmxlID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5ncmlkc3Rlci5pdGVtcy5mb3JFYWNoKChpdGVtOiBHcmlkTGlzdEl0ZW0pID0+XG4gICAgICAgICAgICBpdGVtLml0ZW1Db21wb25lbnQuZGlzYWJsZVJlc2l6YWJsZSgpXG4gICAgICAgICk7XG4gICAgfVxufVxuIl19