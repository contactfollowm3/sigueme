import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CamelizePipe } from 'ngx-pipes';
import { of } from 'rxjs'; // Import the 'of' operator from RxJS


// Define an interface for the coordinates object
interface Coordinates {
    lat: number;
    lng: number;
  }

@Injectable()
export class MapService {


    

    private geoCoder: google.maps.Geocoder;
    private locationCache: any = {};

    constructor(private cameLizePipe: CamelizePipe) {}

    private camelize(value:string): string {
        return this.cameLizePipe.transform(value);
    }

    private cacheLocation(location: string, coordinates:any) {
        

        this.locationCache[this.camelize(location)] = coordinates;
    }

    private isLocationCached(location: string): boolean {
        return this.locationCache[this.camelize(location)];
    }


    public geocodeLocation(location: string): Observable<any> {
        
        if(!this.geoCoder) {this.geoCoder = new window.google.maps.Geocoder();}

        return new Observable((observer) => {
            this.geoCoder.geocode({address: location}, (result,status) => {
                if (status === 'OK') {
                    const geometry = result[0].geometry.location;
                    const coordinates = {lat: geometry.lat(), lng: geometry.lng()};
                    this.cacheLocation(location, coordinates);

                    observer.next(coordinates);
                }else {
                    observer.error('Location could not be geocoded');
                }
            });
        });
    }

    //public geocodeLocation(location: string): Observable<any> {
    public getGeoLocation(location: string): Observable<any> {
        //this.geoCoder = new window.google.maps.Geocoder();

       
            if(this.isLocationCached(location)) {
                return of(this.locationCache[this.camelize(location)]);
            }else{
               return this.geocodeLocation(location);
            }
    }
}