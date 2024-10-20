import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';

import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter, withViewTransitions } from '@angular/router';

import { ROUTES } from './app.routes';

//** Angular Animations: https://angular.dev/guide/animations/route-animations */
export const appConfig: ApplicationConfig = {
	providers: [
		provideRouter(ROUTES, withViewTransitions()),
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideClientHydration(),
	],
};
