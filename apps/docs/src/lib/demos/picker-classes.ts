import type { PickerClasses } from '@frostycle/rime/date-picker';

export const pickerClasses: PickerClasses = {
	trigger:
		'rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 data-hover:bg-gray-50 data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-blue-600 data-open:border-blue-600 data-disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:data-hover:bg-gray-700',
	popup:
		'rounded-lg border border-gray-200 bg-white p-4 text-gray-900 shadow-lg transition duration-150 ease-out data-closed:-translate-y-1 data-closed:opacity-0 motion-reduce:transition-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100',
	body: 'flex flex-wrap gap-6',
	presets: 'flex flex-col gap-1',
	preset:
		'rounded-md px-2 py-1 text-start text-sm data-hover:bg-gray-100 data-focus:outline-2 data-focus:outline-blue-600 disabled:opacity-40 dark:data-hover:bg-gray-700',
	header: 'mb-2 flex items-center gap-2',
	title: 'flex-1 text-center text-sm font-semibold',
	nav: 'size-8 rounded-md data-hover:bg-gray-100 data-focus:outline-2 data-focus:outline-blue-600 dark:data-hover:bg-gray-700',
	weekday: 'pb-1 text-xs font-medium text-gray-500 dark:text-gray-400',
	cell: 'p-0',
	day: 'size-9 rounded-md text-sm data-hover:bg-gray-100 data-focus:outline-2 data-focus:outline-blue-600 data-today:font-bold data-in-range:rounded-none data-in-range:bg-blue-100 data-range-start:rounded-s-md data-range-end:rounded-e-md data-range-start:bg-blue-600 data-range-start:text-white data-range-end:bg-blue-600 data-range-end:text-white data-selected:bg-blue-600 data-selected:text-white data-disabled:opacity-40 dark:data-hover:bg-gray-700 dark:data-in-range:bg-blue-900 dark:data-range-start:bg-blue-600 dark:data-range-end:bg-blue-600 dark:data-selected:bg-blue-600'
};
