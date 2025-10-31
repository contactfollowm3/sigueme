import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgPipesModule } from 'ngx-pipes';
import { TranslateModule } from '@ngx-translate/core';
import { ReviewModule } from '../review/review.module';

import { ManageTmerBookingComponent } from './manage-tmer/manage-tmer-booking/manage-tmer-booking.component';
import { ManageComponent } from './manage.component';
import { ManageBookingComponent } from './manage-booking/manage-booking.component';
import { ManageTmerComponent } from './manage-tmer/manage-tmer.component';
import { FormatDatePipe } from '../common/pipes/format-date.pipe';

import { TmerService } from '../tmers/shared/tmer.service';
import { BookingService } from '../booking/shared/booking.service';
import { AuthGuard } from '../auth/shared/auth.guard';
import { ToastrModule } from 'ngx-toastr';

const routes: Routes = [
  {
    path: 'manage',
    component: ManageComponent,
    children: [
      {
        path: 'tmers',
        component: ManageTmerComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'bookings',
        component: ManageBookingComponent,
        canActivate: [AuthGuard],
      },
    ],
  },
];

@NgModule({
  declarations: [
    ManageComponent,
    ManageBookingComponent,
    ManageTmerComponent,
    FormatDatePipe,
    ManageTmerBookingComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    NgPipesModule,
    ToastrModule.forRoot(),
    TranslateModule.forChild(), 
    ReviewModule,
  ],
  providers: [TmerService, BookingService],
})
export class ManageModule {}

