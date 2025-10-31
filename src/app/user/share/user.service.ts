import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'; // Added environment import

@Injectable()
export class UserService {
  constructor(private http: HttpClient) {}

  public getUser(userId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/users/${userId}`); // Updated URL
  }

  public updateUser(userId: string, userData: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/users/${userId}`, userData); // Updated URL
  }

  public updatePassword(userId: string, data: any): Observable<any> {
    return this.http.patch(
      `${environment.apiUrl}/users/${userId}/password`,
      data
    ); // Updated URL
  }
}
