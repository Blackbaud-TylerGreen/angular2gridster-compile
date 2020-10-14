(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common'), require('rxjs'), require('rxjs/operators')) :
    typeof define === 'function' && define.amd ? define('angular2gridster', ['exports', '@angular/core', '@angular/common', 'rxjs', 'rxjs/operators'], factory) :
    (global = global || self, factory(global.angular2gridster = {}, global.ng.core, global.ng.common, global.rxjs, global.rxjs.operators));
}(this, (function (exports, core, common, rxjs, operators) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    }

    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function __exportStar(m, exports) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };

    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }

    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    }

    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }

    function __asyncValues(o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
    }

    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    };

    function __importStar(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result.default = mod;
        return result;
    }

    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }

    function __classPrivateFieldGet(receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    }

    function __classPrivateFieldSet(receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    }

    var ɵ0 = function ($element, position) {
        $element.style.left = position.x + 'px';
        $element.style.top = position.y + 'px';
    }, ɵ1 = function ($element) {
        $element.style.left = '';
        $element.style.top = '';
    }, ɵ2 = function ($element, position) {
        var left = position.x;
        var top = position.y;
        // Replace unitless items with px
        var translate = "translate(" + left + "px," + top + "px)";
        $element.style['transform'] = translate;
        $element.style['WebkitTransform'] = translate;
        $element.style['MozTransform'] = translate;
        $element.style['msTransform'] = translate;
        $element.style['OTransform'] = translate;
    }, ɵ3 = function ($element) {
        $element.style['transform'] = '';
        $element.style['WebkitTransform'] = '';
        $element.style['MozTransform'] = '';
        $element.style['msTransform'] = '';
        $element.style['OTransform'] = '';
    }, ɵ4 = function () {
        if (document['selection']) {
            document['selection'].empty();
        }
        else if (window.getSelection) {
            window.getSelection().removeAllRanges();
        }
    }, ɵ5 = function (element, containerEl) {
        var containerRect = containerEl.getBoundingClientRect();
        var elRect = element.getBoundingClientRect();
        return elRect.left > containerRect.left &&
            elRect.right < containerRect.right &&
            elRect.top > containerRect.top &&
            elRect.bottom < containerRect.bottom;
    }, ɵ6 = function (element, containerEl) {
        var containerRect = containerEl.getBoundingClientRect();
        var elRect = element.getBoundingClientRect();
        var elWidth = elRect.right - elRect.left;
        var elHeight = elRect.bottom - elRect.top;
        return (elRect.left + (elWidth / 2)) > containerRect.left &&
            (elRect.right - (elWidth / 2)) < containerRect.right &&
            (elRect.top + (elHeight / 2)) > containerRect.top &&
            (elRect.bottom - (elHeight / 2)) < containerRect.bottom;
    }, ɵ7 = function (element, containerEl) {
        var containerRect = containerEl.getBoundingClientRect();
        var elRect = element.getBoundingClientRect();
        return elRect.right > containerRect.left &&
            elRect.bottom > containerRect.top &&
            elRect.left < containerRect.right &&
            elRect.top < containerRect.bottom;
    }, ɵ8 = function (event, element) {
        var elRect = element.getBoundingClientRect();
        return event.pageX > elRect.left &&
            event.pageX < elRect.right &&
            event.pageY > elRect.top &&
            event.pageY < elRect.bottom;
    }, ɵ9 = function ($element) {
        var styleObj = window.getComputedStyle($element);
        // NOTE: Manually calculating height because IE's `clientHeight` isn't always
        // reliable.
        return parseFloat(styleObj.getPropertyValue('height')) +
            parseFloat(styleObj.getPropertyValue('padding-top')) +
            parseFloat(styleObj.getPropertyValue('padding-bottom'));
    }, ɵ10 = function (element, parentElement) {
        var parentElementRect = parentElement.getBoundingClientRect();
        var elementRect = element.getBoundingClientRect();
        return {
            top: elementRect.top - parentElementRect.top,
            left: elementRect.left - parentElementRect.left
        };
    };
    var utils = {
        setCssElementPosition: ɵ0,
        resetCSSElementPosition: ɵ1,
        setTransform: ɵ2,
        resetTransform: ɵ3,
        clearSelection: ɵ4,
        isElementFitContainer: ɵ5,
        isElementIntersectContainer: ɵ6,
        isElementTouchContainer: ɵ7,
        isCursorAboveElement: ɵ8,
        getElementOuterHeight: ɵ9,
        getRelativeCoordinates: ɵ10,
        getScrollableContainer: function (node) {
            var regex = /(auto|scroll)/;
            var parents = function (_node, ps) {
                if (_node.parentNode === null) {
                    return ps;
                }
                return parents(_node.parentNode, ps.concat([_node]));
            };
            var style = function (_node, prop) {
                return getComputedStyle(_node, null).getPropertyValue(prop);
            };
            var overflow = function (_node) {
                return (style(_node, 'overflow') + style(_node, 'overflow-y') + style(_node, 'overflow-x'));
            };
            var scroll = function (_node) { return regex.test(overflow(_node)); };
            /* eslint-disable consistent-return */
            var scrollParent = function (_node) {
                if (!(_node instanceof HTMLElement || _node instanceof SVGElement)) {
                    return;
                }
                var ps = parents(_node.parentNode, []);
                for (var i = 0; i < ps.length; i += 1) {
                    if (scroll(ps[i])) {
                        return ps[i];
                    }
                }
                return document.scrollingElement || document.documentElement;
            };
            return scrollParent(node);
        }
    };

    // const GridCol = function(lanes) {
    //     for (let i = 0; i < lanes; i++) {
    //         this.push(null);
    //     }
    // };
    var makeGridCol = function (lanes) {
        var result = [];
        for (var i = 0; i < lanes; i++) {
            result.push(null);
        }
        return result;
    };
    var ɵ0$1 = makeGridCol;
    /**
     * A GridList manages the two-dimensional positions from a list of items,
     * within a virtual matrix.
     *
     * The GridList's main function is to convert the item positions from one
     * grid size to another, maintaining as much of their order as possible.
     *
     * The GridList's second function is to handle collisions when moving an item
     * over another.
     *
     * The positioning algorithm places items in columns. Starting from left to
     * right, going through each column top to bottom.
     *
     * The size of an item is expressed using the number of cols and rows it
     * takes up within the grid (w and h)
     *
     * The position of an item is express using the col and row position within
     * the grid (x and y)
     *
     * An item is an object of structure:
     * {
     *   w: 3, h: 1,
     *   x: 0, y: 1
     * }
     */
    var GridList = /** @class */ (function () {
        function GridList(items, options) {
            this.options = options;
            this.items = items;
            this.adjustSizeOfItems();
            this.generateGrid();
        }
        /**
         * Illustrates grid as text-based table, using a number identifier for each
         * item. E.g.
         *
         *  #|  0  1  2  3  4  5  6  7  8  9 10 11 12 13
         *  --------------------------------------------
         *  0| 00 02 03 04 04 06 08 08 08 12 12 13 14 16
         *  1| 01 -- 03 05 05 07 09 10 11 11 -- 13 15 --
         *
         * Warn: Does not work if items don't have a width or height specified
         * besides their position in the grid.
         */
        GridList.prototype.toString = function () {
            var widthOfGrid = this.grid.length;
            var output = '\n #|', border = '\n --', item, i, j;
            // Render the table header
            for (i = 0; i < widthOfGrid; i++) {
                output += ' ' + this.padNumber(i, ' ');
                border += '---';
            }
            output += border;
            // Render table contents row by row, as we go on the y axis
            for (i = 0; i < this.options.lanes; i++) {
                output += '\n' + this.padNumber(i, ' ') + '|';
                for (j = 0; j < widthOfGrid; j++) {
                    output += ' ';
                    item = this.grid[j][i];
                    output += item
                        ? this.padNumber(this.items.indexOf(item), '0')
                        : '--';
                }
            }
            output += '\n';
            return output;
        };
        GridList.prototype.setOption = function (name, value) {
            this.options[name] = value;
        };
        /**
         * Build the grid structure from scratch, with the current item positions
         */
        GridList.prototype.generateGrid = function () {
            var i;
            this.resetGrid();
            for (i = 0; i < this.items.length; i++) {
                this.markItemPositionToGrid(this.items[i]);
            }
        };
        GridList.prototype.resizeGrid = function (lanes) {
            var currentColumn = 0;
            this.options.lanes = lanes;
            this.adjustSizeOfItems();
            this.sortItemsByPosition();
            this.resetGrid();
            // The items will be sorted based on their index within the this.items array,
            // that is their "1d position"
            for (var i = 0; i < this.items.length; i++) {
                var item = this.items[i], position = this.getItemPosition(item);
                this.updateItemPosition(item, this.findPositionForItem(item, { x: currentColumn, y: 0 }));
                // New items should never be placed to the left of previous items
                currentColumn = Math.max(currentColumn, position.x);
            }
            this.pullItemsToLeft();
        };
        /**
         * This method has two options for the position we want for the item:
         * - Starting from a certain row/column number and only looking for
         *   positions to its right
         * - Accepting positions for a certain row number only (use-case: items
         *   being shifted to the left/right as a result of collisions)
         *
         * @param Object item
         * @param Object start Position from which to start
         *     the search.
         * @param number [fixedRow] If provided, we're going to try to find a
         *     position for the new item on it. If doesn't fit there, we're going
         *     to put it on the first row.
         *
         * @returns Array x and y.
         */
        GridList.prototype.findPositionForItem = function (item, start, fixedRow) {
            var x, y, position;
            // Start searching for a position from the horizontal position of the
            // rightmost item from the grid
            for (x = start.x; x < this.grid.length; x++) {
                if (fixedRow !== undefined) {
                    position = [x, fixedRow];
                    if (this.itemFitsAtPosition(item, position)) {
                        return position;
                    }
                }
                else {
                    for (y = start.y; y < this.options.lanes; y++) {
                        position = [x, y];
                        if (this.itemFitsAtPosition(item, position)) {
                            return position;
                        }
                    }
                }
            }
            // If we've reached this point, we need to start a new column
            var newCol = this.grid.length;
            var newRow = 0;
            if (fixedRow !== undefined &&
                this.itemFitsAtPosition(item, [newCol, fixedRow])) {
                newRow = fixedRow;
            }
            return [newCol, newRow];
        };
        GridList.prototype.moveAndResize = function (item, newPosition, size) {
            var position = this.getItemPosition({
                x: newPosition[0],
                y: newPosition[1],
                w: item.w,
                h: item.h
            });
            var width = size.w || item.w, height = size.h || item.h;
            this.updateItemPosition(item, [position.x, position.y]);
            this.updateItemSize(item, width, height);
            this.resolveCollisions(item);
        };
        GridList.prototype.moveItemToPosition = function (item, newPosition) {
            var position = this.getItemPosition({
                x: newPosition[0],
                y: newPosition[1],
                w: item.w,
                h: item.h
            });
            this.updateItemPosition(item, [position.x, position.y]);
            this.resolveCollisions(item);
        };
        /**
         * Resize an item and resolve collisions.
         *
         * @param Object item A reference to an item that's part of the grid.
         * @param Object size
         * @param number [size.w=item.w] The new width.
         * @param number [size.h=item.h] The new height.
         */
        GridList.prototype.resizeItem = function (item, size) {
            var width = size.w || item.w, height = size.h || item.h;
            this.updateItemSize(item, width, height);
            this.pullItemsToLeft(item);
        };
        /**
         * Compare the current items against a previous snapshot and return only
         * the ones that changed their attributes in the meantime. This includes both
         * position (x, y) and size (w, h)
         *
         * Each item that is returned is not the GridListItem but the helper that holds GridListItem
         * and list of changed properties.
         */
        GridList.prototype.getChangedItems = function (initialItems, breakpoint) {
            return this.items
                .map(function (item) {
                var changes = [];
                var oldValues = {};
                var initItem = initialItems.find(function (initItm) { return initItm.$element === item.$element; });
                if (!initItem) {
                    return { item: item, changes: ['x', 'y', 'w', 'h'], isNew: true };
                }
                var oldX = initItem.getValueX(breakpoint);
                if (item.getValueX(breakpoint) !== oldX) {
                    changes.push('x');
                    if (oldX || oldX === 0) {
                        oldValues.x = oldX;
                    }
                }
                var oldY = initItem.getValueY(breakpoint);
                if (item.getValueY(breakpoint) !== oldY) {
                    changes.push('y');
                    if (oldY || oldY === 0) {
                        oldValues.y = oldY;
                    }
                }
                if (item.getValueW(breakpoint) !==
                    initItem.getValueW(breakpoint)) {
                    changes.push('w');
                    oldValues.w = initItem.w;
                }
                if (item.getValueH(breakpoint) !==
                    initItem.getValueH(breakpoint)) {
                    changes.push('h');
                    oldValues.h = initItem.h;
                }
                return { item: item, oldValues: oldValues, changes: changes, isNew: false };
            })
                .filter(function (itemChange) {
                return itemChange.changes.length;
            });
        };
        GridList.prototype.resolveCollisions = function (item) {
            if (!this.tryToResolveCollisionsLocally(item)) {
                this.pullItemsToLeft(item);
            }
            if (this.options.floating) {
                this.pullItemsToLeft();
            }
            else if (this.getItemsCollidingWithItem(item).length) {
                this.pullItemsToLeft();
            }
        };
        GridList.prototype.pushCollidingItems = function (fixedItem) {
            var _this = this;
            // Start a fresh grid with the fixed item already placed inside
            this.sortItemsByPosition();
            this.resetGrid();
            this.generateGrid();
            this.items
                .filter(function (item) { return !_this.isItemFloating(item) && item !== fixedItem; })
                .forEach(function (item) {
                if (!_this.tryToResolveCollisionsLocally(item)) {
                    _this.pullItemsToLeft(item);
                }
            });
        };
        /**
         * Build the grid from scratch, by using the current item positions and
         * pulling them as much to the left as possible, removing as space between
         * them as possible.
         *
         * If a "fixed item" is provided, its position will be kept intact and the
         * rest of the items will be layed around it.
         */
        GridList.prototype.pullItemsToLeft = function (fixedItem) {
            var _this = this;
            if (this.options.direction === 'none') {
                return;
            }
            // Start a fresh grid with the fixed item already placed inside
            this.sortItemsByPosition();
            this.resetGrid();
            // Start the grid with the fixed item as the first positioned item
            if (fixedItem) {
                var fixedPosition = this.getItemPosition(fixedItem);
                this.updateItemPosition(fixedItem, [
                    fixedPosition.x,
                    fixedPosition.y
                ]);
            }
            this.items
                .filter(function (item) {
                return !item.dragAndDrop && item !== fixedItem;
            })
                .forEach(function (item) {
                var fixedPosition = _this.getItemPosition(item);
                _this.updateItemPosition(item, [
                    fixedPosition.x,
                    fixedPosition.y
                ]);
            });
            for (var i = 0; i < this.items.length; i++) {
                var item = this.items[i], position = this.getItemPosition(item);
                // The fixed item keeps its exact position
                if ((fixedItem && item === fixedItem) ||
                    !item.dragAndDrop ||
                    (!this.options.floating &&
                        this.isItemFloating(item) &&
                        !this.getItemsCollidingWithItem(item).length)) {
                    continue;
                }
                var x = this.findLeftMostPositionForItem(item), newPosition = this.findPositionForItem(item, { x: x, y: 0 }, position.y);
                this.updateItemPosition(item, newPosition);
            }
        };
        GridList.prototype.isOverFixedArea = function (x, y, w, h, item) {
            if (item === void 0) { item = null; }
            var itemData = { x: x, y: y, w: w, h: h };
            if (this.options.direction !== 'horizontal') {
                itemData = { x: y, y: x, w: h, h: w };
            }
            for (var i = itemData.x; i < itemData.x + itemData.w; i++) {
                for (var j = itemData.y; j < itemData.y + itemData.h; j++) {
                    if (this.grid[i] &&
                        this.grid[i][j] &&
                        this.grid[i][j] !== item &&
                        !this.grid[i][j].dragAndDrop) {
                        return true;
                    }
                }
            }
            return false;
        };
        GridList.prototype.checkItemAboveEmptyArea = function (item, newPosition) {
            var itemData = {
                x: newPosition.x,
                y: newPosition.y,
                w: item.w,
                h: item.h
            };
            if (!item.itemPrototype &&
                item.x === newPosition.x &&
                item.y === newPosition.y) {
                return true;
            }
            if (this.options.direction === 'horizontal') {
                itemData = {
                    x: newPosition.y,
                    y: newPosition.x,
                    w: itemData.h,
                    h: itemData.w
                };
            }
            return !this.checkItemsInArea(itemData.y, itemData.y + itemData.h - 1, itemData.x, itemData.x + itemData.w - 1, item);
        };
        GridList.prototype.fixItemsPositions = function (options) {
            var _this = this;
            // items with x, y that fits gird with size of options.lanes
            var validItems = this.items
                .filter(function (item) { return item.itemComponent; })
                .filter(function (item) {
                return _this.isItemValidForGrid(item, options);
            });
            // items that x, y must be generated
            var invalidItems = this.items
                .filter(function (item) { return item.itemComponent; })
                .filter(function (item) { return !_this.isItemValidForGrid(item, options); });
            var gridList = new GridList([], options);
            // put items with defined positions to the grid
            gridList.items = validItems.map(function (item) {
                return item.copyForBreakpoint(options.breakpoint);
            });
            gridList.generateGrid();
            invalidItems.forEach(function (item) {
                // TODO: check if this change does not broke anything
                // const itemCopy = item.copy();
                var itemCopy = item.copyForBreakpoint(options.breakpoint);
                var position = gridList.findPositionForItem(itemCopy, {
                    x: 0,
                    y: 0
                });
                gridList.items.push(itemCopy);
                gridList.setItemPosition(itemCopy, position);
                gridList.markItemPositionToGrid(itemCopy);
            });
            gridList.pullItemsToLeft();
            gridList.pushCollidingItems();
            this.items.forEach(function (itm) {
                var cachedItem = gridList.items.filter(function (cachedItm) {
                    return cachedItm.$element === itm.$element;
                })[0];
                itm.setValueX(cachedItem.x, options.breakpoint);
                itm.setValueY(cachedItem.y, options.breakpoint);
                itm.setValueW(cachedItem.w, options.breakpoint);
                itm.setValueH(cachedItem.h, options.breakpoint);
                itm.autoSize = cachedItem.autoSize;
            });
        };
        GridList.prototype.deleteItemPositionFromGrid = function (item) {
            var position = this.getItemPosition(item);
            var x, y;
            for (x = position.x; x < position.x + position.w; x++) {
                // It can happen to try to remove an item from a position not generated
                // in the grid, probably when loading a persisted grid of items. No need
                // to create a column to be able to remove something from it, though
                if (!this.grid[x]) {
                    continue;
                }
                for (y = position.y; y < position.y + position.h; y++) {
                    // Don't clear the cell if it's been occupied by a different widget in
                    // the meantime (e.g. when an item has been moved over this one, and
                    // thus by continuing to clear this item's previous position you would
                    // cancel the first item's move, leaving it without any position even)
                    if (this.grid[x][y] === item) {
                        this.grid[x][y] = null;
                    }
                }
            }
        };
        GridList.prototype.isItemFloating = function (item) {
            if (item.itemComponent && item.itemComponent.isDragging) {
                return false;
            }
            var position = this.getItemPosition(item);
            if (position.x === 0) {
                return false;
            }
            var rowBelowItem = this.grid[position.x - 1];
            return (rowBelowItem || [])
                .slice(position.y, position.y + position.h)
                .reduce(function (isFloating, cellItem) {
                return isFloating && !cellItem;
            }, true);
        };
        GridList.prototype.isItemValidForGrid = function (item, options) {
            var itemData = options.direction === 'horizontal'
                ? {
                    x: item.getValueY(options.breakpoint),
                    y: item.getValueX(options.breakpoint),
                    w: item.getValueH(options.breakpoint),
                    h: Math.min(item.getValueW(this.options.breakpoint), options.lanes)
                }
                : {
                    x: item.getValueX(options.breakpoint),
                    y: item.getValueY(options.breakpoint),
                    w: Math.min(item.getValueW(this.options.breakpoint), options.lanes),
                    h: item.getValueH(options.breakpoint)
                };
            return (typeof itemData.x === 'number' &&
                typeof itemData.y === 'number' &&
                itemData.x + itemData.w <= options.lanes);
        };
        GridList.prototype.findDefaultPositionHorizontal = function (width, height) {
            var e_1, _a;
            try {
                for (var _b = __values(this.grid), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var col = _c.value;
                    var colIdx = this.grid.indexOf(col);
                    var rowIdx = 0;
                    while (rowIdx < col.length - height + 1) {
                        if (!this.checkItemsInArea(colIdx, colIdx + width - 1, rowIdx, rowIdx + height - 1)) {
                            return [colIdx, rowIdx];
                        }
                        rowIdx++;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return [this.grid.length, 0];
        };
        GridList.prototype.findDefaultPositionVertical = function (width, height) {
            var e_2, _a;
            try {
                for (var _b = __values(this.grid), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var row = _c.value;
                    var rowIdx = this.grid.indexOf(row);
                    var colIdx = 0;
                    while (colIdx < row.length - width + 1) {
                        if (!this.checkItemsInArea(rowIdx, rowIdx + height - 1, colIdx, colIdx + width - 1)) {
                            return [colIdx, rowIdx];
                        }
                        colIdx++;
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return [0, this.grid.length];
        };
        GridList.prototype.checkItemsInArea = function (rowStart, rowEnd, colStart, colEnd, item) {
            for (var i = rowStart; i <= rowEnd; i++) {
                for (var j = colStart; j <= colEnd; j++) {
                    if (this.grid[i] &&
                        this.grid[i][j] &&
                        (item ? this.grid[i][j] !== item : true)) {
                        return true;
                    }
                }
            }
            return false;
        };
        GridList.prototype.sortItemsByPosition = function () {
            var _this = this;
            this.items.sort(function (item1, item2) {
                var position1 = _this.getItemPosition(item1), position2 = _this.getItemPosition(item2);
                // Try to preserve columns.
                if (position1.x !== position2.x) {
                    return position1.x - position2.x;
                }
                if (position1.y !== position2.y) {
                    return position1.y - position2.y;
                }
                // The items are placed on the same position.
                return 0;
            });
        };
        /**
         * Some items can have 100% height or 100% width. Those dimmensions are
         * expressed as 0. We need to ensure a valid width and height for each of
         * those items as the number of items per lane.
         */
        GridList.prototype.adjustSizeOfItems = function () {
            for (var i = 0; i < this.items.length; i++) {
                var item = this.items[i];
                // This can happen only the first time items are checked.
                // We need the property to have a value for all the items so that the
                // `cloneItems` method will merge the properties properly. If we only set
                // it to the items that need it then the following can happen:
                //
                // cloneItems([{id: 1, autoSize: true}, {id: 2}],
                //            [{id: 2}, {id: 1, autoSize: true}]);
                //
                // will result in
                //
                // [{id: 1, autoSize: true}, {id: 2, autoSize: true}]
                if (item.autoSize === undefined) {
                    item.autoSize = item.w === 0 || item.h === 0;
                }
                if (item.autoSize) {
                    if (this.options.direction === 'horizontal') {
                        item.h = this.options.lanes;
                    }
                    else {
                        item.w = this.options.lanes;
                    }
                }
            }
        };
        GridList.prototype.resetGrid = function () {
            this.grid = [];
        };
        /**
         * Check that an item wouldn't overlap with another one if placed at a
         * certain position within the grid
         */
        GridList.prototype.itemFitsAtPosition = function (item, newPosition) {
            var position = this.getItemPosition(item);
            var x, y;
            // No coordonate can be negative
            if (newPosition[0] < 0 || newPosition[1] < 0) {
                return false;
            }
            // Make sure the item isn't larger than the entire grid
            if (newPosition[1] + Math.min(position.h, this.options.lanes) >
                this.options.lanes) {
                return false;
            }
            if (this.isOverFixedArea(item.x, item.y, item.w, item.h)) {
                return false;
            }
            // Make sure the position doesn't overlap with an already positioned
            // item.
            for (x = newPosition[0]; x < newPosition[0] + position.w; x++) {
                var col = this.grid[x];
                // Surely a column that hasn't even been created yet is available
                if (!col) {
                    continue;
                }
                for (y = newPosition[1]; y < newPosition[1] + position.h; y++) {
                    // Any space occupied by an item can continue to be occupied by the
                    // same item.
                    if (col[y] && col[y] !== item) {
                        return false;
                    }
                }
            }
            return true;
        };
        GridList.prototype.updateItemPosition = function (item, position) {
            if (item.x !== null && item.y !== null) {
                this.deleteItemPositionFromGrid(item);
            }
            this.setItemPosition(item, position);
            this.markItemPositionToGrid(item);
        };
        /**
         * @param Object item A reference to a grid item.
         * @param number width The new width.
         * @param number height The new height.
         */
        GridList.prototype.updateItemSize = function (item, width, height) {
            if (item.x !== null && item.y !== null) {
                this.deleteItemPositionFromGrid(item);
            }
            item.w = width;
            item.h = height;
            this.markItemPositionToGrid(item);
        };
        /**
         * Mark the grid cells that are occupied by an item. This prevents items
         * from overlapping in the grid
         */
        GridList.prototype.markItemPositionToGrid = function (item) {
            var position = this.getItemPosition(item);
            var x, y;
            // Ensure that the grid has enough columns to accomodate the current item.
            this.ensureColumns(position.x + position.w);
            for (x = position.x; x < position.x + position.w; x++) {
                for (y = position.y; y < position.y + position.h; y++) {
                    this.grid[x][y] = item;
                }
            }
        };
        /**
         * Ensure that the grid has at least N columns available.
         */
        GridList.prototype.ensureColumns = function (N) {
            for (var i = 0; i < N; i++) {
                if (!this.grid[i]) {
                    this.grid.push(makeGridCol(this.options.lanes));
                }
            }
        };
        GridList.prototype.getItemsCollidingWithItem = function (item) {
            var collidingItems = [];
            for (var i = 0; i < this.items.length; i++) {
                if (item !== this.items[i] &&
                    this.itemsAreColliding(item, this.items[i])) {
                    collidingItems.push(i);
                }
            }
            return collidingItems;
        };
        GridList.prototype.itemsAreColliding = function (item1, item2) {
            var position1 = this.getItemPosition(item1), position2 = this.getItemPosition(item2);
            return !(position2.x >= position1.x + position1.w ||
                position2.x + position2.w <= position1.x ||
                position2.y >= position1.y + position1.h ||
                position2.y + position2.h <= position1.y);
        };
        /**
         * Attempt to resolve the collisions after moving an item over one or more
         * other items within the grid, by shifting the position of the colliding
         * items around the moving one. This might result in subsequent collisions,
         * in which case we will revert all position permutations. To be able to
         * revert to the initial item positions, we create a virtual grid in the
         * process
         */
        GridList.prototype.tryToResolveCollisionsLocally = function (item) {
            var collidingItems = this.getItemsCollidingWithItem(item);
            if (!collidingItems.length) {
                return true;
            }
            var _gridList = new GridList(this.items.map(function (itm) {
                return itm.copy();
            }), this.options);
            var leftOfItem;
            var rightOfItem;
            var aboveOfItem;
            var belowOfItem;
            for (var i = 0; i < collidingItems.length; i++) {
                var collidingItem = _gridList.items[collidingItems[i]], collidingPosition = this.getItemPosition(collidingItem);
                // We use a simple algorithm for moving items around when collisions occur:
                // In this prioritized order, we try to move a colliding item around the
                // moving one:
                // 1. to its left side
                // 2. above it
                // 3. under it
                // 4. to its right side
                var position = this.getItemPosition(item);
                leftOfItem = [
                    position.x - collidingPosition.w,
                    collidingPosition.y
                ];
                rightOfItem = [position.x + position.w, collidingPosition.y];
                aboveOfItem = [
                    collidingPosition.x,
                    position.y - collidingPosition.h
                ];
                belowOfItem = [collidingPosition.x, position.y + position.h];
                if (_gridList.itemFitsAtPosition(collidingItem, leftOfItem)) {
                    _gridList.updateItemPosition(collidingItem, leftOfItem);
                }
                else if (_gridList.itemFitsAtPosition(collidingItem, aboveOfItem)) {
                    _gridList.updateItemPosition(collidingItem, aboveOfItem);
                }
                else if (_gridList.itemFitsAtPosition(collidingItem, belowOfItem)) {
                    _gridList.updateItemPosition(collidingItem, belowOfItem);
                }
                else if (_gridList.itemFitsAtPosition(collidingItem, rightOfItem)) {
                    _gridList.updateItemPosition(collidingItem, rightOfItem);
                }
                else {
                    // Collisions failed, we must use the pullItemsToLeft method to arrange
                    // the other items around this item with fixed position. This is our
                    // plan B for when local collision resolving fails.
                    return false;
                }
            }
            // If we reached this point it means we managed to resolve the collisions
            // from one single iteration, just by moving the colliding items around. So
            // we accept this scenario and merge the branched-out grid instance into the
            // original one
            this.items.forEach(function (itm, idx) {
                var cachedItem = _gridList.items.filter(function (cachedItm) {
                    return cachedItm.$element === itm.$element;
                })[0];
                itm.x = cachedItem.x;
                itm.y = cachedItem.y;
                itm.w = cachedItem.w;
                itm.h = cachedItem.h;
                itm.autoSize = cachedItem.autoSize;
            });
            this.generateGrid();
            return true;
        };
        /**
         * When pulling items to the left, we need to find the leftmost position for
         * an item, with two considerations in mind:
         * - preserving its current row
         * - preserving the previous horizontal order between items
         */
        GridList.prototype.findLeftMostPositionForItem = function (item) {
            var tail = 0;
            var position = this.getItemPosition(item);
            for (var i = 0; i < this.grid.length; i++) {
                for (var j = position.y; j < position.y + position.h; j++) {
                    var otherItem = this.grid[i][j];
                    if (!otherItem) {
                        continue;
                    }
                    var otherPosition = this.getItemPosition(otherItem);
                    if (this.items.indexOf(otherItem) < this.items.indexOf(item)) {
                        tail = otherPosition.x + otherPosition.w;
                    }
                }
            }
            return tail;
        };
        GridList.prototype.findItemByPosition = function (x, y) {
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].x === x && this.items[i].y === y) {
                    return this.items[i];
                }
            }
        };
        GridList.prototype.getItemByAttribute = function (key, value) {
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i][key] === value) {
                    return this.items[i];
                }
            }
            return null;
        };
        GridList.prototype.padNumber = function (nr, prefix) {
            // Currently works for 2-digit numbers (<100)
            return nr >= 10 ? nr : prefix + nr;
        };
        /**
         * If the direction is vertical we need to rotate the grid 90 deg to the
         * left. Thus, we simulate the fact that items are being pulled to the top.
         *
         * Since the items have widths and heights, if we apply the classic
         * counter-clockwise 90 deg rotation
         *
         *     [0 -1]
         *     [1  0]
         *
         * then the top left point of an item will become the bottom left point of
         * the rotated item. To adjust for this, we need to subtract from the y
         * position the height of the original item - the width of the rotated item.
         *
         * However, if we do this then we'll reverse some actions: resizing the
         * width of an item will stretch the item to the left instead of to the
         * right; resizing an item that doesn't fit into the grid will push the
         * items around it instead of going on a new row, etc.
         *
         * We found it better to do a vertical flip of the grid after rotating it.
         * This restores the direction of the actions and greatly simplifies the
         * transformations.
         */
        GridList.prototype.getItemPosition = function (item) {
            if (this.options.direction === 'horizontal') {
                return item;
            }
            else {
                return {
                    x: item.y,
                    y: item.x,
                    w: item.h,
                    h: item.w
                };
            }
        };
        /**
         * See getItemPosition.
         */
        GridList.prototype.setItemPosition = function (item, position) {
            if (this.options.direction === 'horizontal') {
                item.x = position[0];
                item.y = position[1];
            }
            else {
                // We're supposed to subtract the rotated item's height which is actually
                // the non-rotated item's width.
                item.x = position[1];
                item.y = position[0];
            }
        };
        return GridList;
    }());

    var GridsterService = /** @class */ (function () {
        function GridsterService() {
            var _this = this;
            this.items = [];
            this._items = [];
            this._itemsMap = {};
            this.disabledItems = [];
            this.debounceRenderSubject = new rxjs.Subject();
            this.itemRemoveSubject = new rxjs.Subject();
            this.isInit = false;
            this.itemRemoveSubject.pipe(operators.debounceTime(0)).subscribe(function () {
                _this.gridList.pullItemsToLeft();
                _this.render();
                _this.updateCachedItems();
            });
            this.debounceRenderSubject.pipe(operators.debounceTime(0)).subscribe(function () { return _this.render(); });
        }
        GridsterService.prototype.isInitialized = function () {
            return this.isInit;
        };
        /**
         * Must be called before init
         * @param item
         */
        GridsterService.prototype.registerItem = function (item) {
            this.items.push(item);
            return item;
        };
        GridsterService.prototype.init = function (gridsterComponent) {
            this.gridsterComponent = gridsterComponent;
            this.draggableOptions = gridsterComponent.draggableOptions;
            this.gridsterOptions = gridsterComponent.gridsterOptions;
        };
        GridsterService.prototype.start = function () {
            var _this = this;
            this.updateMaxItemSize();
            // Used to highlight a position an element will land on upon drop
            if (this.$positionHighlight) {
                this.removePositionHighlight();
            }
            this.initGridList();
            this.isInit = true;
            setTimeout(function () {
                _this.copyItems();
                _this.fixItemsPositions();
                _this.gridsterComponent.reflowGridster(true);
                _this.gridsterComponent.setReady();
            });
        };
        GridsterService.prototype.initGridList = function () {
            // Create instance of GridList (decoupled lib for handling the grid
            // positioning and sorting post-drag and dropping)
            this.gridList = new GridList(this.items, this.options);
        };
        GridsterService.prototype.render = function () {
            this.updateMaxItemSize();
            this.gridList.generateGrid();
            this.applySizeToItems();
            this.applyPositionToItems();
            this.refreshLines();
        };
        GridsterService.prototype.reflow = function () {
            this.calculateCellSize();
            this.render();
        };
        GridsterService.prototype.fixItemsPositions = function () {
            var _this = this;
            if (this.options.responsiveSizes) {
                this.gridList.fixItemsPositions(this.options);
            }
            else {
                this.gridList.fixItemsPositions(this.gridsterOptions.basicOptions);
                this.gridsterOptions.responsiveOptions.forEach(function (options) {
                    _this.gridList.fixItemsPositions(options);
                });
            }
            this.updateCachedItems();
        };
        GridsterService.prototype.removeItem = function (item) {
            var idx = this.items.indexOf(item);
            if (idx >= 0) {
                this.items.splice(this.items.indexOf(item), 1);
            }
            this.gridList.deleteItemPositionFromGrid(item);
            this.removeItemFromCache(item);
        };
        GridsterService.prototype.onResizeStart = function (item) {
            this.currentElement = item.$element;
            this.copyItems();
            this._maxGridCols = this.gridList.grid.length;
            this.highlightPositionForItem(item);
            this.gridsterComponent.isResizing = true;
            this.refreshLines();
        };
        GridsterService.prototype.onResizeDrag = function (item) {
            var newSize = this.snapItemSizeToGrid(item);
            var sizeChanged = this.dragSizeChanged(newSize);
            var newPosition = this.snapItemPositionToGrid(item);
            var positionChanged = this.dragPositionChanged(newPosition);
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
        };
        GridsterService.prototype.onResizeStop = function (item) {
            this.currentElement = undefined;
            this.updateCachedItems();
            this.previousDragSize = null;
            this.removePositionHighlight();
            this.gridsterComponent.isResizing = false;
            this.gridList.pullItemsToLeft(item);
            this.debounceRenderSubject.next();
            this.fixItemsPositions();
        };
        GridsterService.prototype.onStart = function (item) {
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
        };
        GridsterService.prototype.onDrag = function (item) {
            var newPosition = this.snapItemPositionToGrid(item);
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
        };
        GridsterService.prototype.cancel = function () {
            this.restoreCachedItems();
            this.previousDragPosition = null;
            this.updateMaxItemSize();
            this.applyPositionToItems();
            this.removePositionHighlight();
            this.currentElement = undefined;
            this.gridsterComponent.isDragging = false;
        };
        GridsterService.prototype.onDragOut = function (item) {
            this.cancel();
            var idx = this.items.indexOf(item);
            if (idx >= 0) {
                this.items.splice(idx, 1);
            }
            this.gridList.pullItemsToLeft();
            this.render();
        };
        GridsterService.prototype.onStop = function (item) {
            this.currentElement = undefined;
            this.updateCachedItems();
            this.previousDragPosition = null;
            this.removePositionHighlight();
            this.gridList.pullItemsToLeft(item);
            this.gridsterComponent.isDragging = false;
            this.refreshLines();
        };
        GridsterService.prototype.calculateCellSize = function () {
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
        };
        GridsterService.prototype.applyPositionToItems = function (increaseGridsterSize) {
            if (!this.options.shrink) {
                increaseGridsterSize = true;
            }
            // TODO: Implement group separators
            for (var i = 0; i < this.items.length; i++) {
                // Don't interfere with the positions of the dragged items
                if (this.isCurrentElement(this.items[i].$element)) {
                    continue;
                }
                this.items[i].applyPosition(this);
            }
            var child = this.gridsterComponent.$element.firstChild;
            // Update the width of the entire grid container with enough room on the
            // right to allow dragging items to the end of the grid.
            if (this.options.direction === 'horizontal') {
                var increaseWidthWith = (increaseGridsterSize) ? this.maxItemWidth : 0;
                child.style.height = '';
                child.style.width = ((this.gridList.grid.length + increaseWidthWith) * this.cellWidth) + 'px';
            }
            else if (this.gridList.grid.length) {
                // todo: fix me
                var rowHeights = this.getRowHeights();
                var rowTops = this.getRowTops(rowHeights);
                var height = rowTops[rowTops.length - 1] + rowHeights[rowHeights.length - 1];
                var previousHeight = child.style.height;
                child.style.height = height + 'px';
                child.style.width = '';
                if (previousHeight !== child.style.height) {
                    this.refreshLines();
                }
            }
        };
        GridsterService.prototype.getRowHeights = function () {
            var result = [];
            for (var row = 0; row < this.gridList.grid.length; row++) {
                result.push(0);
                for (var column = 0; column < this.gridList.grid[row].length; column++) {
                    var item = this.gridList.grid[row][column];
                    if (item) {
                        var height = item.contentHeight / item.h;
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
        };
        GridsterService.prototype.getRowTops = function (rowHeights) {
            var e_1, _a;
            var result = [];
            var lastHeight = 0;
            try {
                for (var rowHeights_1 = __values(rowHeights), rowHeights_1_1 = rowHeights_1.next(); !rowHeights_1_1.done; rowHeights_1_1 = rowHeights_1.next()) {
                    var rowHeight = rowHeights_1_1.value;
                    result.push(lastHeight);
                    lastHeight += rowHeight;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (rowHeights_1_1 && !rowHeights_1_1.done && (_a = rowHeights_1.return)) _a.call(rowHeights_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return result;
        };
        GridsterService.prototype.refreshLines = function () {
            var canvas = this.gridsterComponent.$backgroundGrid.nativeElement;
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            var canvasContext = canvas.getContext('2d');
            canvasContext.clearRect(0, 0, canvas.width, canvas.height);
            if (this.options.lines && this.options.lines.visible &&
                (this.gridsterComponent.isDragging || this.gridsterComponent.isResizing || this.options.lines.always)) {
                var linesColor = this.options.lines.color || '#d8d8d8';
                var linesBgColor = this.options.lines.backgroundColor || 'transparent';
                var linesWidth = this.options.lines.width || 1;
                canvasContext.fillStyle = linesBgColor;
                canvasContext.fillRect(0, 0, canvas.width, canvas.height);
                canvasContext.strokeStyle = linesColor;
                canvasContext.lineWidth = linesWidth;
                canvasContext.beginPath();
                // draw row lines
                var rowHeights = this.getRowHeights();
                var rowTops = this.getRowTops(rowHeights);
                for (var i = 0; i < rowTops.length; i++) {
                    canvasContext.moveTo(0, rowTops[i]);
                    canvasContext.lineTo(canvas.width, rowTops[i]);
                }
                // draw column lines
                for (var i = 0; i < this.options.lanes; i++) {
                    canvasContext.moveTo(i * this.cellWidth, 0);
                    canvasContext.lineTo(i * this.cellWidth, canvas.height);
                }
                canvasContext.stroke();
                canvasContext.closePath();
            }
        };
        GridsterService.prototype.removeItemFromCache = function (item) {
            var _this = this;
            this._items = this._items
                .filter(function (cachedItem) { return cachedItem.$element !== item.$element; });
            Object.keys(this._itemsMap)
                .forEach(function (breakpoint) {
                _this._itemsMap[breakpoint] = _this._itemsMap[breakpoint]
                    .filter(function (cachedItem) { return cachedItem.$element !== item.$element; });
            });
        };
        GridsterService.prototype.copyItems = function () {
            var _this = this;
            this._items = this.items
                .filter(function (item) { return _this.isValidGridItem(item); })
                .map(function (item) {
                return item.copyForBreakpoint(null);
            });
            this.gridsterOptions.responsiveOptions.forEach(function (options) {
                _this._itemsMap[options.breakpoint] = _this.items
                    .filter(function (item) { return _this.isValidGridItem(item); })
                    .map(function (item) {
                    return item.copyForBreakpoint(options.breakpoint);
                });
            });
        };
        /**
         * Update maxItemWidth and maxItemHeight vales according to current state of items
         */
        GridsterService.prototype.updateMaxItemSize = function () {
            this.maxItemWidth = Math.max.apply(null, this.items.map(function (item) {
                return item.w;
            }));
            this.maxItemHeight = Math.max.apply(null, this.items.map(function (item) {
                return item.h;
            }));
        };
        /**
         * Update items properties of previously cached items
         */
        GridsterService.prototype.restoreCachedItems = function () {
            var _this = this;
            var items = this.options.breakpoint ? this._itemsMap[this.options.breakpoint] : this._items;
            this.items
                .filter(function (item) { return _this.isValidGridItem(item); })
                .forEach(function (item) {
                var cachedItem = items.filter(function (cachedItm) {
                    return cachedItm.$element === item.$element;
                })[0];
                item.x = cachedItem.x;
                item.y = cachedItem.y;
                item.w = cachedItem.w;
                item.h = cachedItem.h;
                item.autoSize = cachedItem.autoSize;
            });
        };
        /**
         * If item should react on grid
         * @param GridListItem item
         * @returns boolean
         */
        GridsterService.prototype.isValidGridItem = function (item) {
            if (this.options.direction === 'none') {
                return !!item.itemComponent;
            }
            return true;
        };
        GridsterService.prototype.calculateCellWidth = function () {
            var gridsterWidth = parseFloat(window.getComputedStyle(this.gridsterComponent.$element).width);
            return gridsterWidth / this.options.lanes;
        };
        GridsterService.prototype.calculateCellHeight = function () {
            var gridsterHeight = parseFloat(window.getComputedStyle(this.gridsterComponent.$element).height);
            return gridsterHeight / this.options.lanes;
        };
        GridsterService.prototype.applySizeToItems = function () {
            for (var i = 0; i < this.items.length; i++) {
                this.items[i].applySize();
                if (this.options.heightToFontSizeRatio) {
                    this.items[i].$element.style['font-size'] = this._fontSize;
                }
            }
        };
        GridsterService.prototype.isCurrentElement = function (element) {
            if (!this.currentElement) {
                return false;
            }
            return element === this.currentElement;
        };
        GridsterService.prototype.snapItemSizeToGrid = function (item) {
            var itemSize = {
                width: parseInt(item.$element.style.width, 10) - 1,
                height: parseInt(item.$element.style.height, 10) - 1
            };
            var colSize = Math.round(itemSize.width / this.cellWidth);
            var rowSize = Math.round(itemSize.height / this.cellHeight);
            // Keep item minimum 1
            colSize = Math.max(colSize, 1);
            rowSize = Math.max(rowSize, 1);
            // check if element is pinned
            if (this.gridList.isOverFixedArea(item.x, item.y, colSize, rowSize, item)) {
                return [item.w, item.h];
            }
            return [colSize, rowSize];
        };
        GridsterService.prototype.generateItemPosition = function (item) {
            var position;
            if (item.itemPrototype) {
                var coords = item.itemPrototype.getPositionToGridster(this);
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
        };
        GridsterService.prototype.snapItemPositionToGrid = function (item) {
            var position = this.generateItemPosition(item);
            var col = position.x;
            var row = position.y;
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
        };
        GridsterService.prototype.dragSizeChanged = function (newSize) {
            if (!this.previousDragSize) {
                return true;
            }
            return (newSize[0] !== this.previousDragSize[0] ||
                newSize[1] !== this.previousDragSize[1]);
        };
        GridsterService.prototype.dragPositionChanged = function (newPosition) {
            if (!this.previousDragPosition) {
                return true;
            }
            return (newPosition[0] !== this.previousDragPosition[0] ||
                newPosition[1] !== this.previousDragPosition[1]);
        };
        GridsterService.prototype.highlightPositionForItem = function (item) {
            var size = item.calculateSize(this);
            var position = item.calculatePosition(this);
            this.$positionHighlight.style.width = size.width + 'px';
            this.$positionHighlight.style.height = size.height + 'px';
            this.$positionHighlight.style.left = position.left + 'px';
            this.$positionHighlight.style.top = position.top + 'px';
            this.$positionHighlight.style.display = '';
            if (this.options.heightToFontSizeRatio) {
                this.$positionHighlight.style['font-size'] = this._fontSize;
            }
        };
        GridsterService.prototype.updateCachedItems = function () {
            var _this = this;
            // Notify the user with the items that changed since the previous snapshot
            this.triggerOnChange(null);
            this.gridsterOptions.responsiveOptions.forEach(function (options) {
                _this.triggerOnChange(options.breakpoint);
            });
            this.copyItems();
        };
        GridsterService.prototype.triggerOnChange = function (breakpoint) {
            var items = breakpoint ? this._itemsMap[breakpoint] : this._items;
            var changeItems = this.gridList.getChangedItems(items || [], breakpoint);
            changeItems
                .filter(function (itemChange) {
                return itemChange.item.itemComponent;
            })
                .forEach(function (itemChange) {
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
        };
        GridsterService.prototype.removePositionHighlight = function () {
            this.$positionHighlight.style.display = 'none';
        };
        GridsterService = __decorate([
            core.Injectable(),
            __metadata("design:paramtypes", [])
        ], GridsterService);
        return GridsterService;
    }());

    var GridsterPrototypeService = /** @class */ (function () {
        function GridsterPrototypeService() {
            this.isDragging = false;
            this.dragSubject = new rxjs.Subject();
            this.dragStartSubject = new rxjs.Subject();
            this.dragStopSubject = new rxjs.Subject();
        }
        GridsterPrototypeService.prototype.observeDropOver = function (gridster) {
            var _this = this;
            return this.dragStopSubject.pipe(operators.filter(function (data) {
                var gridsterEl = gridster.gridsterComponent.$element;
                var isOverNestedGridster = [].slice.call(gridsterEl.querySelectorAll('gridster'))
                    .reduce(function (isOverGridster, nestedGridsterEl) {
                    return isOverGridster ||
                        _this.isOverGridster(data.item, nestedGridsterEl, data.event, gridster.options);
                }, false);
                if (isOverNestedGridster) {
                    return false;
                }
                return _this.isOverGridster(data.item, gridsterEl, data.event, gridster.options);
            }), operators.tap(function (data) {
                // TODO: what we should provide as a param?
                // prototype.drop.emit({item: prototype.item});
                data.item.onDrop(gridster);
            }));
        };
        GridsterPrototypeService.prototype.observeDropOut = function (gridster) {
            var _this = this;
            return this.dragStopSubject.pipe(operators.filter(function (data) {
                var gridsterEl = gridster.gridsterComponent.$element;
                return !_this.isOverGridster(data.item, gridsterEl, data.event, gridster.options);
            }), operators.tap(function (data) {
                // TODO: what we should provide as a param?
                data.item.onCancel();
            }));
        };
        GridsterPrototypeService.prototype.observeDragOver = function (gridster) {
            var _this = this;
            var over = this.dragSubject.pipe(operators.map(function (data) {
                var gridsterEl = gridster.gridsterComponent.$element;
                return {
                    item: data.item,
                    event: data.event,
                    isOver: _this.isOverGridster(data.item, gridsterEl, data.event, gridster.options),
                    isDrop: false
                };
            }));
            var drop = this.dragStopSubject.pipe(operators.map(function (data) {
                var gridsterEl = gridster.gridsterComponent.$element;
                return {
                    item: data.item,
                    event: data.event,
                    isOver: _this.isOverGridster(data.item, gridsterEl, data.event, gridster.options),
                    isDrop: true
                };
            }));
            var dragExt = rxjs.merge(
            // dragStartSubject is connected in case when item prototype is placed above gridster
            // and drag enter is not fired
            this.dragStartSubject.pipe(operators.map(function () { return ({ item: null, isOver: false, isDrop: false }); })), over, drop).pipe(operators.scan(function (prev, next) {
                return {
                    item: next.item,
                    event: next.event,
                    isOver: next.isOver,
                    isEnter: prev.isOver === false && next.isOver === true,
                    isOut: prev.isOver === true && next.isOver === false && !prev.isDrop,
                    isDrop: next.isDrop
                };
            }), operators.filter(function (data) {
                return !data.isDrop;
            }), operators.share());
            var dragEnter = this.createDragEnterObservable(dragExt, gridster);
            var dragOut = this.createDragOutObservable(dragExt, gridster);
            var dragOver = dragEnter
                .pipe(operators.switchMap(function () { return _this.dragSubject.pipe(operators.takeUntil(dragOut)); }), operators.map(function (data) { return data.item; }));
            return { dragEnter: dragEnter, dragOut: dragOut, dragOver: dragOver };
        };
        GridsterPrototypeService.prototype.dragItemStart = function (item, event) {
            this.isDragging = true;
            this.dragStartSubject.next({ item: item, event: event });
        };
        GridsterPrototypeService.prototype.dragItemStop = function (item, event) {
            this.isDragging = false;
            this.dragStopSubject.next({ item: item, event: event });
        };
        GridsterPrototypeService.prototype.updatePrototypePosition = function (item, event) {
            this.dragSubject.next({ item: item, event: event });
        };
        /**
         * Creates observable that is fired on dragging over gridster container.
         */
        GridsterPrototypeService.prototype.createDragOverObservable = function (dragIsOver, gridster) {
            return dragIsOver.pipe(operators.filter(function (data) { return data.isOver && !data.isEnter && !data.isOut; }), operators.map(function (data) { return data.item; }), operators.tap(function (item) { return item.onOver(gridster); }));
        };
        /**
         * Creates observable that is fired on drag enter gridster container.
         */
        GridsterPrototypeService.prototype.createDragEnterObservable = function (dragIsOver, gridster) {
            return dragIsOver.pipe(operators.filter(function (data) { return data.isEnter; }), operators.map(function (data) { return data.item; }), operators.tap(function (item) { return item.onEnter(gridster); }));
        };
        /**
         * Creates observable that is fired on drag out gridster container.
         */
        GridsterPrototypeService.prototype.createDragOutObservable = function (dragIsOver, gridster) {
            return dragIsOver.pipe(operators.filter(function (data) { return data.isOut; }), operators.map(function (data) { return data.item; }), operators.tap(function (item) { return item.onOut(gridster); }));
        };
        /**
         * Checks whether "element" position fits inside "containerEl" position.
         * It checks if "element" is totally covered by "containerEl" area.
         */
        GridsterPrototypeService.prototype.isOverGridster = function (item, gridsterEl, event, options) {
            var el = item.$element;
            var parentItem = gridsterEl.parentElement &&
                gridsterEl.parentElement.closest('gridster-item');
            if (parentItem) {
                return this.isOverGridster(item, parentItem, event, options);
            }
            switch (options.tolerance) {
                case 'fit':
                    return utils.isElementFitContainer(el, gridsterEl);
                case 'intersect':
                    return utils.isElementIntersectContainer(el, gridsterEl);
                case 'touch':
                    return utils.isElementTouchContainer(el, gridsterEl);
                default:
                    return utils.isCursorAboveElement(event, gridsterEl);
            }
        };
        GridsterPrototypeService = __decorate([
            core.Injectable(),
            __metadata("design:paramtypes", [])
        ], GridsterPrototypeService);
        return GridsterPrototypeService;
    }());

    var GridsterOptions = /** @class */ (function () {
        function GridsterOptions(config, gridsterElement) {
            var _this = this;
            this.defaults = {
                lanes: 5,
                direction: 'horizontal',
                widthHeightRatio: 1,
                shrink: false,
                responsiveView: true,
                responsiveSizes: false,
                responsiveToParent: false,
                dragAndDrop: true,
                resizable: false,
                useCSSTransforms: false,
                floating: true,
                tolerance: 'pointer'
            };
            this.responsiveOptions = [];
            this.breakpointsMap = {
                sm: 576,
                md: 768,
                lg: 992,
                xl: 1200 // Extra large
            };
            var responsiveContainer = config.responsiveToParent ? gridsterElement : window;
            this.basicOptions = config;
            this.responsiveOptions = this.extendResponsiveOptions(config.responsiveOptions || []);
            this.change = rxjs.merge(rxjs.of(this.getOptionsByWidth(this.getElementWidth(responsiveContainer))), rxjs.fromEvent(window, 'resize').pipe(operators.debounceTime(config.responsiveDebounce || 0), operators.map(function (event) { return _this.getOptionsByWidth(_this.getElementWidth(responsiveContainer)); }))).pipe(operators.distinctUntilChanged(null, function (options) { return options.minWidth; }));
        }
        GridsterOptions.prototype.getOptionsByWidth = function (width) {
            var i = 0;
            var options = Object.assign({}, this.defaults, this.basicOptions);
            while (this.responsiveOptions[i]) {
                if (this.responsiveOptions[i].minWidth <= width) {
                    options = this.responsiveOptions[i];
                }
                i++;
            }
            return options;
        };
        GridsterOptions.prototype.extendResponsiveOptions = function (responsiveOptions) {
            var _this = this;
            return responsiveOptions
                // responsive options are valid only with "breakpoint" property
                .filter(function (options) { return options.breakpoint; })
                // set default minWidth if not given
                .map(function (options) {
                return Object.assign({
                    minWidth: _this.breakpointsMap[options.breakpoint] || 0
                }, options);
            })
                .sort(function (curr, next) { return curr.minWidth - next.minWidth; })
                .map(function (options) { return Object.assign({}, _this.defaults, _this.basicOptions, options); });
        };
        GridsterOptions.prototype.getElementWidth = function ($element) {
            if ($element === window) {
                return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            }
            return $element.clientWidth;
        };
        return GridsterOptions;
    }());

    var GridsterComponent = /** @class */ (function () {
        function GridsterComponent(zone, elementRef, gridster, gridsterPrototype) {
            this.zone = zone;
            this.gridsterPrototype = gridsterPrototype;
            this.optionsChange = new core.EventEmitter();
            this.ready = new core.EventEmitter();
            this.reflow = new core.EventEmitter();
            this.prototypeDrop = new core.EventEmitter();
            this.prototypeEnter = new core.EventEmitter();
            this.prototypeOut = new core.EventEmitter();
            this.isDragging = false;
            this.isResizing = false;
            this.isReady = false;
            this.isPrototypeEntered = false;
            this.isDisabled = false;
            this.subscription = new rxjs.Subscription();
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
            this.subscription.add(rxjs.fromEvent(window, 'resize')
                .pipe(operators.debounceTime(this.gridster.options.responsiveDebounce || 0), operators.filter(function () { return _this.gridster.options.responsiveView; }))
                .subscribe(function () { return _this.reload(); }));
            this.zone.runOutsideAngular(function () {
                _this.subscription.add(rxjs.fromEvent(document, 'scroll', { passive: true }).subscribe(function () {
                    return _this.updateGridsterElementData();
                }));
                var scrollableContainer = utils.getScrollableContainer(_this.$element);
                if (scrollableContainer) {
                    _this.subscription.add(rxjs.fromEvent(scrollableContainer, 'scroll', { passive: true })
                        .subscribe(function () {
                        return _this.updateGridsterElementData();
                    }));
                }
            });
            var scrollableContainer = utils.getScrollableContainer(this.$element);
            if (scrollableContainer) {
                this.subscription.add(rxjs.fromEvent(scrollableContainer, 'scroll', { passive: true })
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
                .pipe(operators.publish()));
            var dragObservable = this.gridsterPrototype.observeDragOver(this.gridster);
            dragObservable.dragOver
                .pipe(operators.filter(function () { return !_this.isDisabled; }))
                .subscribe(function (prototype) {
                if (!_this.isPrototypeEntered) {
                    return;
                }
                _this.gridster.onDrag(prototype.item);
            });
            dragObservable.dragEnter
                .pipe(operators.filter(function () { return !_this.isDisabled; }))
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
                .pipe(operators.filter(function () { return !_this.isDisabled; }))
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
                .pipe(operators.filter(function () { return !_this.isDisabled; }))
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
            { type: core.NgZone },
            { type: core.ElementRef },
            { type: GridsterService },
            { type: GridsterPrototypeService }
        ]; };
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], GridsterComponent.prototype, "options", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterComponent.prototype, "optionsChange", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterComponent.prototype, "ready", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterComponent.prototype, "reflow", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterComponent.prototype, "prototypeDrop", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterComponent.prototype, "prototypeEnter", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterComponent.prototype, "prototypeOut", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], GridsterComponent.prototype, "draggableOptions", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", GridsterComponent)
        ], GridsterComponent.prototype, "parent", void 0);
        __decorate([
            core.ViewChild('positionHighlight', { static: true }),
            __metadata("design:type", Object)
        ], GridsterComponent.prototype, "$positionHighlight", void 0);
        __decorate([
            core.ViewChild('backgroundGrid'),
            __metadata("design:type", Object)
        ], GridsterComponent.prototype, "$backgroundGrid", void 0);
        __decorate([
            core.HostBinding('class.gridster--dragging'),
            __metadata("design:type", Object)
        ], GridsterComponent.prototype, "isDragging", void 0);
        __decorate([
            core.HostBinding('class.gridster--resizing'),
            __metadata("design:type", Object)
        ], GridsterComponent.prototype, "isResizing", void 0);
        __decorate([
            core.HostBinding('class.gridster--ready'),
            __metadata("design:type", Object)
        ], GridsterComponent.prototype, "isReady", void 0);
        GridsterComponent = __decorate([
            core.Component({
                selector: 'ngx-gridster',
                template: "<div class=\"gridster-container\">\n      <canvas class=\"gridster-background-grid\" #backgroundGrid></canvas>\n      <ng-content></ng-content>\n      <div class=\"position-highlight\" style=\"display:none;\" #positionHighlight>\n        <div class=\"inner\"></div>\n      </div>\n    </div>",
                providers: [GridsterService],
                changeDetection: core.ChangeDetectionStrategy.OnPush,
                encapsulation: core.ViewEncapsulation.None,
                styles: ["\n            ngx-gridster {\n                position: relative;\n                display: block;\n                left: 0;\n                width: 100%;\n            }\n\n            ngx-gridster.gridster--dragging {\n                -moz-user-select: none;\n                -khtml-user-select: none;\n                -webkit-user-select: none;\n                -ms-user-select: none;\n                user-select: none;\n            }\n\n            ngx-gridster .gridster-container {\n                position: relative;\n                width: 100%;\n                list-style: none;\n                -webkit-transition: width 0.2s, height 0.2s;\n                transition: width 0.2s, height 0.2s;\n            }\n\n    ngx-gridster .position-highlight {\n        display: block;\n        position: absolute;\n        z-index: 1;\n    }\n\n    ngx-gridster .gridster-background-grid {\n        z-index: 0;\n        position: relative;\n        width: 100%;\n        height: 100%\n    }\n    "]
            }),
            __metadata("design:paramtypes", [core.NgZone,
                core.ElementRef,
                GridsterService,
                GridsterPrototypeService])
        ], GridsterComponent);
        return GridsterComponent;
    }());

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

    var DraggableEvent = /** @class */ (function () {
        function DraggableEvent(event) {
            if (event.touches) {
                this.touchEvent = event;
                this.setDataFromTouchEvent(this.touchEvent);
            }
            else {
                this.mouseEvent = event;
                this.setDataFromMouseEvent(this.mouseEvent);
            }
        }
        DraggableEvent.prototype.isTouchEvent = function () {
            return !!this.touchEvent;
        };
        DraggableEvent.prototype.pauseEvent = function () {
            var event = this.touchEvent || this.mouseEvent;
            if (event.stopPropagation) {
                event.stopPropagation();
            }
            if (event.preventDefault) {
                event.preventDefault();
            }
            event.cancelBubble = true;
            event.returnValue = false;
            return false;
        };
        DraggableEvent.prototype.getRelativeCoordinates = function (container) {
            var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
            var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
            var rect = container.getBoundingClientRect();
            return {
                x: this.pageX - rect.left - scrollLeft,
                y: this.pageY - rect.top - scrollTop,
            };
        };
        DraggableEvent.prototype.setDataFromMouseEvent = function (event) {
            this.target = event.target;
            this.clientX = event.clientX;
            this.clientY = event.clientY;
            this.pageX = event.pageX;
            this.pageY = event.pageY;
            this.type = event.type;
        };
        DraggableEvent.prototype.setDataFromTouchEvent = function (event) {
            var touch = event.touches[0] || event.changedTouches[0];
            this.target = event.target;
            this.clientX = touch.clientX;
            this.clientY = touch.clientY;
            this.pageX = touch.pageX;
            this.pageY = touch.pageY;
            this.type = event.type;
        };
        return DraggableEvent;
    }());

    var Draggable = /** @class */ (function () {
        function Draggable(element, config) {
            if (config === void 0) { config = {}; }
            this.mousemove = rxjs.merge(rxjs.fromEvent(document, 'mousemove'), rxjs.fromEvent(document, 'touchmove', { passive: false })).pipe(operators.share());
            this.mouseup = rxjs.merge(rxjs.fromEvent(document, 'mouseup'), rxjs.fromEvent(document, 'touchend'), rxjs.fromEvent(document, 'touchcancel')).pipe(operators.share());
            this.config = {
                handlerClass: null,
                scroll: true,
                scrollEdge: 36,
                scrollDirection: null
            };
            // reference to auto scrolling listeners
            this.autoScrollingInterval = [];
            this.element = element;
            this.mousedown = rxjs.merge(rxjs.fromEvent(element, 'mousedown'), rxjs.fromEvent(element, 'touchstart')).pipe(operators.share());
            this.config = __assign(__assign({}, this.config), config);
            this.dragStart = this.createDragStartObservable().pipe(operators.share());
            this.dragMove = this.createDragMoveObservable(this.dragStart);
            this.dragStop = this.createDragStopObservable(this.dragStart);
            this.fixProblemWithDnDForIE(element);
            this.requestAnimationFrame = window.requestAnimationFrame || (function (callback) { return setTimeout(callback, 1000 / 60); });
            this.cancelAnimationFrame = window.cancelAnimationFrame || (function (cafID) { return clearTimeout(cafID); });
        }
        Draggable.prototype.createDragStartObservable = function () {
            var _this = this;
            return this.mousedown.pipe(operators.map(function (md) { return new DraggableEvent(md); }), operators.filter(function (event) { return _this.isDragingByHandler(event); }), operators.tap(function (e) {
                if (!e.isTouchEvent()) {
                    e.pauseEvent();
                }
                if (document.activeElement) {
                    document.activeElement.blur();
                }
                // prevents rendering performance issues while dragging item with selection inside
                utils.clearSelection();
            }), operators.switchMap(function (startEvent) {
                return _this.mousemove.pipe(operators.map(function (mm) { return new DraggableEvent(mm); }), operators.filter(function (moveEvent) { return _this.inRange(startEvent, moveEvent, 5); }), operators.map(function () { return startEvent; }), operators.takeUntil(_this.mouseup), operators.take(1));
            }));
        };
        Draggable.prototype.createDragMoveObservable = function (dragStart) {
            var _this = this;
            return dragStart.pipe(operators.tap(function (event) {
                _this.addTouchActionNone(event.target);
            }), operators.switchMap(function (startEvent) {
                return _this.mousemove.pipe(operators.skip(1), operators.map(function (mm) { return new DraggableEvent(mm); }), operators.tap(function (event) {
                    event.pauseEvent();
                    startEvent.pauseEvent();
                }), operators.takeUntil(_this.mouseup));
            }), operators.filter(function (val) { return !!val; }), operators.tap(function (event) {
                if (_this.config.scroll) {
                    _this.startScroll(_this.element, event);
                }
            }));
        };
        Draggable.prototype.createDragStopObservable = function (dragStart) {
            var _this = this;
            return dragStart.pipe(operators.switchMap(function () {
                return _this.mouseup.pipe(operators.take(1));
            }), operators.map(function (e) { return new DraggableEvent(e); }), operators.tap(function (e) {
                if (e.target) {
                    _this.removeTouchActionNone(e.target);
                }
                _this.autoScrollingInterval.forEach(function (raf) { return _this.cancelAnimationFrame(raf); });
            }));
        };
        Draggable.prototype.startScroll = function (item, event) {
            var _this = this;
            var scrollContainer = this.getScrollContainer(item);
            this.autoScrollingInterval.forEach(function (raf) { return _this.cancelAnimationFrame(raf); });
            if (scrollContainer) {
                this.startScrollForContainer(event, scrollContainer);
            }
            else {
                this.startScrollForWindow(event);
            }
        };
        Draggable.prototype.startScrollForContainer = function (event, scrollContainer) {
            if (!this.config.scrollDirection || this.config.scrollDirection === 'vertical') {
                this.startScrollVerticallyForContainer(event, scrollContainer);
            }
            if (!this.config.scrollDirection || this.config.scrollDirection === 'horizontal') {
                this.startScrollHorizontallyForContainer(event, scrollContainer);
            }
        };
        Draggable.prototype.startScrollVerticallyForContainer = function (event, scrollContainer) {
            if (event.pageY - this.getOffset(scrollContainer).top < this.config.scrollEdge) {
                this.startAutoScrolling(scrollContainer, -Draggable.SCROLL_SPEED, 'scrollTop');
            }
            else if (this.getOffset(scrollContainer).top +
                scrollContainer.getBoundingClientRect().height -
                event.pageY <
                this.config.scrollEdge) {
                this.startAutoScrolling(scrollContainer, Draggable.SCROLL_SPEED, 'scrollTop');
            }
        };
        Draggable.prototype.startScrollHorizontallyForContainer = function (event, scrollContainer) {
            if (event.pageX - scrollContainer.getBoundingClientRect().left < this.config.scrollEdge) {
                this.startAutoScrolling(scrollContainer, -Draggable.SCROLL_SPEED, 'scrollLeft');
            }
            else if (this.getOffset(scrollContainer).left +
                scrollContainer.getBoundingClientRect().width -
                event.pageX <
                this.config.scrollEdge) {
                this.startAutoScrolling(scrollContainer, Draggable.SCROLL_SPEED, 'scrollLeft');
            }
        };
        Draggable.prototype.startScrollForWindow = function (event) {
            if (!this.config.scrollDirection || this.config.scrollDirection === 'vertical') {
                this.startScrollVerticallyForWindow(event);
            }
            if (!this.config.scrollDirection || this.config.scrollDirection === 'horizontal') {
                this.startScrollHorizontallyForWindow(event);
            }
        };
        Draggable.prototype.startScrollVerticallyForWindow = function (event) {
            var scrollingElement = document.scrollingElement || document.documentElement || document.body;
            // NOTE: Using `window.pageYOffset` here because IE doesn't have `window.scrollY`.
            if (event.pageY - window.pageYOffset < this.config.scrollEdge) {
                this.startAutoScrolling(scrollingElement, -Draggable.SCROLL_SPEED, 'scrollTop');
            }
            else if (window.innerHeight - (event.pageY - window.pageYOffset) <
                this.config.scrollEdge) {
                this.startAutoScrolling(scrollingElement, Draggable.SCROLL_SPEED, 'scrollTop');
            }
        };
        Draggable.prototype.startScrollHorizontallyForWindow = function (event) {
            var scrollingElement = document.scrollingElement || document.documentElement || document.body;
            // NOTE: Using `window.pageXOffset` here because IE doesn't have `window.scrollX`.
            if (event.pageX - window.pageXOffset < this.config.scrollEdge) {
                this.startAutoScrolling(scrollingElement, -Draggable.SCROLL_SPEED, 'scrollLeft');
            }
            else if (window.innerWidth - (event.pageX - window.pageXOffset) <
                this.config.scrollEdge) {
                this.startAutoScrolling(scrollingElement, Draggable.SCROLL_SPEED, 'scrollLeft');
            }
        };
        Draggable.prototype.getScrollContainer = function (node) {
            var nodeOuterHeight = utils.getElementOuterHeight(node);
            if (node.scrollHeight > Math.ceil(nodeOuterHeight)) {
                return node;
            }
            if (!new RegExp('(body|html)', 'i').test(node.parentNode.tagName)) {
                return this.getScrollContainer(node.parentNode);
            }
            return null;
        };
        Draggable.prototype.startAutoScrolling = function (node, amount, direction) {
            this.autoScrollingInterval.push(this.requestAnimationFrame(function () {
                this.startAutoScrolling(node, amount, direction);
            }.bind(this)));
            return (node[direction] += amount * 0.25);
        };
        Draggable.prototype.getOffset = function (el) {
            var rect = el.getBoundingClientRect();
            return {
                left: rect.left + this.getScroll('scrollLeft', 'pageXOffset'),
                top: rect.top + this.getScroll('scrollTop', 'pageYOffset')
            };
        };
        Draggable.prototype.getScroll = function (scrollProp, offsetProp) {
            if (typeof window[offsetProp] !== 'undefined') {
                return window[offsetProp];
            }
            if (document.documentElement.clientHeight) {
                return document.documentElement[scrollProp];
            }
            return document.body[scrollProp];
        };
        Draggable.prototype.isDragingByHandler = function (event) {
            if (!this.isValidDragHandler(event.target)) {
                return false;
            }
            return (!this.config.handlerClass ||
                (this.config.handlerClass &&
                    this.hasElementWithClass(this.config.handlerClass, event.target)));
        };
        Draggable.prototype.isValidDragHandler = function (targetEl) {
            return ['input', 'textarea'].indexOf(targetEl.tagName.toLowerCase()) === -1;
        };
        Draggable.prototype.inRange = function (startEvent, moveEvent, range) {
            return (Math.abs(moveEvent.clientX - startEvent.clientX) > range ||
                Math.abs(moveEvent.clientY - startEvent.clientY) > range);
        };
        Draggable.prototype.hasElementWithClass = function (className, target) {
            while (target !== this.element) {
                if (target.classList.contains(className)) {
                    return true;
                }
                target = target.parentElement;
            }
            return false;
        };
        Draggable.prototype.pauseEvent = function (e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.cancelBubble = true;
            e.returnValue = false;
        };
        Draggable.prototype.fixProblemWithDnDForIE = function (element) {
            if (this.isTouchDevice() && this.isIEorEdge() && element.style) {
                element.style['touch-action'] = 'none';
            }
        };
        Draggable.prototype.removeTouchActionNone = function (element) {
            if (!element.style) {
                return;
            }
            element.style['touch-action'] = '';
        };
        Draggable.prototype.addTouchActionNone = function (element) {
            if (!element.style) {
                return;
            }
            element.style['touch-action'] = 'none';
        };
        Draggable.prototype.isTouchDevice = function () {
            return ('ontouchstart' in window || navigator.maxTouchPoints // works on most browsers
            ); // works on IE10/11 and Surface
        };
        Draggable.prototype.isIEorEdge = function () {
            var ua = window.navigator.userAgent;
            var msie = ua.indexOf('MSIE ');
            if (msie > 0) {
                // IE 10 or older => return version number
                return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
            }
            var trident = ua.indexOf('Trident/');
            if (trident > 0) {
                // IE 11 => return version number
                var rv = ua.indexOf('rv:');
                return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
            }
            var edge = ua.indexOf('Edge/');
            if (edge > 0) {
                // Edge (IE 12+) => return version number
                return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
            }
            // other browser
            return false;
        };
        Draggable.SCROLL_SPEED = 20;
        return Draggable;
    }());

    var GridsterItemComponent = /** @class */ (function () {
        function GridsterItemComponent(zone, elementRef, gridster) {
            this.zone = zone;
            this.xChange = new core.EventEmitter(true);
            this.yChange = new core.EventEmitter(true);
            this.xSmChange = new core.EventEmitter(true);
            this.ySmChange = new core.EventEmitter(true);
            this.xMdChange = new core.EventEmitter(true);
            this.yMdChange = new core.EventEmitter(true);
            this.xLgChange = new core.EventEmitter(true);
            this.yLgChange = new core.EventEmitter(true);
            this.xXlChange = new core.EventEmitter(true);
            this.yXlChange = new core.EventEmitter(true);
            this.wChange = new core.EventEmitter(true);
            this.hChange = new core.EventEmitter(true);
            this.wSmChange = new core.EventEmitter(true);
            this.hSmChange = new core.EventEmitter(true);
            this.wMdChange = new core.EventEmitter(true);
            this.hMdChange = new core.EventEmitter(true);
            this.wLgChange = new core.EventEmitter(true);
            this.hLgChange = new core.EventEmitter(true);
            this.wXlChange = new core.EventEmitter(true);
            this.hXlChange = new core.EventEmitter(true);
            this.change = new core.EventEmitter(true);
            this.start = new core.EventEmitter(true);
            this.end = new core.EventEmitter(true);
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
            { type: core.NgZone },
            { type: core.ElementRef, decorators: [{ type: core.Inject, args: [core.ElementRef,] }] },
            { type: GridsterService, decorators: [{ type: core.Inject, args: [GridsterService,] }] }
        ]; };
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GridsterItemComponent.prototype, "x", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterItemComponent.prototype, "xChange", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GridsterItemComponent.prototype, "y", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterItemComponent.prototype, "yChange", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GridsterItemComponent.prototype, "xSm", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterItemComponent.prototype, "xSmChange", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GridsterItemComponent.prototype, "ySm", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterItemComponent.prototype, "ySmChange", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GridsterItemComponent.prototype, "xMd", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterItemComponent.prototype, "xMdChange", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GridsterItemComponent.prototype, "yMd", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterItemComponent.prototype, "yMdChange", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GridsterItemComponent.prototype, "xLg", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterItemComponent.prototype, "xLgChange", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GridsterItemComponent.prototype, "yLg", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterItemComponent.prototype, "yLgChange", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GridsterItemComponent.prototype, "xXl", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterItemComponent.prototype, "xXlChange", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GridsterItemComponent.prototype, "yXl", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterItemComponent.prototype, "yXlChange", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GridsterItemComponent.prototype, "w", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterItemComponent.prototype, "wChange", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GridsterItemComponent.prototype, "h", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterItemComponent.prototype, "hChange", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GridsterItemComponent.prototype, "wSm", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterItemComponent.prototype, "wSmChange", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GridsterItemComponent.prototype, "hSm", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterItemComponent.prototype, "hSmChange", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GridsterItemComponent.prototype, "wMd", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterItemComponent.prototype, "wMdChange", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GridsterItemComponent.prototype, "hMd", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterItemComponent.prototype, "hMdChange", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GridsterItemComponent.prototype, "wLg", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterItemComponent.prototype, "wLgChange", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GridsterItemComponent.prototype, "hLg", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterItemComponent.prototype, "hLgChange", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GridsterItemComponent.prototype, "wXl", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterItemComponent.prototype, "wXlChange", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GridsterItemComponent.prototype, "hXl", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterItemComponent.prototype, "hXlChange", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterItemComponent.prototype, "change", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterItemComponent.prototype, "start", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterItemComponent.prototype, "end", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], GridsterItemComponent.prototype, "dragAndDrop", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], GridsterItemComponent.prototype, "resizable", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], GridsterItemComponent.prototype, "options", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], GridsterItemComponent.prototype, "variableHeight", void 0);
        __decorate([
            core.ViewChild('contentWrapper'),
            __metadata("design:type", core.ElementRef)
        ], GridsterItemComponent.prototype, "contentWrapper", void 0);
        __decorate([
            core.HostBinding('class.is-dragging'),
            __metadata("design:type", Object)
        ], GridsterItemComponent.prototype, "isDragging", void 0);
        __decorate([
            core.HostBinding('class.is-resizing'),
            __metadata("design:type", Object)
        ], GridsterItemComponent.prototype, "isResizing", void 0);
        GridsterItemComponent = __decorate([
            core.Component({
                selector: 'ngx-gridster-item',
                template: "<div class=\"gridster-item-inner\" [ngStyle]=\"{position: variableHeight ? 'relative' : ''}\">\n      <span #contentWrapper class=\"gridster-content-wrapper\">\n        <ng-content></ng-content>\n      </span>\n      <div class=\"gridster-item-resizable-handler handle-s\"></div>\n      <div class=\"gridster-item-resizable-handler handle-e\"></div>\n      <div class=\"gridster-item-resizable-handler handle-n\"></div>\n      <div class=\"gridster-item-resizable-handler handle-w\"></div>\n      <div class=\"gridster-item-resizable-handler handle-se\"></div>\n      <div class=\"gridster-item-resizable-handler handle-ne\"></div>\n      <div class=\"gridster-item-resizable-handler handle-sw\"></div>\n      <div class=\"gridster-item-resizable-handler handle-nw\"></div>\n    </div>",
                changeDetection: core.ChangeDetectionStrategy.OnPush,
                encapsulation: core.ViewEncapsulation.None,
                styles: ["\n    ngx-gridster-item {\n        display: block;\n        position: absolute;\n        top: 0;\n        left: 0;\n        z-index: 1;\n        -webkit-transition: none;\n        transition: none;\n    }\n\n    .gridster--ready ngx-gridster-item {\n        transition: all 200ms ease;\n        transition-property: left, top;\n    }\n\n    .gridster--ready.css-transform ngx-gridster-item  {\n        transition-property: transform;\n    }\n\n    .gridster--ready ngx-gridster-item.is-dragging,\n    .gridster--ready ngx-gridster-item.is-resizing {\n        -webkit-transition: none;\n        transition: none;\n        z-index: 9999;\n    }\n\n    ngx-gridster-item.no-transition {\n        -webkit-transition: none;\n        transition: none;\n    }\n    ngx-gridster-item .gridster-item-resizable-handler {\n        position: absolute;\n        z-index: 2;\n        display: none;\n    }\n\n    ngx-gridster-item .gridster-item-resizable-handler.handle-n {\n      cursor: n-resize;\n      height: 10px;\n      right: 0;\n      top: 0;\n      left: 0;\n    }\n\n    ngx-gridster-item .gridster-item-resizable-handler.handle-e {\n      cursor: e-resize;\n      width: 10px;\n      bottom: 0;\n      right: 0;\n      top: 0;\n    }\n\n    ngx-gridster-item .gridster-item-resizable-handler.handle-s {\n      cursor: s-resize;\n      height: 10px;\n      right: 0;\n      bottom: 0;\n      left: 0;\n    }\n\n    ngx-gridster-item .gridster-item-resizable-handler.handle-w {\n      cursor: w-resize;\n      width: 10px;\n      left: 0;\n      top: 0;\n      bottom: 0;\n    }\n\n    ngx-gridster-item .gridster-item-resizable-handler.handle-ne {\n      cursor: ne-resize;\n      width: 10px;\n      height: 10px;\n      right: 0;\n      top: 0;\n    }\n\n    ngx-gridster-item .gridster-item-resizable-handler.handle-nw {\n      cursor: nw-resize;\n      width: 10px;\n      height: 10px;\n      left: 0;\n      top: 0;\n    }\n\n    ngx-gridster-item .gridster-item-resizable-handler.handle-se {\n      cursor: se-resize;\n      width: 0;\n      height: 0;\n      right: 0;\n      bottom: 0;\n      border-style: solid;\n      border-width: 0 0 10px 10px;\n      border-color: transparent;\n    }\n\n    ngx-gridster-item .gridster-item-resizable-handler.handle-sw {\n      cursor: sw-resize;\n      width: 10px;\n      height: 10px;\n      left: 0;\n      bottom: 0;\n    }\n\n    ngx-gridster-item:hover .gridster-item-resizable-handler.handle-se {\n      border-color: transparent transparent #ccc\n    }\n    "]
            }),
            __param(1, core.Inject(core.ElementRef)),
            __param(2, core.Inject(GridsterService)),
            __metadata("design:paramtypes", [core.NgZone,
                core.ElementRef,
                GridsterService])
        ], GridsterItemComponent);
        return GridsterItemComponent;
    }());

    var GridsterItemPrototypeDirective = /** @class */ (function () {
        function GridsterItemPrototypeDirective(zone, elementRef, gridsterPrototype) {
            this.zone = zone;
            this.elementRef = elementRef;
            this.gridsterPrototype = gridsterPrototype;
            this.drop = new core.EventEmitter();
            this.start = new core.EventEmitter();
            this.cancel = new core.EventEmitter();
            this.enter = new core.EventEmitter();
            this.out = new core.EventEmitter();
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
            var scrollSub = rxjs.fromEvent(document, 'scroll')
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
            { type: core.NgZone },
            { type: core.ElementRef },
            { type: GridsterPrototypeService }
        ]; };
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterItemPrototypeDirective.prototype, "drop", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterItemPrototypeDirective.prototype, "start", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterItemPrototypeDirective.prototype, "cancel", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterItemPrototypeDirective.prototype, "enter", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], GridsterItemPrototypeDirective.prototype, "out", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], GridsterItemPrototypeDirective.prototype, "data", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], GridsterItemPrototypeDirective.prototype, "config", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GridsterItemPrototypeDirective.prototype, "w", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GridsterItemPrototypeDirective.prototype, "wSm", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GridsterItemPrototypeDirective.prototype, "wMd", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GridsterItemPrototypeDirective.prototype, "wLg", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GridsterItemPrototypeDirective.prototype, "wXl", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GridsterItemPrototypeDirective.prototype, "h", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GridsterItemPrototypeDirective.prototype, "hSm", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GridsterItemPrototypeDirective.prototype, "hMd", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GridsterItemPrototypeDirective.prototype, "hLg", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GridsterItemPrototypeDirective.prototype, "hXl", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], GridsterItemPrototypeDirective.prototype, "variableHeight", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], GridsterItemPrototypeDirective.prototype, "variableHeightContainToRow", void 0);
        GridsterItemPrototypeDirective = __decorate([
            core.Directive({
                selector: '[ngxGridsterItemPrototype]'
            }),
            __metadata("design:paramtypes", [core.NgZone,
                core.ElementRef,
                GridsterPrototypeService])
        ], GridsterItemPrototypeDirective);
        return GridsterItemPrototypeDirective;
    }());

    var GridsterModule = /** @class */ (function () {
        function GridsterModule() {
        }
        GridsterModule_1 = GridsterModule;
        GridsterModule.forRoot = function () {
            return {
                ngModule: GridsterModule_1,
                providers: [GridsterPrototypeService]
            };
        };
        var GridsterModule_1;
        GridsterModule = GridsterModule_1 = __decorate([
            core.NgModule({
                imports: [
                    common.CommonModule
                ],
                declarations: [
                    GridsterComponent,
                    GridsterItemComponent,
                    GridsterItemPrototypeDirective
                ],
                exports: [
                    GridsterComponent,
                    GridsterItemComponent,
                    GridsterItemPrototypeDirective
                ]
            })
        ], GridsterModule);
        return GridsterModule;
    }());

    exports.GridList = GridList;
    exports.GridListItem = GridListItem;
    exports.GridsterComponent = GridsterComponent;
    exports.GridsterItemComponent = GridsterItemComponent;
    exports.GridsterItemPrototypeDirective = GridsterItemPrototypeDirective;
    exports.GridsterModule = GridsterModule;
    exports.GridsterOptions = GridsterOptions;
    exports.GridsterPrototypeService = GridsterPrototypeService;
    exports.GridsterService = GridsterService;
    exports.ɵ0 = ɵ0$1;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=angular2gridster.umd.js.map
