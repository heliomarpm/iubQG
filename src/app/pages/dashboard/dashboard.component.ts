import { Component } from '@angular/core';
import { FavoriteComponent } from '../../shared/components/favorite/favorite.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FavoriteComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

flows = [
	{ flowName: 'Jornada 1', pilotVersion: '300', pilotDist: '30% [0;1;2]', publishVersion: '299', publishDist: '70%' },
	{ flowName: 'Jornada 2', pilotVersion: '300', pilotDist: '30% [0;1;2]', publishVersion: '299', publishDist: '70%' },
	{ flowName: 'Jornada 3', pilotVersion: '300', pilotDist: '30% [0;1;2]', publishVersion: '299', publishDist: '70%' }
]

	activities = [
		{ name: 'Jornada 1', id: 'Pilot 1', type: 'Publish' },
		{ name: 'Jornada 2', id: 'Pilot 2', type: 'Publish' },
		{ name: 'Jornada 3', id: 'Pilot 3', type: 'Publish' },
		{ name: 'Jornada 4', id: 'Pilot 4', type: 'Publish' },
		{ name: 'Jornada 5', id: 'Pilot 5', type: 'Publish' },
		{ name: 'Jornada 6', id: 'Pilot 6', type: 'Publish' },
		{ name: 'Jornada 7', id: 'Pilot 7', type: 'Publish' },
		{ name: 'Jornada 8', id: 'Pilot 8', type: 'Publish' },
		{ name: 'Jornada 9', id: 'Pilot 9', type: 'Publish' },
	]
}
