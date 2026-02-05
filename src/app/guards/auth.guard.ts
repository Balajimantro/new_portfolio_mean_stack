import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticatedOnce().pipe(
    map((isAuthed) => (isAuthed ? true : router.parseUrl('/admin/login'))),
    catchError((error) => {
      router.navigate(['/admin/login']);
      return of(false);
    })
  );
};
