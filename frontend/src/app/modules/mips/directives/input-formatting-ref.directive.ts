import { Directive, ElementRef } from '@angular/core';
import { FormControl, NgControl } from '@angular/forms';

@Directive({
  selector: '[appInputFormattingRef]'
})
export class InputFormattingRefDirective {

  constructor(private host: ElementRef<HTMLInputElement>) { }

  get origin() {
    return this.host.nativeElement;
  }
}
