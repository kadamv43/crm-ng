import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GalleryRoutingModule } from './gallery-routing.module';
import { GalleryListComponent } from './gallery-list/gallery-list.component';
import { GalleryCreateComponent } from './gallery-create/gallery-create.component';
import { GalleryEditComponent } from './gallery-edit/gallery-edit.component';
import { ToolbarModule } from 'primeng/toolbar';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';


@NgModule({
  declarations: [
    GalleryListComponent,
    GalleryCreateComponent,
    GalleryEditComponent
  ],
  imports: [
    CommonModule,
    ToolbarModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    GalleryRoutingModule,
    ToastModule,
    DropdownModule
  ]
})
export class GalleryModule { }
