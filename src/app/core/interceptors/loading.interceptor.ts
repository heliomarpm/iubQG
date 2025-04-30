import { Observable, finalize } from "rxjs";

import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { LoaderService } from "../services/loader.service";

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
	private totalRequests = 0;

	constructor(private loadingService: LoaderService) {}

	intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		this.totalRequests++;
		this.loadingService.setLoading(true);
		return next.handle(request).pipe(
			finalize(() => {
				this.totalRequests--;
				if (this.totalRequests == 0) {
					this.loadingService.setLoading(false);
				}
			})
		);
	}
}

// export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
//   return next(req);
// };
