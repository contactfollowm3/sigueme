import { Component } from '@angular/core';
import { EditableComponent } from '../editable-component';
import { ImageUploadComponent } from 'src/app/common/components/image-upload/image-upload.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-editable-image',
  standalone: true,
  imports: [CommonModule,  ImageUploadComponent], // Include ImageUploadComponent in imports
  templateUrl: './editable-image.component.html',
  styleUrls: ['./editable-image.component.scss'],
})
export class EditableImageComponent extends EditableComponent {
  // Handle the image upload event
  handleImageUpload(imageUrl: string) {
    this.entity[this.entityField] = imageUrl;
    this.updateEntity();
  }

  // Handle the image upload error
  handleImageError() {
    this.cancelUpdate();
    console.error('Image upload error occurred'); // Replace with actual logic as needed
  }

  handleImageLoad() {
    this.isActiveInput = true;
  }
}
