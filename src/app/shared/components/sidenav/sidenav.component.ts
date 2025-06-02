import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import menuItems from './sidenav-items';
import { SidenavService } from './sidenav.service';

@Component({
	selector: 'app-sidenav',
	standalone: true,
	imports: [RouterModule, CommonModule],
	templateUrl: './sidenav.component.html',
	styleUrl: './sidenav.component.scss',
})
export class SidenavComponent {
	public expanded = this.sidenavService.expanded;

	protected items = menuItems;

	constructor(private sidenavService: SidenavService) {}

	public toggleExpand() {
		this.sidenavService.toggleExpand();
	}
}
