import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
	constructor(
		private authService: AuthService,
		private router: Router
	) {}

	intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		const token = this.authService.getToken();

		if (token && !this.authService.isTokenExpired()) {
			req = req.clone({
				headers: req.headers.set('Authorization', `Bearer ${token}`),
			});
		} else if (token && this.authService.isTokenExpired()) {
			this.authService.clearToken();
			this.router.navigate(['/login']); // Redireciona para login se token expirou
			return throwError(() => 'Sessão expirada. Faça login novamente.');
		}

		return next.handle(req).pipe(
			catchError((error: HttpErrorResponse) => {
				if (error.status === 401) {
					this.router.navigate(['/login']);
				}
				return throwError(() => error);
			})
		);
	}
}
