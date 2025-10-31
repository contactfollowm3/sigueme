import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TmerService } from '../shared/tmer.service';
import { Tmer } from '../shared/tmer.model';

import { HttpErrorResponse } from '@angular/common/http';
import { error } from 'jquery';

@Component({
  selector: 'app-tmer-search',
  templateUrl: './tmer-search.component.html',
  styleUrls: ['./tmer-search.component.scss']
})
export class TmerSearchComponent implements OnInit {

  city: string;
  tmers: Tmer[] = [];
  errors: any[] = [];
  
  constructor(private route: ActivatedRoute,
    private tmerService: TmerService) {
    this.errors = [];
    
  }
  
  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const cityParam: string = params['city'];
      this.city = cityParam.charAt(0).toUpperCase() + cityParam.slice(1).toLowerCase();
      this.getTmers();
    })
  }


  getTmers() {
  this.tmerService.getTmersByCity(this.city).subscribe(
    (tmers: Tmer[]) => {
      this.tmers = tmers;
      // Clear any previous errors
      this.errors = [];
    },
    (errorResponse: any) => {
      if (errorResponse.status === 404) {
        // Handle 404 error when city is not found
        this.errors = [{ detail: `No Tmers found for city ${this.city}` }];
      } else {
        // Handle other errors
        this.errors = errorResponse.error.errors;
      }
      // Clear tmers array
      this.tmers = [];
    }
  );
}


}
