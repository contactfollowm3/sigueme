import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Tmer } from './tmer.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'; // Added environment import

@Injectable()
export class TmerService {
  constructor(private http: HttpClient) {}

  public getTmerById(tmerId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/tmers/${tmerId}`);
  }

  public getTmers(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/tmers`);
  }

  public getTmersByCity(city: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/tmers?city=${city}`);
  }

  public createTmer(tmer: Tmer): Observable<any> {
    return this.http.post(`${environment.apiUrl}/tmers`, tmer);
  }

  public getUserTmers(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/tmers/manage`);
  }

  public deleteTmer(tmerId: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/tmers/${tmerId}`);
  }

  public updateTmer(tmerId: string, tmerData: any): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/tmers/${tmerId}`, tmerData);
  }

  public verifyTmerUser(tmerId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/tmers/${tmerId}/verify-user`);
  }
}
