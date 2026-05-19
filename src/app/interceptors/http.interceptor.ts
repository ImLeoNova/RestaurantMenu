import { HttpInterceptorFn } from '@angular/common/http';
import {
  inject,
  createComponent,
  ApplicationRef,
  EnvironmentInjector,
  EmbeddedViewRef,
} from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoaderService } from '../services/loader.service';
export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);

  loaderService.show();

  return next(req).pipe(
    finalize(() => {
      loaderService.hide();
    }),
  );
};
