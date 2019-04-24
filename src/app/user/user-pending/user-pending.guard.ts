import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '.././auth.service';
import { map, take } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class UserPendingGuard implements CanActivate {

  constructor(
    private router: Router,
    private cookieService: CookieService,
    private authService: AuthService
  ) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.isPending
      .pipe(
        take(1),
        map((isPending: boolean) => {
          console.log(isPending);
          if (!isPending) {
            return true;
          }
          console.log(state.url);
          this.authService.redirectUrl = state.url;

          this.router.navigate(['/user-pending']);
          return false;
        })
      );
  }
}
