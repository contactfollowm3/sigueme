import { Injectable } from '@angular/core';
import { TmerService } from './tmer.service';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class TmerGuard implements CanActivate {
  constructor(private tmerService: TmerService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const tmerId: string = route.params['tmerId'];

    return this.tmerService.verifyTmerUser(tmerId).pipe(
      map(() => true),
      catchError(() => {
        // Optionally, you can navigate to an error page or show a message
        // this.router.navigate(['error-page']);
        this.router.navigate(['/tmers']);
        return of(false);
      })
    );
  }
}
