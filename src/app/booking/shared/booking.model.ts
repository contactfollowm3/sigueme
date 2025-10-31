import { Tmer } from '../../tmers/shared/tmer.model';

export class Booking {
  static readonly DATE_FORMAT = 'Y/MM/DD HH:mm'; // Include time in the format

  _id: string;
  startAt: string;
  endAt: string;
  totalPrice: number;
  guests: number;
  hours: number; // Changed from days to hours
  paymentToken: any;
  createdAt: string;
  tmer?: Tmer;
  review?: any;
}
