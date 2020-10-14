import { __decorate, __metadata } from "tslib";
import { Directive, ElementRef, Input, Output, EventEmitter, OnInit, OnDestroy, NgZone } from '@angular/core';
import { fromEvent } from 'rxjs';
import { GridsterPrototypeService } from './gridster-prototype.service';
import { GridListItem } from '../gridList/GridListItem';
import { Draggable } from '../utils/draggable';
import { utils } from '../utils/utils';
let GridsterItemPrototypeDirective = class GridsterItemPrototypeDirective {
    constructor(zone, elementRef, gridsterPrototype) {
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
    // must be set to true because of item dragAndDrop configuration
    get dragAndDrop() {
        return true;
    }
    get gridster() {
        return this.dragContextGridster;
    }
    ngOnInit() {
        this.wSm = this.wSm || this.w;
        this.hSm = this.hSm || this.h;
        this.wMd = this.wMd || this.w;
        this.hMd = this.hMd || this.h;
        this.wLg = this.wLg || this.w;
        this.hLg = this.hLg || this.h;
        this.wXl = this.wXl || this.w;
        this.hXl = this.hXl || this.h;
        this.zone.runOutsideAngular(() => {
            this.enableDragDrop();
        });
    }
    ngOnDestroy() {
        this.subscribtions.forEach((sub) => {
            sub.unsubscribe();
        });
    }
    onDrop(gridster) {
        if (!this.config.helper) {
            this.$element.parentNode.removeChild(this.$element);
        }
        this.drop.emit({
            item: this.item,
            gridster: gridster
        });
    }
    onCancel() {
        this.cancel.emit({ item: this.item });
    }
    onEnter(gridster) {
        this.enter.emit({
            item: this.item,
            gridster: gridster
        });
    }
    onOver(gridster) { }
    onOut(gridster) {
        this.out.emit({
            item: this.item,
            gridster: gridster
        });
    }
    getPositionToGridster(gridster) {
        const relativeContainerCoords = this.getContainerCoordsToGridster(gridster);
        return {
            y: this.positionY - relativeContainerCoords.top,
            x: this.positionX - relativeContainerCoords.left
        };
    }
    setDragContextGridster(gridster) {
        this.dragContextGridster = gridster;
    }
    getContainerCoordsToGridster(gridster) {
        return {
            left: gridster.gridsterRect.left - this.parentRect.left,
            top: gridster.gridsterRect.top - this.parentRect.top
        };
    }
    enableDragDrop() {
        let cursorToElementPosition;
        const draggable = new Draggable(this.elementRef.nativeElement);
        const dragStartSub = draggable.dragStart
            .subscribe((event) => {
            this.zone.run(() => {
                this.$element = this.provideDragElement();
                this.containerRectange = this.$element.parentElement.getBoundingClientRect();
                this.updateParentElementData();
                this.onStart(event);
                cursorToElementPosition = event.getRelativeCoordinates(this.$element);
            });
        });
        const dragSub = draggable.dragMove
            .subscribe((event) => {
            this.setElementPosition(this.$element, {
                x: event.clientX - cursorToElementPosition.x - this.parentRect.left,
                y: event.clientY - cursorToElementPosition.y - this.parentRect.top
            });
            this.onDrag(event);
        });
        const dragStopSub = draggable.dragStop
            .subscribe((event) => {
            this.zone.run(() => {
                this.onStop(event);
                this.$element = null;
            });
        });
        const scrollSub = fromEvent(document, 'scroll')
            .subscribe(() => {
            if (this.$element) {
                this.updateParentElementData();
            }
        });
        this.subscribtions = this.subscribtions.concat([dragStartSub, dragSub, dragStopSub, scrollSub]);
    }
    setElementPosition(element, position) {
        this.positionX = position.x;
        this.positionY = position.y;
        utils.setCssElementPosition(element, position);
    }
    updateParentElementData() {
        this.parentRect = this.$element.parentElement.getBoundingClientRect();
        this.parentOffset = {
            left: this.$element.parentElement.offsetLeft,
            top: this.$element.parentElement.offsetTop
        };
    }
    onStart(event) {
        this.isDragging = true;
        this.$element.style.pointerEvents = 'none';
        this.$element.style.position = 'absolute';
        this.gridsterPrototype.dragItemStart(this, event);
        this.start.emit({ item: this.item });
    }
    onDrag(event) {
        this.gridsterPrototype.updatePrototypePosition(this, event);
    }
    onStop(event) {
        this.gridsterPrototype.dragItemStop(this, event);
        this.isDragging = false;
        this.$element.style.pointerEvents = 'auto';
        this.$element.style.position = '';
        utils.resetCSSElementPosition(this.$element);
        if (this.config.helper) {
            this.$element.parentNode.removeChild(this.$element);
        }
    }
    provideDragElement() {
        let dragElement = this.elementRef.nativeElement;
        if (this.config.helper) {
            dragElement = (dragElement).cloneNode(true);
            document.body.appendChild(this.fixStylesForBodyHelper(dragElement));
        }
        else {
            this.fixStylesForRelativeElement(dragElement);
        }
        return dragElement;
    }
    fixStylesForRelativeElement(el) {
        if (window.getComputedStyle(el).position === 'absolute') {
            return el;
        }
        const rect = this.elementRef.nativeElement.getBoundingClientRect();
        this.containerRectange = el.parentElement.getBoundingClientRect();
        el.style.position = 'absolute';
        this.setElementPosition(el, {
            x: rect.left - this.containerRectange.left,
            y: rect.top - this.containerRectange.top
        });
        return el;
    }
    /**
     * When element is cloned and append to body it should have position absolute and coords set by original
     * relative prototype element position.
     */
    fixStylesForBodyHelper(el) {
        const bodyRect = document.body.getBoundingClientRect();
        const rect = this.elementRef.nativeElement.getBoundingClientRect();
        el.style.position = 'absolute';
        this.setElementPosition(el, {
            x: rect.left - bodyRect.left,
            y: rect.top - bodyRect.top
        });
        return el;
    }
};
GridsterItemPrototypeDirective.ctorParameters = () => [
    { type: NgZone },
    { type: ElementRef },
    { type: GridsterPrototypeService }
];
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
export { GridsterItemPrototypeDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZHN0ZXItaXRlbS1wcm90b3R5cGUuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhcjJncmlkc3Rlci8iLCJzb3VyY2VzIjpbImxpYi9ncmlkc3Rlci1wcm90b3R5cGUvZ3JpZHN0ZXItaXRlbS1wcm90b3R5cGUuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUMxRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDakMsT0FBTyxFQUE0QixTQUFTLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFM0QsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDeEUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBR3hELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUMvQyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFLdkMsSUFBYSw4QkFBOEIsR0FBM0MsTUFBYSw4QkFBOEI7SUFnRXZDLFlBQW9CLElBQVksRUFDWixVQUFzQixFQUN0QixpQkFBMkM7UUFGM0MsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUNaLGVBQVUsR0FBVixVQUFVLENBQVk7UUFDdEIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUEwQjtRQWpFckQsU0FBSSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFDMUIsVUFBSyxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFDM0IsV0FBTSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFDNUIsVUFBSyxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFDM0IsUUFBRyxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFHMUIsV0FBTSxHQUFRLEVBQUUsQ0FBQztRQUVuQixNQUFD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QUFNLEVBQUU7OzZEQUE0QjtBQUMzQjtJQUFULE1BQU0sRUFBRTs7OERBQTZCO0FBQzVCO0lBQVQsTUFBTSxFQUFFOzs2REFBNEI7QUFDM0I7SUFBVCxNQUFNLEVBQUU7OzJEQUEwQjtBQUUxQjtJQUFSLEtBQUssRUFBRTs7NERBQVc7QUFDVjtJQUFSLEtBQUssRUFBRTs7OERBQWtCO0FBSWpCO0lBQVIsS0FBSyxFQUFFOzt5REFBVztBQUNWO0lBQVIsS0FBSyxFQUFFOzsyREFBYTtBQUNaO0lBQVIsS0FBSyxFQUFFOzsyREFBYTtBQUNaO0lBQVIsS0FBSyxFQUFFOzsyREFBYTtBQUNaO0lBQVIsS0FBSyxFQUFFOzsyREFBYTtBQUNaO0lBQVIsS0FBSyxFQUFFOzt5REFBVztBQUNWO0lBQVIsS0FBSyxFQUFFOzsyREFBYTtBQUNaO0lBQVIsS0FBSyxFQUFFOzsyREFBYTtBQUNaO0lBQVIsS0FBSyxFQUFFOzsyREFBYTtBQUNaO0lBQVIsS0FBSyxFQUFFOzsyREFBYTtBQUVaO0lBQVIsS0FBSyxFQUFFOztzRUFBaUM7QUFDaEM7SUFBUixLQUFLLEVBQUU7O2tGQUE2QztBQXhCNUMsOEJBQThCO0lBSDFDLFNBQVMsQ0FBQztRQUNQLFFBQVEsRUFBRSw0QkFBNEI7S0FDekMsQ0FBQztxQ0FpRTRCLE1BQU07UUFDQSxVQUFVO1FBQ0gsd0JBQXdCO0dBbEV0RCw4QkFBOEIsQ0FvUjFDO1NBcFJZLDhCQUE4QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgRWxlbWVudFJlZiwgSW5wdXQsIE91dHB1dCwgRXZlbnRFbWl0dGVyLCBPbkluaXQsIE9uRGVzdHJveSxcbiAgICBOZ1pvbmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgU3Vic2NyaXB0aW9uLCBmcm9tRXZlbnQgfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHsgR3JpZHN0ZXJQcm90b3R5cGVTZXJ2aWNlIH0gZnJvbSAnLi9ncmlkc3Rlci1wcm90b3R5cGUuc2VydmljZSc7XG5pbXBvcnQgeyBHcmlkTGlzdEl0ZW0gfSBmcm9tICcuLi9ncmlkTGlzdC9HcmlkTGlzdEl0ZW0nO1xuaW1wb3J0IHsgR3JpZHN0ZXJTZXJ2aWNlIH0gZnJvbSAnLi4vZ3JpZHN0ZXIuc2VydmljZSc7XG5pbXBvcnQgeyBEcmFnZ2FibGVFdmVudCB9IGZyb20gJy4uL3V0aWxzL0RyYWdnYWJsZUV2ZW50JztcbmltcG9ydCB7IERyYWdnYWJsZSB9IGZyb20gJy4uL3V0aWxzL2RyYWdnYWJsZSc7XG5pbXBvcnQgeyB1dGlscyB9IGZyb20gJy4uL3V0aWxzL3V0aWxzJztcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbbmd4R3JpZHN0ZXJJdGVtUHJvdG90eXBlXSdcbn0pXG5leHBvcnQgY2xhc3MgR3JpZHN0ZXJJdGVtUHJvdG90eXBlRGlyZWN0aXZlIGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICAgIEBPdXRwdXQoKSBkcm9wID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIEBPdXRwdXQoKSBzdGFydCA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICBAT3V0cHV0KCkgY2FuY2VsID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIEBPdXRwdXQoKSBlbnRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICBAT3V0cHV0KCkgb3V0ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gICAgQElucHV0KCkgZGF0YTogYW55O1xuICAgIEBJbnB1dCgpIGNvbmZpZzogYW55ID0ge307XG5cbiAgICBwdWJsaWMgeCA9IDA7XG4gICAgcHVibGljIHkgPSAwO1xuICAgIEBJbnB1dCgpIHc6IG51bWJlcjtcbiAgICBASW5wdXQoKSB3U206IG51bWJlcjtcbiAgICBASW5wdXQoKSB3TWQ6IG51bWJlcjtcbiAgICBASW5wdXQoKSB3TGc6IG51bWJlcjtcbiAgICBASW5wdXQoKSB3WGw6IG51bWJlcjtcbiAgICBASW5wdXQoKSBoOiBudW1iZXI7XG4gICAgQElucHV0KCkgaFNtOiBudW1iZXI7XG4gICAgQElucHV0KCkgaE1kOiBudW1iZXI7XG4gICAgQElucHV0KCkgaExnOiBudW1iZXI7XG4gICAgQElucHV0KCkgaFhsOiBudW1iZXI7XG5cbiAgICBASW5wdXQoKSB2YXJpYWJsZUhlaWdodDogYm9vbGVhbiA9IGZhbHNlO1xuICAgIEBJbnB1dCgpIHZhcmlhYmxlSGVpZ2h0Q29udGFpblRvUm93OiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBwb3NpdGlvblg6IG51bWJlcjtcbiAgICBwb3NpdGlvblk6IG51bWJlcjtcblxuICAgIGF1dG9TaXplID0gZmFsc2U7XG5cbiAgICAkZWxlbWVudDogSFRNTEVsZW1lbnQ7XG5cbiAgICAvKipcbiAgICAgKiBNb3VzZSBkcmFnIG9ic2VydmFibGVcbiAgICAgKi9cbiAgICBkcmFnOiBPYnNlcnZhYmxlPGFueT47XG5cbiAgICAvKipcbiAgICAgKiBTdWJzY3JpYnRpb24gZm9yIGRyYWcgb2JzZXJ2YWJsZVxuICAgICAqL1xuICAgIGRyYWdTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjtcblxuICAgIGlzRHJhZ2dpbmcgPSBmYWxzZTtcblxuICAgIGl0ZW06IEdyaWRMaXN0SXRlbTtcblxuICAgIGNvbnRhaW5lclJlY3RhbmdlOiBDbGllbnRSZWN0O1xuXG4gICAgcHJpdmF0ZSBkcmFnQ29udGV4dEdyaWRzdGVyOiBHcmlkc3RlclNlcnZpY2U7XG4gICAgcHJpdmF0ZSBwYXJlbnRSZWN0OiBDbGllbnRSZWN0O1xuICAgIHByaXZhdGUgcGFyZW50T2Zmc2V0OiB7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn07XG5cbiAgICBwcml2YXRlIHN1YnNjcmlidGlvbnM6IEFycmF5PFN1YnNjcmlwdGlvbj4gPSBbXTtcblxuICAgIC8vIG11c3QgYmUgc2V0IHRvIHRydWUgYmVjYXVzZSBvZiBpdGVtIGRyYWdBbmREcm9wIGNvbmZpZ3VyYXRpb25cbiAgICBnZXQgZHJhZ0FuZERyb3AoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGdldCBncmlkc3RlcigpOiBHcmlkc3RlclNlcnZpY2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5kcmFnQ29udGV4dEdyaWRzdGVyO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgem9uZTogTmdab25lLFxuICAgICAgICAgICAgICAgIHByaXZhdGUgZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgICAgICAgICAgICAgICBwcml2YXRlIGdyaWRzdGVyUHJvdG90eXBlOiBHcmlkc3RlclByb3RvdHlwZVNlcnZpY2UpIHtcblxuICAgICAgICB0aGlzLml0ZW0gPSAobmV3IEdyaWRMaXN0SXRlbSgpKS5zZXRGcm9tR3JpZHN0ZXJJdGVtUHJvdG90eXBlKHRoaXMpO1xuICAgIH1cblxuICAgIG5nT25Jbml0KCkge1xuICAgICAgICB0aGlzLndTbSA9IHRoaXMud1NtIHx8IHRoaXMudztcbiAgICAgICAgdGhpcy5oU20gPSB0aGlzLmhTbSB8fCB0aGlzLmg7XG4gICAgICAgIHRoaXMud01kID0gdGhpcy53TWQgfHwgdGhpcy53O1xuICAgICAgICB0aGlzLmhNZCA9IHRoaXMuaE1kIHx8IHRoaXMuaDtcbiAgICAgICAgdGhpcy53TGcgPSB0aGlzLndMZyB8fCB0aGlzLnc7XG4gICAgICAgIHRoaXMuaExnID0gdGhpcy5oTGcgfHwgdGhpcy5oO1xuICAgICAgICB0aGlzLndYbCA9IHRoaXMud1hsIHx8IHRoaXMudztcbiAgICAgICAgdGhpcy5oWGwgPSB0aGlzLmhYbCB8fCB0aGlzLmg7XG4gICAgICAgIHRoaXMuem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmVuYWJsZURyYWdEcm9wKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG5nT25EZXN0cm95KCkge1xuICAgICAgICB0aGlzLnN1YnNjcmlidGlvbnMuZm9yRWFjaCgoc3ViOiBTdWJzY3JpcHRpb24pID0+IHtcbiAgICAgICAgICAgIHN1Yi51bnN1YnNjcmliZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvbkRyb3AgKGdyaWRzdGVyOiBHcmlkc3RlclNlcnZpY2UpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLmNvbmZpZy5oZWxwZXIpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLiRlbGVtZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZHJvcC5lbWl0KHtcbiAgICAgICAgICAgIGl0ZW06IHRoaXMuaXRlbSxcbiAgICAgICAgICAgIGdyaWRzdGVyOiBncmlkc3RlclxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvbkNhbmNlbCAoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY2FuY2VsLmVtaXQoe2l0ZW06IHRoaXMuaXRlbX0pO1xuICAgIH1cblxuICAgIG9uRW50ZXIgKGdyaWRzdGVyOiBHcmlkc3RlclNlcnZpY2UpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5lbnRlci5lbWl0KHtcbiAgICAgICAgICAgIGl0ZW06IHRoaXMuaXRlbSxcbiAgICAgICAgICAgIGdyaWRzdGVyOiBncmlkc3RlclxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvbk92ZXIgKGdyaWRzdGVyOiBHcmlkc3RlclNlcnZpY2UpOiB2b2lkIHt9XG5cbiAgICBvbk91dCAoZ3JpZHN0ZXI6IEdyaWRzdGVyU2VydmljZSk6IHZvaWQge1xuICAgICAgICB0aGlzLm91dC5lbWl0KHtcbiAgICAgICAgICAgIGl0ZW06IHRoaXMuaXRlbSxcbiAgICAgICAgICAgIGdyaWRzdGVyOiBncmlkc3RlclxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRQb3NpdGlvblRvR3JpZHN0ZXIoZ3JpZHN0ZXI6IEdyaWRzdGVyU2VydmljZSkge1xuICAgICAgICBjb25zdCByZWxhdGl2ZUNvbnRhaW5lckNvb3JkcyA9IHRoaXMuZ2V0Q29udGFpbmVyQ29vcmRzVG9Hcmlkc3Rlcihncmlkc3Rlcik7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHk6IHRoaXMucG9zaXRpb25ZIC0gcmVsYXRpdmVDb250YWluZXJDb29yZHMudG9wLFxuICAgICAgICAgICAgeDogdGhpcy5wb3NpdGlvblggLSByZWxhdGl2ZUNvbnRhaW5lckNvb3Jkcy5sZWZ0XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgc2V0RHJhZ0NvbnRleHRHcmlkc3Rlcihncmlkc3RlcjogR3JpZHN0ZXJTZXJ2aWNlKSB7XG4gICAgICAgIHRoaXMuZHJhZ0NvbnRleHRHcmlkc3RlciA9IGdyaWRzdGVyO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29udGFpbmVyQ29vcmRzVG9Hcmlkc3Rlcihncmlkc3RlcjogR3JpZHN0ZXJTZXJ2aWNlKToge3RvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXJ9IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxlZnQ6IGdyaWRzdGVyLmdyaWRzdGVyUmVjdC5sZWZ0IC0gdGhpcy5wYXJlbnRSZWN0LmxlZnQsXG4gICAgICAgICAgICB0b3A6IGdyaWRzdGVyLmdyaWRzdGVyUmVjdC50b3AgLSB0aGlzLnBhcmVudFJlY3QudG9wXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBlbmFibGVEcmFnRHJvcCgpIHtcbiAgICAgICAgbGV0IGN1cnNvclRvRWxlbWVudFBvc2l0aW9uOiB7IHg6IG51bWJlciwgeTogbnVtYmVyIH07XG4gICAgICAgIGNvbnN0IGRyYWdnYWJsZSA9IG5ldyBEcmFnZ2FibGUodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpO1xuXG4gICAgICAgIGNvbnN0IGRyYWdTdGFydFN1YiA9IGRyYWdnYWJsZS5kcmFnU3RhcnRcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoKGV2ZW50OiBEcmFnZ2FibGVFdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuem9uZS5ydW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50ID0gdGhpcy5wcm92aWRlRHJhZ0VsZW1lbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250YWluZXJSZWN0YW5nZSA9IHRoaXMuJGVsZW1lbnQucGFyZW50RWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVQYXJlbnRFbGVtZW50RGF0YSgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uU3RhcnQoZXZlbnQpO1xuXG4gICAgICAgICAgICAgICAgICAgIGN1cnNvclRvRWxlbWVudFBvc2l0aW9uID0gZXZlbnQuZ2V0UmVsYXRpdmVDb29yZGluYXRlcyh0aGlzLiRlbGVtZW50KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGRyYWdTdWIgPSBkcmFnZ2FibGUuZHJhZ01vdmVcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoKGV2ZW50OiBEcmFnZ2FibGVFdmVudCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRFbGVtZW50UG9zaXRpb24odGhpcy4kZWxlbWVudCwge1xuICAgICAgICAgICAgICAgICAgICB4OiBldmVudC5jbGllbnRYIC0gY3Vyc29yVG9FbGVtZW50UG9zaXRpb24ueCAgLSB0aGlzLnBhcmVudFJlY3QubGVmdCxcbiAgICAgICAgICAgICAgICAgICAgeTogZXZlbnQuY2xpZW50WSAtIGN1cnNvclRvRWxlbWVudFBvc2l0aW9uLnkgIC0gdGhpcy5wYXJlbnRSZWN0LnRvcFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5vbkRyYWcoZXZlbnQpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgZHJhZ1N0b3BTdWIgPSBkcmFnZ2FibGUuZHJhZ1N0b3BcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoKGV2ZW50OiBEcmFnZ2FibGVFdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuem9uZS5ydW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uU3RvcChldmVudCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3Qgc2Nyb2xsU3ViID0gZnJvbUV2ZW50KGRvY3VtZW50LCAnc2Nyb2xsJylcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLiRlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlUGFyZW50RWxlbWVudERhdGEoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnN1YnNjcmlidGlvbnMgPSB0aGlzLnN1YnNjcmlidGlvbnMuY29uY2F0KFtkcmFnU3RhcnRTdWIsIGRyYWdTdWIsIGRyYWdTdG9wU3ViLCBzY3JvbGxTdWJdKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNldEVsZW1lbnRQb3NpdGlvbihlbGVtZW50OiBIVE1MRWxlbWVudCwgcG9zaXRpb246IHt4OiBudW1iZXIsIHk6IG51bWJlcn0pIHtcbiAgICAgICAgdGhpcy5wb3NpdGlvblggPSBwb3NpdGlvbi54O1xuICAgICAgICB0aGlzLnBvc2l0aW9uWSA9IHBvc2l0aW9uLnk7XG4gICAgICAgIHV0aWxzLnNldENzc0VsZW1lbnRQb3NpdGlvbihlbGVtZW50LCBwb3NpdGlvbik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB1cGRhdGVQYXJlbnRFbGVtZW50RGF0YSgpIHtcbiAgICAgICAgdGhpcy5wYXJlbnRSZWN0ID0gdGhpcy4kZWxlbWVudC5wYXJlbnRFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICB0aGlzLnBhcmVudE9mZnNldCA9IHtcbiAgICAgICAgICAgIGxlZnQ6IHRoaXMuJGVsZW1lbnQucGFyZW50RWxlbWVudC5vZmZzZXRMZWZ0LFxuICAgICAgICAgICAgdG9wOiB0aGlzLiRlbGVtZW50LnBhcmVudEVsZW1lbnQub2Zmc2V0VG9wXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblN0YXJ0IChldmVudDogRHJhZ2dhYmxlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5pc0RyYWdnaW5nID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLiRlbGVtZW50LnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnbm9uZSc7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuXG4gICAgICAgIHRoaXMuZ3JpZHN0ZXJQcm90b3R5cGUuZHJhZ0l0ZW1TdGFydCh0aGlzLCBldmVudCk7XG5cbiAgICAgICAgdGhpcy5zdGFydC5lbWl0KHtpdGVtOiB0aGlzLml0ZW19KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRHJhZyAoZXZlbnQ6IERyYWdnYWJsZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIHRoaXMuZ3JpZHN0ZXJQcm90b3R5cGUudXBkYXRlUHJvdG90eXBlUG9zaXRpb24odGhpcywgZXZlbnQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25TdG9wIChldmVudDogRHJhZ2dhYmxlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5ncmlkc3RlclByb3RvdHlwZS5kcmFnSXRlbVN0b3AodGhpcywgZXZlbnQpO1xuXG4gICAgICAgIHRoaXMuaXNEcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLiRlbGVtZW50LnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnYXV0byc7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnJztcbiAgICAgICAgdXRpbHMucmVzZXRDU1NFbGVtZW50UG9zaXRpb24odGhpcy4kZWxlbWVudCk7XG5cbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLmhlbHBlcikge1xuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuJGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwcm92aWRlRHJhZ0VsZW1lbnQgKCk6IEhUTUxFbGVtZW50IHtcbiAgICAgICAgbGV0IGRyYWdFbGVtZW50ID0gdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLmhlbHBlcikge1xuICAgICAgICAgICAgZHJhZ0VsZW1lbnQgPSA8YW55PihkcmFnRWxlbWVudCkuY2xvbmVOb2RlKHRydWUpO1xuXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuZml4U3R5bGVzRm9yQm9keUhlbHBlcihkcmFnRWxlbWVudCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5maXhTdHlsZXNGb3JSZWxhdGl2ZUVsZW1lbnQoZHJhZ0VsZW1lbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRyYWdFbGVtZW50O1xuICAgIH1cblxuICAgIHByaXZhdGUgZml4U3R5bGVzRm9yUmVsYXRpdmVFbGVtZW50KGVsOiBIVE1MRWxlbWVudCkge1xuICAgICAgICBpZiAod2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwpLnBvc2l0aW9uID09PSAnYWJzb2x1dGUnKSB7XG4gICAgICAgICAgICByZXR1cm4gZWw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVjdCA9IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICB0aGlzLmNvbnRhaW5lclJlY3RhbmdlID0gZWwucGFyZW50RWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICBlbC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgIHRoaXMuc2V0RWxlbWVudFBvc2l0aW9uKGVsLCB7XG4gICAgICAgICAgICB4OiByZWN0LmxlZnQgLSB0aGlzLmNvbnRhaW5lclJlY3RhbmdlLmxlZnQsXG4gICAgICAgICAgICB5OiByZWN0LnRvcCAtIHRoaXMuY29udGFpbmVyUmVjdGFuZ2UudG9wXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXaGVuIGVsZW1lbnQgaXMgY2xvbmVkIGFuZCBhcHBlbmQgdG8gYm9keSBpdCBzaG91bGQgaGF2ZSBwb3NpdGlvbiBhYnNvbHV0ZSBhbmQgY29vcmRzIHNldCBieSBvcmlnaW5hbFxuICAgICAqIHJlbGF0aXZlIHByb3RvdHlwZSBlbGVtZW50IHBvc2l0aW9uLlxuICAgICAqL1xuICAgIHByaXZhdGUgZml4U3R5bGVzRm9yQm9keUhlbHBlciAoZWw6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IGJvZHlSZWN0ID0gZG9jdW1lbnQuYm9keS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY29uc3QgcmVjdCA9IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAgIGVsLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgdGhpcy5zZXRFbGVtZW50UG9zaXRpb24oZWwsIHtcbiAgICAgICAgICAgIHg6IHJlY3QubGVmdCAtIGJvZHlSZWN0LmxlZnQsXG4gICAgICAgICAgICB5OiByZWN0LnRvcCAtIGJvZHlSZWN0LnRvcFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZWw7XG4gICAgfVxuXG59XG4iXX0=