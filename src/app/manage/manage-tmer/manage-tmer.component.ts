import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { TmerService } from 'src/app/tmers/shared/tmer.service';
import { ToastrService } from 'ngx-toastr';
import { Tmer } from 'src/app/tmers/shared/tmer.model';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-manage-tmer',
  templateUrl: './manage-tmer.component.html',
  styleUrls: ['./manage-tmer.component.scss'],
})
export class ManageTmerComponent implements OnInit {
  tmers: Tmer[];
  tmerDeleteIndex: number | null = null;

  constructor(
    private tmerService: TmerService,
    public toastr: ToastrService,
    private vcr: ViewContainerRef,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.tmerService.getUserTmers().subscribe(
      (tmers: Tmer[]) => {
        this.tmers = tmers;
      },
      () => {
        // Handle error if needed
      }
    );
  }

  showConfirmation(index: number) {
    this.tmerDeleteIndex = index;
  }

  cancelDelete() {
    this.tmerDeleteIndex = null;
  }

  deleteTmer(tmerId: string) {
    if (
      this.tmerDeleteIndex !== null &&
      this.tmerDeleteIndex >= 0 &&
      this.tmerDeleteIndex < this.tmers.length
    ) {
      const deletedIndex = this.tmers.findIndex((tmer) => tmer._id === tmerId);
      if (deletedIndex !== -1) {
        this.tmerService.deleteTmer(tmerId).subscribe(
          () => {
            this.tmers.splice(deletedIndex, 1);
            this.tmerDeleteIndex = null;
            this.translate
              .get('MANAGE_TMER.TOAST.SUCCESS_DELETE')
              .subscribe((message: string) => {
                this.toastr.success(message, 'Success');
              });
          },
          (errorResponse: HttpErrorResponse) => {
            console.error('Error response:', errorResponse);
            const errorDetail = errorResponse?.error?.errors?.[0]?.detail;
            if (errorDetail) {
              console.error('Error detail:', errorDetail);
              this.toastr.error(errorDetail, 'Failed!');
            } else {
              this.translate
                .get('MANAGE_TMER.TOAST.ERROR_DELETE')
                .subscribe((message: string) => {
                  this.toastr.error(message, 'Failed!');
                });
            }
          }
        );
      }
    }
  }
}
