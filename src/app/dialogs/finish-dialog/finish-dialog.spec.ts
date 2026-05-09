import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinishDialog } from './finish-dialog';

describe('FinishDialog', () => {
  let component: FinishDialog;
  let fixture: ComponentFixture<FinishDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinishDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinishDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
