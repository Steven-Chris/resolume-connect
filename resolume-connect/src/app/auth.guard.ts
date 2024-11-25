import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private canAccessProgram = true; //! FOR TESTING IT IS TRUE

  constructor(private router: Router) {}

  canActivate(): boolean {
    if (!this.canAccessProgram) {
      this.router.navigate(['/program']);
      return false;
    }
    return true;
  }

  allowAccess() {
    this.canAccessProgram = true;
  }

  revokeAccess() {
    this.canAccessProgram = false;
  }
}
