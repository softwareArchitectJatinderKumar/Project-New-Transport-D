import { inject, Injectable } from '@angular/core';
import { CanLoadFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanLoadFn = (route, segments) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  router.navigate(['/login']);
  return false;
};
