import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

import { NgxSpinnerModule } from 'ngx-spinner';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(), 
    provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),
    provideAnimations(),
    importProvidersFrom(NgxSpinnerModule.forRoot({type: 'square-spin'}))
  ]
};
