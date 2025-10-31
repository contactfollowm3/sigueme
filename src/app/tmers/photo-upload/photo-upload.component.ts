import { Component, OnInit, Input } from '@angular/core';
import { CommonModule, NgFor, NgIf, NgStyle } from '@angular/common';
import {
  HttpClientModule,
  HttpEventType,
  HttpErrorResponse,
} from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { PhotoUploadService, FetchedPhoto } from './photo-upload.service';
import { ToastrService } from 'ngx-toastr';

// Interface for a file being processed for upload within the component
interface TmerPhoto {
  key: string; // Key (e.g., S3 key) after upload
  url: string; // URL (e.g., signed URL) for display
  file?: File; // The actual File object before upload (only for selectedFiles)
  status: 'INIT' | 'PENDING' | 'OK' | 'FAIL'; // Status of the file
  progress?: number; // Upload progress percentage
}

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, NgStyle, HttpClientModule],
  templateUrl: './photo-upload.component.html',
  styleUrls: ['./photo-upload.component.scss'],
})
export class PhotoUploadComponent implements OnInit {
  // tmerId can come from @Input or route params. Initialize as null.
  @Input() tmerId: string | null = null; // Adding @Input decorator explicitly

  selectedFiles: TmerPhoto[] = []; // Files chosen by the user for upload
  uploadedPhotos: TmerPhoto[] = []; // Photos already uploaded and fetched from backend
  isUploading = false; // Flag to indicate if an upload/delete operation is in progress

  constructor(
    private photoUploadService: PhotoUploadService,
    private toastr: ToastrService,
    private route: ActivatedRoute // Inject ActivatedRoute to access route parameters
  ) {}

  ngOnInit(): void {
    console.log('--- PhotoUploadComponent ngOnInit START ---');
    console.log(
      '1. Value of @Input() tmerId at ngOnInit start (before route check):',
      this.tmerId
    );

    // Prioritize @Input tmerId if it's already set
    if (this.tmerId) {
      console.log('tmerId set via @Input:', this.tmerId);
      this.loadPhotosIfTmerIdAvailable();
      console.log('--- PhotoUploadComponent ngOnInit END (via @Input) ---');
      return; // Exit as tmerId is already known
    }

    // Attempt to get tmerId from parent route parameters first.
    this.route.parent?.params.subscribe((parentParams) => {
      const parentTmerId = parentParams['tmerId'];
      console.log(
        '2. Parent Route Params (from subscribe):',
        parentParams,
        'Extracted tmerId:',
        parentTmerId
      );

      if (parentTmerId) {
        this.tmerId = parentTmerId;
        console.log('3. tmerId set from Parent Route Params:', this.tmerId);
        this.loadPhotosIfTmerIdAvailable();
      } else {
        console.log(
          '3. No tmerId found in Parent Route Params. Checking current route params.'
        );
        // If not found in parent, try the current route parameters.
        this.route.params.subscribe((currentParams) => {
          const currentTmerId = currentParams['tmerId'];
          console.log(
            '4. Current Route Params (from subscribe):',
            currentParams,
            'Extracted tmerId:',
            currentTmerId
          );
          if (currentTmerId) {
            this.tmerId = currentTmerId;
            console.log(
              '5. tmerId set from Current Route Params:',
              this.tmerId
            );
            this.loadPhotosIfTmerIdAvailable();
          } else {
            console.warn(
              '6. Tmer ID is still NOT available after checking @Input, Parent Route, and Current Route.'
            );
            if (!this.tmerId) {
              this.toastr.error(
                'Tmer ID not found for photo upload. Please ensure you are on a valid Tmer page.',
                'Error'
              );
            }
          }
        });
      }
    });
    console.log('--- PhotoUploadComponent ngOnInit END ---');
  }

  /**
   * Helper function to load photos only if tmerId has been successfully determined.
   */
  private loadPhotosIfTmerIdAvailable(): void {
    if (this.tmerId) {
      this.getTmerPhotos(this.tmerId);
    }
  }

  /**
   * Fetches existing photos for the current Tmer from the backend.
   * @param tmerId The ID of the Tmer.
   */
  private getTmerPhotos(tmerId: string): void {
    console.log('getTmerPhotos called with tmerId:', tmerId);
    if (!tmerId) {
      console.error(
        'getTmerPhotos: tmerId is undefined or null, aborting request.'
      );
      return;
    }
    this.photoUploadService.getPhotos(tmerId).subscribe({
      next: (photos: FetchedPhoto[]) => {
        // Map fetched photos to the TmerPhoto interface for local management
        this.uploadedPhotos = photos.map((p: FetchedPhoto) => ({
          key: p.key,
          url: p.url,
          status: 'OK',
          progress: 100,
        }));
        console.log(
          'Successfully fetched existing uploaded photos:',
          this.uploadedPhotos
        );
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching photos for tmerId:', tmerId, err);
        // Do not show toastr if it's a 404, as it often means no photos exist yet (not an error to user)
        if (err.status !== 404) {
          this.toastr.error('Failed to load existing photos.', 'Error');
        } else {
          console.log(
            'No existing photos found for this Tmer (404 response). This is expected for new Tmers or Tmers without photos).'
          );
        }
      },
    });
  }

  /**
   * Processes files selected by the user for upload.
   * @param event The change event from the file input.
   */
  processFiles(event: any): void {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    (Array.from(files) as File[]).forEach((file: File) => {
      // Basic validation: Check file type
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        this.toastr.error('Only JPEG, PNG, and GIF images are allowed.');
        return;
      }

      // Basic validation: Check file size (e.g., 5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error(`File "${file.name}" is too large. Max 5MB allowed.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.selectedFiles.push({
          file: file,
          url: e.target?.result as string, // URL for image preview
          key: '', // Key will be populated after successful upload
          status: 'INIT', // Initial status
          progress: 0, // Initial progress
        });
      };
      reader.readAsDataURL(file); // Read file as Data URL for preview
    });

    // Clear the file input value to allow selecting the same files again if needed
    event.target.value = '';
  }

  /**
   * Uploads all currently selected files to the backend.
   */
  uploadPhotos(): void {
    console.log('uploadPhotos called. Current tmerId:', this.tmerId);
    // Crucial check: Ensure tmerId is available before proceeding with upload
    if (!this.tmerId) {
      this.toastr.error('Tmer ID is missing. Cannot upload photos.', 'Error');
      console.error('Upload aborted: tmerId is undefined or null.');
      this.isUploading = false; // Reset loading state
      return;
    }

    const filesToUpload = this.selectedFiles.filter((f) => f.status === 'INIT');

    if (filesToUpload.length === 0) {
      this.toastr.warning('No new photos selected for upload.');
      return;
    }

    this.isUploading = true; // Set loading state

    const formData = new FormData();
    filesToUpload.forEach((fileSnippet) => {
      if (fileSnippet.file) {
        // Append each file to the FormData object under the 'photos' field
        // This 'photos' field name must match the 'upload.array('photos', ...)' in the backend
        formData.append('photos', fileSnippet.file, fileSnippet.file.name);
        fileSnippet.status = 'PENDING'; // Mark as pending upload
        fileSnippet.progress = 0; // Reset progress
      }
    });

    // Call the service to upload photos, observing progress events
    this.photoUploadService.uploadPhotos(this.tmerId, formData).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          // Update progress for all pending files
          const percentDone = Math.round((100 * event.loaded) / event.total);
          filesToUpload.forEach((f) => {
            if (f.status === 'PENDING') {
              f.progress = percentDone;
            }
          });
        } else if (event.type === HttpEventType.Response) {
          // Upload complete, process the response
          const response = event.body;
          if (response && response.photos && response.keys) {
            filesToUpload.forEach((f, index) => {
              f.status = 'OK'; // Mark as successfully uploaded
              // Ensure we have corresponding data from the backend response
              if (response.photos[index] && response.keys[index]) {
                f.url = response.photos[index]; // Update URL with signed URL from backend
                f.key = response.keys[index]; // Store S3 key for future deletion
              }
              f.progress = 100;
              this.uploadedPhotos.push(f); // Move to uploaded photos list
            });
            // Filter out successfully uploaded files from selectedFiles, keeping only failed or untouched ones
            this.selectedFiles = this.selectedFiles.filter(
              (f) => f.status === 'FAIL' || f.status === 'INIT'
            );
            this.toastr.success(
              `${response.photos.length} photos uploaded successfully!`
            );
          }
          this.isUploading = false; // Reset loading state
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Photo upload error:', err);
        // Mark all currently uploading files as failed
        filesToUpload.forEach((f) => {
          f.status = 'FAIL';
          f.progress = 0;
        });
        this.toastr.error(
          err.error?.message || 'Failed to upload photos.',
          'Upload Error'
        );
        this.isUploading = false; // Reset loading state
      },
    });
  }

  /**
   * Removes a selected file from the preview list before upload.
   * @param index The index of the file to remove.
   */
  removeSelectedFile(index: number): void {
    if (!this.isUploading) {
      // Prevent removal during an active upload
      this.selectedFiles.splice(index, 1);
    } else {
      this.toastr.warning(
        'Cannot remove files while an upload is in progress.',
        'Action Blocked'
      );
    }
  }

  /**
   * Deletes an already uploaded photo from the backend.
   * @param photoToDelete The TmerPhoto object to delete.
   */
  deleteUploadedPhoto(photoToDelete: TmerPhoto): void {
    console.log(
      'deleteUploadedPhoto called. Current tmerId:',
      this.tmerId,
      'Photo key:',
      photoToDelete.key
    );
    // Crucial check: Ensure tmerId is available before proceeding with deletion
    if (!this.tmerId) {
      this.toastr.error('Tmer ID is missing. Cannot delete photo.', 'Error');
      console.error('Delete aborted: tmerId is undefined or null.');
      return;
    }

    if (
      !confirm(
        'Are you sure you want to delete this photo? This cannot be undone.'
      )
    ) {
      return;
    }

    if (photoToDelete.key) {
      this.isUploading = true; // Indicate that a process is active
      this.photoUploadService
        .deletePhoto(this.tmerId, photoToDelete.key)
        .subscribe({
          next: () => {
            // Remove the photo from the local list upon successful deletion
            this.uploadedPhotos = this.uploadedPhotos.filter(
              (p) => p.key !== photoToDelete.key
            );
            this.toastr.success('Photo deleted successfully!');
            this.isUploading = false; // Reset loading state
          },
          error: (err: HttpErrorResponse) => {
            this.toastr.error(
              err.error?.message || 'Failed to delete photo.',
              'Deletion Error'
            );
            console.error('Error deleting photo:', err);
            this.isUploading = false; // Reset loading state
          },
        });
    } else {
      this.toastr.error(
        'Cannot delete a photo without a key. Please refresh if this is an error.',
        'Error'
      );
    }
  }
}



//almost work second part the belwo i think is better

/* import { Component, OnInit, Input } from '@angular/core';
import { CommonModule, NgFor, NgIf, NgStyle } from '@angular/common';
import {
  HttpClientModule,
  HttpEventType,
  HttpErrorResponse,
} from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { PhotoUploadService, FetchedPhoto } from './photo-upload.service'; 
import { ToastrService } from 'ngx-toastr';


interface TmerPhoto {
  key: string; 
  url: string; 
  file?: File; 
  status: 'INIT' | 'PENDING' | 'OK' | 'FAIL'; 
  progress?: number; 
}

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, NgStyle, HttpClientModule],
  templateUrl: './photo-upload.component.html',
  styleUrls: ['./photo-upload.component.scss'],
})
export class PhotoUploadComponent implements OnInit {

  tmerId: string | null = null;

  selectedFiles: TmerPhoto[] = []; 
  uploadedPhotos: TmerPhoto[] = []; 
  isUploading = false; 

  constructor(
    private photoUploadService: PhotoUploadService,
    private toastr: ToastrService,
    private route: ActivatedRoute 
  ) {}

  ngOnInit(): void {
    console.log('--- PhotoUploadComponent ngOnInit START ---');
    console.log(
      '1. Value of @Input() tmerId at ngOnInit start (before route check):',
      this.tmerId
    );

    
   
    this.route.parent?.params.subscribe((parentParams) => {
      const parentTmerId = parentParams['tmerId'];
      console.log(
        '2. Parent Route Params (from subscribe):',
        parentParams,
        'Extracted tmerId:',
        parentTmerId
      );

      if (parentTmerId) {
     
        this.tmerId = parentTmerId;
        console.log('3. tmerId set from Parent Route Params:', this.tmerId);
        this.loadPhotosIfTmerIdAvailable(); 
      } else {
        console.log(
          '3. No tmerId found in Parent Route Params. Checking current route params.'
        );
       
        this.route.params.subscribe((currentParams) => {
          const currentTmerId = currentParams['tmerId'];
          console.log(
            '4. Current Route Params (from subscribe):',
            currentParams,
            'Extracted tmerId:',
            currentTmerId
          );
          if (currentTmerId) {
            this.tmerId = currentTmerId;
            console.log(
              '5. tmerId set from Current Route Params:',
              this.tmerId
            );
            this.loadPhotosIfTmerIdAvailable(); 
          } else {
            console.warn(
              '6. Tmer ID is still NOT available after checking @Input, Parent Route, and Current Route.'
            );
           
            if (!this.tmerId) {
              this.toastr.error(
                'Tmer ID not found for photo upload. Please ensure you are on a valid Tmer page.',
                'Error'
              );
            }
          }
        });
      }
    });
    console.log('--- PhotoUploadComponent ngOnInit END ---');
  }

 
  private loadPhotosIfTmerIdAvailable(): void {
    if (this.tmerId) {
      this.getTmerPhotos(this.tmerId);
    }
  }

  
  private getTmerPhotos(tmerId: string): void {
    console.log('getTmerPhotos called with tmerId:', tmerId);
    if (!tmerId) {
      console.error(
        'getTmerPhotos: tmerId is undefined or null, aborting request.'
      );
      return;
    }
    this.photoUploadService.getPhotos(tmerId).subscribe({
      next: (photos: FetchedPhoto[]) => {
       
        this.uploadedPhotos = photos.map((p: FetchedPhoto) => ({
          key: p.key,
          url: p.url,
          status: 'OK',
          progress: 100,
        }));
        console.log(
          'Successfully fetched existing uploaded photos:',
          this.uploadedPhotos
        );
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching photos for tmerId:', tmerId, err);
        
        if (err.status !== 404) {
          this.toastr.error('Failed to load existing photos.', 'Error');
        } else {
          console.log(
            'No existing photos found for this Tmer (404 response). This is expected for new Tmers or Tmers without photos).'
          );
        }
      },
    });
  }

  
  processFiles(event: any): void {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

  
    (Array.from(files) as File[]).forEach((file: File) => {
     
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        this.toastr.error('Only JPEG, PNG, and GIF images are allowed.');
        return;
      }

    
      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error(`File "${file.name}" is too large. Max 5MB allowed.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.selectedFiles.push({
          file: file,
          url: e.target?.result as string, 
          key: '', 
          status: 'INIT', 
          progress: 0, 
        });
      };
      reader.readAsDataURL(file); 
    });

    
    event.target.value = '';
  }

  
  uploadPhotos(): void {
    console.log('uploadPhotos called. Current tmerId:', this.tmerId);
   
    if (!this.tmerId) {
      this.toastr.error('Tmer ID is missing. Cannot upload photos.', 'Error');
      console.error('Upload aborted: tmerId is undefined or null.');
      this.isUploading = false; 
      return;
    }

    const filesToUpload = this.selectedFiles.filter((f) => f.status === 'INIT');

    if (filesToUpload.length === 0) {
      this.toastr.warning('No new photos selected for upload.');
      return;
    }

    this.isUploading = true;

    const formData = new FormData();
    filesToUpload.forEach((fileSnippet) => {
      if (fileSnippet.file) {
       
        formData.append('photos', fileSnippet.file, fileSnippet.file.name);
        fileSnippet.status = 'PENDING';
        fileSnippet.progress = 0; 
      }
    });

 
    this.photoUploadService.uploadPhotos(this.tmerId, formData).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
        
          const percentDone = Math.round((100 * event.loaded) / event.total);
          filesToUpload.forEach((f) => {
            if (f.status === 'PENDING') {
              f.progress = percentDone;
            }
          });
        } else if (event.type === HttpEventType.Response) {
       
          const response = event.body;
          if (response && response.photos && response.keys) {
            filesToUpload.forEach((f, index) => {
              f.status = 'OK'; 
              
              if (response.photos[index] && response.keys[index]) {
                f.url = response.photos[index]; 
                f.key = response.keys[index]; 
              }
              f.progress = 100;
              this.uploadedPhotos.push(f); 
            });
           
            this.selectedFiles = this.selectedFiles.filter(
              (f) => f.status === 'FAIL' || f.status === 'INIT'
            );
            this.toastr.success(
              `${response.photos.length} photos uploaded successfully!`
            );
          }
          this.isUploading = false; 
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Photo upload error:', err);
        
        filesToUpload.forEach((f) => {
          f.status = 'FAIL';
          f.progress = 0;
        });
        this.toastr.error(
          err.error?.message || 'Failed to upload photos.',
          'Upload Error'
        );
        this.isUploading = false; 
      },
    });
  }

 
  removeSelectedFile(index: number): void {
    if (!this.isUploading) {
    
      this.selectedFiles.splice(index, 1);
    } else {
      this.toastr.warning(
        'Cannot remove files while an upload is in progress.',
        'Action Blocked'
      );
    }
  }


  deleteUploadedPhoto(photoToDelete: TmerPhoto): void {
    console.log(
      'deleteUploadedPhoto called. Current tmerId:',
      this.tmerId,
      'Photo key:',
      photoToDelete.key
    );
   
    if (!this.tmerId) {
      this.toastr.error('Tmer ID is missing. Cannot delete photo.', 'Error');
      console.error('Delete aborted: tmerId is undefined or null.');
      return;
    }

    if (!confirm('Are you sure you want to delete this photo? This cannot be undone.')) {
      return;
    }

    if (photoToDelete.key) {
      this.isUploading = true; 
      this.photoUploadService
        .deletePhoto(this.tmerId, photoToDelete.key)
        .subscribe({
          next: () => {
         
            this.uploadedPhotos = this.uploadedPhotos.filter(
              (p) => p.key !== photoToDelete.key
            );
            this.toastr.success('Photo deleted successfully!');
            this.isUploading = false; 
          },
          error: (err: HttpErrorResponse) => {
            this.toastr.error(
              err.error?.message || 'Failed to delete photo.',
              'Deletion Error'
            );
            console.error('Error deleting photo:', err);
            this.isUploading = false; 
          },
        });
    } else {
      this.toastr.error(
        'Cannot delete a photo without a key. Please refresh if this is an error.',
        'Error'
      );
    }
  }
}


 */

// almost working

/* import { Component, OnInit, Input } from '@angular/core';
import { CommonModule, NgFor, NgIf, NgStyle } from '@angular/common';

import { PhotoUploadService, FetchedPhoto } from './photo-upload.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClientModule, HttpEventType } from '@angular/common/http'; 

interface TmerPhoto {
  key: string;
  url: string;
  file?: File; 
  status: 'INIT' | 'PENDING' | 'OK' | 'FAIL';
  progress?: number;
}

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, NgStyle, HttpClientModule],
  templateUrl: './photo-upload.component.html',
  styleUrls: ['./photo-upload.component.scss'],
})
export class PhotoUploadComponent implements OnInit {
  @Input() tmerId!: string;

  selectedFiles: TmerPhoto[] = []; 
  uploadedPhotos: TmerPhoto[] = []; 
  isUploading = false; 

  constructor(
    private photoUploadService: PhotoUploadService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    if (this.tmerId) {
      this.getTmerPhotos(this.tmerId); 
    }
  }

  
  private getTmerPhotos(tmerId: string): void {
   
    this.photoUploadService.getPhotos(tmerId).subscribe({
      next: (photos: FetchedPhoto[]) => {
       
        this.uploadedPhotos = photos.map((p: FetchedPhoto) => ({
          key: p.key,
          url: p.url,
          status: 'OK', 
          progress: 100, 
        }));
        console.log('Fetched existing uploaded photos:', this.uploadedPhotos);
      },
      error: (err: any) => {
      
        this.toastr.error('Failed to load existing photos.', 'Error');
        console.error('Error fetching photos:', err);
      },
    });
  }

  
  processFiles(event: any): void {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    Array.from(files).forEach((file: any) => {
   
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        this.toastr.error('Only JPEG, PNG, and GIF images are allowed.');
        return;
      }

    
      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error(`File "${file.name}" is too large. Max 5MB allowed.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
       
        this.selectedFiles.push({
          file: file,
          url: e.target.result, 
          key: '', 
          status: 'INIT', // 
          progress: 0, 
        });
      };
      reader.readAsDataURL(file); 
    });

   
    event.target.value = '';
  }

 
  uploadPhotos(): void {
    const filesToUpload = this.selectedFiles.filter((f) => f.status === 'INIT');

    if (filesToUpload.length === 0) {
      this.toastr.warning('No new photos selected for upload.');
      return;
    }

    this.isUploading = true; 

    const formData = new FormData();
    filesToUpload.forEach((fileSnippet) => {
      if (fileSnippet.file) {
      
        formData.append('photos', fileSnippet.file, fileSnippet.file.name);
        fileSnippet.status = 'PENDING'; 
        fileSnippet.progress = 0; 
      }
    });

    
    this.photoUploadService.uploadPhotos(this.tmerId, formData).subscribe({
      next: (event: any) => {
       
        if (event.type === HttpEventType.UploadProgress && event.total) {
          const percentDone = Math.round((100 * event.loaded) / event.total);
         
          filesToUpload.forEach((f) => {
            if (f.status === 'PENDING') {
              f.progress = percentDone;
            }
          });
        }
        
        else if (event.type === HttpEventType.Response) {
          const response = event.body;
          if (response && response.photos && response.keys) {
           
            filesToUpload.forEach((f, index) => {
              f.status = 'OK';
              f.url = response.photos[index]; 
              f.key = response.keys[index]; 
              f.progress = 100;
              this.uploadedPhotos.push(f); 
            });
            
            this.selectedFiles = this.selectedFiles.filter(
              (f) => f.status !== 'OK' && f.status !== 'PENDING'
            );
            this.toastr.success(
              `${response.photos.length} photos uploaded successfully!`
            );
          }
          this.isUploading = false; 
        }
      },
      error: (err: any) => {
        
        console.error('Photo upload error:', err);
       
        filesToUpload.forEach((f) => {
          f.status = 'FAIL';
          f.progress = 0;
        });
        this.toastr.error('Failed to upload photos.', 'Upload Error');
        this.isUploading = false; 
      },
    });
  }

 
  removeSelectedFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  deleteUploadedPhoto(photoToDelete: TmerPhoto): void {
    if (!confirm('Are you sure you want to delete this photo? This cannot be undone.')) {
      return;
    }

    if (photoToDelete.key) {
      
      this.photoUploadService
        .deletePhoto(this.tmerId, photoToDelete.key)
        .subscribe({
          next: () => {
            
            this.uploadedPhotos = this.uploadedPhotos.filter(
              (p) => p.key !== photoToDelete.key
            );
            this.toastr.success('Photo deleted successfully!');
          },
          error: (err: any) => {
            
            this.toastr.error('Failed to delete photo.', 'Deletion Error');
            console.error('Error deleting photo:', err);
          },
        });
    } else {
      this.toastr.error(
        'Cannot delete a photo without a key. Please refresh if this is an error.',
        'Error'
      );
    }
  }
}
 */

/* import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCropperModule, ImageCroppedEvent } from 'ngx-image-cropper';
import { ToastrService } from 'ngx-toastr';
import { PhotoUploadService } from './photo-upload.service';

class FileSnippet {
  static readonly IMAGE_SIZE = { width: 850, height: 650 };
  pending = false;
  status: 'INIT' | 'OK' | 'FAIL' = 'INIT';
  constructor(public src: string, public file: File) {}
}

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  imports: [CommonModule, ImageCropperModule],
  templateUrl: './photo-upload.component.html',
  styleUrls: ['./photo-upload.component.scss'],
})
export class PhotoUploadComponent {
  @Output() imageUploaded = new EventEmitter<string>();

  imageChangedEvent: any = null;
  selectedFiles: FileSnippet[] = [];
  uploadedImages: string[] = [];

  constructor(
    private toastr: ToastrService,
    private photoUploadService: PhotoUploadService
  ) {}

  processFiles(event: any) {
    const files = event.target.files;
    for (let file of files) {
      if (['image/jpeg', 'image/png'].includes(file.type)) {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
          if (
            img.width >= FileSnippet.IMAGE_SIZE.width &&
            img.height >= FileSnippet.IMAGE_SIZE.height
          ) {
            this.selectedFiles.push(new FileSnippet('', file));
          } else {
            this.toastr.error('Image too small. Minimum: 850x650');
          }
          URL.revokeObjectURL(url);
        };

        img.src = url;
      } else {
        this.toastr.error('Only JPEG and PNG allowed');
      }
    }
  }

  imageCropped(event: ImageCroppedEvent, index: number) {
    if (event.base64) {
      const file = this.base64ToFile(event.base64, `cropped-${Date.now()}.jpg`);
      this.selectedFiles[index] = new FileSnippet(event.base64, file);
    }
  }

  base64ToFile(base64: string, filename: string): File {
    const byteString = atob(base64.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
    return new File([blob], filename, { type: 'image/jpeg' });
  }

  uploadAll() {
    this.selectedFiles.forEach((snippet) => {
      snippet.pending = true;

      this.photoUploadService.uploadImage(snippet.file).subscribe({
        next: (res) => {
          snippet.pending = false;
          snippet.status = 'OK';
          this.uploadedImages.push(res); // ✅ Corrected here
          this.toastr.success('Image uploaded');
        },
        error: () => {
          snippet.pending = false;
          snippet.status = 'FAIL';
          this.toastr.error('Upload failed');
        },
      });
    });
  }

  removeImage(imageUrl: string, index: number) {
    this.photoUploadService.deleteImage(imageUrl).subscribe({
      next: () => {
        this.uploadedImages.splice(index, 1);
        this.toastr.success('Image deleted');
      },
      error: () => this.toastr.error('Deletion failed'),
    });
  }
}
 */
