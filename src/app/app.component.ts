import { Component } from '@angular/core';
import { displayedColumns, items } from './data-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  displayedColumns: string[];
  items: any[];

  constructor() {
    this.displayedColumns = displayedColumns;
    this.items = items;
  }
}
