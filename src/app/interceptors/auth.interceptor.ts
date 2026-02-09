import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Agrega Authorization: Bearer <token> a todas las requests si existe token.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  if (!token) return next(req);

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    })
  );
};
