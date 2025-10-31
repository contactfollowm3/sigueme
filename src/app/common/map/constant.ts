//export const GOOGLE_MAPS_API_KEY = 'AIzaSyCdtfuOeSvI0vqVKdLKqgZdNckztd5PNGE';

import { InjectionToken } from '@angular/core';

export const GOOGLE_MAPS_API_KEY = new InjectionToken<string>('GOOGLE_MAPS_API_KEY');

export function getGoogleMapsApiKey() {
  return "AIzaSyC6N89vctbjidctpbRGIXVMxYu4QGiPEsk";
}