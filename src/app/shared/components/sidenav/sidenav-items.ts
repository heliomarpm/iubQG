const navItems = [
	{
		type: 'route',
		routeLink: 'dashboard',
		// icon: 'fal fa-home',
		icon: 'window',
		label: 'Painel Principal',
	},
	{
		type: 'route',
		routeLink: 'analyze',
		// icon: 'fal fa-tasks',
		icon: 'troubleshoot',
		label: 'Analisar Construção',
	},
	{
		type: 'route',
		routeLink: 'compare',
		// icon: 'fal fa-not-equal',
		icon: 'compare_arrows',
		// icon: 'text_compare',
		label: 'Comparar Versões',
	},
	{
		type: 'separator',
	},
	{
		type: 'route',
		routeLink: 'table',
		// icon: 'fal fa-table',
		icon: 'table',
		label: 'Listar Blocos',
	},
	{
		type: 'space',
	},
	{
		type: 'separator',
	},
	{
		type: 'route',
		routeLink: 'settings',
		// icon: 'fal fa-cog',
		icon: 'settings',
		label: 'Configurações',
	},
];

export default navItems;
