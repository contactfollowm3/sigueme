import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Booking } from './booking.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'; // Added environment import

@Injectable()
export class BookingService {
  constructor(private http: HttpClient) {}

  public createBooking(booking: Booking): Observable<any> {
    return this.http.post(`${environment.apiUrl}/bookings`, booking); // Updated URL
  }

  public getUserBookings(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/bookings/manage`); // Updated URL
  }
}
