import { AfterViewInit, Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { ResizeTableHandle } from './widgets/resize-table-handle';

@Directive({
  selector: 'th[ngResizableTable],' +
    'td[ngResizableTable]'
})
export class AngularResizableTableDirective implements OnInit, AfterViewInit {
  private _resizable = true;
  private _handleResizing: ResizeTableHandle = null;
  private startX: number;
  private startWidth: number;
  private startWidthNext: number;
  private columnCount = 0;
  private readonly column: HTMLElement;
  private table: HTMLElement;
  private pressed = false;
  private draggingSub: Subscription = null;

  /**  */
  @Input() index = 0;

  /**  */
  @Input() minWidth = 16;

  /**  */
  @Input() useWidth = false;

  /** Whether to prevent default event */
  @Input() preventDefaultEvent = true;

  /** Disables the resizable if set to false. */
  @Input() set ngResizableTable(v: any) {
    if (v !== undefined && v !== null && v !== '') {
      this._resizable = !!v;
      this.updateResizable();
    }
  }

  get isHeader(): boolean {
    return this.el.nativeElement.localName === 'th';
  }

  constructor(private renderer: Renderer2, private el: ElementRef) {
    this.column = this.el.nativeElement;
  }

  ngOnInit() {
    const row = this.renderer.parentNode(this.column);
    const rowParent = this.renderer.parentNode(row);
    this.table = this.renderer.parentNode(rowParent);
    this.columnCount = row.childElementCount;

    this.updateResizable();
  }

  ngAfterViewInit(): void {
    if (this._resizable) {
      this.setWidth();
    }
  }

  updateResizable() {
    if (this._resizable) {
      this.createHandle();
    }
  }

  private createHandle() {
    const _el = this.el.nativeElement;
    return new ResizeTableHandle(_el, this.renderer, this.onMouseDown.bind(this));
  }

  private setWidth() {
    const _el = this.el.nativeElement;
    if (this.useWidth && this.isHeader && !_el.style.getPropertyValue('width')) {
      this.renderer.setStyle(_el, 'width', `${ _el.offsetWidth }px`);
    }
  }

  private subscribeEvents() {
    this.draggingSub = fromEvent(document, 'mousemove', { passive: false }).subscribe(event => this.onMouseMove(event as MouseEvent));
    this.draggingSub.add(fromEvent(document, 'touchmove', { passive: false }).subscribe(event => this.onMouseMove(event as TouchEvent)));
    this.draggingSub.add(fromEvent(document, 'mouseup', { passive: false }).subscribe(() => this.onMouseLeave()));
    // fix for issue #164
    let isIEOrEdge = /msie\s|trident\//i.test(window.navigator.userAgent);
    if (!isIEOrEdge) {
      this.draggingSub.add(fromEvent(document, 'mouseleave', { passive: false }).subscribe(() => this.onMouseLeave()));
    }
    this.draggingSub.add(fromEvent(document, 'touchend', { passive: false }).subscribe(() => this.onMouseLeave()));
    this.draggingSub.add(fromEvent(document, 'touchcancel', { passive: false }).subscribe(() => this.onMouseLeave()));
  }

  private unsubscribeEvents() {
    this.draggingSub.unsubscribe();
    this.draggingSub = null;
  }

  private startResize(handle: ResizeTableHandle) {
    this._handleResizing = handle;
  }

  private stopResize() {
    if (this.pressed) {
      this.pressed = false;
      this.renderer.removeClass(this.table, 'ng-resizable-resizing');
    }

    this._handleResizing = null;
  }

  onMouseDown(event: MouseEvent | TouchEvent, handle: ResizeTableHandle) {
    // skip right click;
    if (event instanceof MouseEvent && event.button === 2) {
      return;
    }

    if (this.preventDefaultEvent) {
      // prevent default events
      event.stopPropagation();
      event.preventDefault();
    }

    if (!this._handleResizing) {
      this.startResize(handle);

      const nextHeader = this.table.querySelectorAll<HTMLElement>('thead > tr > th')[this.index + 1];

      this.pressed = true;
      this.startX = 'pageX' in event ? event.pageX : event.touches[0].pageX;

      if (this.useWidth) {
        this.startWidth = parseInt(this.column.style.width, 10);
        this.startWidthNext = parseInt(nextHeader.style.width, 10);
      } else {
        this.startWidth = this.column.getBoundingClientRect().width;
        this.startWidthNext = nextHeader.getBoundingClientRect().width;
      }

      this.subscribeEvents();
    }
  }

  onMouseMove(event: MouseEvent | TouchEvent) {
    if (this._handleResizing && this._resizable) {
      const offset = 1;
      const header = this.isHeader ? this.column : this.table.querySelectorAll('thead > tr > th')[this.index];
      const nextHeader = this.table.querySelectorAll('thead > tr > th')[this.index + 1];
      this.renderer.addClass(this.table, 'ng-resizable-resizing');

      // Calculate width of column
      const pageX = 'pageX' in event ? event.pageX : event.touches[0].pageX;
      const changedWidth = pageX - this.startX - offset;
      let headerWidth = this.startWidth + changedWidth;
      let nextHeaderWidth = this.startWidthNext - changedWidth;

      // Set table header width
      if (!this.minWidth || (changedWidth < 0 && headerWidth >= this.minWidth) || (changedWidth > 0 && nextHeaderWidth >= this.minWidth)) {
        this.renderer.setStyle(header, 'width', `${ headerWidth }px`);
        this.renderer.setStyle(nextHeader, 'width', `${ nextHeaderWidth }px`);
      }
    }
  }

  onMouseLeave() {
    if (this._handleResizing) {
      this.stopResize();
      this.unsubscribeEvents();
    }
  }
}
