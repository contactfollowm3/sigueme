import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import jwt_decode from 'jwt-decode';
import * as moment from 'moment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

class DecodedToken {
  exp: number = 0;
  username: string = '';
  userId: string = '';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private decodedToken: DecodedToken;

  constructor(private http: HttpClient) {
    const storedMeta = localStorage.getItem('bwm_meta');
    this.decodedToken = storedMeta
      ? JSON.parse(storedMeta)
      : new DecodedToken();
  }

  private saveToken(token: string): string {
    this.decodedToken = jwt_decode(token);
    localStorage.setItem('bwm_auth', token);
    localStorage.setItem('bwm_meta', JSON.stringify(this.decodedToken));
    return token;
  }

  private getExpiration(): moment.Moment | null {
    return this.decodedToken?.exp ? moment.unix(this.decodedToken.exp) : null;
  }

  public register(userData: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/users/register`, userData, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      withCredentials: true,
    });
  }

  public login(userData: any): Observable<any> {
    return this.http
      .post(`${environment.apiUrl}/users/auth`, userData, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        withCredentials: true,
      })
      .pipe(map((token: any) => this.saveToken(token)));
  }

  public logout(): void {
    localStorage.removeItem('bwm_auth');
    localStorage.removeItem('bwm_meta');
    this.decodedToken = new DecodedToken();
  }

  public isAuthenticated(): boolean {
    const expiration = this.getExpiration();
    return expiration ? moment().isBefore(expiration) : false;
  }

  public getAuthToken(): string | null {
    return localStorage.getItem('bwm_auth');
  }

  public getUsername(): string {
    return this.decodedToken?.username || '';
  }

  public getUserId(): string {
    return this.decodedToken?.userId || '';
  }
}
