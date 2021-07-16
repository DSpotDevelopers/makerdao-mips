import {
  AfterViewInit,
  Component,
  ContentChild,
  ContentChildren,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { merge, Subject } from 'rxjs/index';
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
  @Output() activatedLabel: Subject<string> = new Subject<string>();
  @ViewChild('autocomplete') autocompleteRef: ElementRef;
  maxVisibleOptions: number = 6;
  topOptionIndex: number = 0;
  ITEM_OPTION_HEIGHT: number = 25;
  showOptions: Subject<any> = new Subject<any>();
  @Output() closedOptions: Subject<any> = new Subject<any>();
  optionsChanged: boolean = false;

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.options.changes.subscribe((data) => {
      if (this.options.length > 0) {
        this.optionsChanged = true;
        this.topOptionIndex = 0;
        this.focusIndex = 0;

        this.options.toArray().forEach((item, index) => {
          let child: Element = (item.element as HTMLElement).children.item(0);

          if (index === this.focusIndex) {
            child.classList.add('focusOption');
            (child as HTMLElement).focus();
          } else {
            child.classList.remove('focusOption');
          }
        });
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
    if (this.autocompleteRef?.nativeElement) {
      event.preventDefault();
      let size: number = this.options.length;
      this.focusIndex = (size + ++this.focusIndex) % size;

      this.options.toArray().forEach((item, index) => {
        let child: Element = (item.element as HTMLElement).children.item(0);

        if (index === this.focusIndex) {
          child.classList.add('focusOption');
        } else {
          child.classList.remove('focusOption');
        }
      });

      // scrolling settings
      if (this.focusIndex === 0) {
        (this.autocompleteRef.nativeElement as HTMLElement).scrollTo(0, 0);
        this.topOptionIndex = 0;
      }

      const focusedElTop: number = (this.options.toArray()[this.focusIndex]
        .element as HTMLElement).getBoundingClientRect().top;

      const focusedElHeight: number = (this.options.toArray()[this.focusIndex]
        .element as HTMLElement).getBoundingClientRect().height;

      const focusedElParentTop: number = (this.autocompleteRef
        .nativeElement as HTMLElement).getBoundingClientRect().top;

      const parentElHeight: number = (this.autocompleteRef
        .nativeElement as HTMLElement).getBoundingClientRect().height;

      if (focusedElTop < focusedElParentTop) {
        (this.autocompleteRef.nativeElement as HTMLElement).scrollTo(
          0,
          this.focusIndex * this.ITEM_OPTION_HEIGHT
        );
      } else if (
        focusedElTop + focusedElHeight >
        focusedElParentTop + parentElHeight
      ) {
        this.topOptionIndex++;

        (this.autocompleteRef.nativeElement as HTMLElement).scrollTo(
          0,
          (this.focusIndex - this.maxVisibleOptions + 1) *
            this.ITEM_OPTION_HEIGHT
        );
      }
    }
  }

  @HostListener('document:keydown.ArrowUp', ['$event'])
  onArrowUp(event: KeyboardEvent) {
    if (this.autocompleteRef?.nativeElement) {
      event.preventDefault();
      let size: number = this.options.length;
      this.focusIndex = (size + --this.focusIndex) % size;

      this.options.toArray().forEach((item, index) => {
        let child: Element = (item.element as HTMLElement).children.item(0);

        if (index === this.focusIndex) {
          child.classList.add('focusOption');
        } else {
          child.classList.remove('focusOption');
        }
      });

      const focusedElTop: number = (this.options.toArray()[this.focusIndex]
        .element as HTMLElement).getBoundingClientRect().top;

      const focusedElHeight: number = (this.options.toArray()[this.focusIndex]
        .element as HTMLElement).getBoundingClientRect().height;

      const focusedElParentTop: number = (this.autocompleteRef
        .nativeElement as HTMLElement).getBoundingClientRect().top;

      const parentElHeight: number = (this.autocompleteRef
        .nativeElement as HTMLElement).getBoundingClientRect().height;

      if (focusedElTop < focusedElParentTop) {
        (this.autocompleteRef.nativeElement as HTMLElement).scrollTo(
          0,
          this.focusIndex * this.ITEM_OPTION_HEIGHT
        );
      } else if (
        focusedElTop + focusedElHeight >
        focusedElParentTop + parentElHeight
      ) {
        this.topOptionIndex++;

        (this.autocompleteRef.nativeElement as HTMLElement).scrollTo(
          0,
          (this.focusIndex - this.maxVisibleOptions + 1) *
            this.ITEM_OPTION_HEIGHT
        );
      }
    }
  }

  @HostListener('document:keydown.Enter', ['$event'])
  onEnter(event: KeyboardEvent) {
    event.preventDefault();
    if (this.options.length > 0) {
      this.enter.next();
    }

    this.options.toArray()[this.focusIndex]?.element.click();
  }

  ngAfterViewChecked() {
    if (
      this.autocompleteRef?.nativeElement &&
      this.focusIndex === 0 &&
      this.optionsChanged
    ) {
      this.showOptions.next();
      (this.autocompleteRef.nativeElement as HTMLElement).scrollTo(0, 0);
      this.optionsChanged = false;
    }
  }
}
