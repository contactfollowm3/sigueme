import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from './review.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  constructor(private http: HttpClient) {}

  public createReview(review: Review, bookingId: string): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/reviews?bookingId=${bookingId}`,
      review
    );
  }

  public getTmerReviews(tmerId: string): Observable<any> {
    // Use the correct endpoint with query parameter
    return this.http.get(`${environment.apiUrl}/reviews?tmerId=${tmerId}`);
  }

  public getOverallRating(tmerId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/reviews/${tmerId}/rating`);
  }
}

