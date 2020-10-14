import { __decorate, __metadata } from "tslib";
import { Component, OnInit, AfterContentInit, OnDestroy, ElementRef, ViewChild, NgZone, Input, Output, EventEmitter, ChangeDetectionStrategy, HostBinding, ViewEncapsulation } from '@angular/core';
import { Subscription, fromEvent } from 'rxjs';
import { debounceTime, filter, publish } from 'rxjs/operators';
import { utils } from './utils/utils';
import { GridsterService } from './gridster.service';
import { GridsterPrototypeService } from './gridster-prototype/gridster-prototype.service';
import { GridsterOptions } from './GridsterOptions';
let GridsterComponent = class GridsterComponent {
    constructor(zone, elementRef, gridster, gridsterPrototype) {
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
    ngOnInit() {
        this.gridsterOptions = new GridsterOptions(this.options, this.$element);
        if (this.options.useCSSTransforms) {
            this.$element.classList.add('css-transform');
        }
        this.subscription.add(this.gridsterOptions.change.subscribe(options => {
            this.gridster.options = options;
            if (this.gridster.gridList) {
                this.gridster.gridList.options = options;
            }
            setTimeout(() => this.optionsChange.emit(options));
        }));
        this.gridster.init(this);
        this.subscription.add(fromEvent(window, 'resize')
            .pipe(debounceTime(this.gridster.options.responsiveDebounce || 0), filter(() => this.gridster.options.responsiveView))
            .subscribe(() => this.reload()));
        this.zone.runOutsideAngular(() => {
            this.subscription.add(fromEvent(document, 'scroll', { passive: true }).subscribe(() => this.updateGridsterElementData()));
            const scrollableContainer = utils.getScrollableContainer(this.$element);
            if (scrollableContainer) {
                this.subscription.add(fromEvent(scrollableContainer, 'scroll', { passive: true })
                    .subscribe(() => this.updateGridsterElementData()));
            }
        });
        const scrollableContainer = utils.getScrollableContainer(this.$element);
        if (scrollableContainer) {
            this.subscription.add(fromEvent(scrollableContainer, 'scroll', { passive: true })
                .subscribe(() => this.updateGridsterElementData()));
        }
    }
    ngAfterContentInit() {
        this.gridster.start();
        this.updateGridsterElementData();
        this.connectGridsterPrototype();
        this.gridster.$positionHighlight = this.$positionHighlight.nativeElement;
    }
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
    /**
     * Change gridster config option and rebuild
     * @param string name
     * @param any value
     * @return GridsterComponent
     */
    setOption(name, value) {
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
    }
    reload() {
        setTimeout(() => {
            this.gridster.fixItemsPositions();
            this.reflowGridster();
        });
        return this;
    }
    reflowGridster(isInit = false) {
        this.gridster.reflow();
        this.reflow.emit({
            isInit: isInit,
            gridsterComponent: this
        });
    }
    updateGridsterElementData() {
        this.gridster.gridsterScrollData = this.getScrollPositionFromParents(this.$element);
        this.gridster.gridsterRect = this.$element.getBoundingClientRect();
    }
    setReady() {
        setTimeout(() => (this.isReady = true));
        this.ready.emit();
    }
    adjustItemsHeightToContent(scrollableItemElementSelector = '.gridster-item-inner') {
        this.gridster.items
            // convert each item to object with information about content height and scroll height
            .map((item) => {
            const scrollEl = item.$element.querySelector(scrollableItemElementSelector);
            const contentEl = scrollEl.lastElementChild;
            const scrollElDistance = utils.getRelativeCoordinates(scrollEl, item.$element);
            const scrollElRect = scrollEl.getBoundingClientRect();
            const contentRect = contentEl.getBoundingClientRect();
            return {
                item,
                contentHeight: contentRect.bottom - scrollElRect.top,
                scrollElDistance
            };
        })
            // calculate required height in lanes amount and update item "h"
            .forEach(data => {
            data.item.h = Math.ceil(((data.contentHeight /
                (this.gridster.cellHeight - data.scrollElDistance.top))));
        });
        this.gridster.fixItemsPositions();
        this.gridster.reflow();
    }
    disable(item) {
        const itemIdx = this.gridster.items.indexOf(item.itemComponent);
        this.isDisabled = true;
        if (itemIdx >= 0) {
            delete this.gridster.items[this.gridster.items.indexOf(item.itemComponent)];
        }
        this.gridster.onDragOut(item);
    }
    enable() {
        this.isDisabled = false;
    }
    getScrollPositionFromParents(element, data = { scrollTop: 0, scrollLeft: 0 }) {
        if (element.parentElement && element.parentElement !== document.body) {
            data.scrollTop += element.parentElement.scrollTop;
            data.scrollLeft += element.parentElement.scrollLeft;
            return this.getScrollPositionFromParents(element.parentElement, data);
        }
        return {
            scrollTop: data.scrollTop,
            scrollLeft: data.scrollLeft
        };
    }
    /**
     * Connect gridster prototype item to gridster dragging hooks (onStart, onDrag, onStop).
     */
    connectGridsterPrototype() {
        this.gridsterPrototype.observeDropOut(this.gridster).subscribe();
        const dropOverObservable = (this.gridsterPrototype
            .observeDropOver(this.gridster)
            .pipe(publish()));
        const dragObservable = this.gridsterPrototype.observeDragOver(this.gridster);
        dragObservable.dragOver
            .pipe(filter(() => !this.isDisabled))
            .subscribe((prototype) => {
            if (!this.isPrototypeEntered) {
                return;
            }
            this.gridster.onDrag(prototype.item);
        });
        dragObservable.dragEnter
            .pipe(filter(() => !this.isDisabled))
            .subscribe((prototype) => {
            this.isPrototypeEntered = true;
            if (this.gridster.items.indexOf(prototype.item) < 0) {
                this.gridster.items.push(prototype.item);
            }
            this.gridster.onStart(prototype.item);
            prototype.setDragContextGridster(this.gridster);
            if (this.parent) {
                this.parent.disable(prototype.item);
            }
            this.prototypeEnter.emit({ item: prototype.item });
        });
        dragObservable.dragOut
            .pipe(filter(() => !this.isDisabled))
            .subscribe((prototype) => {
            if (!this.isPrototypeEntered) {
                return;
            }
            this.gridster.onDragOut(prototype.item);
            this.isPrototypeEntered = false;
            this.prototypeOut.emit({ item: prototype.item });
            if (this.parent) {
                this.parent.enable();
                this.parent.isPrototypeEntered = true;
                if (this.parent.gridster.items.indexOf(prototype.item) < 0) {
                    this.parent.gridster.items.push(prototype.item);
                }
                this.parent.gridster.onStart(prototype.item);
                prototype.setDragContextGridster(this.parent.gridster);
                // timeout is needed to be sure that "enter" event is fired after "out"
                setTimeout(() => {
                    this.parent.prototypeEnter.emit({
                        item: prototype.item
                    });
                    prototype.onEnter(this.parent.gridster);
                });
            }
        });
        dropOverObservable
            .pipe(filter(() => !this.isDisabled))
            .subscribe((data) => {
            if (!this.isPrototypeEntered) {
                return;
            }
            this.gridster.onStop(data.item.item);
            this.gridster.removeItem(data.item.item);
            this.isPrototypeEntered = false;
            if (this.parent) {
                this.parent.enable();
            }
            this.prototypeDrop.emit({ item: data.item.item });
        });
        dropOverObservable.connect();
    }
    enableDraggable() {
        this.gridster.options.dragAndDrop = true;
        this.gridster.items
            .filter(item => item.itemComponent && item.itemComponent.dragAndDrop)
            .forEach((item) => item.itemComponent.enableDragDrop());
    }
    disableDraggable() {
        this.gridster.options.dragAndDrop = false;
        this.gridster.items
            .filter(item => item.itemComponent)
            .forEach((item) => item.itemComponent.disableDraggable());
    }
    enableResizable() {
        this.gridster.options.resizable = true;
        this.gridster.items
            .filter(item => item.itemComponent && item.itemComponent.resizable)
            .forEach((item) => item.itemComponent.enableResizable());
    }
    disableResizable() {
        this.gridster.options.resizable = false;
        this.gridster.items.forEach((item) => item.itemComponent.disableResizable());
    }
};
GridsterComponent.ctorParameters = () => [
    { type: NgZone },
    { type: ElementRef },
    { type: GridsterService },
    { type: GridsterPrototypeService }
];
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
        template: `<div class="gridster-container">
      <canvas class="gridster-background-grid" #backgroundGrid></canvas>
      <ng-content></ng-content>
      <div class="position-highlight" style="display:none;" #positionHighlight>
        <div class="inner"></div>
      </div>
    </div>`,
        providers: [GridsterService],
        changeDetection: ChangeDetectionStrategy.OnPush,
        encapsulation: ViewEncapsulation.None,
        styles: [`
            ngx-gridster {
                position: relative;
                display: block;
                left: 0;
                width: 100%;
            }

            ngx-gridster.gridster--dragging {
                -moz-user-select: none;
                -khtml-user-select: none;
                -webkit-user-select: none;
                -ms-user-select: none;
                user-select: none;
            }

            ngx-gridster .gridster-container {
                position: relative;
                width: 100%;
                list-style: none;
                -webkit-transition: width 0.2s, height 0.2s;
                transition: width 0.2s, height 0.2s;
            }

    ngx-gridster .position-highlight {
        display: block;
        position: absolute;
        z-index: 1;
    }

    ngx-gridster .gridster-background-grid {
        z-index: 0;
        position: relative;
        width: 100%;
        height: 100%
    }
    `]
    }),
    __metadata("design:paramtypes", [NgZone,
        ElementRef,
        GridsterService,
        GridsterPrototypeService])
], GridsterComponent);
export { GridsterComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZHN0ZXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhcjJncmlkc3Rlci8iLCJzb3VyY2VzIjpbImxpYi9ncmlkc3Rlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFDSCxTQUFTLEVBQ1QsTUFBTSxFQUNOLGdCQUFnQixFQUNoQixTQUFTLEVBQ1QsVUFBVSxFQUNWLFNBQVMsRUFDVCxNQUFNLEVBQ04sS0FBSyxFQUNMLE1BQU0sRUFDTixZQUFZLEVBQ1osdUJBQXVCLEVBQ3ZCLFdBQVcsRUFDWCxpQkFBaUIsRUFDcEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUVILFlBQVksRUFDWixTQUFTLEVBRVosTUFBTSxNQUFNLENBQUM7QUFDZCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUUvRCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUdyRCxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxpREFBaUQsQ0FBQztBQUczRixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFxRHBELElBQWEsaUJBQWlCLEdBQTlCLE1BQWEsaUJBQWlCO0lBeUIxQixZQUNZLElBQVksRUFDcEIsVUFBc0IsRUFDdEIsUUFBeUIsRUFDakIsaUJBQTJDO1FBSDNDLFNBQUksR0FBSixJQUFJLENBQVE7UUFHWixzQkFBaUIsR0FBakIsaUJBQWlCLENBQTBCO1FBM0J0QyxrQkFBYSxHQUFHLElBQUksWUFBWSxFQUFPLENBQUM7UUFDeEMsVUFBSyxHQUFHLElBQUksWUFBWSxFQUFPLENBQUM7UUFDaEMsV0FBTSxHQUFHLElBQUksWUFBWSxFQUFPLENBQUM7UUFDakMsa0JBQWEsR0FBRyxJQUFJLFlBQVksRUFBd0IsQ0FBQztRQUN6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QywwQkFBMEIsQ0FBQzs7cURBQW9CO0FBQ25CO0lBQXhDLFdBQVcsQ0FBQywwQkFBMEIsQ0FBQzs7cURBQW9CO0FBRXRCO0lBQXJDLFdBQVcsQ0FBQyx1QkFBdUIsQ0FBQzs7a0RBQXdCO0FBaEJwRCxpQkFBaUI7SUFuRDdCLFNBQVMsQ0FBQztRQUNQLFFBQVEsRUFBRSxjQUFjO1FBQ3hCLFFBQVEsRUFBRTs7Ozs7O1dBTUg7UUF1Q1AsU0FBUyxFQUFFLENBQUMsZUFBZSxDQUFDO1FBQzVCLGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNO1FBQy9DLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO2lCQXZDakM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztLQW9DSDtLQUlKLENBQUM7cUNBMkJvQixNQUFNO1FBQ1IsVUFBVTtRQUNaLGVBQWU7UUFDRSx3QkFBd0I7R0E3QjlDLGlCQUFpQixDQTJYN0I7U0EzWFksaUJBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBDb21wb25lbnQsXG4gICAgT25Jbml0LFxuICAgIEFmdGVyQ29udGVudEluaXQsXG4gICAgT25EZXN0cm95LFxuICAgIEVsZW1lbnRSZWYsXG4gICAgVmlld0NoaWxkLFxuICAgIE5nWm9uZSxcbiAgICBJbnB1dCxcbiAgICBPdXRwdXQsXG4gICAgRXZlbnRFbWl0dGVyLFxuICAgIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICAgIEhvc3RCaW5kaW5nLFxuICAgIFZpZXdFbmNhcHN1bGF0aW9uXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtcbiAgICBPYnNlcnZhYmxlLFxuICAgIFN1YnNjcmlwdGlvbixcbiAgICBmcm9tRXZlbnQsXG4gICAgQ29ubmVjdGFibGVPYnNlcnZhYmxlXG59IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgZGVib3VuY2VUaW1lLCBmaWx0ZXIsIHB1Ymxpc2ggfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7IHV0aWxzIH0gZnJvbSAnLi91dGlscy91dGlscyc7XG5pbXBvcnQgeyBHcmlkc3RlclNlcnZpY2UgfSBmcm9tICcuL2dyaWRzdGVyLnNlcnZpY2UnO1xuaW1wb3J0IHsgSUdyaWRzdGVyT3B0aW9ucyB9IGZyb20gJy4vSUdyaWRzdGVyT3B0aW9ucyc7XG5pbXBvcnQgeyBJR3JpZHN0ZXJEcmFnZ2FibGVPcHRpb25zIH0gZnJvbSAnLi9JR3JpZHN0ZXJEcmFnZ2FibGVPcHRpb25zJztcbmltcG9ydCB7IEdyaWRzdGVyUHJvdG90eXBlU2VydmljZSB9IGZyb20gJy4vZ3JpZHN0ZXItcHJvdG90eXBlL2dyaWRzdGVyLXByb3RvdHlwZS5zZXJ2aWNlJztcbmltcG9ydCB7IEdyaWRzdGVySXRlbVByb3RvdHlwZURpcmVjdGl2ZSB9IGZyb20gJy4vZ3JpZHN0ZXItcHJvdG90eXBlL2dyaWRzdGVyLWl0ZW0tcHJvdG90eXBlLmRpcmVjdGl2ZSc7XG5pbXBvcnQgeyBHcmlkTGlzdEl0ZW0gfSBmcm9tICcuL2dyaWRMaXN0L0dyaWRMaXN0SXRlbSc7XG5pbXBvcnQgeyBHcmlkc3Rlck9wdGlvbnMgfSBmcm9tICcuL0dyaWRzdGVyT3B0aW9ucyc7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnbmd4LWdyaWRzdGVyJyxcbiAgICB0ZW1wbGF0ZTogYDxkaXYgY2xhc3M9XCJncmlkc3Rlci1jb250YWluZXJcIj5cbiAgICAgIDxjYW52YXMgY2xhc3M9XCJncmlkc3Rlci1iYWNrZ3JvdW5kLWdyaWRcIiAjYmFja2dyb3VuZEdyaWQ+PC9jYW52YXM+XG4gICAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XG4gICAgICA8ZGl2IGNsYXNzPVwicG9zaXRpb24taGlnaGxpZ2h0XCIgc3R5bGU9XCJkaXNwbGF5Om5vbmU7XCIgI3Bvc2l0aW9uSGlnaGxpZ2h0PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiaW5uZXJcIj48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PmAsXG4gICAgc3R5bGVzOiBbXG4gICAgICAgIGBcbiAgICAgICAgICAgIG5neC1ncmlkc3RlciB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICAgICAgICAgIGxlZnQ6IDA7XG4gICAgICAgICAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG5neC1ncmlkc3Rlci5ncmlkc3Rlci0tZHJhZ2dpbmcge1xuICAgICAgICAgICAgICAgIC1tb3otdXNlci1zZWxlY3Q6IG5vbmU7XG4gICAgICAgICAgICAgICAgLWtodG1sLXVzZXItc2VsZWN0OiBub25lO1xuICAgICAgICAgICAgICAgIC13ZWJraXQtdXNlci1zZWxlY3Q6IG5vbmU7XG4gICAgICAgICAgICAgICAgLW1zLXVzZXItc2VsZWN0OiBub25lO1xuICAgICAgICAgICAgICAgIHVzZXItc2VsZWN0OiBub25lO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBuZ3gtZ3JpZHN0ZXIgLmdyaWRzdGVyLWNvbnRhaW5lciB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICAgICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICAgICAgICAgIGxpc3Qtc3R5bGU6IG5vbmU7XG4gICAgICAgICAgICAgICAgLXdlYmtpdC10cmFuc2l0aW9uOiB3aWR0aCAwLjJzLCBoZWlnaHQgMC4ycztcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiB3aWR0aCAwLjJzLCBoZWlnaHQgMC4ycztcbiAgICAgICAgICAgIH1cblxuICAgIG5neC1ncmlkc3RlciAucG9zaXRpb24taGlnaGxpZ2h0IHtcbiAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgei1pbmRleDogMTtcbiAgICB9XG5cbiAgICBuZ3gtZ3JpZHN0ZXIgLmdyaWRzdGVyLWJhY2tncm91bmQtZ3JpZCB7XG4gICAgICAgIHotaW5kZXg6IDA7XG4gICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgIGhlaWdodDogMTAwJVxuICAgIH1cbiAgICBgXSxcbiAgICBwcm92aWRlcnM6IFtHcmlkc3RlclNlcnZpY2VdLFxuICAgIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmVcbn0pXG5leHBvcnQgY2xhc3MgR3JpZHN0ZXJDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIEFmdGVyQ29udGVudEluaXQsIE9uRGVzdHJveSB7XG4gICAgQElucHV0KCkgcHVibGljIG9wdGlvbnM6IElHcmlkc3Rlck9wdGlvbnM7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBvcHRpb25zQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByZWFkeSA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcmVmbG93ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBwcm90b3R5cGVEcm9wID0gbmV3IEV2ZW50RW1pdHRlcjx7aXRlbTogR3JpZExpc3RJdGVtfT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHByb3RvdHlwZUVudGVyID0gbmV3IEV2ZW50RW1pdHRlcjx7aXRlbTogR3JpZExpc3RJdGVtfT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHByb3RvdHlwZU91dCA9IG5ldyBFdmVudEVtaXR0ZXI8e2l0ZW06IEdyaWRMaXN0SXRlbX0+KCk7XG4gICAgQElucHV0KCkgcHVibGljIGRyYWdnYWJsZU9wdGlvbnM6IElHcmlkc3RlckRyYWdnYWJsZU9wdGlvbnM7XG4gICAgQElucHV0KCkgcHVibGljIHBhcmVudDogR3JpZHN0ZXJDb21wb25lbnQ7XG5cbiAgICBAVmlld0NoaWxkKCdwb3NpdGlvbkhpZ2hsaWdodCcsIHsgc3RhdGljOiB0cnVlIH0pICRwb3NpdGlvbkhpZ2hsaWdodDtcbiAgICBAVmlld0NoaWxkKCdiYWNrZ3JvdW5kR3JpZCcpIHB1YmxpYyAkYmFja2dyb3VuZEdyaWQ6IGFueTtcbiAgICBASG9zdEJpbmRpbmcoJ2NsYXNzLmdyaWRzdGVyLS1kcmFnZ2luZycpIGlzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICBASG9zdEJpbmRpbmcoJ2NsYXNzLmdyaWRzdGVyLS1yZXNpemluZycpIGlzUmVzaXppbmcgPSBmYWxzZTtcblxuICAgIEBIb3N0QmluZGluZygnY2xhc3MuZ3JpZHN0ZXItLXJlYWR5JykgcHVibGljIGlzUmVhZHkgPSBmYWxzZTtcbiAgICBwdWJsaWMgZ3JpZHN0ZXI6IEdyaWRzdGVyU2VydmljZTtcbiAgICBwdWJsaWMgJGVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuXG4gICAgcHVibGljIGdyaWRzdGVyT3B0aW9uczogR3JpZHN0ZXJPcHRpb25zO1xuICAgIHB1YmxpYyBpc1Byb3RvdHlwZUVudGVyZWQgPSBmYWxzZTtcbiAgICBwcml2YXRlIGlzRGlzYWJsZWQgPSBmYWxzZTtcbiAgICBwcml2YXRlIHN1YnNjcmlwdGlvbiA9IG5ldyBTdWJzY3JpcHRpb24oKTtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIHpvbmU6IE5nWm9uZSxcbiAgICAgICAgZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgICAgICAgZ3JpZHN0ZXI6IEdyaWRzdGVyU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBncmlkc3RlclByb3RvdHlwZTogR3JpZHN0ZXJQcm90b3R5cGVTZXJ2aWNlXG4gICAgKSB7XG4gICAgICAgIHRoaXMuZ3JpZHN0ZXIgPSBncmlkc3RlcjtcbiAgICAgICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcbiAgICB9XG5cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgdGhpcy5ncmlkc3Rlck9wdGlvbnMgPSBuZXcgR3JpZHN0ZXJPcHRpb25zKHRoaXMub3B0aW9ucywgdGhpcy4kZWxlbWVudCk7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy51c2VDU1NUcmFuc2Zvcm1zKSB7XG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2Nzcy10cmFuc2Zvcm0nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc3Vic2NyaXB0aW9uLmFkZChcbiAgICAgICAgICAgIHRoaXMuZ3JpZHN0ZXJPcHRpb25zLmNoYW5nZS5zdWJzY3JpYmUob3B0aW9ucyA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5ncmlkc3Rlci5vcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ncmlkc3Rlci5ncmlkTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdyaWRzdGVyLmdyaWRMaXN0Lm9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMub3B0aW9uc0NoYW5nZS5lbWl0KG9wdGlvbnMpKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5ncmlkc3Rlci5pbml0KHRoaXMpO1xuXG4gICAgICAgIHRoaXMuc3Vic2NyaXB0aW9uLmFkZChcbiAgICAgICAgICAgIGZyb21FdmVudCh3aW5kb3csICdyZXNpemUnKVxuICAgICAgICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgICAgICAgICBkZWJvdW5jZVRpbWUodGhpcy5ncmlkc3Rlci5vcHRpb25zLnJlc3BvbnNpdmVEZWJvdW5jZSB8fCAwKSxcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyKCgpID0+IHRoaXMuZ3JpZHN0ZXIub3B0aW9ucy5yZXNwb25zaXZlVmlldylcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgLnN1YnNjcmliZSgoKSA9PiB0aGlzLnJlbG9hZCgpKVxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMuem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbi5hZGQoXG4gICAgICAgICAgICAgICAgZnJvbUV2ZW50KGRvY3VtZW50LCAnc2Nyb2xsJywgeyBwYXNzaXZlOiB0cnVlIH0pLnN1YnNjcmliZSgoKSA9PlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUdyaWRzdGVyRWxlbWVudERhdGEoKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjb25zdCBzY3JvbGxhYmxlQ29udGFpbmVyID0gdXRpbHMuZ2V0U2Nyb2xsYWJsZUNvbnRhaW5lcih0aGlzLiRlbGVtZW50KTtcbiAgICAgICAgICAgIGlmIChzY3JvbGxhYmxlQ29udGFpbmVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdWJzY3JpcHRpb24uYWRkKFxuICAgICAgICAgICAgICAgICAgICBmcm9tRXZlbnQoc2Nyb2xsYWJsZUNvbnRhaW5lciwgJ3Njcm9sbCcsIHsgcGFzc2l2ZTogdHJ1ZSB9KVxuICAgICAgICAgICAgICAgICAgICAuc3Vic2NyaWJlKCgpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUdyaWRzdGVyRWxlbWVudERhdGEoKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHNjcm9sbGFibGVDb250YWluZXIgPSB1dGlscy5nZXRTY3JvbGxhYmxlQ29udGFpbmVyKHRoaXMuJGVsZW1lbnQpO1xuICAgICAgICBpZiAoc2Nyb2xsYWJsZUNvbnRhaW5lcikge1xuICAgICAgICAgICAgdGhpcy5zdWJzY3JpcHRpb24uYWRkKFxuICAgICAgICAgICAgICAgIGZyb21FdmVudChzY3JvbGxhYmxlQ29udGFpbmVyLCAnc2Nyb2xsJywgeyBwYXNzaXZlOiB0cnVlIH0pXG4gICAgICAgICAgICAgICAgLnN1YnNjcmliZSgoKSA9PlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUdyaWRzdGVyRWxlbWVudERhdGEoKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgICAgIHRoaXMuZ3JpZHN0ZXIuc3RhcnQoKTtcblxuICAgICAgICB0aGlzLnVwZGF0ZUdyaWRzdGVyRWxlbWVudERhdGEoKTtcblxuICAgICAgICB0aGlzLmNvbm5lY3RHcmlkc3RlclByb3RvdHlwZSgpO1xuXG4gICAgICAgIHRoaXMuZ3JpZHN0ZXIuJHBvc2l0aW9uSGlnaGxpZ2h0ID0gdGhpcy4kcG9zaXRpb25IaWdobGlnaHQubmF0aXZlRWxlbWVudDtcbiAgICB9XG5cbiAgICBuZ09uRGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGFuZ2UgZ3JpZHN0ZXIgY29uZmlnIG9wdGlvbiBhbmQgcmVidWlsZFxuICAgICAqIEBwYXJhbSBzdHJpbmcgbmFtZVxuICAgICAqIEBwYXJhbSBhbnkgdmFsdWVcbiAgICAgKiBAcmV0dXJuIEdyaWRzdGVyQ29tcG9uZW50XG4gICAgICovXG4gICAgc2V0T3B0aW9uKG5hbWU6IGtleW9mIElHcmlkc3Rlck9wdGlvbnMsIHZhbHVlOiBhbnkpIHtcbiAgICAgICAgaWYgKG5hbWUgPT09ICdkcmFnQW5kRHJvcCcpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZW5hYmxlRHJhZ2dhYmxlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzYWJsZURyYWdnYWJsZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChuYW1lID09PSAncmVzaXphYmxlJykge1xuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbmFibGVSZXNpemFibGUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNhYmxlUmVzaXphYmxlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5hbWUgPT09ICdsYW5lcycpIHtcbiAgICAgICAgICAgIHRoaXMuZ3JpZHN0ZXIub3B0aW9ucy5sYW5lcyA9IHZhbHVlO1xuXG4gICAgICAgICAgICB0aGlzLmdyaWRzdGVyLmdyaWRMaXN0LmZpeEl0ZW1zUG9zaXRpb25zKHRoaXMuZ3JpZHN0ZXIub3B0aW9ucyk7XG4gICAgICAgICAgICB0aGlzLnJlZmxvd0dyaWRzdGVyKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5hbWUgPT09ICdkaXJlY3Rpb24nKSB7XG4gICAgICAgICAgICB0aGlzLmdyaWRzdGVyLm9wdGlvbnMuZGlyZWN0aW9uID0gdmFsdWU7XG4gICAgICAgICAgICB0aGlzLmdyaWRzdGVyLmdyaWRMaXN0LnB1bGxJdGVtc1RvTGVmdCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuYW1lID09PSAnd2lkdGhIZWlnaHRSYXRpbycpIHtcbiAgICAgICAgICAgIHRoaXMuZ3JpZHN0ZXIub3B0aW9ucy53aWR0aEhlaWdodFJhdGlvID0gcGFyc2VGbG9hdCh2YWx1ZSB8fCAxKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobmFtZSA9PT0gJ3Jlc3BvbnNpdmVWaWV3Jykge1xuICAgICAgICAgICAgdGhpcy5ncmlkc3Rlci5vcHRpb25zLnJlc3BvbnNpdmVWaWV3ID0gISF2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdyaWRzdGVyLmdyaWRMaXN0LnNldE9wdGlvbihuYW1lLCB2YWx1ZSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcmVsb2FkKCkge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZ3JpZHN0ZXIuZml4SXRlbXNQb3NpdGlvbnMoKTtcbiAgICAgICAgICAgIHRoaXMucmVmbG93R3JpZHN0ZXIoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcmVmbG93R3JpZHN0ZXIoaXNJbml0ID0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy5ncmlkc3Rlci5yZWZsb3coKTtcbiAgICAgICAgdGhpcy5yZWZsb3cuZW1pdCh7XG4gICAgICAgICAgICBpc0luaXQ6IGlzSW5pdCxcbiAgICAgICAgICAgIGdyaWRzdGVyQ29tcG9uZW50OiB0aGlzXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHVwZGF0ZUdyaWRzdGVyRWxlbWVudERhdGEoKSB7XG4gICAgICAgIHRoaXMuZ3JpZHN0ZXIuZ3JpZHN0ZXJTY3JvbGxEYXRhID0gdGhpcy5nZXRTY3JvbGxQb3NpdGlvbkZyb21QYXJlbnRzKFxuICAgICAgICAgICAgdGhpcy4kZWxlbWVudFxuICAgICAgICApO1xuICAgICAgICB0aGlzLmdyaWRzdGVyLmdyaWRzdGVyUmVjdCA9IHRoaXMuJGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgfVxuXG4gICAgc2V0UmVhZHkoKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gKHRoaXMuaXNSZWFkeSA9IHRydWUpKTtcbiAgICAgICAgdGhpcy5yZWFkeS5lbWl0KCk7XG4gICAgfVxuXG4gICAgYWRqdXN0SXRlbXNIZWlnaHRUb0NvbnRlbnQoXG4gICAgICAgIHNjcm9sbGFibGVJdGVtRWxlbWVudFNlbGVjdG9yOiBzdHJpbmcgPSAnLmdyaWRzdGVyLWl0ZW0taW5uZXInXG4gICAgKSB7XG4gICAgICAgIHRoaXMuZ3JpZHN0ZXIuaXRlbXNcbiAgICAgICAgICAgIC8vIGNvbnZlcnQgZWFjaCBpdGVtIHRvIG9iamVjdCB3aXRoIGluZm9ybWF0aW9uIGFib3V0IGNvbnRlbnQgaGVpZ2h0IGFuZCBzY3JvbGwgaGVpZ2h0XG4gICAgICAgICAgICAubWFwKChpdGVtOiBHcmlkTGlzdEl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBzY3JvbGxFbCA9IGl0ZW0uJGVsZW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsYWJsZUl0ZW1FbGVtZW50U2VsZWN0b3JcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnRFbCA9IHNjcm9sbEVsLmxhc3RFbGVtZW50Q2hpbGQ7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2Nyb2xsRWxEaXN0YW5jZSA9IHV0aWxzLmdldFJlbGF0aXZlQ29vcmRpbmF0ZXMoXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbEVsLFxuICAgICAgICAgICAgICAgICAgICBpdGVtLiRlbGVtZW50XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBjb25zdCBzY3JvbGxFbFJlY3QgPSBzY3JvbGxFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50UmVjdCA9IGNvbnRlbnRFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0sXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnRIZWlnaHQ6IGNvbnRlbnRSZWN0LmJvdHRvbSAtIHNjcm9sbEVsUmVjdC50b3AsXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbEVsRGlzdGFuY2VcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC8vIGNhbGN1bGF0ZSByZXF1aXJlZCBoZWlnaHQgaW4gbGFuZXMgYW1vdW50IGFuZCB1cGRhdGUgaXRlbSBcImhcIlxuICAgICAgICAgICAgLmZvckVhY2goZGF0YSA9PiB7XG4gICAgICAgICAgICAgICAgZGF0YS5pdGVtLmggPSBNYXRoLmNlaWwoPGFueT4oXG4gICAgICAgICAgICAgICAgICAgIChkYXRhLmNvbnRlbnRIZWlnaHQgL1xuICAgICAgICAgICAgICAgICAgICAgICAgKHRoaXMuZ3JpZHN0ZXIuY2VsbEhlaWdodCAtIGRhdGEuc2Nyb2xsRWxEaXN0YW5jZS50b3ApKVxuICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5ncmlkc3Rlci5maXhJdGVtc1Bvc2l0aW9ucygpO1xuICAgICAgICB0aGlzLmdyaWRzdGVyLnJlZmxvdygpO1xuICAgIH1cblxuICAgIGRpc2FibGUoaXRlbTogYW55KSB7XG4gICAgICAgIGNvbnN0IGl0ZW1JZHggPSB0aGlzLmdyaWRzdGVyLml0ZW1zLmluZGV4T2YoaXRlbS5pdGVtQ29tcG9uZW50KTtcblxuICAgICAgICB0aGlzLmlzRGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICBpZiAoaXRlbUlkeCA+PSAwKSB7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5ncmlkc3Rlci5pdGVtc1tcbiAgICAgICAgICAgICAgICB0aGlzLmdyaWRzdGVyLml0ZW1zLmluZGV4T2YoaXRlbS5pdGVtQ29tcG9uZW50KVxuICAgICAgICAgICAgXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdyaWRzdGVyLm9uRHJhZ091dChpdGVtKTtcbiAgICB9XG5cbiAgICBlbmFibGUoKSB7XG4gICAgICAgIHRoaXMuaXNEaXNhYmxlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0U2Nyb2xsUG9zaXRpb25Gcm9tUGFyZW50cyhcbiAgICAgICAgZWxlbWVudDogRWxlbWVudCxcbiAgICAgICAgZGF0YSA9IHsgc2Nyb2xsVG9wOiAwLCBzY3JvbGxMZWZ0OiAwIH1cbiAgICApOiB7IHNjcm9sbFRvcDogbnVtYmVyOyBzY3JvbGxMZWZ0OiBudW1iZXIgfSB7XG4gICAgICAgIGlmIChlbGVtZW50LnBhcmVudEVsZW1lbnQgJiYgZWxlbWVudC5wYXJlbnRFbGVtZW50ICE9PSBkb2N1bWVudC5ib2R5KSB7XG4gICAgICAgICAgICBkYXRhLnNjcm9sbFRvcCArPSBlbGVtZW50LnBhcmVudEVsZW1lbnQuc2Nyb2xsVG9wO1xuICAgICAgICAgICAgZGF0YS5zY3JvbGxMZWZ0ICs9IGVsZW1lbnQucGFyZW50RWxlbWVudC5zY3JvbGxMZWZ0O1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRTY3JvbGxQb3NpdGlvbkZyb21QYXJlbnRzKFxuICAgICAgICAgICAgICAgIGVsZW1lbnQucGFyZW50RWxlbWVudCxcbiAgICAgICAgICAgICAgICBkYXRhXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNjcm9sbFRvcDogZGF0YS5zY3JvbGxUb3AsXG4gICAgICAgICAgICBzY3JvbGxMZWZ0OiBkYXRhLnNjcm9sbExlZnRcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb25uZWN0IGdyaWRzdGVyIHByb3RvdHlwZSBpdGVtIHRvIGdyaWRzdGVyIGRyYWdnaW5nIGhvb2tzIChvblN0YXJ0LCBvbkRyYWcsIG9uU3RvcCkuXG4gICAgICovXG4gICAgcHJpdmF0ZSBjb25uZWN0R3JpZHN0ZXJQcm90b3R5cGUoKSB7XG4gICAgICAgIHRoaXMuZ3JpZHN0ZXJQcm90b3R5cGUub2JzZXJ2ZURyb3BPdXQodGhpcy5ncmlkc3Rlcikuc3Vic2NyaWJlKCk7XG5cbiAgICAgICAgY29uc3QgZHJvcE92ZXJPYnNlcnZhYmxlID0gPENvbm5lY3RhYmxlT2JzZXJ2YWJsZTxhbnk+PihcbiAgICAgICAgICAgIHRoaXMuZ3JpZHN0ZXJQcm90b3R5cGVcbiAgICAgICAgICAgICAgICAub2JzZXJ2ZURyb3BPdmVyKHRoaXMuZ3JpZHN0ZXIpXG4gICAgICAgICAgICAgICAgLnBpcGUocHVibGlzaCgpKVxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IGRyYWdPYnNlcnZhYmxlID0gdGhpcy5ncmlkc3RlclByb3RvdHlwZS5vYnNlcnZlRHJhZ092ZXIoXG4gICAgICAgICAgICB0aGlzLmdyaWRzdGVyXG4gICAgICAgICk7XG5cbiAgICAgICAgZHJhZ09ic2VydmFibGUuZHJhZ092ZXJcbiAgICAgICAgICAgIC5waXBlKGZpbHRlcigoKSA9PiAhdGhpcy5pc0Rpc2FibGVkKSlcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoKHByb3RvdHlwZTogR3JpZHN0ZXJJdGVtUHJvdG90eXBlRGlyZWN0aXZlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmlzUHJvdG90eXBlRW50ZXJlZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuZ3JpZHN0ZXIub25EcmFnKHByb3RvdHlwZS5pdGVtKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGRyYWdPYnNlcnZhYmxlLmRyYWdFbnRlclxuICAgICAgICAgICAgLnBpcGUoZmlsdGVyKCgpID0+ICF0aGlzLmlzRGlzYWJsZWQpKVxuICAgICAgICAgICAgLnN1YnNjcmliZSgocHJvdG90eXBlOiBHcmlkc3Rlckl0ZW1Qcm90b3R5cGVEaXJlY3RpdmUpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmlzUHJvdG90eXBlRW50ZXJlZCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ncmlkc3Rlci5pdGVtcy5pbmRleE9mKHByb3RvdHlwZS5pdGVtKSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ncmlkc3Rlci5pdGVtcy5wdXNoKHByb3RvdHlwZS5pdGVtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5ncmlkc3Rlci5vblN0YXJ0KHByb3RvdHlwZS5pdGVtKTtcbiAgICAgICAgICAgICAgICBwcm90b3R5cGUuc2V0RHJhZ0NvbnRleHRHcmlkc3Rlcih0aGlzLmdyaWRzdGVyKTtcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5kaXNhYmxlKHByb3RvdHlwZS5pdGVtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5wcm90b3R5cGVFbnRlci5lbWl0KHsgaXRlbTogcHJvdG90eXBlLml0ZW0gfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBkcmFnT2JzZXJ2YWJsZS5kcmFnT3V0XG4gICAgICAgICAgICAucGlwZShmaWx0ZXIoKCkgPT4gIXRoaXMuaXNEaXNhYmxlZCkpXG4gICAgICAgICAgICAuc3Vic2NyaWJlKChwcm90b3R5cGU6IEdyaWRzdGVySXRlbVByb3RvdHlwZURpcmVjdGl2ZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5pc1Byb3RvdHlwZUVudGVyZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmdyaWRzdGVyLm9uRHJhZ091dChwcm90b3R5cGUuaXRlbSk7XG4gICAgICAgICAgICAgICAgdGhpcy5pc1Byb3RvdHlwZUVudGVyZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgIHRoaXMucHJvdG90eXBlT3V0LmVtaXQoeyBpdGVtOiBwcm90b3R5cGUuaXRlbSB9KTtcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbmFibGUoKTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5pc1Byb3RvdHlwZUVudGVyZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5ncmlkc3Rlci5pdGVtcy5pbmRleE9mKHByb3RvdHlwZS5pdGVtKSA8IDBcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5ncmlkc3Rlci5pdGVtcy5wdXNoKHByb3RvdHlwZS5pdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5ncmlkc3Rlci5vblN0YXJ0KHByb3RvdHlwZS5pdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvdG90eXBlLnNldERyYWdDb250ZXh0R3JpZHN0ZXIodGhpcy5wYXJlbnQuZ3JpZHN0ZXIpO1xuICAgICAgICAgICAgICAgICAgICAvLyB0aW1lb3V0IGlzIG5lZWRlZCB0byBiZSBzdXJlIHRoYXQgXCJlbnRlclwiIGV2ZW50IGlzIGZpcmVkIGFmdGVyIFwib3V0XCJcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5wcm90b3R5cGVFbnRlci5lbWl0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtOiBwcm90b3R5cGUuaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm90b3R5cGUub25FbnRlcih0aGlzLnBhcmVudC5ncmlkc3Rlcik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGRyb3BPdmVyT2JzZXJ2YWJsZVxuICAgICAgICAgICAgLnBpcGUoZmlsdGVyKCgpID0+ICF0aGlzLmlzRGlzYWJsZWQpKVxuICAgICAgICAgICAgLnN1YnNjcmliZSgoZGF0YTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmlzUHJvdG90eXBlRW50ZXJlZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5ncmlkc3Rlci5vblN0b3AoZGF0YS5pdGVtLml0ZW0pO1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JpZHN0ZXIucmVtb3ZlSXRlbShkYXRhLml0ZW0uaXRlbSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmlzUHJvdG90eXBlRW50ZXJlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbmFibGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5wcm90b3R5cGVEcm9wLmVtaXQoeyBpdGVtOiBkYXRhLml0ZW0uaXRlbSB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGRyb3BPdmVyT2JzZXJ2YWJsZS5jb25uZWN0KCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBlbmFibGVEcmFnZ2FibGUoKSB7XG4gICAgICAgIHRoaXMuZ3JpZHN0ZXIub3B0aW9ucy5kcmFnQW5kRHJvcCA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5ncmlkc3Rlci5pdGVtc1xuICAgICAgICAgICAgLmZpbHRlcihcbiAgICAgICAgICAgICAgICBpdGVtID0+IGl0ZW0uaXRlbUNvbXBvbmVudCAmJiBpdGVtLml0ZW1Db21wb25lbnQuZHJhZ0FuZERyb3BcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5mb3JFYWNoKChpdGVtOiBHcmlkTGlzdEl0ZW0pID0+XG4gICAgICAgICAgICAgICAgaXRlbS5pdGVtQ29tcG9uZW50LmVuYWJsZURyYWdEcm9wKClcbiAgICAgICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkaXNhYmxlRHJhZ2dhYmxlKCkge1xuICAgICAgICB0aGlzLmdyaWRzdGVyLm9wdGlvbnMuZHJhZ0FuZERyb3AgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLmdyaWRzdGVyLml0ZW1zXG4gICAgICAgICAgICAuZmlsdGVyKGl0ZW0gPT4gaXRlbS5pdGVtQ29tcG9uZW50KVxuICAgICAgICAgICAgLmZvckVhY2goKGl0ZW06IEdyaWRMaXN0SXRlbSkgPT5cbiAgICAgICAgICAgICAgICBpdGVtLml0ZW1Db21wb25lbnQuZGlzYWJsZURyYWdnYWJsZSgpXG4gICAgICAgICAgICApO1xuICAgIH1cblxuICAgIHByaXZhdGUgZW5hYmxlUmVzaXphYmxlKCkge1xuICAgICAgICB0aGlzLmdyaWRzdGVyLm9wdGlvbnMucmVzaXphYmxlID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLmdyaWRzdGVyLml0ZW1zXG4gICAgICAgICAgICAuZmlsdGVyKGl0ZW0gPT4gaXRlbS5pdGVtQ29tcG9uZW50ICYmIGl0ZW0uaXRlbUNvbXBvbmVudC5yZXNpemFibGUpXG4gICAgICAgICAgICAuZm9yRWFjaCgoaXRlbTogR3JpZExpc3RJdGVtKSA9PlxuICAgICAgICAgICAgICAgIGl0ZW0uaXRlbUNvbXBvbmVudC5lbmFibGVSZXNpemFibGUoKVxuICAgICAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRpc2FibGVSZXNpemFibGUoKSB7XG4gICAgICAgIHRoaXMuZ3JpZHN0ZXIub3B0aW9ucy5yZXNpemFibGUgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLmdyaWRzdGVyLml0ZW1zLmZvckVhY2goKGl0ZW06IEdyaWRMaXN0SXRlbSkgPT5cbiAgICAgICAgICAgIGl0ZW0uaXRlbUNvbXBvbmVudC5kaXNhYmxlUmVzaXphYmxlKClcbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=