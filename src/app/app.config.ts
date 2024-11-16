import { provideToastr } from 'ngx-toastr';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ApplicationConfig, ErrorHandler, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
// import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter, withViewTransitions } from '@angular/router';

import { ROUTES } from './app.routes';
import { GlobalErrorHandler } from './core/error';
import { HttpErrorInterceptor } from './core/error/http-error.interceptor';
import { LoadingInterceptor } from './core/interceptors/loading.interceptor';


import { enableProdMode } from '@angular/core';
import { environment } from '@environments/environment';

if (environment.production) {
	console.log('Production');
  enableProdMode();
}

//** Angular Animations: https://angular.dev/guide/animations/route-animations */
export const appConfig: ApplicationConfig = {
	providers: [
		provideZoneChangeDetection({ eventCoalescing: true }),
		importProvidersFrom(HttpClientModule),
		// provideHttpClient(withInterceptors([AuthInterceptor, ErrorInterceptor])),

		{ provide: ErrorHandler, useClass: GlobalErrorHandler },
		{ provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
		{ provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },

		provideRouter(ROUTES, withViewTransitions()),
		provideAnimations(), // required animations providers
		// importProvidersFrom( ToastrModule.forRoot() ),
		provideToastr({
			// timeOut: 10000,
			// positionClass: 'toast-bottom-right',
			preventDuplicates: true,
		}),
	],
};
