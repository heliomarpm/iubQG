import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'textEllipsis',
	standalone: true,
})
export class TextEllipsisPipe implements PipeTransform {
	transform(value: unknown, maxLength: number): string {
		const text = (typeof value === 'object' ? JSON.stringify(value || '') : value || '') as string;

		if (maxLength > 3 && text.length > maxLength) {
			return `${text.substring(0, maxLength - 3)}...`;
		}

		return text;
	}
}
