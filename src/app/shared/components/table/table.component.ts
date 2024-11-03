import { Component, OnInit, input } from '@angular/core';

// import { TableDataType } from './table.type';

@Component({
	selector: 'app-table',
	standalone: true,
	imports: [],
	templateUrl: './table.component.html',
	styleUrl: './table.component.scss',
})
export class TableComponent implements OnInit {
	data = input<Record<string, unknown>>();
// 	keys = computed(() => {
//     if (this.data && this.data.value.length > 0) {
//         return Object.keys(this.data.value[0]);
//     }
//     return [];
// });
	ngOnInit(): void {
		throw new Error('Method not implemented.');
	}
}
