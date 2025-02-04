import { Directive, ElementRef, Input, OnChanges, OnDestroy, OnInit, Renderer2, SimpleChanges } from '@angular/core';
import { CloseHandle } from './widgets/close-handle';
import { fromEvent, Subscription } from 'rxjs';

@Directive({
  selector: '[ngClosable]',
  exportAs: 'ngClosable'
})
export class AngularClosableDirective implements OnInit, OnChanges, OnDestroy {
  private _closable = true;
  private _handleClosing: CloseHandle = null;
  private _containment: HTMLElement = null;
  private draggingSub: Subscription = null;

  /** Whether to prevent default event */
  @Input() preventDefaultEvent = true;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {
  }

  /** Disables the closable if set to false. */
  @Input() set ngClosable(v: any) {
    if (v !== undefined && v !== null && v !== '') {
      this._closable = !!v;
      this.updateClosable();
    }
  }

  ngOnInit() {
    this.updateClosable();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['rzHandles'] && !changes['rzHandles'].isFirstChange()) {
      this.updateClosable();
    }
  }

  ngOnDestroy() {
    this._containment = null;

    if (this._handleClosing) {
      this._handleClosing.dispose();
      this._handleClosing = null;
    }
  }

  private updateClosable() {
    const element = this.el.nativeElement;

    // clear handles:
    this.renderer.removeClass(element, 'ng-closable');

    // create new ones:
    if (this._closable) {
      this._handleClosing = new CloseHandle(element, this.renderer, this.onMouseUp.bind(this), this.onMouseDown.bind(this));
    }
  }

  onMouseDown(event: MouseEvent | TouchEvent) {
    // skip right click;
    if (event instanceof MouseEvent && event.button === 2) {
      return;
    }

    if (this.preventDefaultEvent) {
      // prevent default events
      event.stopPropagation();
      event.preventDefault();
    }

    if (!this._handleClosing) {
      this.subscribeEvents();
    }
  }

  onMouseUp(event: MouseEvent | TouchEvent) {
    // skip right click;
    if (event instanceof MouseEvent && event.button === 2) {
      return;
    }

    if (this.preventDefaultEvent) {
      // prevent default events
      event.stopPropagation();
      event.preventDefault();
    }

    if (this._handleClosing && this._closable) {
      this._handleClosing.dispose();
    }
  }

  private subscribeEvents() {
    this.draggingSub = fromEvent(document, 'mousemove', { passive: false }).subscribe(event => this.onMouseMove());
    this.draggingSub.add(fromEvent(document, 'touchmove', { passive: false }).subscribe(event => this.onMouseMove()));
    this.draggingSub.add(fromEvent(document, 'mouseup', { passive: false }).subscribe(() => this.putBack()));
    // fix for issue #164
    let isIEOrEdge = /msie\s|trident\//i.test(window.navigator.userAgent);
    if (!isIEOrEdge) {
      this.draggingSub.add(fromEvent(document, 'mouseleave', { passive: false }).subscribe(() => this.putBack()));
    }
    this.draggingSub.add(fromEvent(document, 'touchend', { passive: false }).subscribe(() => this.putBack()));
    this.draggingSub.add(fromEvent(document, 'touchcancel', { passive: false }).subscribe(() => this.putBack()));
  }

  private unsubscribeEvents() {
    this.draggingSub.unsubscribe();
    this.draggingSub = null;
  }

  onMouseMove() {
  }

  putBack() {
    if (this._handleClosing) {
      this.unsubscribeEvents();
    }
  }
}
