<script lang="ts">
	const keys = ['trigger', 'popup', 'body', 'presets', 'preset', 'month', 'header', 'title', 'nav', 'grid', 'weekday', 'cell', 'day'];
	const presetNames = ['Today', 'Last 7 days', 'Last 30 days'];
	const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
	const days = Array.from({ length: 30 }, (_, index) => index + 1);

	let selected = $state('day');

	const mark = (key: string) => (key === selected ? 'outline-2 outline-fg' : '');
	const dayShade = (day: number) =>
		day === 9 || day === 13 ? 'bg-accent text-on-accent' : day > 9 && day < 13 ? 'bg-accent-soft' : '';
</script>

<div class="flex flex-wrap overflow-hidden rounded-2xl border border-line bg-surface">
	<div
		role="group"
		aria-label="Classes keys"
		class="grid flex-[1_1_170px] content-start gap-1 p-3 [grid-template-columns:repeat(auto-fill,minmax(96px,1fr))]"
	>
		{#each keys as key (key)}
			<button
				type="button"
				aria-pressed={key === selected}
				onclick={() => (selected = key)}
				class="min-h-11 cursor-pointer rounded-lg px-2.5 text-start font-mono text-[13px] font-medium text-fg aria-pressed:bg-accent aria-pressed:text-on-accent"
			>
				{key}
			</button>
		{/each}
	</div>
	<div
		aria-hidden="true"
		class="flex min-w-0 flex-[3_1_420px] flex-col items-start gap-2 bg-(image:--desk) p-4 sm:p-7"
	>
		<div
			class="flex min-h-[38px] items-center rounded-lg border border-(--glass-border) bg-(--glass) px-3 text-sm outline-offset-2 {mark('trigger')}"
		>
			Nov 9 – 13, 2026
		</div>
		<div
			class="max-w-full rounded-xl border border-(--glass-border) bg-(--glass) p-4 shadow-(--glass-shadow) backdrop-blur-xl outline-offset-[3px] {mark('popup')}"
		>
			<div class="flex flex-wrap gap-5 outline-offset-2 {mark('body')}">
				<div class="flex flex-col gap-1 outline-offset-2 {mark('presets')}">
					{#each presetNames as name (name)}
						<div class="rounded-md px-2.5 py-1.5 text-sm whitespace-nowrap -outline-offset-1 {mark('preset')}">{name}</div>
					{/each}
				</div>
				<div class="flex flex-col outline-offset-2 {mark('month')}">
					<div class="mb-2 flex items-center gap-2 outline-offset-1 {mark('header')}">
						<div class="flex size-8 items-center justify-center rounded-md -outline-offset-1 {mark('nav')}">‹</div>
						<div class="flex-1 text-center text-sm font-semibold outline-offset-1 {mark('title')}">November 2026</div>
						<div class="flex size-8 items-center justify-center rounded-md -outline-offset-1 {mark('nav')}">›</div>
					</div>
					<div class="grid [grid-template-columns:repeat(7,36px)] outline-offset-1 {mark('grid')}">
						{#each weekdays as weekday (weekday)}
							<div class="pb-1 text-center text-[11px] font-medium text-fg-muted -outline-offset-1 {mark('weekday')}">{weekday}</div>
						{/each}
						{#each days as day (day)}
							<div class="box-border h-9 p-0.5 -outline-offset-1 {mark('cell')}">
								<div
									class="flex h-full items-center justify-center rounded-md text-[13px] -outline-offset-1 {dayShade(day)} {mark('day')}"
								>
									{day}
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
