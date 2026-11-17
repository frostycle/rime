import type { SelectClasses } from '@frostycle/rime/select';

export const selectClasses: SelectClasses = {
	trigger:
		'min-w-48 rounded-md border border-gray-300 bg-white px-3 py-2 text-start text-sm text-gray-900 data-hover:bg-gray-50 data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-blue-600 data-open:border-blue-600 data-placeholder:text-gray-500 data-disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:data-placeholder:text-gray-400 dark:data-hover:bg-gray-700',
	popup:
		'min-w-48 rounded-lg border border-gray-200 bg-white p-1.5 text-sm text-gray-900 shadow-lg transition duration-150 ease-out outline-none data-closed:-translate-y-1 data-closed:opacity-0 motion-reduce:transition-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100',
	option:
		'block w-full rounded-md px-2.5 py-1.5 text-start data-highlighted:bg-gray-100 data-selected:font-semibold data-disabled:opacity-50 dark:data-highlighted:bg-gray-700',
	separator: 'mx-1 my-1.5 h-px bg-gray-200 dark:bg-gray-700',
	groupLabel: 'px-2.5 pt-1.5 pb-1 text-xs font-semibold text-gray-500 dark:text-gray-400'
};
