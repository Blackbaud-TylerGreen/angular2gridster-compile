import { DraggableEvent } from './DraggableEvent';
export declare const utils: {
    setCssElementPosition: ($element: HTMLElement, position: {
        x: number;
        y: number;
    }) => void;
    resetCSSElementPosition: ($element: HTMLElement) => void;
    setTransform: ($element: HTMLElement, position: {
        x: number;
        y: number;
    }) => void;
    resetTransform: ($element: HTMLElement) => void;
    clearSelection: () => void;
    isElementFitContainer: (element: HTMLElement, containerEl: HTMLElement) => boolean;
    isElementIntersectContainer: (element: HTMLElement, containerEl: HTMLElement) => boolean;
    isElementTouchContainer: (element: HTMLElement, containerEl: HTMLElement) => boolean;
    isCursorAboveElement: (event: DraggableEvent, element: HTMLElement) => boolean;
    getElementOuterHeight: ($element: HTMLElement) => number;
    getRelativeCoordinates: (element: HTMLElement, parentElement: HTMLElement) => {
        top: number;
        left: number;
    };
    getScrollableContainer(node: any): any;
};
