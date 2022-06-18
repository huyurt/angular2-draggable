import { NgModule } from '@angular/core';
import { AngularDraggableDirective } from './angular-draggable.directive';
import { AngularResizableDirective } from './angular-resizable.directive';
import { AngularClosableDirective } from './angular-closable.directive';
import { AngularResizableTableDirective } from './angular-resizable-table.directive';

@NgModule({
  imports: [
  ],
  declarations: [
    AngularDraggableDirective,
    AngularResizableDirective,
    AngularClosableDirective,
    AngularResizableTableDirective
  ],
  exports: [
    AngularDraggableDirective,
    AngularResizableDirective,
    AngularClosableDirective,
    AngularResizableTableDirective
  ]
})
export class AngularDraggableModule { }
