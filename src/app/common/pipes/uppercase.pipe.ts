/* import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name:'upper'
})
export class UppercasePipe implements PipeTransform {
    transform(value:string): string {
        const transformedValue = value.toUpperCase();
        return transformedValue;
    }
}
 */


import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'upper'
})
export class UppercasePipe implements PipeTransform {
    transform(value: string | undefined): string {
        if (typeof value === 'string') {
            return value.toUpperCase();
        } else {
            return '';
        }
    }
}
