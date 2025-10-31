import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
  constructor(private http: HttpClient) {}

  public uploadImage(image: File): Observable<string> {
    console.log("The service: ",image); // Add inside uploadImage() in the service

    const formData = new FormData();
    formData.append('image', image);

    const headers = new HttpHeaders({
      Accept: 'application/json',
    });

    return this.http
      .post<{ signedUrl: string }>(
        `${environment.apiUrl}/image-upload`,
        formData,
        {
          headers,
          withCredentials: true,
          reportProgress: true,
        }
      )
      .pipe(map((response) => response.signedUrl));
  }

  public getImageUrl(key: string): Observable<string> {
    return this.http
      .get<{ signedUrl: string }>(
        `${environment.apiUrl}/image-url?key=${encodeURIComponent(key)}`,
        { withCredentials: true }
      )
      .pipe(map((response) => response.signedUrl));
  }
}

