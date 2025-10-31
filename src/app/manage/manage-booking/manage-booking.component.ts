import { Component, OnInit } from '@angular/core';
import { Booking } from 'src/app/booking/shared/booking.model';
import { PaymentService } from 'src/app/payment/share/payment.service';
import { BookingService } from 'src/app/booking/shared/booking.service';
import { TranslateService } from '@ngx-translate/core';
import { Review } from 'src/app/review/share/review.model';


import * as moment from 'moment';

@Component({
  selector: 'app-manage-booking',
  templateUrl: './manage-booking.component.html',
  styleUrls: ['./manage-booking.component.scss'],
})
export class ManageBookingComponent implements OnInit {
  bookings: Booking[];
  payments: any[];
  loading: { [paymentId: string]: boolean } = {};

  constructor(
    private bookingService: BookingService,
    private paymentService: PaymentService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.bookingService.getUserBookings().subscribe(
      (bookings: Booking[]) => {
        this.bookings = bookings;
      },
      (errorResponse: any) => {
        console.error('Error fetching bookings:', errorResponse);
      }
    );

    this.getPendingPayments();
  }

  getPendingPayments() {
    this.paymentService.getPendingPayment().subscribe(
      (payments: any) => {
        this.payments = payments;
      },
      () => {}
    );
  }

  acceptPayment(payment: any) {
    this.loading[payment._id] = true;
    this.paymentService.acceptPayment(payment).subscribe(
      (response) => {
        console.log('Payment accepted:', response);
        payment.status = response.status;
        this.getPendingPayments();
        this.loading[payment._id] = false;
      },
      (errorResponse: any) => {
        console.error('Error accepting payment:', errorResponse);
        this.loading[payment._id] = false;
      }
    );
  }

  declinePayment(payment: any) {
    this.loading[payment._id] = true;
    this.paymentService.declinePayment(payment).subscribe(
      (response) => {
        console.log('Payment declined:', response);
        payment.status = response.status;
        this.getPendingPayments();
        this.loading[payment._id] = false;
      },
      (errorResponse: any) => {
        console.error('Error declining payment:', errorResponse);
        this.loading[payment._id] = false;
      }
    );
  }

  isExpired(endAtText: string) {
    const timeNow = moment();
    const endAt = moment(endAtText);

    return endAt.isBefore(timeNow); // Check if the end date is before the current date
  }

  reviewPublished(bookingIndex: number, review:Review) { 
    this.bookings[bookingIndex]['review'] = review;
  }
  
}

