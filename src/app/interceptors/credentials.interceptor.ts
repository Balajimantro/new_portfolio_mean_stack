import { HttpInterceptorFn } from '@angular/common/http';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const withCredsReq = req.clone({ withCredentials: true });
  return next(withCredsReq);
};
