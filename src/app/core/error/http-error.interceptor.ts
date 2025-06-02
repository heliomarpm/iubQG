// import { ToastrService } from 'ngx-toastr';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, Injector, NgZone } from '@angular/core';

// import { ToastrService } from 'ngx-toastr';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
	constructor(
		private injector: Injector,
		private ngZone: NgZone
	) {}

	intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		return next.handle(req).pipe(
			catchError((error: HttpErrorResponse) => {
				console.error('HttpErrorInterceptor~intercept:', error);

				// return this.ngZone.run(() => {
				// 	const toastr = this.injector.get(ToastrService);
				// 	toastr.error(error.message, `Erro HTTP ${error.status}`);

				// 	return throwError(() => error);
				// });
				return throwError(() => error);
			})
		);
	}
}
