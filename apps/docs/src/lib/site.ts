export const NAV: { heading: string; links: { href: string; label: string }[] }[] = [
	{
		heading: 'Getting started',
		links: [
			{ href: '/', label: 'Introduction' },
			{ href: '/installation', label: 'Installation' },
			{ href: '/styling', label: 'Styling with Tailwind' },
			{ href: '/how-its-built', label: "How it's built" }
		]
	},
	{
		heading: 'Components',
		links: [
			{ href: '/date-pickers', label: 'Date pickers' },
			{ href: '/dropdown-menu', label: 'Dropdown menu' },
			{ href: '/select', label: 'Select' },
			{ href: '/native-select', label: 'Native select' },
			{ href: '/combobox', label: 'Combobox' }
		]
	}
];

export const ROUTES: string[] = NAV.flatMap((group) => group.links.map((link) => link.href));
