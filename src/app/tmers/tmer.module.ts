import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Translation
import { TranslateModule } from '@ngx-translate/core';

// Third-party
import { NgPipesModule, UcWordsPipe } from 'ngx-pipes';
import { Daterangepicker } from 'ng2-daterangepicker';

// App modules
import { MapModule } from '../common/map/map.module';
import { EditableModule } from '../common/components/editable/editable.module';
import { ImageUploadModule } from '../common/components/image-upload/image-upload.module';
import { PaymentModule } from '../payment/payment.module';
//import { RatingModule } from 'ng-starrating';

import { StarRatingModule } from 'angular-star-rating';

// Components
import { TmerListComponent } from './tmer-list/tmer-list.component';
import { TmerListItemComponent } from './tmer-list-item/tmer-list-item.component';
import { TmersComponent } from './tmers.component';
import { TmerDetailComponent } from './tmer-detail/tmer-detail.component';
import { TmerDetailBookingComponent } from './tmer-detail/tmer-detail-booking/tmer-detail-booking.component';
import { TmerSearchComponent } from './tmer-search/tmer-search.component';
import { TmerCreateComponent } from './tmer-create/tmer-create.component';
import { TmerUpdateComponent } from './tmer-update/tmer-update.component';
import { ContactComponent } from './Contact/Contact.component';
import { PhotoUploadComponent } from './photo-upload/photo-upload.component';

// Pipes
import { UppercasePipe } from '../common/pipes/uppercase.pipe';

// Services
import { TmerService } from './shared/tmer.service';
import { BookingService } from '../booking/shared/booking.service';
import { HelperService } from '../common/service/helper.service';
import { PhotoUploadService } from './photo-upload/photo-upload.service';

// Guards
import { AuthGuard } from '../auth/shared/auth.guard';
import { TmerGuard } from './shared/tmer.guard';

const routes: Routes = [
  {
    path: 'tmers',
    component: TmersComponent,
    children: [
      { path: '', component: TmerListComponent },
      { path: 'new', component: TmerCreateComponent, canActivate: [AuthGuard] },
      {
        path: ':tmerId/edit',
        component: TmerUpdateComponent,
        canActivate: [AuthGuard, TmerGuard],
      },
      { path: ':tmerId', component: TmerDetailComponent },
      { path: ':city/homes', component: TmerSearchComponent },
      { path: ':tmerId/photo-upload', component: PhotoUploadComponent },
    ],
  },
  { path: 'contact', component: ContactComponent },
];

@NgModule({
  declarations: [
    TmerListComponent,
    TmerListItemComponent,
    TmersComponent,
    TmerDetailComponent,
    UppercasePipe,
    TmerDetailBookingComponent,
    TmerSearchComponent,
    TmerCreateComponent,
    TmerUpdateComponent,
    ContactComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HttpClientModule,
    FormsModule,
    TranslateModule,
    StarRatingModule.forRoot(),

    // Third-party
    NgPipesModule,
    Daterangepicker,

    // App modules
    MapModule,
    EditableModule,
    ImageUploadModule,
    PaymentModule,
  ],
  providers: [
    TmerService,
    BookingService,
    HelperService,
    UcWordsPipe,
    TmerGuard,
    PhotoUploadService,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TmerModule {}

