import { Injectable } from '@angular/core';
import { Booking } from '../../booking/shared/booking.model';
import * as moment from 'moment';

@Injectable()
export class HelperService {
  private getRangeOfDates(startAt: any, endAt: any, dateFormat: any) {
    const tempDates = [];
    const mEndAt = moment(endAt);
    let mStartAt = moment(startAt);

    while (mStartAt < mEndAt) {
      tempDates.push(mStartAt.format(dateFormat));
      mStartAt = mStartAt.add(1, 'hour'); // Increment by hours instead of days
    }

    tempDates.push(moment(startAt).format(dateFormat));
    tempDates.push(mEndAt.format(dateFormat));
    return tempDates;
  }

  private formatDate(date: any, dateFormat: any) {
    return moment(date).format(dateFormat);
  }

  public formatBookingDate(date: any) {
    return this.formatDate(date, Booking.DATE_FORMAT);
  }

  public getBookingRangeOfDates(startAt: any, endAt: any) {
    return this.getRangeOfDates(startAt, endAt, Booking.DATE_FORMAT);
  }
}
