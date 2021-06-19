import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputFormattingComponent } from './input-formatting.component';

describe('InputFormattingComponent', () => {
  let component: InputFormattingComponent;
  let fixture: ComponentFixture<InputFormattingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InputFormattingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InputFormattingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
