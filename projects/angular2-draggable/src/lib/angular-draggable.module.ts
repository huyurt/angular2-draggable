import { NgModule } from '@angular/core';
import { AngularDraggableDirective } from './angular-draggable.directive';
import { AngularResizableDirective } from './angular-resizable.directive';
import { AngularClosableDirective } from './angular-closable.directive';

@NgModule({
  imports: [
  ],
  declarations: [
    AngularDraggableDirective,
    AngularResizableDirective,
    AngularClosableDirective
  ],
  exports: [
    AngularDraggableDirective,
    AngularResizableDirective,
    AngularClosableDirective
  ]
})
export class AngularDraggableModule { }
