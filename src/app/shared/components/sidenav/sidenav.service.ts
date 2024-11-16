import { Injectable, signal } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class SidenavService {
	public expanded = signal(this.localExpanded);
	public screenWidth = signal<number>(window.innerWidth);

	// constructor() {
	// 	effect(() => {
	// 	  console.log("Sidenav Expanded: ", this.expanded());
	// 	})
	// }

	private get localExpanded() {
		return localStorage.getItem('sidenavExpanded') !== 'false';
	}

	private set localExpanded(value) {
		localStorage.setItem('sidenavExpanded', String(value));
	}

	public toggleExpand() {
		this.expanded.update(value => !value);
		this.localExpanded = this.expanded();

		return this.expanded();
	}

	public sizeScreen() {
		if (!this.localExpanded && !this.expanded()) {
			return;
		}

		this.screenWidth.set(window.innerWidth);
		this.screenWidth() < 768 ? this.expanded.set(false) : this.expanded.set(this.localExpanded);
	}

	public initialize() {
		this.sizeScreen();
	}
}
