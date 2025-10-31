import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Interface for the backend response after uploading photos
interface PhotoUploadResponse {
  message: string;
  photos: string[]; // Array of signed URLs for the newly uploaded images
  keys: string[]; // Array of S3 keys for the newly uploaded images
}

// Interface for a single fetched photo from the backend
export interface FetchedPhoto {
  // Ensure 'export' is here
  key: string; // The S3 key of the photo
  url: string; // The signed URL of the photo
}

// Interface for the backend response when getting all photos for a Tmer
interface GetPhotosResponse {
  photos: FetchedPhoto[]; // Array of FetchedPhoto objects
}

@Injectable({
  providedIn: 'root',
})
export class PhotoUploadService {
  constructor(private http: HttpClient) {}

  public uploadPhotos(tmerId: string, formData: FormData): Observable<any> {
    const headers = new HttpHeaders({}); // Headers handled by browser for FormData, but can add custom ones if needed

    return this.http.post<PhotoUploadResponse>(
      `${environment.apiUrl}/tmers/${tmerId}/photos`,
      formData,
      {
        headers,
        withCredentials: true,
        reportProgress: true, // Crucial for showing upload progress
        observe: 'events', // Crucial for getting HttpEventType.UploadProgress
      }
    );
  }

  public getPhotos(tmerId: string): Observable<FetchedPhoto[]> {
    return this.http
      .get<GetPhotosResponse>(`${environment.apiUrl}/tmers/${tmerId}/photos`, {
        withCredentials: true,
      })
      .pipe(map((response) => response.photos));
  }

  public deletePhoto(tmerId: string, key: string): Observable<any> {
    // Note: 'key' must be URL-encoded, especially if it contains special characters
    return this.http.delete(
      `${environment.apiUrl}/tmers/${tmerId}/photos?key=${encodeURIComponent(
        key
      )}`,
      { withCredentials: true }
    );
  }
}

//almost working

/* import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment'; 


interface PhotoUploadResponse {
  message: string;
  photos: string[]; 
  keys: string[]; 
}



export interface FetchedPhoto {
  key: string; 
  url: string; 
}


interface GetPhotosResponse {
  photos: FetchedPhoto[]; 
}

@Injectable({
  providedIn: 'root',
})
export class PhotoUploadService {
  constructor(private http: HttpClient) {}

  public uploadPhotos(tmerId: string, formData: FormData): Observable<any> {
    const headers = new HttpHeaders({});

    return this.http.post<PhotoUploadResponse>(
      `${environment.apiUrl}/tmers/${tmerId}/photos`,
      formData,
      {
        headers,
        withCredentials: true,
        reportProgress: true,
        observe: 'events',
      }
    );
  }

  public getPhotos(tmerId: string): Observable<FetchedPhoto[]> {
    return this.http
      .get<GetPhotosResponse>(`${environment.apiUrl}/tmers/${tmerId}/photos`, {
        withCredentials: true,
      })
      .pipe(map((response) => response.photos));
  }

  public deletePhoto(tmerId: string, key: string): Observable<any> {
    return this.http.delete(
      `${environment.apiUrl}/tmers/${tmerId}/photos?key=${encodeURIComponent(
        key
      )}`,
      { withCredentials: true }
    );
  }
}
 */

/* import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PhotoUploadService {
  constructor(private http: HttpClient) {}

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('images', file); // ✅ match backend field name

    const headers = new HttpHeaders({
      Accept: 'application/json',
    });

    return this.http
      .post<{ images: string[] }>(
        `${environment.apiUrl}/photo-upload`,
        formData,
        {
          headers,
          withCredentials: true,
        }
      )
      .pipe(map((response) => response.images?.[0] || '')); // Return first uploaded image URL
  }

  deleteImage(imageUrl: string): Observable<any> {
    return this.http.delete(
      `${environment.apiUrl}/photo-upload?url=${encodeURIComponent(imageUrl)}`,
      {
        withCredentials: true,
      }
    );
  }
}
 */
