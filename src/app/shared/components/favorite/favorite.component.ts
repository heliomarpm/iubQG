import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { lastValueFrom, map, catchError, of } from 'rxjs';

@Component({
	selector: 'app-favorite',
	standalone: true,
	imports: [HttpClientModule],
	templateUrl: './favorite.component.html',
	styleUrl: './favorite.component.scss',
})
export class FavoriteComponent {

	item = {
		href: 'https://angular.io',
		img: 'https://angular.io/assets/images/logos/angular/angular.svg',
		titulo: 'Angular',
	}

	constructor(private http: HttpClient) {}

	async getFavicon(linkUrl: string): Promise<string> {
		const defaultFavicon = `${new URL(linkUrl).origin}/favicon.ico`;
		// const fallbackApi = `https://www.google.com/s2/favicons?domain=${new URL(linkUrl).hostname}`;
		const fallbackApi = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${linkUrl}&size=64`;

		return await lastValueFrom(
			this.http.get(linkUrl, { responseType: 'text' }).pipe(
				map(html => {
					const parser = new DOMParser();
					const doc = parser.parseFromString(html, 'text/html');
					const iconLink = doc.querySelector("link[rel*='icon']");
					return iconLink ? (iconLink.getAttribute('href') ?? defaultFavicon) : defaultFavicon;
				}),
				catchError(() => of(fallbackApi)),
			),
		);
	}
}
