import { ApplicationConfig, ErrorHandler, provideZoneChangeDetection } from '@angular/core';

import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter, withViewTransitions } from '@angular/router';

import { ROUTES } from './app.routes';
import { GlobalErrorHandlerService } from './shared/services';

//** Angular Animations: https://angular.dev/guide/animations/route-animations */
export const appConfig: ApplicationConfig = {
	providers: [
		provideZoneChangeDetection({ eventCoalescing: true }),
		{ provide: ErrorHandler, useClass: GlobalErrorHandlerService },
		provideRouter(ROUTES, withViewTransitions()),
		provideClientHydration(),
	],
};
