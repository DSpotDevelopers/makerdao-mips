import {
  AfterViewInit,
  Component,
  ContentChild,
  ContentChildren,
  HostListener,
  Input,
  OnInit,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { fromEvent, merge, Subject } from 'rxjs/index';
import { OptionAutocompleteComponent } from '../option-autocomplete/option-autocomplete.component';
import { AutocompleteContentDirective } from '../../directives/autocomplete-content.directive';

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  exportAs: 'appAutocomplete',
})
export class AutocompleteComponent implements OnInit, AfterViewInit {
  @ViewChild('root') rootTemplate: TemplateRef<any>;

  @ContentChild(AutocompleteContentDirective)
  content: AutocompleteContentDirective;

  @ContentChildren(OptionAutocompleteComponent) options: QueryList<
    OptionAutocompleteComponent
  >;

  @Input() labels: string[] = [];
  focusIndex: number = 0;
  @Output() enter: Subject<boolean> = new Subject<boolean>();

  ngOnInit() {}

  ngAfterViewInit() {
    this.options.changes.subscribe(data => {
      if (this.options.length > 0) {
        this.focusIndex = 0;
        let child: Element = (this.options.toArray()[0].element as HTMLElement).children.item(0);
        child.classList.add("focusOption");
        (child as HTMLElement).focus();
      }
    });
  }

  optionsClick() {
    return this.options.changes.pipe(
      switchMap((options) => {
        const clicks$ = options.map((option) => option.click$);
        return merge(...clicks$);
      })
    );
  }

  @HostListener('document:keydown.ArrowDown', ['$event'])
  onArrowDown(event: KeyboardEvent) {
    event.preventDefault();
    let size: number = this.options.length;
    this.focusIndex = (size + ++this.focusIndex) % size;

    this.options.toArray().forEach((item, index) => {
      let child: Element = (item.element as HTMLElement).children.item(0);

      if (index === this.focusIndex) {
        child.classList.add("focusOption");
      } else {
        child.classList.remove("focusOption");
      }
    });
  }

  @HostListener('document:keydown.ArrowUp', ['$event'])
  onArrowUp(event: KeyboardEvent) {
    event.preventDefault();
    let size: number = this.options.length;
    this.focusIndex = (size + --this.focusIndex) % size;

    this.options.toArray().forEach((item, index) => {
      let child: Element = (item.element as HTMLElement).children.item(0);

      if (index === this.focusIndex) {
        child.classList.add("focusOption");
      } else {
        child.classList.remove("focusOption");
      }
    });
  }

  @HostListener('document:keydown.Enter', ['$event'])
  onEnter(event: KeyboardEvent) {
    event.preventDefault();
    if (this.options.length > 0) {
      this.enter.next();
    }

    this.options.toArray()[this.focusIndex]?.element.click();
  }
}
