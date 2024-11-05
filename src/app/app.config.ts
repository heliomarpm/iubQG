import { provideToastr, ToastrModule } from 'ngx-toastr';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApplicationConfig, ErrorHandler, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
// import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter, withViewTransitions } from '@angular/router';

import { ROUTES } from './app.routes';
import { LoadingInterceptor } from './shared/interceptors/loading.interceptor';
import { GlobalErrorHandlerService } from './shared/services';

//** Angular Animations: https://angular.dev/guide/animations/route-animations */
export const appConfig: ApplicationConfig = {
	providers: [
		provideZoneChangeDetection({ eventCoalescing: true }),
		{ provide: ErrorHandler, useClass: GlobalErrorHandlerService },
		{ provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
		provideRouter(ROUTES, withViewTransitions()),
		provideAnimations(), // required animations providers
		importProvidersFrom(
			ToastrModule.forRoot()
    ),
		// provideToastr(), // Toastr providers
	],
};
