import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2 } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { ResizeTableHandle } from './widgets/resize-table-handle';

@Directive({
  selector: 'table[ngResizableTable],'
})
export class AngularResizableTableDirective implements OnInit, AfterViewInit, OnDestroy {
  private _resizable = true;
  private _handleResizing: ResizeTableHandle = null;
  private _handles: ResizeTableHandle[] = [];
  private startX: number;
  private startWidth: number;
  private readonly container: HTMLElement;
  private wrapper: HTMLElement;
  private readonly table: HTMLElement;
  private columns: HTMLElement[] = [];
  private draggingSub: Subscription = null;
  private index: number;
  private columnWidth: number;
  private columnNextWidth: number;
  private readonly handleOffset = -3;

  /**  */
  @Input() minWidth = 20;

  /** Whether to prevent default event */
  @Input() preventDefaultEvent = true;

  /** emitted when start resizing */
  @Output() rzResizing = new EventEmitter();

  /** Disables the resizable if set to false. */
  @Input() set ngResizableTable(v: any) {
    if (v !== undefined && v !== null && v !== '') {
      this._resizable = !!v;
      this.updateResizable();
    }
  }

  constructor(private renderer: Renderer2, private el: ElementRef) {
    this.table = this.el.nativeElement;
    this.container = this.el.nativeElement.parentElement;
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    if (this._resizable) {
      this.addClassToTable();
      this.setColumns();
      this.setColumnsWidth();
      this.updateResizable();
    }
  }

  ngOnDestroy() {
    this.removeHandles();
  }

  private setColumns() {
    this.columns = Array.from(this.table.querySelectorAll<HTMLElement>('thead > tr > th'));
  }

  private setColumnsWidth() {
    for (let i = 0; i < this.columns.length; i++) {
      const column = this.columns[i];
      this.renderer.setStyle(column, 'width', `${ Math.round(column.getBoundingClientRect().width) }px`);
    }
  }

  private addClassToTable() {
    this.renderer.addClass(this.table, 'ng-resizable-table');
    Array.from(this.table.querySelectorAll('thead > tr > th')).map(header => {
      this.renderer.addClass(header, 'ng-resizable-header-cell');
    });
    Array.from(this.table.querySelectorAll('tbody > tr > td')).map(header => {
      this.renderer.addClass(header, 'ng-resizable-cell');
    });
  }

  updateResizable() {
    if (this._resizable) {
      this.createWrapper();
      this.createHandles();
    }
  }

  private createWrapper() {
    this.wrapper = this.renderer.createElement('div');
    this.renderer.addClass(this.wrapper, 'ng-resizable-resize-wrapper');
    this.renderer.insertBefore(this.container, this.wrapper, this.table);
  }

  private createHandles() {
    let position = this.handleOffset;
    for (let i = 0; i < this.columns.length; i++) {
      if (i === this.columns.length - 1) {
        break;
      }

      const column = this.columns[i];
      position += Math.round(column.getBoundingClientRect().width);

      const handle = this.createHandle(position);
      this._handles.push(handle);
    }
  }

  private createHandle(position: number): ResizeTableHandle {
    const handle = new ResizeTableHandle(this.wrapper, this.renderer, this.onMouseDown.bind(this));
    this.renderer.setStyle(handle.el, 'left', `${ position }px`);
    return handle;
  }

  private removeHandles() {
    for (let handle of this._handles) {
      handle.dispose();
    }

    this._handles = [];
    this.columns = [];
    this.index = null;
    this.columnWidth = null;
    this.columnNextWidth = null;
  }

  private onResizing() {
    this.rzResizing.emit();
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
    this._handleResizing = null;
    this.index = null;
    this.columnWidth = null;
    this.columnNextWidth = null;
  }

  private getPageX(event: MouseEvent | TouchEvent): number {
    return 'pageX' in event ? event.pageX : event.touches[0].pageX;
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

      this.startX = parseFloat(handle.el.style.left);
      this.startWidth = this.getPageX(event);

      this.index = this._handles.indexOf(this._handleResizing);
      const column = this.columns[this.index];
      const columnNext = this.columns[this.index + 1];
      this.columnWidth = parseFloat(column.style.width);
      this.columnNextWidth = parseFloat(columnNext.style.width);

      this.subscribeEvents();
    }
  }

  onMouseMove(event: MouseEvent | TouchEvent) {
    if (this._handleResizing && this._resizable) {
      const column = this.columns[this.index];
      const columnNext = this.columns[this.index + 1];

      // Calculate width of column
      const pageX = this.getPageX(event);
      let changedX = this.startWidth - pageX;
      let newLeft = this.startX - changedX;

      let newColumnWidth = this.columnWidth - changedX;
      let newColumnNextWidth = this.columnNextWidth + changedX;

      if (newColumnWidth <= this.minWidth) {
        changedX = this.columnWidth - this.minWidth;
        newColumnWidth = this.minWidth;
        newColumnNextWidth = this.columnNextWidth + changedX;

        newLeft = this.startX - changedX;
      } else if (newColumnNextWidth <= this.minWidth) {
        changedX = this.columnNextWidth - this.minWidth;
        newColumnNextWidth = this.minWidth;
        newColumnWidth = this.columnWidth + changedX;

        newLeft = this.startX + changedX;
      }

      // Set table header width
      if (newColumnWidth >= this.minWidth && newColumnNextWidth >= this.minWidth) {
        this.renderer.setStyle(this._handleResizing.el, 'left', `${ newLeft }px`);
        this.renderer.setStyle(column, 'width', `${ newColumnWidth }px`);
        this.renderer.setStyle(columnNext, 'width', `${ newColumnNextWidth }px`);
        this.onResizing();
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
