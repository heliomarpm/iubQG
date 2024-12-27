import { APP_INITIALIZER, ApplicationConfig, enableProdMode, ErrorHandler, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient } from '@angular/common/http';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
// import { provideClientHydration } from '@angular/platform-browser';

import { provideToastr } from 'ngx-toastr';

import { ROUTES } from './app.routes';
import { GlobalErrorHandler } from './core/error';
import { HttpErrorInterceptor } from './core/error/http-error.interceptor';
import { LoadingInterceptor } from './core/interceptors/loading.interceptor';

import { environment } from '@env/environment';
import { provideHighlightOptions } from 'ngx-highlightjs';
import { FlowService } from './core/services';


if (environment.production) {
	console.log('Production');
  enableProdMode();
}

export function initializeApp(flowService: FlowService):() => Promise<void> {
  return async () => {
		try {
			await flowService.loadFlows();
		} catch (error) {
			console.error('Error loading flows', error);
		}
  };
}


//** Angular Animations: https://angular.dev/guide/animations/route-animations */
export const appConfig: ApplicationConfig = {
	providers: [
		// provideHttpClient(withInterceptors([AuthInterceptor, ErrorInterceptor])),
		provideHttpClient(),
		{
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      multi: true,
      deps: [FlowService],
    },
		provideZoneChangeDetection({ eventCoalescing: true }),
		importProvidersFrom(HttpClientModule),

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
		provideHighlightOptions({
      coreLibraryLoader: () => import('highlight.js/lib/core'),
      languages: {
				json: () => import('highlight.js/lib/languages/json'),
      }
    })
	],
};
