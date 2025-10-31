import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Booking } from 'src/app/booking/shared/booking.model';

@Component({
  selector: 'app-manage-tmer-booking',
  templateUrl: './manage-tmer-booking.component.html',
  styleUrls: ['./manage-tmer-booking.component.css'],
})
export class ManageTmerBookingComponent implements OnInit {
  @Input() bookings: Booking[];

  constructor(public modalService: NgbModal) {}

  ngOnInit(): void {
    console.log(this.bookings);
  }
}
