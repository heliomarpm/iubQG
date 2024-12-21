import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpContextToken } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class TokenService {
	private tokenSubject = new BehaviorSubject<string | null>(null);
	private tokenExpirationTime: number | null = null;

	constructor(private http: HttpClient) { }

	getToken(): Observable<string | null> {
		if (this.isTokenExpired()) {
			return this.renewToken();
		}
		return this.tokenSubject.asObservable();
	}

	private renewToken(): Observable<string> {
		return this.http.post<{ token: string; expiresIn: number }>('api/obter/token', {}).pipe(
			tap(response => {
				this.tokenSubject.next(response.token);
				this.tokenExpirationTime = response.expiresIn; // Date.now() + response.expiresIn * 1000;
			}),
			map(response => response.token)
		);
	}

	private isTokenExpired(): boolean {
		console.log('isTokenExpired', !this.tokenExpirationTime || Date.now() > this.tokenExpirationTime);
		return !this.tokenExpirationTime || Date.now() > this.tokenExpirationTime;
	}
}

export const SKIP_TOKEN = new HttpContextToken<boolean>(() => false);
export const skipToken = { context: new HttpContext().set(SKIP_TOKEN, true) };
