import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridsterComponent } from './gridster.component';
import { GridsterItemComponent } from './gridster-item/gridster-item.component';
import { GridsterItemPrototypeDirective } from './gridster-prototype/gridster-item-prototype.directive';
import { GridsterPrototypeService } from './gridster-prototype/gridster-prototype.service';
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
        NgModule({
            imports: [
                CommonModule
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
export { GridsterModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZHN0ZXIubW9kdWxlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhcjJncmlkc3Rlci8iLCJzb3VyY2VzIjpbImxpYi9ncmlkc3Rlci5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQXVCLE1BQU0sZUFBZSxDQUFDO0FBQzlELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUUvQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUN6RCxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUNoRixPQUFPLEVBQUUsOEJBQThCLEVBQUUsTUFBTSx3REFBd0QsQ0FBQztBQUN4RyxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxpREFBaUQsQ0FBQztBQWlCM0Y7SUFBQTtJQU9BLENBQUM7dUJBUFksY0FBYztJQUNoQixzQkFBTyxHQUFkO1FBQ0EsT0FBTztZQUNILFFBQVEsRUFBRSxnQkFBYztZQUN4QixTQUFTLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQztTQUN4QyxDQUFDO0lBQ04sQ0FBQzs7SUFOWSxjQUFjO1FBZjFCLFFBQVEsQ0FBQztZQUNOLE9BQU8sRUFBRTtnQkFDTCxZQUFZO2FBQ2Y7WUFDRCxZQUFZLEVBQUU7Z0JBQ1YsaUJBQWlCO2dCQUNqQixxQkFBcUI7Z0JBQ3JCLDhCQUE4QjthQUNqQztZQUNELE9BQU8sRUFBRTtnQkFDTCxpQkFBaUI7Z0JBQ2pCLHFCQUFxQjtnQkFDckIsOEJBQThCO2FBQ2pDO1NBQ0osQ0FBQztPQUNXLGNBQWMsQ0FPMUI7SUFBRCxxQkFBQztDQUFBLEFBUEQsSUFPQztTQVBZLGNBQWMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ01vZHVsZSwgTW9kdWxlV2l0aFByb3ZpZGVycyB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcblxuaW1wb3J0IHsgR3JpZHN0ZXJDb21wb25lbnQgfSBmcm9tICcuL2dyaWRzdGVyLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBHcmlkc3Rlckl0ZW1Db21wb25lbnQgfSBmcm9tICcuL2dyaWRzdGVyLWl0ZW0vZ3JpZHN0ZXItaXRlbS5jb21wb25lbnQnO1xuaW1wb3J0IHsgR3JpZHN0ZXJJdGVtUHJvdG90eXBlRGlyZWN0aXZlIH0gZnJvbSAnLi9ncmlkc3Rlci1wcm90b3R5cGUvZ3JpZHN0ZXItaXRlbS1wcm90b3R5cGUuZGlyZWN0aXZlJztcbmltcG9ydCB7IEdyaWRzdGVyUHJvdG90eXBlU2VydmljZSB9IGZyb20gJy4vZ3JpZHN0ZXItcHJvdG90eXBlL2dyaWRzdGVyLXByb3RvdHlwZS5zZXJ2aWNlJztcblxuQE5nTW9kdWxlKHtcbiAgICBpbXBvcnRzOiBbXG4gICAgICAgIENvbW1vbk1vZHVsZVxuICAgIF0sXG4gICAgZGVjbGFyYXRpb25zOiBbXG4gICAgICAgIEdyaWRzdGVyQ29tcG9uZW50LFxuICAgICAgICBHcmlkc3Rlckl0ZW1Db21wb25lbnQsXG4gICAgICAgIEdyaWRzdGVySXRlbVByb3RvdHlwZURpcmVjdGl2ZVxuICAgIF0sXG4gICAgZXhwb3J0czogW1xuICAgICAgICBHcmlkc3RlckNvbXBvbmVudCxcbiAgICAgICAgR3JpZHN0ZXJJdGVtQ29tcG9uZW50LFxuICAgICAgICBHcmlkc3Rlckl0ZW1Qcm90b3R5cGVEaXJlY3RpdmVcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIEdyaWRzdGVyTW9kdWxlIHtcbiAgICBzdGF0aWMgZm9yUm9vdCgpOiBNb2R1bGVXaXRoUHJvdmlkZXJzPEdyaWRzdGVyTW9kdWxlPiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgbmdNb2R1bGU6IEdyaWRzdGVyTW9kdWxlLFxuICAgICAgICBwcm92aWRlcnM6IFtHcmlkc3RlclByb3RvdHlwZVNlcnZpY2VdXG4gICAgfTtcbn1cbn1cblxuIl19