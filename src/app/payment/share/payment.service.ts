import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'; // Added environment import

@Injectable()
export class PaymentService {
  constructor(private http: HttpClient) {}

  public getPendingPayment(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/payments`);
  }

  public acceptPayment(payment: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/payments/accept`, payment);
  }

  public declinePayment(payment: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/payments/decline`, payment);
  }
}
