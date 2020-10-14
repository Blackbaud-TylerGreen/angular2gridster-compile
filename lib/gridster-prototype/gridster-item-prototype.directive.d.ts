import { ElementRef, EventEmitter, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { GridsterPrototypeService } from './gridster-prototype.service';
import { GridListItem } from '../gridList/GridListItem';
import { GridsterService } from '../gridster.service';
export declare class GridsterItemPrototypeDirective implements OnInit, OnDestroy {
    private zone;
    private elementRef;
    private gridsterPrototype;
    drop: EventEmitter<any>;
    start: EventEmitter<any>;
    cancel: EventEmitter<any>;
    enter: EventEmitter<any>;
    out: EventEmitter<any>;
    data: any;
    config: any;
    x: number;
    y: number;
    w: number;
    wSm: number;
    wMd: number;
    wLg: number;
    wXl: number;
    h: number;
    hSm: number;
    hMd: number;
    hLg: number;
    hXl: number;
    variableHeight: boolean;
    variableHeightContainToRow: boolean;
    positionX: number;
    positionY: number;
    autoSize: boolean;
    $element: HTMLElement;
    /**
     * Mouse drag observable
     */
    drag: Observable<any>;
    /**
     * Subscribtion for drag observable
     */
    dragSubscription: Subscription;
    isDragging: boolean;
    item: GridListItem;
    containerRectange: ClientRect;
    private dragContextGridster;
    private parentRect;
    private parentOffset;
    private subscribtions;
    get dragAndDrop(): boolean;
    get gridster(): GridsterService;
    constructor(zone: NgZone, elementRef: ElementRef, gridsterPrototype: GridsterPrototypeService);
    ngOnInit(): void;
    ngOnDestroy(): void;
    onDrop(gridster: GridsterService): void;
    onCancel(): void;
    onEnter(gridster: GridsterService): void;
    onOver(gridster: GridsterService): void;
    onOut(gridster: GridsterService): void;
    getPositionToGridster(gridster: GridsterService): {
        y: number;
        x: number;
    };
    setDragContextGridster(gridster: GridsterService): void;
    private getContainerCoordsToGridster;
    private enableDragDrop;
    private setElementPosition;
    private updateParentElementData;
    private onStart;
    private onDrag;
    private onStop;
    private provideDragElement;
    private fixStylesForRelativeElement;
    /**
     * When element is cloned and append to body it should have position absolute and coords set by original
     * relative prototype element position.
     */
    private fixStylesForBodyHelper;
}
