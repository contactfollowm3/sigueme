import { Component, OnInit } from '@angular/core';
import { Tmer } from '../shared/tmer.model';
import { TmerService } from '../shared/tmer.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-tmer-create',
  templateUrl: './tmer-create.component.html',
  styleUrls: ['./tmer-create.component.css'],
})
export class TmerCreateComponent implements OnInit {
  newTmer: Tmer;
  tmerCategories = Tmer.CATEGORIES;
  errors: string[] = [];
  isSubmitting = false;

  constructor(
    private tmerService: TmerService,
    private router: Router,
    private translate: TranslateService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.newTmer = new Tmer();
    this.newTmer.shared = false;
  }

  handleImageUpload(signedUrl: string) {
    this.newTmer.image = signedUrl;
    this.errors = this.errors.filter(
      (e) => e !== 'Please upload an image first'
    );
    this.toastr.success('Image uploaded successfully!', 'Success');
  }

  handleImageError() {
    this.errors.push('Please upload an image first');
    this.toastr.error('Image upload failed');
  }

  createTmer() {
    if (!this.newTmer.image) {
      this.errors.push('Please upload an image first');
      this.toastr.error('Please upload an image first');
      return;
    }

    this.isSubmitting = true;
    this.tmerService.createTmer(this.newTmer).subscribe({
      next: (tmer: any) => {
        this.toastr.success('Tmer created successfully');
        this.router.navigate(['/tmers', tmer._id]);
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting = false;
        if (err.error && err.error.errors) {
          this.errors = Object.values(err.error.errors).map(
            (e: any) => e.message
          );
        } else {
          this.errors = [err.message];
        }
      },
    });
  }
}
