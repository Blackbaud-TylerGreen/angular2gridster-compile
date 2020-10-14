var GridListItem = /** @class */ (function () {
    function GridListItem() {
    }
    Object.defineProperty(GridListItem.prototype, "$element", {
        get: function () {
            return this.getItem().$element;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridListItem.prototype, "x", {
        get: function () {
            var item = this.getItem();
            var breakpoint = item.gridster ? item.gridster.options.breakpoint : null;
            return this.getValueX(breakpoint);
        },
        set: function (value) {
            var item = this.getItem();
            var breakpoint = item.gridster ? item.gridster.options.breakpoint : null;
            this.setValueX(value, breakpoint);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridListItem.prototype, "y", {
        get: function () {
            var item = this.getItem();
            var breakpoint = item.gridster ? item.gridster.options.breakpoint : null;
            return this.getValueY(breakpoint);
        },
        set: function (value) {
            var item = this.getItem();
            var breakpoint = item.gridster ? item.gridster.options.breakpoint : null;
            this.setValueY(value, breakpoint);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridListItem.prototype, "w", {
        get: function () {
            var item = this.getItem();
            var breakpoint = item.gridster ? item.gridster.options.breakpoint : null;
            return this.getValueW(breakpoint);
        },
        set: function (value) {
            var item = this.getItem();
            var breakpoint = item.gridster ? item.gridster.options.breakpoint : null;
            this.setValueW(value, breakpoint);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridListItem.prototype, "h", {
        get: function () {
            var item = this.getItem();
            var breakpoint = item.gridster ? item.gridster.options.breakpoint : null;
            return this.getValueH(breakpoint);
        },
        set: function (value) {
            var item = this.getItem();
            var breakpoint = item.gridster ? item.gridster.options.breakpoint : null;
            this.setValueH(value, breakpoint);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridListItem.prototype, "autoSize", {
        get: function () {
            return this.getItem().autoSize;
        },
        set: function (value) {
            this.getItem().autoSize = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridListItem.prototype, "dragAndDrop", {
        get: function () {
            return !!this.getItem().dragAndDrop;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridListItem.prototype, "resizable", {
        get: function () {
            return !!this.getItem().resizable;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridListItem.prototype, "positionX", {
        get: function () {
            var item = this.itemComponent || this.itemPrototype;
            if (!item) {
                return null;
            }
            return item.positionX;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridListItem.prototype, "positionY", {
        get: function () {
            var item = this.itemComponent || this.itemPrototype;
            if (!item) {
                return null;
            }
            return item.positionY;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridListItem.prototype, "variableHeight", {
        get: function () {
            return this.getItem().variableHeight;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridListItem.prototype, "contentHeight", {
        get: function () {
            // itemComponent is undefined when dragging a prototype
            var contentHeight;
            if (this.itemComponent) {
                contentHeight = this.itemComponent.elementRef.nativeElement.offsetheight || 0;
            }
            else {
                contentHeight = 0;
            }
            var childHeight = this.$element.firstChild.offsetHeight || 0;
            return Math.max(contentHeight, childHeight);
        },
        enumerable: true,
        configurable: true
    });
    GridListItem.prototype.setFromGridsterItem = function (item) {
        if (this.isItemSet()) {
            throw new Error('GridListItem is already set.');
        }
        this.itemComponent = item;
        return this;
    };
    GridListItem.prototype.setFromGridsterItemPrototype = function (item) {
        if (this.isItemSet()) {
            throw new Error('GridListItem is already set.');
        }
        this.itemPrototype = item;
        return this;
    };
    GridListItem.prototype.setFromObjectLiteral = function (item) {
        if (this.isItemSet()) {
            throw new Error('GridListItem is already set.');
        }
        this.itemObject = item;
        return this;
    };
    GridListItem.prototype.copy = function () {
        var itemCopy = new GridListItem();
        return itemCopy.setFromObjectLiteral({
            $element: this.$element,
            x: this.x,
            y: this.y,
            w: this.w,
            h: this.h,
            autoSize: this.autoSize,
            dragAndDrop: this.dragAndDrop,
            resizable: this.resizable
        });
    };
    GridListItem.prototype.copyForBreakpoint = function (breakpoint) {
        var itemCopy = new GridListItem();
        return itemCopy.setFromObjectLiteral({
            $element: this.$element,
            x: this.getValueX(breakpoint),
            y: this.getValueY(breakpoint),
            w: this.getValueW(breakpoint),
            h: this.getValueH(breakpoint),
            autoSize: this.autoSize,
            dragAndDrop: this.dragAndDrop,
            resizable: this.resizable
        });
    };
    GridListItem.prototype.getValueX = function (breakpoint) {
        var item = this.getItem();
        return item[this.getXProperty(breakpoint)];
    };
    GridListItem.prototype.getValueY = function (breakpoint) {
        var item = this.getItem();
        return item[this.getYProperty(breakpoint)];
    };
    GridListItem.prototype.getValueW = function (breakpoint) {
        var item = this.getItem();
        return item[this.getWProperty(breakpoint)] || 1;
    };
    GridListItem.prototype.getValueH = function (breakpoint) {
        var item = this.getItem();
        return item[this.getHProperty(breakpoint)] || 1;
    };
    GridListItem.prototype.setValueX = function (value, breakpoint) {
        var item = this.getItem();
        item[this.getXProperty(breakpoint)] = value;
    };
    GridListItem.prototype.setValueY = function (value, breakpoint) {
        var item = this.getItem();
        item[this.getYProperty(breakpoint)] = value;
    };
    GridListItem.prototype.setValueW = function (value, breakpoint) {
        var item = this.getItem();
        item[this.getWProperty(breakpoint)] = value;
    };
    GridListItem.prototype.setValueH = function (value, breakpoint) {
        var item = this.getItem();
        item[this.getHProperty(breakpoint)] = value;
    };
    GridListItem.prototype.triggerChangeX = function (breakpoint) {
        var item = this.itemComponent;
        if (item) {
            item[this.getXProperty(breakpoint) + 'Change'].emit(this.getValueX(breakpoint));
        }
    };
    GridListItem.prototype.triggerChangeY = function (breakpoint) {
        var item = this.itemComponent;
        if (item) {
            item[this.getYProperty(breakpoint) + 'Change'].emit(this.getValueY(breakpoint));
        }
    };
    GridListItem.prototype.triggerChangeW = function (breakpoint) {
        var item = this.itemComponent;
        if (item) {
            item[this.getWProperty(breakpoint) + 'Change'].emit(this.getValueW(breakpoint));
        }
    };
    GridListItem.prototype.triggerChangeH = function (breakpoint) {
        var item = this.itemComponent;
        if (item) {
            item[this.getHProperty(breakpoint) + 'Change'].emit(this.getValueH(breakpoint));
        }
    };
    GridListItem.prototype.hasPositions = function (breakpoint) {
        var x = this.getValueX(breakpoint);
        var y = this.getValueY(breakpoint);
        return (x || x === 0) && (y || y === 0);
    };
    GridListItem.prototype.applyPosition = function (gridster) {
        var position = this.calculatePosition(gridster);
        this.itemComponent.positionX = position.left;
        this.itemComponent.positionY = position.top;
        this.itemComponent.updateElemenetPosition();
    };
    GridListItem.prototype.calculatePosition = function (gridster) {
        if (!gridster && !this.itemComponent) {
            return { left: 0, top: 0 };
        }
        gridster = gridster || this.itemComponent.gridster;
        var top;
        if (gridster.gridList) {
            var rowHeights = gridster.getRowHeights();
            var rowTops = gridster.getRowTops(rowHeights);
            top = rowTops[this.y];
        }
        else {
            top = this.y * gridster.cellHeight;
        }
        return {
            left: this.x * gridster.cellWidth,
            top: top
        };
    };
    GridListItem.prototype.applySize = function (gridster) {
        var size = this.calculateSize(gridster);
        this.$element.style.width = size.width + 'px';
        this.$element.style.height = size.height + 'px';
    };
    GridListItem.prototype.calculateSize = function (gridster) {
        if (!gridster && !this.itemComponent) {
            return { width: 0, height: 0 };
        }
        gridster = gridster || this.itemComponent.gridster;
        var rowHeights, rowTops;
        if (gridster.gridList) {
            rowHeights = gridster.getRowHeights();
            rowTops = gridster.getRowTops(rowHeights);
        }
        var width = this.w;
        var height = this.h;
        if (gridster.options.direction === 'vertical') {
            width = Math.min(width, gridster.options.lanes);
        }
        if (gridster.options.direction === 'horizontal') {
            height = Math.min(height, gridster.options.lanes);
        }
        var pixelHeight;
        if (rowHeights) {
            pixelHeight = 0;
            for (var i = this.y; i < this.y + height; i++) {
                pixelHeight += rowHeights[i];
            }
        }
        else {
            pixelHeight = height * gridster.cellHeight;
        }
        return {
            width: width * gridster.cellWidth,
            height: pixelHeight
        };
    };
    GridListItem.prototype.getXProperty = function (breakpoint) {
        if (breakpoint && this.itemComponent) {
            return GridListItem.X_PROPERTY_MAP[breakpoint];
        }
        else {
            return 'x';
        }
    };
    GridListItem.prototype.getYProperty = function (breakpoint) {
        if (breakpoint && this.itemComponent) {
            return GridListItem.Y_PROPERTY_MAP[breakpoint];
        }
        else {
            return 'y';
        }
    };
    GridListItem.prototype.getWProperty = function (breakpoint) {
        if (this.itemPrototype) {
            return this.itemPrototype[GridListItem.W_PROPERTY_MAP[breakpoint]] ?
                GridListItem.W_PROPERTY_MAP[breakpoint] : 'w';
        }
        var item = this.getItem();
        var responsiveSizes = item.gridster && item.gridster.options.responsiveSizes;
        if (breakpoint && responsiveSizes) {
            return GridListItem.W_PROPERTY_MAP[breakpoint];
        }
        else {
            return 'w';
        }
    };
    GridListItem.prototype.getHProperty = function (breakpoint) {
        if (this.itemPrototype) {
            return this.itemPrototype[GridListItem.H_PROPERTY_MAP[breakpoint]] ?
                GridListItem.H_PROPERTY_MAP[breakpoint] : 'h';
        }
        var item = this.getItem();
        var responsiveSizes = item.gridster && item.gridster.options.responsiveSizes;
        if (breakpoint && responsiveSizes) {
            return GridListItem.H_PROPERTY_MAP[breakpoint];
        }
        else {
            return 'h';
        }
    };
    GridListItem.prototype.getItem = function () {
        var item = this.itemComponent || this.itemPrototype || this.itemObject;
        if (!item) {
            throw new Error('GridListItem is not set.');
        }
        return item;
    };
    GridListItem.prototype.isItemSet = function () {
        return this.itemComponent || this.itemPrototype || this.itemObject;
    };
    GridListItem.BREAKPOINTS = ['sm', 'md', 'lg', 'xl'];
    GridListItem.X_PROPERTY_MAP = {
        sm: 'xSm',
        md: 'xMd',
        lg: 'xLg',
        xl: 'xXl'
    };
    GridListItem.Y_PROPERTY_MAP = {
        sm: 'ySm',
        md: 'yMd',
        lg: 'yLg',
        xl: 'yXl'
    };
    GridListItem.W_PROPERTY_MAP = {
        sm: 'wSm',
        md: 'wMd',
        lg: 'wLg',
        xl: 'wXl'
    };
    GridListItem.H_PROPERTY_MAP = {
        sm: 'hSm',
        md: 'hMd',
        lg: 'hLg',
        xl: 'hXl'
    };
    return GridListItem;
}());
export { GridListItem };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR3JpZExpc3RJdGVtLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhcjJncmlkc3Rlci8iLCJzb3VyY2VzIjpbImxpYi9ncmlkTGlzdC9HcmlkTGlzdEl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUE7SUE0SUk7SUFBZ0IsQ0FBQztJQTFHakIsc0JBQUksa0NBQVE7YUFBWjtZQUNJLE9BQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQztRQUNuQyxDQUFDOzs7T0FBQTtJQUVELHNCQUFJLDJCQUFDO2FBQUw7WUFDSSxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDNUIsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFFM0UsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7YUFDRCxVQUFPLEtBQWE7WUFDaEIsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzVCLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBRTNFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7OztPQU5BO0lBUUQsc0JBQUksMkJBQUM7YUFBTDtZQUNJLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUM1QixJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUks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QUM7SUFDdEQsMkJBQWMsR0FBUTtRQUN6QixFQUFFLEVBQUUsS0FBSztRQUNULEVBQUUsRUFBRSxLQUFLO1FBQ1QsRUFBRSxFQUFFLEtBQUs7UUFDVCxFQUFFLEVBQUUsS0FBSztLQUNaLENBQUM7SUFFSywyQkFBYyxHQUFRO1FBQ3pCLEVBQUUsRUFBRSxLQUFLO1FBQ1QsRUFBRSxFQUFFLEtBQUs7UUFDVCxFQUFFLEVBQUUsS0FBSztRQUNULEVBQUUsRUFBRSxLQUFLO0tBQ1osQ0FBQztJQUVLLDJCQUFjLEdBQVE7UUFDekIsRUFBRSxFQUFFLEtBQUs7UUFDVCxFQUFFLEVBQUUsS0FBSztRQUNULEVBQUUsRUFBRSxLQUFLO1FBQ1QsRUFBRSxFQUFFLEtBQUs7S0FDWixDQUFDO0lBRUssMkJBQWMsR0FBUTtRQUN6QixFQUFFLEVBQUUsS0FBSztRQUNULEVBQUUsRUFBRSxLQUFLO1FBQ1QsRUFBRSxFQUFFLEtBQUs7UUFDVCxFQUFFLEVBQUUsS0FBSztLQUNaLENBQUM7SUFtWU4sbUJBQUM7Q0FBQSxBQS9aRCxJQStaQztTQS9aWSxZQUFZIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgR3JpZHN0ZXJJdGVtQ29tcG9uZW50IH0gZnJvbSAnLi4vZ3JpZHN0ZXItaXRlbS9ncmlkc3Rlci1pdGVtLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBHcmlkc3Rlckl0ZW1Qcm90b3R5cGVEaXJlY3RpdmUgfSBmcm9tICcuLi9ncmlkc3Rlci1wcm90b3R5cGUvZ3JpZHN0ZXItaXRlbS1wcm90b3R5cGUuZGlyZWN0aXZlJztcbmltcG9ydCB7IEdyaWRzdGVyU2VydmljZSB9IGZyb20gJy4uL2dyaWRzdGVyLnNlcnZpY2UnO1xuXG5leHBvcnQgY2xhc3MgR3JpZExpc3RJdGVtIHtcbiAgICBzdGF0aWMgQlJFQUtQT0lOVFM6IEFycmF5PHN0cmluZz4gPSBbJ3NtJywgJ21kJywgJ2xnJywgJ3hsJ107XG4gICAgc3RhdGljIFhfUFJPUEVSVFlfTUFQOiBhbnkgPSB7XG4gICAgICAgIHNtOiAneFNtJyxcbiAgICAgICAgbWQ6ICd4TWQnLFxuICAgICAgICBsZzogJ3hMZycsXG4gICAgICAgIHhsOiAneFhsJ1xuICAgIH07XG5cbiAgICBzdGF0aWMgWV9QUk9QRVJUWV9NQVA6IGFueSA9IHtcbiAgICAgICAgc206ICd5U20nLFxuICAgICAgICBtZDogJ3lNZCcsXG4gICAgICAgIGxnOiAneUxnJyxcbiAgICAgICAgeGw6ICd5WGwnXG4gICAgfTtcblxuICAgIHN0YXRpYyBXX1BST1BFUlRZX01BUDogYW55ID0ge1xuICAgICAgICBzbTogJ3dTbScsXG4gICAgICAgIG1kOiAnd01kJyxcbiAgICAgICAgbGc6ICd3TGcnLFxuICAgICAgICB4bDogJ3dYbCdcbiAgICB9O1xuXG4gICAgc3RhdGljIEhfUFJPUEVSVFlfTUFQOiBhbnkgPSB7XG4gICAgICAgIHNtOiAnaFNtJyxcbiAgICAgICAgbWQ6ICdoTWQnLFxuICAgICAgICBsZzogJ2hMZycsXG4gICAgICAgIHhsOiAnaFhsJ1xuICAgIH07XG5cbiAgICBpdGVtQ29tcG9uZW50OiBHcmlkc3Rlckl0ZW1Db21wb25lbnQ7XG4gICAgaXRlbVByb3RvdHlwZTogR3JpZHN0ZXJJdGVtUHJvdG90eXBlRGlyZWN0aXZlO1xuICAgIGl0ZW1PYmplY3Q6IGFueTtcblxuICAgIGdldCAkZWxlbWVudCAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEl0ZW0oKS4kZWxlbWVudDtcbiAgICB9XG5cbiAgICBnZXQgeCAoKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLmdldEl0ZW0oKTtcbiAgICAgICAgY29uc3QgYnJlYWtwb2ludCA9IGl0ZW0uZ3JpZHN0ZXIgPyBpdGVtLmdyaWRzdGVyLm9wdGlvbnMuYnJlYWtwb2ludCA6IG51bGw7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VmFsdWVYKGJyZWFrcG9pbnQpO1xuICAgIH1cbiAgICBzZXQgeCAodmFsdWU6IG51bWJlcikge1xuICAgICAgICBjb25zdCBpdGVtID0gdGhpcy5nZXRJdGVtKCk7XG4gICAgICAgIGNvbnN0IGJyZWFrcG9pbnQgPSBpdGVtLmdyaWRzdGVyID8gaXRlbS5ncmlkc3Rlci5vcHRpb25zLmJyZWFrcG9pbnQgOiBudWxsO1xuXG4gICAgICAgIHRoaXMuc2V0VmFsdWVYKHZhbHVlLCBicmVha3BvaW50KTtcbiAgICB9XG5cbiAgICBnZXQgeSAoKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLmdldEl0ZW0oKTtcbiAgICAgICAgY29uc3QgYnJlYWtwb2ludCA9IGl0ZW0uZ3JpZHN0ZXIgPyBpdGVtLmdyaWRzdGVyLm9wdGlvbnMuYnJlYWtwb2ludCA6IG51bGw7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VmFsdWVZKGJyZWFrcG9pbnQpO1xuICAgIH1cbiAgICBzZXQgeSAodmFsdWU6IG51bWJlcikge1xuICAgICAgICBjb25zdCBpdGVtID0gdGhpcy5nZXRJdGVtKCk7XG4gICAgICAgIGNvbnN0IGJyZWFrcG9pbnQgPSBpdGVtLmdyaWRzdGVyID8gaXRlbS5ncmlkc3Rlci5vcHRpb25zLmJyZWFrcG9pbnQgOiBudWxsO1xuXG4gICAgICAgIHRoaXMuc2V0VmFsdWVZKHZhbHVlLCBicmVha3BvaW50KTtcbiAgICB9XG5cbiAgICBnZXQgdyAoKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLmdldEl0ZW0oKTtcbiAgICAgICAgY29uc3QgYnJlYWtwb2ludCA9IGl0ZW0uZ3JpZHN0ZXIgPyBpdGVtLmdyaWRzdGVyLm9wdGlvbnMuYnJlYWtwb2ludCA6IG51bGw7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VmFsdWVXKGJyZWFrcG9pbnQpO1xuICAgIH1cbiAgICBzZXQgdyAodmFsdWU6IG51bWJlcikge1xuICAgICAgICBjb25zdCBpdGVtID0gdGhpcy5nZXRJdGVtKCk7XG4gICAgICAgIGNvbnN0IGJyZWFrcG9pbnQgPSBpdGVtLmdyaWRzdGVyID8gaXRlbS5ncmlkc3Rlci5vcHRpb25zLmJyZWFrcG9pbnQgOiBudWxsO1xuXG4gICAgICAgIHRoaXMuc2V0VmFsdWVXKHZhbHVlLCBicmVha3BvaW50KTtcbiAgICB9XG5cbiAgICBnZXQgaCAoKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLmdldEl0ZW0oKTtcbiAgICAgICAgY29uc3QgYnJlYWtwb2ludCA9IGl0ZW0uZ3JpZHN0ZXIgPyBpdGVtLmdyaWRzdGVyLm9wdGlvbnMuYnJlYWtwb2ludCA6IG51bGw7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFZhbHVlSChicmVha3BvaW50KTtcbiAgICB9XG4gICAgc2V0IGggKHZhbHVlOiBudW1iZXIpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IHRoaXMuZ2V0SXRlbSgpO1xuICAgICAgICBjb25zdCBicmVha3BvaW50ID0gaXRlbS5ncmlkc3RlciA/IGl0ZW0uZ3JpZHN0ZXIub3B0aW9ucy5icmVha3BvaW50IDogbnVsbDtcblxuICAgICAgICB0aGlzLnNldFZhbHVlSCh2YWx1ZSwgYnJlYWtwb2ludCk7XG4gICAgfVxuXG4gICAgZ2V0IGF1dG9TaXplICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SXRlbSgpLmF1dG9TaXplO1xuICAgIH1cbiAgICBzZXQgYXV0b1NpemUgKHZhbHVlOiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuZ2V0SXRlbSgpLmF1dG9TaXplID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IGRyYWdBbmREcm9wKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLmdldEl0ZW0oKS5kcmFnQW5kRHJvcDtcbiAgICB9XG5cbiAgICBnZXQgcmVzaXphYmxlKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLmdldEl0ZW0oKS5yZXNpemFibGU7XG4gICAgfVxuXG4gICAgZ2V0IHBvc2l0aW9uWCgpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IHRoaXMuaXRlbUNvbXBvbmVudCB8fCB0aGlzLml0ZW1Qcm90b3R5cGU7XG5cbiAgICAgICAgaWYgKCFpdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpdGVtLnBvc2l0aW9uWDtcbiAgICB9XG5cbiAgICBnZXQgcG9zaXRpb25ZKCkge1xuICAgICAgICBjb25zdCBpdGVtID0gdGhpcy5pdGVtQ29tcG9uZW50IHx8IHRoaXMuaXRlbVByb3RvdHlwZTtcblxuICAgICAgICBpZiAoIWl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGl0ZW0ucG9zaXRpb25ZO1xuICAgIH1cblxuICAgIGdldCB2YXJpYWJsZUhlaWdodCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SXRlbSgpLnZhcmlhYmxlSGVpZ2h0O1xuICAgIH1cblxuICAgIGdldCBjb250ZW50SGVpZ2h0KCk6IG51bWJlciB7XG4gICAgICAgIC8vIGl0ZW1Db21wb25lbnQgaXMgdW5kZWZpbmVkIHdoZW4gZHJhZ2dpbmcgYSBwcm90b3R5cGVcbiAgICAgICAgbGV0IGNvbnRlbnRIZWlnaHQ6IG51bWJlcjtcbiAgICAgICAgaWYgKHRoaXMuaXRlbUNvbXBvbmVudCkge1xuICAgICAgICAgICAgY29udGVudEhlaWdodCA9IHRoaXMuaXRlbUNvbXBvbmVudC5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQub2Zmc2V0aGVpZ2h0IHx8IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb250ZW50SGVpZ2h0ID0gMDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjaGlsZEhlaWdodCA9IHRoaXMuJGVsZW1lbnQuZmlyc3RDaGlsZC5vZmZzZXRIZWlnaHQgfHwgMDtcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KGNvbnRlbnRIZWlnaHQsIGNoaWxkSGVpZ2h0KTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvciAoKSB7fVxuXG4gICAgcHVibGljIHNldEZyb21Hcmlkc3Rlckl0ZW0gKGl0ZW06IEdyaWRzdGVySXRlbUNvbXBvbmVudCk6IEdyaWRMaXN0SXRlbSB7XG4gICAgICAgIGlmICh0aGlzLmlzSXRlbVNldCgpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0dyaWRMaXN0SXRlbSBpcyBhbHJlYWR5IHNldC4nKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLml0ZW1Db21wb25lbnQgPSBpdGVtO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0RnJvbUdyaWRzdGVySXRlbVByb3RvdHlwZSAoaXRlbTogR3JpZHN0ZXJJdGVtUHJvdG90eXBlRGlyZWN0aXZlKTogR3JpZExpc3RJdGVtIHtcbiAgICAgICAgaWYgKHRoaXMuaXNJdGVtU2V0KCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignR3JpZExpc3RJdGVtIGlzIGFscmVhZHkgc2V0LicpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaXRlbVByb3RvdHlwZSA9IGl0ZW07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRGcm9tT2JqZWN0TGl0ZXJhbCAoaXRlbTogT2JqZWN0KTogR3JpZExpc3RJdGVtIHtcbiAgICAgICAgaWYgKHRoaXMuaXNJdGVtU2V0KCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignR3JpZExpc3RJdGVtIGlzIGFscmVhZHkgc2V0LicpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaXRlbU9iamVjdCA9IGl0ZW07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb3B5KCkge1xuICAgICAgICBjb25zdCBpdGVtQ29weSA9IG5ldyBHcmlkTGlzdEl0ZW0oKTtcblxuICAgICAgICByZXR1cm4gaXRlbUNvcHkuc2V0RnJvbU9iamVjdExpdGVyYWwoe1xuICAgICAgICAgICAgJGVsZW1lbnQ6IHRoaXMuJGVsZW1lbnQsXG4gICAgICAgICAgICB4OiB0aGlzLngsXG4gICAgICAgICAgICB5OiB0aGlzLnksXG4gICAgICAgICAgICB3OiB0aGlzLncsXG4gICAgICAgICAgICBoOiB0aGlzLmgsXG4gICAgICAgICAgICBhdXRvU2l6ZTogdGhpcy5hdXRvU2l6ZSxcbiAgICAgICAgICAgIGRyYWdBbmREcm9wOiB0aGlzLmRyYWdBbmREcm9wLFxuICAgICAgICAgICAgcmVzaXphYmxlOiB0aGlzLnJlc2l6YWJsZVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29weUZvckJyZWFrcG9pbnQoYnJlYWtwb2ludD86IHN0cmluZykge1xuICAgICAgICBjb25zdCBpdGVtQ29weSA9IG5ldyBHcmlkTGlzdEl0ZW0oKTtcblxuICAgICAgICByZXR1cm4gaXRlbUNvcHkuc2V0RnJvbU9iamVjdExpdGVyYWwoe1xuICAgICAgICAgICAgJGVsZW1lbnQ6IHRoaXMuJGVsZW1lbnQsXG4gICAgICAgICAgICB4OiB0aGlzLmdldFZhbHVlWChicmVha3BvaW50KSxcbiAgICAgICAgICAgIHk6IHRoaXMuZ2V0VmFsdWVZKGJyZWFrcG9pbnQpLFxuICAgICAgICAgICAgdzogdGhpcy5nZXRWYWx1ZVcoYnJlYWtwb2ludCksXG4gICAgICAgICAgICBoOiB0aGlzLmdldFZhbHVlSChicmVha3BvaW50KSxcbiAgICAgICAgICAgIGF1dG9TaXplOiB0aGlzLmF1dG9TaXplLFxuICAgICAgICAgICAgZHJhZ0FuZERyb3A6IHRoaXMuZHJhZ0FuZERyb3AsXG4gICAgICAgICAgICByZXNpemFibGU6IHRoaXMucmVzaXphYmxlXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRWYWx1ZVgoYnJlYWtwb2ludD86IHN0cmluZykge1xuICAgICAgICBjb25zdCBpdGVtID0gdGhpcy5nZXRJdGVtKCk7XG5cbiAgICAgICAgcmV0dXJuIGl0ZW1bdGhpcy5nZXRYUHJvcGVydHkoYnJlYWtwb2ludCldO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRWYWx1ZVkoYnJlYWtwb2ludD86IHN0cmluZykge1xuICAgICAgICBjb25zdCBpdGVtID0gdGhpcy5nZXRJdGVtKCk7XG5cbiAgICAgICAgcmV0dXJuIGl0ZW1bdGhpcy5nZXRZUHJvcGVydHkoYnJlYWtwb2ludCldO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRWYWx1ZVcoYnJlYWtwb2ludD86IHN0cmluZykge1xuICAgICAgICBjb25zdCBpdGVtID0gdGhpcy5nZXRJdGVtKCk7XG5cbiAgICAgICAgcmV0dXJuIGl0ZW1bdGhpcy5nZXRXUHJvcGVydHkoYnJlYWtwb2ludCldIHx8IDE7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFZhbHVlSChicmVha3BvaW50Pzogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLmdldEl0ZW0oKTtcblxuICAgICAgICByZXR1cm4gaXRlbVt0aGlzLmdldEhQcm9wZXJ0eShicmVha3BvaW50KV0gfHwgMTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0VmFsdWVYKHZhbHVlOiBudW1iZXIsIGJyZWFrcG9pbnQ/OiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IHRoaXMuZ2V0SXRlbSgpO1xuXG4gICAgICAgIGl0ZW1bdGhpcy5nZXRYUHJvcGVydHkoYnJlYWtwb2ludCldID0gdmFsdWU7XG4gICAgfVxuXG4gICAgcHVibGljIHNldFZhbHVlWSh2YWx1ZTogbnVtYmVyLCBicmVha3BvaW50Pzogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLmdldEl0ZW0oKTtcblxuICAgICAgICBpdGVtW3RoaXMuZ2V0WVByb3BlcnR5KGJyZWFrcG9pbnQpXSA9IHZhbHVlO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRWYWx1ZVcodmFsdWU6IG51bWJlciwgYnJlYWtwb2ludD86IHN0cmluZykge1xuICAgICAgICBjb25zdCBpdGVtID0gdGhpcy5nZXRJdGVtKCk7XG5cbiAgICAgICAgaXRlbVt0aGlzLmdldFdQcm9wZXJ0eShicmVha3BvaW50KV0gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0VmFsdWVIKHZhbHVlOiBudW1iZXIsIGJyZWFrcG9pbnQ/OiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IHRoaXMuZ2V0SXRlbSgpO1xuXG4gICAgICAgIGl0ZW1bdGhpcy5nZXRIUHJvcGVydHkoYnJlYWtwb2ludCldID0gdmFsdWU7XG4gICAgfVxuXG4gICAgcHVibGljIHRyaWdnZXJDaGFuZ2VYKGJyZWFrcG9pbnQ/OiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IHRoaXMuaXRlbUNvbXBvbmVudDtcbiAgICAgICAgaWYgKGl0ZW0pIHtcbiAgICAgICAgICAgICg8YW55Pml0ZW0pW3RoaXMuZ2V0WFByb3BlcnR5KGJyZWFrcG9pbnQpICsgJ0NoYW5nZSddLmVtaXQodGhpcy5nZXRWYWx1ZVgoYnJlYWtwb2ludCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHRyaWdnZXJDaGFuZ2VZKGJyZWFrcG9pbnQ/OiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IHRoaXMuaXRlbUNvbXBvbmVudDtcbiAgICAgICAgaWYgKGl0ZW0pIHtcbiAgICAgICAgICAgICg8YW55Pml0ZW0pW3RoaXMuZ2V0WVByb3BlcnR5KGJyZWFrcG9pbnQpICsgJ0NoYW5nZSddLmVtaXQodGhpcy5nZXRWYWx1ZVkoYnJlYWtwb2ludCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHRyaWdnZXJDaGFuZ2VXKGJyZWFrcG9pbnQ/OiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IHRoaXMuaXRlbUNvbXBvbmVudDtcbiAgICAgICAgaWYgKGl0ZW0pIHtcbiAgICAgICAgICAgICg8YW55Pml0ZW0pW3RoaXMuZ2V0V1Byb3BlcnR5KGJyZWFrcG9pbnQpICsgJ0NoYW5nZSddLmVtaXQodGhpcy5nZXRWYWx1ZVcoYnJlYWtwb2ludCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHRyaWdnZXJDaGFuZ2VIKGJyZWFrcG9pbnQ/OiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IHRoaXMuaXRlbUNvbXBvbmVudDtcbiAgICAgICAgaWYgKGl0ZW0pIHtcbiAgICAgICAgICAgICg8YW55Pml0ZW0pW3RoaXMuZ2V0SFByb3BlcnR5KGJyZWFrcG9pbnQpICsgJ0NoYW5nZSddLmVtaXQodGhpcy5nZXRWYWx1ZUgoYnJlYWtwb2ludCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGhhc1Bvc2l0aW9ucyhicmVha3BvaW50Pzogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHggPSB0aGlzLmdldFZhbHVlWChicmVha3BvaW50KTtcbiAgICAgICAgY29uc3QgeSA9IHRoaXMuZ2V0VmFsdWVZKGJyZWFrcG9pbnQpO1xuXG4gICAgICAgIHJldHVybiAoeCB8fCB4ID09PSAwKSAmJiAoeSB8fCB5ID09PSAwKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXBwbHlQb3NpdGlvbihncmlkc3Rlcj86IEdyaWRzdGVyU2VydmljZSkge1xuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuY2FsY3VsYXRlUG9zaXRpb24oZ3JpZHN0ZXIpO1xuXG4gICAgICAgIHRoaXMuaXRlbUNvbXBvbmVudC5wb3NpdGlvblggPSBwb3NpdGlvbi5sZWZ0O1xuICAgICAgICB0aGlzLml0ZW1Db21wb25lbnQucG9zaXRpb25ZID0gcG9zaXRpb24udG9wO1xuICAgICAgICB0aGlzLml0ZW1Db21wb25lbnQudXBkYXRlRWxlbWVuZXRQb3NpdGlvbigpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjYWxjdWxhdGVQb3NpdGlvbihncmlkc3Rlcj86IEdyaWRzdGVyU2VydmljZSk6IHtsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfSB7XG4gICAgICAgIGlmICghZ3JpZHN0ZXIgJiYgIXRoaXMuaXRlbUNvbXBvbmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIHtsZWZ0OiAwLCB0b3A6IDB9O1xuICAgICAgICB9XG4gICAgICAgIGdyaWRzdGVyID0gZ3JpZHN0ZXIgfHwgdGhpcy5pdGVtQ29tcG9uZW50LmdyaWRzdGVyO1xuXG4gICAgICAgIGxldCB0b3A7XG4gICAgICAgIGlmIChncmlkc3Rlci5ncmlkTGlzdCkge1xuICAgICAgICAgICAgY29uc3Qgcm93SGVpZ2h0cyA9IGdyaWRzdGVyLmdldFJvd0hlaWdodHMoKTtcbiAgICAgICAgICAgIGNvbnN0IHJvd1RvcHMgPSBncmlkc3Rlci5nZXRSb3dUb3BzKHJvd0hlaWdodHMpO1xuICAgICAgICAgICAgdG9wID0gcm93VG9wc1t0aGlzLnldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdG9wID0gdGhpcy55ICogZ3JpZHN0ZXIuY2VsbEhlaWdodDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsZWZ0OiB0aGlzLnggKiBncmlkc3Rlci5jZWxsV2lkdGgsXG4gICAgICAgICAgICB0b3A6IHRvcFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHB1YmxpYyBhcHBseVNpemUoZ3JpZHN0ZXI/OiBHcmlkc3RlclNlcnZpY2UpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc2l6ZSA9IHRoaXMuY2FsY3VsYXRlU2l6ZShncmlkc3Rlcik7XG5cbiAgICAgICAgdGhpcy4kZWxlbWVudC5zdHlsZS53aWR0aCA9IHNpemUud2lkdGggKyAncHgnO1xuICAgICAgICB0aGlzLiRlbGVtZW50LnN0eWxlLmhlaWdodCA9IHNpemUuaGVpZ2h0ICsgJ3B4JztcbiAgICB9XG5cbiAgICBwdWJsaWMgY2FsY3VsYXRlU2l6ZShncmlkc3Rlcj86IEdyaWRzdGVyU2VydmljZSk6IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0ge1xuICAgICAgICBpZiAoIWdyaWRzdGVyICYmICF0aGlzLml0ZW1Db21wb25lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiB7d2lkdGg6IDAsIGhlaWdodDogMH07XG4gICAgICAgIH1cbiAgICAgICAgZ3JpZHN0ZXIgPSBncmlkc3RlciB8fCB0aGlzLml0ZW1Db21wb25lbnQuZ3JpZHN0ZXI7XG5cbiAgICAgICAgbGV0IHJvd0hlaWdodHMsIHJvd1RvcHM7XG4gICAgICAgIGlmIChncmlkc3Rlci5ncmlkTGlzdCkge1xuICAgICAgICAgICAgcm93SGVpZ2h0cyA9IGdyaWRzdGVyLmdldFJvd0hlaWdodHMoKTtcbiAgICAgICAgICAgIHJvd1RvcHMgPSBncmlkc3Rlci5nZXRSb3dUb3BzKHJvd0hlaWdodHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHdpZHRoID0gdGhpcy53O1xuICAgICAgICBsZXQgaGVpZ2h0ID0gdGhpcy5oO1xuXG4gICAgICAgIGlmIChncmlkc3Rlci5vcHRpb25zLmRpcmVjdGlvbiA9PT0gJ3ZlcnRpY2FsJykge1xuICAgICAgICAgICAgd2lkdGggPSBNYXRoLm1pbih3aWR0aCwgZ3JpZHN0ZXIub3B0aW9ucy5sYW5lcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGdyaWRzdGVyLm9wdGlvbnMuZGlyZWN0aW9uID09PSAnaG9yaXpvbnRhbCcpIHtcbiAgICAgICAgICAgIGhlaWdodCA9IE1hdGgubWluKGhlaWdodCwgZ3JpZHN0ZXIub3B0aW9ucy5sYW5lcyk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcGl4ZWxIZWlnaHQ7XG4gICAgICAgIGlmIChyb3dIZWlnaHRzKSB7XG4gICAgICAgICAgICBwaXhlbEhlaWdodCA9IDA7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gdGhpcy55OyBpIDwgdGhpcy55ICsgaGVpZ2h0OyBpKyspIHtcbiAgICAgICAgICAgICAgICBwaXhlbEhlaWdodCArPSByb3dIZWlnaHRzW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGl4ZWxIZWlnaHQgPSBoZWlnaHQgKiBncmlkc3Rlci5jZWxsSGVpZ2h0O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiB3aWR0aCAqIGdyaWRzdGVyLmNlbGxXaWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogcGl4ZWxIZWlnaHRcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFhQcm9wZXJ0eShicmVha3BvaW50Pzogc3RyaW5nKSB7XG5cbiAgICAgICAgaWYgKGJyZWFrcG9pbnQgJiYgdGhpcy5pdGVtQ29tcG9uZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gR3JpZExpc3RJdGVtLlhfUFJPUEVSVFlfTUFQW2JyZWFrcG9pbnRdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuICd4JztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0WVByb3BlcnR5KGJyZWFrcG9pbnQ/OiBzdHJpbmcpIHtcblxuICAgICAgICBpZiAoYnJlYWtwb2ludCAmJiB0aGlzLml0ZW1Db21wb25lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBHcmlkTGlzdEl0ZW0uWV9QUk9QRVJUWV9NQVBbYnJlYWtwb2ludF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gJ3knO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRXUHJvcGVydHkoYnJlYWtwb2ludD86IHN0cmluZykge1xuICAgICAgICBpZiAodGhpcy5pdGVtUHJvdG90eXBlKSB7XG4gICAgICAgICAgICByZXR1cm4gKDxhbnk+dGhpcy5pdGVtUHJvdG90eXBlKVtHcmlkTGlzdEl0ZW0uV19QUk9QRVJUWV9NQVBbYnJlYWtwb2ludF1dID9cbiAgICAgICAgICAgICAgICBHcmlkTGlzdEl0ZW0uV19QUk9QRVJUWV9NQVBbYnJlYWtwb2ludF0gOiAndyc7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpdGVtID0gdGhpcy5nZXRJdGVtKCk7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNpdmVTaXplcyA9IGl0ZW0uZ3JpZHN0ZXIgJiYgaXRlbS5ncmlkc3Rlci5vcHRpb25zLnJlc3BvbnNpdmVTaXplcztcblxuICAgICAgICBpZiAoYnJlYWtwb2ludCAmJiByZXNwb25zaXZlU2l6ZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBHcmlkTGlzdEl0ZW0uV19QUk9QRVJUWV9NQVBbYnJlYWtwb2ludF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gJ3cnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRIUHJvcGVydHkoYnJlYWtwb2ludD86IHN0cmluZykge1xuICAgICAgICBpZiAodGhpcy5pdGVtUHJvdG90eXBlKSB7XG4gICAgICAgICAgICByZXR1cm4gKDxhbnk+dGhpcy5pdGVtUHJvdG90eXBlKVtHcmlkTGlzdEl0ZW0uSF9QUk9QRVJUWV9NQVBbYnJlYWtwb2ludF1dID9cbiAgICAgICAgICAgICAgICBHcmlkTGlzdEl0ZW0uSF9QUk9QRVJUWV9NQVBbYnJlYWtwb2ludF0gOiAnaCc7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpdGVtID0gdGhpcy5nZXRJdGVtKCk7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNpdmVTaXplcyA9IGl0ZW0uZ3JpZHN0ZXIgJiYgaXRlbS5ncmlkc3Rlci5vcHRpb25zLnJlc3BvbnNpdmVTaXplcztcblxuICAgICAgICBpZiAoYnJlYWtwb2ludCAmJiByZXNwb25zaXZlU2l6ZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBHcmlkTGlzdEl0ZW0uSF9QUk9QRVJUWV9NQVBbYnJlYWtwb2ludF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gJ2gnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRJdGVtKCk6IGFueSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLml0ZW1Db21wb25lbnQgfHwgdGhpcy5pdGVtUHJvdG90eXBlIHx8IHRoaXMuaXRlbU9iamVjdDtcblxuICAgICAgICBpZiAoIWl0ZW0pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignR3JpZExpc3RJdGVtIGlzIG5vdCBzZXQuJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc0l0ZW1TZXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLml0ZW1Db21wb25lbnQgfHwgdGhpcy5pdGVtUHJvdG90eXBlIHx8IHRoaXMuaXRlbU9iamVjdDtcbiAgICB9XG59XG4iXX0=