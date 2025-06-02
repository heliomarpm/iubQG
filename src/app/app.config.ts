import { provideHighlightOptions } from "ngx-highlightjs";
// import { provideClientHydration } from '@angular/platform-browser';

import { provideToastr } from "ngx-toastr";

import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { APP_INITIALIZER, ApplicationConfig, ErrorHandler, enableProdMode, importProvidersFrom, provideZoneChangeDetection } from "@angular/core";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideRouter, withViewTransitions } from "@angular/router";

import { environment } from "@env/environment";

import { ROUTES } from "./app.routes";
import { GlobalErrorHandler } from "./core/error";
import { HttpErrorInterceptor } from "./core/error/http-error.interceptor";
import { LoadingInterceptor } from "./core/interceptors/loading.interceptor";
import { FlowService } from "./core/services";

if (environment.production) {
	console.log("Production");
	enableProdMode();
}

export function initializeApp(flowService: FlowService): () => Promise<void> {
	return async () => {
		try {
			await flowService.loadFlows();
		} catch (error) {
			console.error("Error loading flows", error);
		}
	};
}

//** Angular Animations: https://angular.dev/guide/animations/route-animations */
export const appConfig: ApplicationConfig = {
	providers: [
		// provideHttpClient(withInterceptors([AuthInterceptor, ErrorInterceptor])),
		// provideHttpClient(withInterceptorsFromDi()),
		// provideHttpClient(),
		// { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
		{ provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
		{ provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
		{ provide: ErrorHandler, useClass: GlobalErrorHandler },
		{
			provide: APP_INITIALIZER,
			useFactory: initializeApp,
			multi: true,
			deps: [FlowService],
		},
		provideZoneChangeDetection({ eventCoalescing: true }),
		importProvidersFrom(HttpClientModule),

		provideRouter(ROUTES, withViewTransitions()),
		provideAnimations(), // required animations providers
		// importProvidersFrom( ToastrModule.forRoot() ),
		provideToastr({
			// timeOut: 10000,
			// positionClass: 'toast-bottom-right',
			preventDuplicates: true,
		}),
		provideHighlightOptions({
			coreLibraryLoader: () => import("highlight.js/lib/core"),
			languages: {
				json: () => import("highlight.js/lib/languages/json"),
			},
		}),
	],
};
