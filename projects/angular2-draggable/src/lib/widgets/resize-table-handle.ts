import { Renderer2 } from '@angular/core';

export class ResizeTableHandle {
  protected _handle: HTMLElement;
  private _onResize;

  constructor(
    protected parent: Element,
    protected renderer: Renderer2,
    private onMouseDown: any
  ) {
    // generate handle div
    let handle = renderer.createElement('div');
    renderer.addClass(handle, 'ng-resizable-resize-handle');

    // append div to parent
    if (this.parent) {
      parent.appendChild(handle);
    }

    // create and register event listener
    this._onResize = (event) => { onMouseDown(event, this); };
    handle.addEventListener('mousedown', this._onResize, { passive: false });
    handle.addEventListener('touchstart', this._onResize, { passive: false });

    // done
    this._handle = handle;
  }

  dispose() {
    this._handle.removeEventListener('mousedown', this._onResize);
    this._handle.removeEventListener('touchstart', this._onResize);

    if (this.parent) {
      this.parent.removeChild(this._handle);
    }
    this._handle = null;
    this._onResize = null;
  }

  get el(): HTMLElement {
    return this._handle;
  }
}
