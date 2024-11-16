// src/app/core/auth/auth.service.ts
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private authUrl = 'https://api.example.com/auth';
	private isLoggedIn$ = new BehaviorSubject<boolean>(this.hasToken());
	private _isLoggedIn$ = this.isLoggedIn$.asObservable();

	constructor(private http: HttpClient) {}

	login(credentials: { email: string; password: string }): Observable<unknown> {
		return this.http.post<{ token: string }>(`${this.authUrl}/login`, credentials).pipe(tap(response => this.setToken(response.token)));
	}

	logout() {
		this.removeToken();
		this.isLoggedIn$.next(false);
	}

	getToken(): string | null {
		return localStorage.getItem('access_token');
	}

	private setToken(token: string): void {
		localStorage.setItem('access_token', token);
		this.isLoggedIn$.next(true);
	}

	private removeToken(): void {
		localStorage.removeItem('access_token');
	}

	private hasToken(): boolean {
		return !!localStorage.getItem('access_token');
	}
}
