import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'formatDate',
})
export class FormatDatePipe implements PipeTransform {
  transform(value: string | undefined, format: string = 'Y/MM/DD'): string {
    if (!value) return ''; // Handle undefined or null values
    return moment(value).format(format); // Use the provided format
  }
}
