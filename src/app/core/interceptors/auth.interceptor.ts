import { Injectable } from '@angular/core';
import {	HttpInterceptor, HttpRequest, HttpHandler, HttpEvent} from '@angular/common/http';
import { Observable } from 'rxjs';
import { SKIP_TOKEN, TokenService } from '../services/token.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
	constructor(private tokenService: TokenService) { }

	intercept(req: HttpRequest<unknown>,next: HttpHandler): Observable<HttpEvent<unknown>> {

		// exemplo de uso:
		// this.http.get('/api/public', {context: new HttpContext().set(SKIP_TOKEN, true)})
		if (req.context.get<boolean>(SKIP_TOKEN)) {
			return next.handle(req);
		}

		// exemplo de uso:
		// this.http.get('/api/public', {headers: new HttpHeaders().set('X-Skip-Token', 'true')})
		if (req.headers.has('X-Skip-Token')) {
			const modifiedReq = req.clone({
				headers: req.headers.delete('X-Skip-Token'),
			});
			return next.handle(modifiedReq);
		}

		const token = this.tokenService.getToken();
		if (token) {
			const authReq = req.clone({
				setHeaders: {
					Authorization: `Bearer ${token}`,
				},
			});
			return next.handle(authReq);
		}

		return next.handle(req);
	}
}
