import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Booking } from 'src/app/booking/shared/booking.model';
import { HelperService } from 'src/app/common/service/helper.service';
import { BookingService } from '../../../booking/shared/booking.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { DaterangepickerComponent } from 'ng2-daterangepicker';
import { AuthService } from 'src/app/auth/shared/auth.service';
import * as moment from 'moment';
import { Tmer } from '../../shared/tmer.model';


@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'bwm-tmer-detail-booking',
  templateUrl: './tmer-detail-booking.component.html',
  styleUrls: ['./tmer-detail-booking.component.scss'],
})
export class TmerDetailBookingComponent implements OnInit {
  @ViewChild(DaterangepickerComponent) private picker:
    | DaterangepickerComponent
    | undefined;

  @Input() tmer: Tmer | undefined;
  newBooking: Booking;
  modalRef: any;

  public daterange: any = {};
  bookedOutDates: any[] = [];
  errors: any[] = [];

  public options: any = {
    locale: {
      format: 'YYYY/MM/DD HH:mm', // Ensure this includes time
      separator: ' - ',
      applyLabel: 'Apply',
      cancelLabel: 'Cancel',
      daysOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      monthNames: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ],
      firstDay: 1,
    },
    alwaysShowCalendars: false,
    opens: 'left',
    autoUpdateInput: false,
    timePicker: true, // Enable time picker
    timePicker24Hour: true, // Use 24-hour format
    timePickerIncrement: 30, // Set time increments (e.g., 30 minutes)
    timePickerSeconds: false, // Hide seconds
    singleDatePicker: false, // Allow range selection
    showDropdowns: true, // Show month and year dropdowns
    isInvalidDate: this.checkForInvalidDates.bind(this),  //here i disable for testin date before current one
  };

  constructor(
    private helper: HelperService,
    private modalService: NgbModal,
    private bookingService: BookingService,
    private toastr: ToastrService,
    public auth: AuthService
  ) {
    this.errors = [];
  }

  ngOnInit(): void {
    this.newBooking = new Booking();
    this.getBookedOutDates();
    this.errors = [];
  }

  private checkForInvalidDates(date: any) {
    return (
      this.bookedOutDates.includes(this.helper.formatBookingDate(date)) ||
      date.diff(moment(), 'hours') < 0 // Changed from days to hours
    );
  }

  private getBookedOutDates() {
    const bookings: Booking[] = this.tmer?.bookings || [];

    if (bookings && bookings.length > 0) {
      bookings.forEach((booking: Booking) => {
        const dateRange = this.helper.getBookingRangeOfDates(
          booking.startAt,
          booking.endAt
        );
        this.bookedOutDates.push(...dateRange);
      });
    }
  }

  private addNewBookedDates(bookingData: any) {
    const dateRange = this.helper.getBookingRangeOfDates(
      bookingData.startAt,
      bookingData.endAt
    );
    this.bookedOutDates.push(...dateRange);
  }

  private resetDatePicker() {
    this.picker?.datePicker.setStartDate(moment());
    this.picker?.datePicker.setEndDate(moment());
    this.picker?.datePicker.element.val('');
  }

  openConfirmModal(content: any) {
    this.errors = [];
    this.modalRef = this.modalService.open(content);
  }

  onPaymentConfirmed(paymentToken: any) {
  
    this.newBooking.paymentToken = paymentToken;
    
  }

  createBooking() {
    this.newBooking.tmer = this.tmer;
    


    this.bookingService.createBooking(this.newBooking).subscribe(
      (bookingData: any) => {
        this.addNewBookedDates(bookingData);
        this.newBooking = new Booking();
        this.modalRef.close();
        this.resetDatePicker();
        this.toastr.success(
          'Booking has been created, please check your booking detail in manage section',
          'Success'
        );
      },
      (errorResponse: any) => {
        if (errorResponse.status === 422) {
          this.errors = errorResponse.error.errors || [];
        } else {
          console.error('Unexpected error:', errorResponse);
        }
      }
    );
  }

  public selectedDate(value: any, datepicker?: any) {
    const startDate = moment(value.start);
    const endDate = moment(value.end);

    // Ensure the start and end dates are on the same day
    if (!startDate.isSame(endDate, 'day')) {
      this.toastr.error(
        'Please select a time range within the same day.',
        'Invalid Selection'
      );
      this.resetDatePicker();
      return;
    }

    this.options.autoUpdateInput = true;
    this.newBooking.startAt = this.helper.formatBookingDate(startDate);
    this.newBooking.endAt = this.helper.formatBookingDate(endDate);
    this.newBooking.hours = -startDate.diff(endDate, 'hours'); // Calculate hours
    this.newBooking.totalPrice =
      this.newBooking.hours * (this.tmer?.dailyRate ?? 0);
  }
}