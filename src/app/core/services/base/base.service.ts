import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ErrorHandlerService } from '../error';

export abstract class BaseService<T> {
	constructor(
		protected http: HttpClient,
		private baseUrl: string,
		private errorHandler: ErrorHandlerService
	) {}

	getAll(withAuth: boolean = false): Observable<T[]> {
		return this.http.get<T[]>(`${this.baseUrl}`, { headers: this.getHeaders(withAuth) }).pipe(catchError(this.errorHandler.handleError));
	}

	getById(id: number, withAuth: boolean = false): Observable<T> {
		return this.http.get<T>(`${this.baseUrl}/${id}`, { headers: this.getHeaders(withAuth) }).pipe(catchError(this.errorHandler.handleError));
	}

	create(data: T, withAuth: boolean = false): Observable<T> {
		return this.http.post<T>(`${this.baseUrl}`, data, { headers: this.getHeaders(withAuth) }).pipe(catchError(this.errorHandler.handleError));
	}

	update(id: number, data: T, withAuth: boolean = false): Observable<T> {
		return this.http.put<T>(`${this.baseUrl}/${id}`, data, { headers: this.getHeaders(withAuth) }).pipe(catchError(this.errorHandler.handleError));
	}

	delete(id: number, withAuth: boolean = false): Observable<void> {
		return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getHeaders(withAuth) }).pipe(catchError(this.errorHandler.handleError));
	}

	protected getHeaders(withAuth: boolean = false): HttpHeaders {
		let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		if (withAuth) {
			const token = localStorage.getItem('token');
			if (token) headers = headers.set('Authorization', `Bearer ${token}`);
		}
		return headers;
	}
}
