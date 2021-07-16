import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  ChangeDetectorRef,
  AfterViewInit,
} from '@angular/core';
import { from, Observable, ObservableInput, Subject, Subscription } from 'rxjs';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { FormControl } from '@angular/forms';
import { SmartSearchService } from '../../services/smart-search.service';
import { debounceTime, map } from 'rxjs/operators';
import { position, offset } from 'caret-pos';
import IFormatting from '../../types/formatting';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent implements OnInit, AfterViewInit {
  @Input() placeHolder? = 'Search on the list';
  @Input() imageDir? = '../../../../../assets/images/magnifier.png';
  @Input() imageClose? = '../../../../../assets/images/close.png';
  @Output() send = new EventEmitter();
  timeout: any = null;
  @ViewChild('search') inputSearch;
  showClose = false;
  @Input() showListSearch = false;
  @Input() listSearchItems = [];
  @Output() clickSearchItem = new Subject<any>();
  @Input() value: string;
  isQueryMode: boolean = false;
  positionHelpPopup: ConnectedPosition[] = new Array<ConnectedPosition>();
  isOpenHelpPopup: boolean = false;
  helpIconDark: string = '../../../../../assets/images/help_icon.svg';
  helpIconBlue: string = '../../../../../assets/images/help_icon_blue.svg';
  @Input() error: boolean = false;
  @Input() errorMessage: string = '';
  options = [];
  control = new FormControl();
  indexCaretPositionStart: number;
  indexCaretPositionEnd: number = 0;
  isFilteringOption: boolean = false;
  selectedAutocompleteOptionByEnter: boolean = false;
  activatedLabelAutocomplete: string;
  searchOptionsSubscription: Subscription;
  format: IFormatting[] = [
    {
      pattern: /and\(/gi,
      replace: "<span style='font-weight:bold;'>AND</span>(",
    },
    {
      pattern: /or\(/gi,
      replace: "<span style='font-weight:bold;'>OR</span>(",
    },
    {
      pattern: /not\(/gi,
      replace: "<span style='font-weight:bold;'>NOT</span>(",
    },
    {
      pattern: /@accepted/gi,
      replace: "@<span style='font-weight:500;color:#27AE60'>Accepted</span>",
    },
    {
      pattern: /@rejected/gi,
      replace: "@<span style='font-weight:500;color:#EB5757'>Rejected</span>",
    },
    {
      pattern: /@rfc/gi,
      replace: "@<span style='font-weight:500;color:#F2994A'>RFC</span>",
    },
    {
      pattern: /@archive/gi,
      replace: "@<span style='font-weight:500;color:#748AA1'>Archive</span>",
    },
    {
      pattern: /@obsolete/gi,
      replace: "@<span style='font-weight:500;color:#CBAB48'>Obsolete</span>",
    },
    {
      pattern: /@Formal\sSubmission/gi,
      replace:
        "@<span style='font-weight:500;color:#9B51E0'>Formal Submission</span>",
    },
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private smartSearchService: SmartSearchService
  ) {}

  ngOnInit(): void {
    this.control.setValue(this.value);
    this.showClose = this.value ? true : false;
    this.initPositionHelpPopup();
  }

  ngAfterViewInit() {
    (this.inputSearch.nativeElement as HTMLElement).setAttribute(
      'placeholder',
      this.placeHolder
    );

    this.isQueryMode = this.isQuery(this.value);
    this.cdr.detectChanges();
  }

  initPositionHelpPopup() {
    this.positionHelpPopup = [
      {
        originX: 'end',
        originY: 'bottom',
        overlayX: 'end',
        overlayY: 'top',
      },
    ];
  }

  openHelpPopup() {
    this.isOpenHelpPopup = !this.isOpenHelpPopup;
  }

  onKeySearch(event: any): void {
    clearTimeout(this.timeout);

    if (event) {
      let val: string = this.control.value;

      if (this.inputSearch.nativeElement.constructor !== HTMLInputElement) {
        val = (this.inputSearch.nativeElement as HTMLElement).innerText;
      }

      if (this.isQuery(val)) {
        this.isQueryMode = true;
        this.showClose = false;

        if (event.keyCode == 13 && !this.selectedAutocompleteOptionByEnter) {
          this.timeout = setTimeout(() => {
            if (
              this.inputSearch.nativeElement.constructor === HTMLInputElement
            ) {
              this.send.emit(event);
            } else {
              event.target.value = (this.inputSearch
                .nativeElement as HTMLElement).innerText;
              this.send.emit(event);
            }
          }, 1000);
        } else {
          this.selectedAutocompleteOptionByEnter = false;
          this.filteringOptions();
        }
      } else {
        this.options = [];
        this.isQueryMode = false;

        if (this.inputSearch.nativeElement.constructor === HTMLInputElement) {
          this.showClose =
            this.inputSearch.nativeElement.value === '' ? false : true;
        } else {
          this.showClose =
            (this.inputSearch.nativeElement as HTMLElement).innerText === ''
              ? false
              : true;
        }

        this.timeout = setTimeout(() => {
          if (this.inputSearch.nativeElement.constructor === HTMLInputElement) {
            this.send.emit(event);
          } else {
            event.target.value = (this.inputSearch
              .nativeElement as HTMLElement).innerText;
            this.send.emit(event);
          }
        }, 1000);
      }
    }
  }

  isQuery(data: string): boolean {
    let search = data.toLowerCase().trim();

    return search.startsWith('$');
  }

  clear(): void {
    this.showClose = false;
    this.control.setValue('');
    let event = new Event('keyup');
    this.inputSearch.nativeElement.dispatchEvent(event);
  }

  onClickSearchItem(element) {
    this.clickSearchItem.next(element);
  }

  onClickOutside(ev: MouseEvent) {
    ev.stopPropagation();
    this.isOpenHelpPopup = false;
  }

  searchAutocompleteOptions(event: any): void {
    this.options = [];
    this.cdr.detectChanges();

    if (event === '@') {
      this.indexCaretPositionStart = position(
        this.inputSearch.nativeElement
      ).pos;
      this.isFilteringOption = true;

      this.searchOptionsSubscription = this.control.valueChanges
        .pipe(debounceTime(10))
        .subscribe((value) => {
          this.indexCaretPositionEnd = position(
            this.inputSearch.nativeElement
          ).pos;

          const search: string = (this.inputSearch
            .nativeElement as HTMLElement).innerText.slice(
            this.indexCaretPositionStart,
            this.indexCaretPositionEnd
          );

          this.smartSearchService
            .getOptions('status', search)
            .pipe(
              map((data) => {
                const newArray = (data as [])
                  .filter((i: any) => i.status !== '')
                  .map((i: any) => {
                    return { label: i.status };
                  });

                return newArray;
              })
            )
            .subscribe((data: any) => {
              this.options = (data as []).sort(function (a: any, b: any) {
                return a.label < b.label ? -1 : 1;
              });
              this.cdr.detectChanges();
            });
        });

        let search: string;

        if (this.inputSearch.nativeElement.constructor === HTMLInputElement) {
          search = this.control.value.slice(
            this.indexCaretPositionStart,
            this.indexCaretPositionEnd
          )
        } else {
          search = (this.inputSearch
            .nativeElement as HTMLElement).innerText.slice(
            this.indexCaretPositionStart,
            this.indexCaretPositionEnd
          );
        }

      this.smartSearchService
        .getOptions(
          'status',
          search
        )
        .pipe(
          map((data) => {
            const newArray = (data as [])
              .filter((i: any) => i.status !== '')
              .map((i: any) => {
                return { label: i.status };
              });

            return newArray;
          })
        )
        .subscribe((data: any) => {
          this.options = (data as []).sort(function (a: any, b: any) {
            return a.label < b.label ? -1 : 1;
          });
          this.cdr.detectChanges();
        });
    } else if (event === '#') {
      this.indexCaretPositionStart = position(
        this.inputSearch.nativeElement
      ).pos;
      this.isFilteringOption = true;

      this.searchOptionsSubscription = this.control.valueChanges
        .pipe(debounceTime(200))
        .subscribe((value) => {
          this.indexCaretPositionEnd = position(
            this.inputSearch.nativeElement
          ).pos;

          const search: string = (this.inputSearch
            .nativeElement as HTMLElement).innerText.slice(
            this.indexCaretPositionStart,
            this.indexCaretPositionEnd
          );

          this.smartSearchService
            .getOptions('tags', search)
            .pipe(
              map((data) => {
                const newArray = (data as [])
                  .filter((i: any) => i.tag !== '')
                  .map((i: any) => {
                    return { label: i.tag };
                  });

                return newArray;
              })
            )
            .subscribe((data: any) => {
              this.options = (data as []).sort(function (a: any, b: any) {
                return a.label < b.label ? -1 : 1;
              });
              this.cdr.detectChanges();
            });
        });

        let search: string;

        if (this.inputSearch.nativeElement.constructor === HTMLInputElement) {
          search = this.control.value.slice(
            this.indexCaretPositionStart,
            this.indexCaretPositionEnd
          )
        } else {
          search = (this.inputSearch
            .nativeElement as HTMLElement).innerText.slice(
            this.indexCaretPositionStart,
            this.indexCaretPositionEnd
          );
        }

      this.smartSearchService
        .getOptions(
          'tags',
          search
        )
        .pipe(
          map((data) => {
            const newArray = (data as [])
              .filter((i: any) => i.tag !== '')
              .map((i: any) => {
                return { label: i.tag };
              });

            return newArray;
          })
        )
        .subscribe((data: any) => {
          this.options = (data as []).sort(function (a: any, b: any) {
            return a.label < b.label ? -1 : 1;
          });
          this.cdr.detectChanges();
        });
    }
  }

  onClosedOptionsAutocomplete() {
    this.searchOptionsSubscription?.unsubscribe();
  }

  filteringOptions() {
    if (this.isFilteringOption) {
      this.indexCaretPositionEnd = position(this.inputSearch.nativeElement).pos;
    }
  }

  getAutocompleteOptionStyle(value: string): any {
    const val: string = value.toLowerCase();
    const style: any = {
      color: '#00000',
    };

    switch (val) {
      case 'accepted':
        style.color = '#27AE60';
        break;
      case 'rejected':
        style.color = '#EB5757';
        break;
      case 'rfc':
        style.color = '#F2994A';
        break;
      case 'obsolete':
        style.color = '#CBAB48';
        break;
      case 'formal submission':
        style.color = '#9B51E0';
        break;
      case 'archive':
        style.color = '#748AA1';
        break;

      default:
        break;
    }

    return style;
  }
}
