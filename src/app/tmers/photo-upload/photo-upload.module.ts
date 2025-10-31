import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment'; // Adjust path if needed

// Interface for the backend response after uploading photos
interface PhotoUploadResponse {
  message: string;
  photos: string[]; // Array of signed URLs for the newly uploaded images
  keys: string[]; // Array of S3 keys for the newly uploaded images
}

// Interface for a single fetched photo from the backend
interface FetchedPhoto {
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

  /**
   * Uploads multiple photos for a specific Tmer.
   * Sends FormData with files to the backend.
   * Observes 'events' to track upload progress.
   *
   * @param tmerId The ID of the Tmer to associate photos with.
   * @param formData FormData object containing the files (e.g., formData.append('photos', file)).
   * @returns An Observable that emits HttpEvents (including HttpEventType.UploadProgress and HttpEventType.Response).
   */
  public uploadTmerPhotos(tmerId: string, formData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      // 'Accept': 'application/json' is usually implicit with HttpClient for JSON responses,
      // but can be explicitly set if needed. Content-Type for FormData is handled automatically.
    });

    return this.http.post<PhotoUploadResponse>(
      `${environment.apiUrl}/tmers/${tmerId}/photos`, // API endpoint for multi-photo upload
      formData,
      {
        headers,
        withCredentials: true, // Send cookies with the request (important for authentication if used)
        reportProgress: true, // Enable progress events
        observe: 'events', // Observe all HTTP events (e.g., upload progress, response)
      }
    );
  }

  /**
   * Fetches all existing photos for a specific Tmer.
   *
   * @param tmerId The ID of the Tmer to retrieve photos for.
   * @returns An Observable that emits an array of FetchedPhoto objects (containing key and signed URL).
   */
  public getTmerPhotos(tmerId: string): Observable<FetchedPhoto[]> {
    return this.http
      .get<GetPhotosResponse>(`${environment.apiUrl}/tmers/${tmerId}/photos`, {
        withCredentials: true,
      })
      .pipe(map((response) => response.photos)); // Extract the 'photos' array from the response
  }

  /**
   * Deletes a specific photo from a Tmer.
   *
   * @param tmerId The ID of the Tmer the photo belongs to.
   * @param key The S3 key of the photo to be deleted.
   * @returns An Observable that emits the deletion response.
   */
  public deleteTmerPhoto(tmerId: string, key: string): Observable<any> {
    return this.http.delete(
      `${environment.apiUrl}/tmers/${tmerId}/photos?key=${encodeURIComponent(
        key
      )}`, // API endpoint for photo deletion
      { withCredentials: true }
    );
  }
}

/* import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ImageCropperModule } from 'ngx-image-cropper';
import { ToastrModule } from 'ngx-toastr';

import { PhotoUploadComponent } from './photo-upload.component';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    ImageCropperModule,
    ToastrModule.forRoot(),
    PhotoUploadComponent, // <-- Import standalone component here (not declarations)
  ],
  exports: [PhotoUploadComponent],
})
export class TmerModule {}
 */
