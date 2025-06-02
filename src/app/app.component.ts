import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { LoaderService } from './core/services/loader.service';
import { SidenavComponent } from './shared/components/sidenav/sidenav.component';
import { SidenavService } from './shared/components/sidenav/sidenav.service';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet, CommonModule, SidenavComponent, SpinnerComponent],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
	public asideExpanded = this.sidenavService.expanded;
	public screenWidth = signal<number>(window.innerWidth);

	constructor(
		private sidenavService: SidenavService,
		public loaderService: LoaderService
	) {}

	@HostListener('window:resize')
	onResize() {
		this.sidenavService.sizeScreen();
	}

	ngOnInit(): void {
		this.sidenavService.initialize();
	}
}
