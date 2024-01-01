import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Router } from "@angular/router";
import { ApiService } from "../services/api.service";
import { Observable, map, tap } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private apiService: ApiService,
              private router: Router) {
  }canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.apiService.jwtUserToken.pipe(
      map((result) => !!result),
      tap(result => {
        if (!result) {
          this.router.navigateByUrl('/login').then();
          return result;
        }
        return result;
      })
    );
  }
}