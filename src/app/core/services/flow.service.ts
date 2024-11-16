import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '@environments/environment';
// import { HttpErrorHandlerService } from '../error';

@Injectable({
	providedIn: 'root',
})
export class FlowService {
	baseUrl = environment.apiSD9;
	constructor(
		protected http: HttpClient,
		// private httpError: HttpErrorHandlerService,
	) {}

	get<T>(flowName: string, version: number): Observable<T> {
		return this.http.get<T>(`${this.baseUrl}/${flowName}_${version}.json`);

		// return this.http.get<T[]>(`${this.baseUrl}`, { headers: this.getHeaders(withAuth) }).pipe(catchError(this.httpError.handleError));
	}
}
