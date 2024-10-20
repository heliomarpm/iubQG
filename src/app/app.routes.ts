import { Routes } from '@angular/router';

export const ROUTES: Routes = [
	{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
	{ path: 'dashboard', loadComponent: () => import('./pages/wellcome/wellcome.component').then(m => m.WellcomeComponent) },
	{ path: 'settings', loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent) },

	{ path: '404', loadComponent: () => import('./pages/page-not-found/page-not-found.component').then(m => m.PageNotFoundComponent) },
	{ path: '**', redirectTo: '/404' },
];
