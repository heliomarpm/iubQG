import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
	name: "filter",
	standalone: true,
})
export class FilterPipe implements PipeTransform {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	transform(items: any[], searchTerm: string, labelKey?: string): any {
		if (!items || !searchTerm) {
			return items;
		}

		return items.filter((item) => item[labelKey || "label"].toLowerCase().includes(searchTerm.toLowerCase()) === true);
	}
}
