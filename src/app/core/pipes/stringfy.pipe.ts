import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stringfy',
  standalone: true
})
export class StringfyPipe implements PipeTransform {

  transform(value: unknown): string {
		return (typeof value === 'object' ? JSON.stringify(value || '') : value || '') as string;
  }

}
