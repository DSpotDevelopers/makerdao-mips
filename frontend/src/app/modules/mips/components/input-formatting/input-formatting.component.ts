import {
  AfterViewInit,
  Component,
  ContentChild,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { InputFormattingRefDirective } from '../../directives/input-formatting-ref.directive';
import { position, offset } from 'caret-pos';

@Component({
  selector: 'app-input-formatting',
  templateUrl: './input-formatting.component.html',
  styleUrls: ['./input-formatting.component.scss'],
})
export class InputFormattingComponent implements OnInit, AfterViewInit {
  @ContentChild(InputFormattingRefDirective)
  input: InputFormattingRefDirective;

  @ViewChild('search') search: ElementRef;
  ctrl = new FormControl('');

  constructor() {}

  ngOnInit(): void {}

  // ngAfterViewInit() {
  //   this.ctrl.setValue(this.input.origin.value);
  //   this.input.origin.value = (this.search.nativeElement as HTMLElement).textContent;

  //   this.ctrl.valueChanges.subscribe(value => {
  //     this.input.origin.value = (this.search.nativeElement as HTMLElement).textContent;

  //     let s: Selection = document.getSelection();
  //   // console.log("selection", s.anchorOffset);
  //   this.input.origin.selectionStart = s.anchorOffset;
  //   // this.input.origin.setSelectionRange(s.anchorOffset, s.anchorOffset);
  //   });
  // }

  // onKeyup(e: KeyboardEvent) {
  //   // this.input.origin.dispatchEvent(new KeyboardEvent("keyup", {key: e.key}));
  //   let event: KeyboardEvent = new KeyboardEvent("keyup", {...e, key: e.key});
  //   // let event: Event = new KeyboardEvent("keyup", {...e, key: e.key});
  //   this.input.origin.dispatchEvent(event);
  //   // this.input.origin.focus();
  //   // (this.search.nativeElement as HTMLInputElement).focus();

  //   // let s: Selection = document.getSelection();
  //   // console.log("selection", s.anchorOffset);
  //   // this.input.origin.selectionStart = s.anchorOffset;
  //   // this.input.origin.setSelectionRange()
  // }

  ngAfterViewInit() {
    this.ctrl.setValue(this.input.origin.value);
    this.input.origin.oninput = this.updateContent;
    this.input.origin.focus();
    this.input.origin.onkeyup = this.updateCaretPosition;

    // caret
    // this.search.nativeElement.oninput = () => {
    //   this.input.origin.focus();
    // }

    // this.input.origin.onkeyup = () => {
    //   this.search.nativeElement.focus();
    //   (this.search.nativeElement as HTMLInputElement).selectionStart = this.input.origin.selectionStart;
    // }


  }

  updateContent = (e) => {
    this.ctrl.setValue(this.input.origin.value);

    if (this.ctrl.value === 'html') {
      this.ctrl.setValue(
        "<span style='color: #ff0000;font-size: 16px;font-weight: 500;'>html       body</span>"
      );
    }

    // caret
    // this.search.nativeElement.focus();
  };

  updateCaretPosition = (e) => {
    console.log("eveve", e);

    (this.search
      .nativeElement as HTMLInputElement).selectionStart = this.input.origin.selectionStart;
      (this.search
        .nativeElement as HTMLInputElement).selectionEnd = 5;
    this.setCaret(this.search.nativeElement.selectionStart);
    // this.search.nativeElement.focus();
    console.log("caret pos", (this.search.nativeElement as HTMLInputElement).selectionStart);
    let caretEl: HTMLElement = document.getElementById("caret");
    const pos = position(this.search.nativeElement); // { left: 15, top: 30, height: 20, pos: 15 }
    const off = offset(this.search.nativeElement); // { left: 15, top: 30, height: 20 }
    this.input.origin.focus();
    console.log("pos", pos);
    console.log("off", off);
    caretEl.style.left = pos.left.toString() +  "px";
  }

  setCaret(pos) {
    var tag = document.getElementById('editable');

    // Creates range object
    var setpos = document.createRange();

    // Creates object for selection
    var set = window.getSelection();

    // Set start position of range
    setpos.setStart(tag.childNodes[0], pos);

    // Collapse range within its boundary points
    // Returns boolean
    setpos.collapse(true);

    // Remove all ranges set
    set.removeAllRanges();

    // Add range with respect to range object.
    set.addRange(setpos);

    // Set cursor on focus
    // tag.focus();


  }
}
