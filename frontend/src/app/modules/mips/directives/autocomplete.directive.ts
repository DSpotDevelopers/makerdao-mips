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
import { position, offset } from 'caret-pos';

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
        let str: string;

        if (this.host.nativeElement.constructor === HTMLInputElement) {
          this.indexCaretPosition = (this.host
            .nativeElement as HTMLInputElement).selectionStart;

          str = (this.host.nativeElement as HTMLInputElement).value.substring(
            (this.host.nativeElement as HTMLInputElement).selectionStart - 1,
            (this.host.nativeElement as HTMLInputElement).selectionStart
          );
        }

        if (this.host.nativeElement.constructor != HTMLInputElement) {
          let p = position(this.host.nativeElement).pos;
          this.indexCaretPosition = p;

          str = (this.host.nativeElement as HTMLElement).innerText.substring(
            p - 1,
            p
          );
        }

        let indexLabel: number = this.appAutocomplete.labels.findIndex(
          (i) => i === str
        );

        if (
          indexLabel !== -1 &&
          !this.overlayRef &&
          ev.key !== 'ArrowLeft' &&
          ev.key !== 'ArrowRight' &&
          ev.key !== 'Delete' &&
          ev.key !== 'Backspace'
        ) {
          this.appAutocomplete.activatedLabel.next(
            this.appAutocomplete.labels[indexLabel]
          );
          // this.indexCaretPositionStart = (this.host
          //   .nativeElement as HTMLInputElement).selectionStart;
          this.indexCaretPositionStart = position(this.host.nativeElement).pos;

          this.showContent();
        } else {
          if (
            // (this.host.nativeElement as HTMLInputElement).selectionStart <
            // this.indexCaretPositionStart
            position(this.host.nativeElement).pos < this.indexCaretPositionStart
          ) {
            if (this.overlayRef) {
              this.close();
            }
          }

          if (this.host.nativeElement.constructor === HTMLInputElement) {
            this.indexCaretPositionEnd = (this.host
              .nativeElement as HTMLInputElement).selectionEnd;
          } else {
            this.indexCaretPositionEnd = position(this.host.nativeElement).pos;
          }
        }
      });

    fromEvent(this.host.nativeElement, 'input')
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        if (this.host.nativeElement.constructor === HTMLInputElement) {
          var caret = getCaretCoordinates(
            this.host.nativeElement as HTMLInputElement,
            (this.host.nativeElement as HTMLInputElement).selectionEnd - 1
          );

          this.top = caret.top;
          this.left = caret.left;
        } else {
          const pos = position(this.host.nativeElement);
          const off = offset(this.host.nativeElement);
          if (pos.pos > 0) {
            position(this.host.nativeElement, pos.pos - 1);
            this.top = off.top;
            this.left = offset(this.host.nativeElement).left;
            position(this.host.nativeElement, pos.pos);
          }
        }
      });

    this.appAutocomplete.showOptions.subscribe((ev) => {
      this.overlayRef?.updatePosition();
    });
  }

  showContent() {
    this.openDropdown();

    this.appAutocomplete
      .optionsClick()
      .pipe(takeUntil(this.overlayRef.detachments()))
      .subscribe((value: string) => {
        let newValue: Array<string>;
        if (this.host.nativeElement.constructor === HTMLInputElement) {
          newValue = (this.host.nativeElement as HTMLInputElement).value
            .slice(0)
            .split('');
        }
        if (this.host.nativeElement.constructor != HTMLInputElement) {
          newValue = (this.host.nativeElement as HTMLElement).innerText
            .slice(0)
            .split('');
        }
        newValue.splice(
          this.indexCaretPositionStart,
          this.indexCaretPositionEnd - this.indexCaretPositionStart,
          value
        );

        this.control.setValue(newValue.join(''));
        this.close();
        (this.host.nativeElement as HTMLInputElement).focus();
        // (this.host.nativeElement as HTMLInputElement).selectionStart =
        //   this.indexCaretPositionStart + value.length;
        // (this.host.nativeElement as HTMLInputElement).selectionEnd =
        //   this.indexCaretPositionStart + value.length;
        position(
          this.host.nativeElement,
          this.indexCaretPositionStart + value.length
        );
        (this.host.nativeElement as HTMLInputElement).dispatchEvent(
          new Event('input')
        );
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
    this.overlayRef = this.overlay.create({
      width: this.origin.offsetWidth,
      maxHeight: 25 * 6,
      maxWidth: 'fit-content',
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
    this.appAutocomplete.closedOptions.next();
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
      new ConnectionPositionPair(
        { originX: 'start', originY: 'bottom' },
        { overlayX: 'end', overlayY: 'top' }
      ),
      new ConnectionPositionPair(
        { originX: 'start', originY: 'bottom' },
        { overlayX: 'center', overlayY: 'top' }
      ),
    ];

    let scrollLeft = this.host.nativeElement.scrollLeft;

    let ev: MouseEvent = new MouseEvent('click', {});
    let ev2: MouseEvent = {
      ...ev,
      x:
        this.host.nativeElement.constructor === HTMLInputElement
          ? (this.host.nativeElement as HTMLElement).getClientRects()[0].left +
            this.left -
            scrollLeft
          : this.left,

      y:
        this.host.nativeElement.constructor === HTMLInputElement
          ? (this.host.nativeElement as HTMLElement).getClientRects()[0].top +
            this.top +
            14
          : this.top + 18,
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
