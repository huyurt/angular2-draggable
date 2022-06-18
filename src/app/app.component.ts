import { AfterViewInit, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { displayedColumns, items } from './data-service';
import { IResizeEvent } from '../../projects/angular2-draggable/src/lib/models/resize-event';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('table') table: ElementRef<HTMLElement>;

  _table: HTMLElement;
  displayedColumns: string[];
  items: any[];

  constructor(private renderer: Renderer2) {
    this.displayedColumns = displayedColumns;
    this.items = items;
  }

  ngAfterViewInit(): void {
    this._table = this.table.nativeElement;

    const parent = this._table.parentElement;
    this.setTableWidth(parent.offsetWidth);
  }

  tableResizing(event: IResizeEvent) {
    this.setTableWidth(event.size.width);
  }

  // sütun gelişliklerinin birbirine oranı
  setTableWidth(width: number) {
    this.renderer.setStyle(this._table, 'width', `${ width }px`);
    const diff = width / tableWidth;

    Array.from(this.table.nativeElement.querySelectorAll<HTMLElement>('thead > tr > th')).map(
      (column: HTMLElement) => {
        const columnWidth = column.getBoundingClientRect().width;
        this.renderer.setStyle(column, 'width', `${ columnWidth * diff }px`);
      });
  }
}
