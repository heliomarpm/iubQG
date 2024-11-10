import { AsyncPipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, input, OnInit } from '@angular/core';

export type FavoriteType = {
	title: string;
	href: string;
	logo?: string;
}

@Component({
	selector: 'app-favorite',
	standalone: true,
	imports: [HttpClientModule, AsyncPipe],
	templateUrl: './favorite.component.html',
	styleUrl: './favorite.component.scss',
})
export class FavoriteComponent implements OnInit  {
	item = input.required<FavoriteType>();

	// item = {
	// 	href: 'https://angular.io',
	// 	// img: 'https://angular.io/assets/images/logos/angular/angular.svg',
	// 	img: this.getFavicon('https://angular.io'),
	// 	titulo: 'Angular',
	// }

	constructor(private http: HttpClient) {

	}
	async ngOnInit() {
		if (!this.item().logo || this.item().logo!.length === 0) {
			this.item().logo = await this.getFavicon(this.item().href);
		}
	}



	async getFavicon(linkUrl: string): Promise<string> {
		return `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${linkUrl}&size=48`;
	}
}
