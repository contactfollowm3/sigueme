import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
//import { RatingModule } from 'ng-starrating'; 
import { StarRatingModule } from 'angular-star-rating';

import { ReviewComponent } from './review.component';

import { ReviewService } from './share/review.service'; 

@NgModule({
  declarations: [ReviewComponent],
  exports: [ReviewComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    StarRatingModule.forRoot(), 
  ],
  providers: [ReviewService], 
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Add this line
})
export class ReviewModule {}
