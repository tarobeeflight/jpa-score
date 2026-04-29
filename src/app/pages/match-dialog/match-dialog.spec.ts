import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchDialog } from './match-dialog';

describe('MatchDialog', () => {
  let component: MatchDialog;
  let fixture: ComponentFixture<MatchDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
