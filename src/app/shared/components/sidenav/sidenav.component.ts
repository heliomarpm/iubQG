import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SidenavService } from './sidenav.service';
import menuItems from './sidenav-items';


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
