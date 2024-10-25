import { Routes } from '@angular/router';

export const ROUTES: Routes = [
	{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
	{ path: '404', loadComponent: () => import('./pages/page-not-found/page-not-found.component').then(c => c.PageNotFoundComponent) },
	{ path: 'welcome', loadComponent: () => import('./pages/welcome/welcome.component').then(c => c.WelcomeComponent) },
	{ path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(c => c.DashboardComponent) },	
	{ path: 'analyze', loadComponent: () => import('./pages/analyze/analyze.component').then(c => c.AnalyzeComponent) },	
	{ path: 'compare', loadComponent: () => import('./pages/compare/compare.component').then(c => c.CompareComponent) },	
	{ path: 'settings', loadComponent: () => import('./pages/settings/settings.component').then(c => c.SettingsComponent) },
	{ path: '**', redirectTo: '/404' },
];
