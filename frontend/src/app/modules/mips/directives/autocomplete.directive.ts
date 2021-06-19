import {
  ConnectionPositionPair,
  FlexibleConnectedPositionStrategyOrigin,
  Overlay,
  OverlayRef,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  Directive,
  ElementRef,
  Input,
  QueryList,
  ViewContainerRef,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { fromEvent } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AutocompleteComponent } from '../components/autocomplete/autocomplete.component';
import { untilDestroyed } from 'ngx-take-until-destroy';
var getCaretCoordinates = require('textarea-caret');

@Directive({
  selector: '[appAutocomplete]',
})
export class AutocompleteDirective {
  @Input() appAutocomplete: AutocompleteComponent;
  private overlayRef: OverlayRef;
  top: number;
  left: number;
  indexCaretPosition: number;
  indexCaretPositionStart: number;
  indexCaretPositionEnd: number;

  constructor(
    private host: ElementRef<HTMLInputElement>,
    private ngControl: NgControl,
    private vcr: ViewContainerRef,
    private overlay: Overlay
  ) {}

  get control() {
    return this.ngControl.control;
  }

  get origin() {
    return this.host.nativeElement;
  }

  ngOnInit() {
    fromEvent(this.host.nativeElement, 'keyup')
      .pipe(untilDestroyed(this))
      .subscribe((ev: any) => {
        this.indexCaretPosition = (this.host
          .nativeElement as HTMLInputElement).selectionStart;
        // console.log("this.indexCaretPosition", this.indexCaretPosition);
        // console.log("this.appAutocomplete.labels", this.appAutocomplete.labels);
        // console.log("ev.key", ev.key);
        // console.log("ev", ev);

        if (this.appAutocomplete.labels.findIndex((i) => i === ev.key) !== -1) {
          console.log("yes");

          this.indexCaretPositionStart = (this.host
            .nativeElement as HTMLInputElement).selectionStart;

          this.showContent();
        } else {
          if (
            (this.host.nativeElement as HTMLInputElement).selectionStart <
            this.indexCaretPositionStart
          ) {
            if (this.overlayRef) {
              this.close();
            }
          }

          this.indexCaretPositionEnd = (this.host
            .nativeElement as HTMLInputElement).selectionEnd;
        }
      });

    fromEvent(this.host.nativeElement, 'input')
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        var caret = getCaretCoordinates(
          this.host.nativeElement as HTMLInputElement,
          (this.host.nativeElement as HTMLInputElement).selectionEnd - 1
        );
        this.top = caret.top;
        this.left = caret.left;
      });
  }

  showContent() {
    this.openDropdown();

    this.appAutocomplete
      .optionsClick()
      .pipe(takeUntil(this.overlayRef.detachments()))
      .subscribe((value: string) => {
        let newValue: Array<string> = (this.host
          .nativeElement as HTMLInputElement).value
          .slice(0)
          .split('');
        newValue.splice(
          this.indexCaretPositionStart,
          this.indexCaretPositionEnd - this.indexCaretPositionStart,
          value
        );
        this.control.setValue(newValue.join(''));
        this.close();
        (this.host.nativeElement as HTMLInputElement).focus();
        (this.host.nativeElement as HTMLInputElement).selectionStart =
          this.indexCaretPositionStart + value.length;
        (this.host.nativeElement as HTMLInputElement).selectionEnd =
          this.indexCaretPositionStart + value.length;
        (this.host.nativeElement as HTMLInputElement).dispatchEvent(new Event("input"));
      });

    this.appAutocomplete.options.changes.subscribe(
      (options: QueryList<any>) => {
        if (options.length === 0) {
          if (this.overlayRef) {
            this.close();
          }
        }
      }
    );
  }

  openDropdown() {
    console.log("openDropdown");

    this.overlayRef = this.overlay.create({
      width: this.origin.offsetWidth,
      maxHeight: 40 * 3,
      backdropClass: '',
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      positionStrategy: this.getOverlayPosition(),
    });

    const template = new TemplatePortal(
      this.appAutocomplete.rootTemplate,
      this.vcr
    );
    this.overlayRef.attach(template);

    overlayClickOutside(this.overlayRef, this.origin).subscribe(() =>
      this.close()
    );
  }

  private close() {
    this.overlayRef.detach();
    this.overlayRef = null;
  }

  private getOverlayPosition() {
    const positions = [
      new ConnectionPositionPair(
        { originX: 'start', originY: 'bottom' },
        { overlayX: 'start', overlayY: 'top' }
      ),
      new ConnectionPositionPair(
        { originX: 'start', originY: 'top' },
        { overlayX: 'start', overlayY: 'bottom' }
      ),
    ];

    let ev: MouseEvent = new MouseEvent('click', {});
    let ev2: MouseEvent = {
      ...ev,
      x:
        (this.host.nativeElement as HTMLElement).getClientRects()[0].left +
        this.left,
      y:
        (this.host.nativeElement as HTMLElement).getClientRects()[0].top +
        this.top +
        14,
    };

    return this.overlay
      .position()
      .flexibleConnectedTo(ev2)
      .withPositions(positions)
      .withFlexibleDimensions(false)
      .withPush(false);
  }

  ngOnDestroy() {}
}

export function overlayClickOutside(
  overlayRef: OverlayRef,
  origin: HTMLElement
) {
  return fromEvent<MouseEvent>(document, 'click').pipe(
    filter((event) => {
      const clickTarget = event.target as HTMLElement;
      const notOrigin = clickTarget !== origin; // the input
      const notOverlay =
        !!overlayRef &&
        overlayRef.overlayElement.contains(clickTarget) === false; // the autocomplete
      return notOrigin && notOverlay;
    }),
    takeUntil(overlayRef.detachments())
  );
}
