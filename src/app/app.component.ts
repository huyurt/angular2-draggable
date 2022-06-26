import { AfterViewInit, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { displayedColumns, items } from './data-service';
import { IResizeEvent } from '../../projects/angular2-draggable/src/lib/models/resize-event';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('resizableTableContainer') resizableTableContainer: ElementRef<HTMLElement>;
  @ViewChild('resizableTable') resizableTable: ElementRef<HTMLElement>;

  private initTableRatio: number;
  private tableColumns: HTMLElement[] = [];
  private tableColumnRatios: number[] = [];
  private readonly handleOffset = -3;

  displayedColumns: string[];
  items: any[];

  constructor(private renderer: Renderer2) {
    this.displayedColumns = displayedColumns;
    this.items = items;
  }

  ngAfterViewInit(): void {
    this.setResizeTable();
  }

  setResizeTable() {
    if (this.resizableTable) {
      this.tableColumns = Array.from(this.resizableTable.nativeElement.querySelectorAll<HTMLElement>('thead > tr > th'));
      this.initTableRatio = this.tableColumns.reduce((a, b) => a + parseFloat(b.style.width), 0)
        / parseFloat(this.resizableTableContainer.nativeElement.style.width);
      this.setColumnRatios();
    }
  }

  setColumnRatios() {
    this.tableColumnRatios = this.tableColumns.map(c => parseFloat(c.style.width)
      / this.tableColumns.reduce((a, b) => a + parseFloat(b.style.width), 0));
  }

  tableResizing(event: IResizeEvent) {
    if (this.resizableTable) {
      let position = this.handleOffset;
      const containerWidth = event.size.width;
      for (let i = 0; i < this.tableColumns.length; i++) {
        const column = this.tableColumns[i];
        const ratio = this.tableColumnRatios[i];
        let newWidth = Math.round(containerWidth * this.initTableRatio * ratio);
        this.renderer.setStyle(column, 'width', `${ Math.round(newWidth) }px`);

        if (i === this.tableColumns.length - 1) {
          break;
        }
        position += column.getBoundingClientRect().width;
        const handle = this.resizableTableContainer.nativeElement
          .querySelectorAll<HTMLElement>('.ng-resizable-resize-wrapper > .ng-resizable-resize-handle')[i];
        this.renderer.setStyle(handle, 'left', `${ position }px`);
      }
    }
  }

  columnResizing() {
    this.setColumnRatios();
  }
}
