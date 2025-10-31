import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ImageCropperModule } from 'ngx-image-cropper';

import { ImageUploadComponent } from './image-upload.component';
import { ImageUploadService } from './image-upload.service';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    ImageCropperModule,
    ImageUploadComponent, // ✅ Standalone component imported directly
  ],
  declarations: [],
  providers: [ImageUploadService],
  exports: [ImageUploadComponent], // ✅ Re-export for other modules to use
})
export class ImageUploadModule {}

