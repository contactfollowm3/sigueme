import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Review } from './share/review.model';
import { ReviewService } from './share/review.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss'],
})
export class ReviewComponent {
  @Input() bookingId: string = '';

  @Output() reviewSubmitted = new EventEmitter();

  modalRef: any;
  review: Review = { text: '', rating: 3 };
  errors: any[];

  constructor(
    private modalService: NgbModal,
    private reviewService: ReviewService
  ) {}

  handleRatingChange(event: any) {
    this.review.rating = event.rating;
  }

  openReviewModal(content: any) {
    this.modalRef = this.modalService.open(content);
  }

  confirmReview() {


    this.reviewService.createReview(this.review, this.bookingId).subscribe(
      (review: Review) => {
        this.reviewSubmitted.emit(review);
        this.modalRef.close();
      },
      (errorResponse: HttpErrorResponse) => {
        this.errors = errorResponse.error.errors;
      }
    );
  }
}
