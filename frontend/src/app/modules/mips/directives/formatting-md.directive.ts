import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import IFormatting from '../types/formatting';
import { position, offset } from 'caret-pos';
import { fromEvent, Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Directive({
  selector: '[appFormattingMd]',
})
export class FormattingMdDirective implements OnChanges {
  @Input() appFormattingMd: IFormatting[];
  @Input() activate: boolean = false;
  subscriptions: Subscription;

  constructor(private host: ElementRef) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    const chng = changes.activate.currentValue;

    if (chng) {
      this.formatting();

      this.subscriptions = fromEvent(this.host.nativeElement, 'input')
        .pipe(distinctUntilChanged())
        .subscribe((ev: any) => {
          this.formatting();
        });
    } else {
      (this.host.nativeElement as HTMLElement).innerHTML = (this.host
        .nativeElement as HTMLElement).innerText;
      this.subscriptions?.unsubscribe();
    }
  }

  formatting = () => {
    (this.host.nativeElement as HTMLElement).focus();

    if (this.host.nativeElement === document.activeElement) {
      const pos = position(this.host.nativeElement);
      let str: string = (this.host.nativeElement as HTMLElement).innerText;

      this.appFormattingMd.forEach((item) => {
        str = str.replace(item.pattern, item.replace);
      });

      (this.host.nativeElement as HTMLElement).innerHTML = str;
      position(this.host.nativeElement, pos.pos);
    }
  };
}
