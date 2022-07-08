import {Renderer2} from '@angular/core';

export class MoveHandle {
  protected _handle: Element;
  private _onClick;

  constructor(
    protected parent: Element,
    protected renderer: Renderer2,
    private onMouseDown: any,
    private onMouseUp: any = () => {}
  ) {
    // generate handle div
    let handle = renderer.createElement('div');
    renderer.addClass(handle, 'ng-movable');

    // append div to parent
    if (this.parent) {
      parent.appendChild(handle);
    }

    // create and register event listener
    this._onClick = (event) => { onMouseDown(event, this); };
    handle.addEventListener('mousedown', this._onClick, {passive: false});
    handle.addEventListener('touchstart', this._onClick, {passive: false});
    handle.addEventListener('mouseup', this.onMouseUp, {passive: false});
    handle.addEventListener('touchend', this.onMouseUp, {passive: false});

    // done
    this._handle = handle;
  }

  dispose() {
    this._handle.removeEventListener('mousedown', this._onClick);
    this._handle.removeEventListener('touchstart', this._onClick);
    this._handle.removeEventListener('mouseup', this.onMouseUp);
    this._handle.removeEventListener('touchend', this.onMouseUp);

    if (this.parent) {
      this.parent.removeChild(this._handle);
      this.parent.remove();
    }
    this._handle = null;
    this._onClick = null;
  }

  get el() {
    return this._handle;
  }
}
