import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Tmer } from '../shared/tmer.model';
import { Review } from '../../review/share/review.model';
import { ReviewService } from '../../review/share/review.service';
import { TmerService } from '../shared/tmer.service';

import * as moment from 'moment';

@Component({
  selector: 'app-tmer-detail',
  templateUrl: './tmer-detail.component.html',
  styleUrls: ['./tmer-detail.component.scss'],
})
export class TmerDetailComponent implements OnInit {
  tmer?: Tmer; // Marked as optional
  reviews: Review[] = [];
  rating: number = 0;
  reviewCount: number = 0;

  constructor(
    private route: ActivatedRoute,
    private tmerService: TmerService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const tmerId = params['tmerId'];
      if (tmerId) {
        this.getTmer(tmerId);
        // Optionally load reviews or rating here
        this.loadReviewsData(tmerId);
      }
    });
  }

  getTmer(tmerId: string) {
    this.tmerService.getTmerById(tmerId).subscribe({
      next: (tmer: Tmer) => {
        this.tmer = tmer;
        if (tmer._id) {
          this.getOverallRating(tmer._id);
          this.getReviews(tmer._id);
        }
      },
      error: (err) => {
        console.error('Error loading tmer:', err);
      },
    });
  }

  getReviews(tmerId: string) {
    this.reviewService.getTmerReviews(tmerId).subscribe((reviews: Review[]) => {
      this.reviews = reviews;
    });
  }

  loadReviewsData(tmerId: string) {
    // can be used to load additional data if needed
  }

  getOverallRating(tmerId: string) {
    this.reviewService.getOverallRating(tmerId).subscribe({
      next: (response: any) => {
        this.rating = response.ratingAvg || 0;
        this.reviewCount = response.reviewCount || 0;
      },
      error: (err) => {
        console.error('Error loading rating:', err);
        this.rating = 0;
      },
    });
  }

  formatDate(date?: string | Date): string {
    if (!date) return '';
    return `${moment(date).fromNow()}`;
  }
}
