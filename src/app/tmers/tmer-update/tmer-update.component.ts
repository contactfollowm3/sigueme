import { TmerService } from './../shared/tmer.service';
import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Tmer } from '../shared/tmer.model';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';

import { UcWordsPipe } from 'ngx-pipes';

@Component({
  selector: 'app-tmer-update',
  templateUrl: './tmer-update.component.html',
  styleUrls: ['./tmer-update.component.scss']
})
export class TmerUpdateComponent implements OnInit {
  tmer: Tmer;
  tmerCategories: string[] = Tmer.CATEGORIES;
  locationSubject: Subject<any> = new Subject();
  private originalTmer: Tmer; // Store the original Tmer data

  constructor(
    private route: ActivatedRoute,
    private tmerService: TmerService,
    private toastr: ToastrService,
    private vcr: ViewContainerRef,
    private upperPipe: UcWordsPipe
  ) {
    this.transformLocation = this.transformLocation.bind(this);
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      console.log(params);
      this.getTmer(params['tmerId']);
    });
  }

  transformLocation(location: string): string {
    return this.upperPipe.transform(location);

  }

  getTmer(tmerId: string): void {
    this.tmerService.getTmerById(tmerId).subscribe(tmer => {
      this.tmer = tmer;
      this.originalTmer = { ...tmer }; // Store a copy of the original data
    });
  }

  updateTmer(tmerId: string | undefined, tmerData: any): void {
    if (tmerId) {
      // Create a copy of the original data to compare with
      const updatedTmerData = { ...this.tmer, ...tmerData };

      if (!updatedTmerData.title || updatedTmerData.title.trim() === '') {
        // Revert to the original title
        tmerData.title = this.originalTmer.title;

        // Show error notification if title is empty
        this.toastr.error('Title cannot be empty', 'Update Error');
        return; // Stop further execution if the validation fails
      }

      this.tmerService.updateTmer(tmerId, tmerData).subscribe(
        (updateTmer: Tmer) => {
          // Handle success
          this.toastr.success('Tmer updated successfully', 'Update Success');
          this.tmer = updateTmer;
          this.originalTmer = { ...updateTmer }; // Update the original data on success

          if (tmerData.city || tmerData.street) {
            this.locationSubject.next(this.tmer.city + ', ' + this.tmer.street);
          }
        },
        (errorResponse: any) => {
          // Handle error
          this.toastr.error('Failed to update Tmer', 'Update Error');
          this.getTmer(tmerId); // Refresh the tmer data to revert any unsuccessful changes
        }
      );
    } else {
      console.error('Tmer ID is undefined');
    }
  }
}
