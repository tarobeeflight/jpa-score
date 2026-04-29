import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchSelect } from './match-select';

describe('MatchSelect', () => {
  let component: MatchSelect;
  let fixture: ComponentFixture<MatchSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchSelect]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchSelect);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
