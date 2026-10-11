import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Verificar sesión
  if (!auth.estaLogueado()) {
    router.navigate(['/login']);
    return false;
  }

  // Verificar rol
  if (!auth.esAdmin()) {
    router.navigate(['/']);
    return false;
  }

  return true;
};