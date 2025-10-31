import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUploadService } from './image-upload.service';
import { ImageCropperModule, ImageCroppedEvent } from 'ngx-image-cropper';
import { ToastrService } from 'ngx-toastr';
import { NgStyle } from '@angular/common';

class FileSnippet {
  static readonly IMAGE_SIZE = { width: 850, height: 650 };
  pending: boolean = false;
  status: string = 'INIT';
  constructor(public src: string, public file: File) {}
}

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, ImageCropperModule, NgStyle],
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss'],
})
export class ImageUploadComponent {
  @Output() imageUploaded = new EventEmitter<string>();
  @Output() imageError = new EventEmitter<string>();
  @Output() imageLoadedToContainer = new EventEmitter<void>();
  @Output() croppingCanceled = new EventEmitter<void>();

  selectedFile?: FileSnippet;
  imageChangedEvent: any;
  isUploading = false;

  constructor(
    private toastr: ToastrService,
    private imageService: ImageUploadService
  ) {}

  private onSuccess(imageUrl: string) {
    this.isUploading = false;
    if (this.selectedFile) {
      this.selectedFile.pending = false;
      this.selectedFile.status = 'OK';
      this.selectedFile.src = imageUrl;
    }
    this.imageUploaded.emit(imageUrl);
    this.toastr.success('Image uploaded successfully!');
  }

  private onFailure(error: any) {
    this.isUploading = false;
    if (this.selectedFile) {
      this.selectedFile.pending = false;
      this.selectedFile.status = 'FAIL';
    }
    const errorMsg = error?.message || 'Image upload failed';
    this.toastr.error(errorMsg);
    this.imageError.emit(errorMsg);
  }

  private base64ToFile(base64: string, filename: string): File {
    const byteString = atob(base64.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }

    return new File(
      [new Blob([arrayBuffer], { type: 'image/jpeg' })],
      filename,
      { type: 'image/jpeg' }
    );
  }

  imageCropped(event: ImageCroppedEvent) {
    if (event.base64) {
      const file = this.base64ToFile(event.base64, 'cropped-image.jpg');
      this.selectedFile = new FileSnippet(event.base64, file);
      console.log("The value looking for is: ", this.selectedFile.file);

    }
  }

  processFile(event: any) {
    
    const file = event.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      this.toastr.error('Only JPEG and PNG images are allowed');
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      if (
        img.width >= FileSnippet.IMAGE_SIZE.width &&
        img.height >= FileSnippet.IMAGE_SIZE.height
      ) {
        this.imageChangedEvent = event;
      } else {
        this.toastr.error(
          `Minimum image size: ${FileSnippet.IMAGE_SIZE.width}x${FileSnippet.IMAGE_SIZE.height}px`
        );
      }
      URL.revokeObjectURL(url);
    };

    img.onerror = () => {
      this.toastr.error('Invalid image file');
      URL.revokeObjectURL(url);
    };

    img.src = url;
  }

  uploadImage() {
    if (!this.selectedFile?.file) {
      this.toastr.warning('Please select and crop an image first');
      return;
    }

    this.isUploading = true;
    this.selectedFile.pending = true;

   

    this.imageService.uploadImage(this.selectedFile.file).subscribe({
      next: (imageUrl) => this.onSuccess(imageUrl),
      error: (err) => this.onFailure(err),
    });
  }

  cancelCropping() {
    this.imageChangedEvent = null;
    this.selectedFile = undefined;
    this.croppingCanceled.emit();
  }

  imageLoaded() {
    this.imageLoadedToContainer.emit();
  }

  cropperReady() {
    console.log('Cropper ready');
  }
}

