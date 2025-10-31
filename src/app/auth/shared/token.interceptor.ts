import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { AuthService } from './auth.service';
/* import { Observable } from 'rxjs/Observable';*/
import { Observable } from 'rxjs';


@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(public auth: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    /* console.log('Outgoing request:', request); */
      
    const token = this.auth.getAuthToken();
      
      if (token) {
          request = request.clone({
              setHeaders: {
                  Authorization: 'Bearer ' + token
                }
          });
      }

    return next.handle(request);
  }
}
