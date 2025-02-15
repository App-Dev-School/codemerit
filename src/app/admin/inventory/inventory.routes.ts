import { Route } from '@angular/router';
import { Page404Component } from '../../authentication/page404/page404.component';
import { IssuedItemsComponent } from './issued-items/issued-items.component';
import { ItemStockListComponent } from './item-stock-list/item-stock-list.component';

export const INVENTORY_ROUTE: Route[] = [
  {
    path: 'item-stock-list',
    component: ItemStockListComponent,
  },
  {
    path: 'issued-items',
    component: IssuedItemsComponent,
  },
  { path: '**', component: Page404Component },
];

