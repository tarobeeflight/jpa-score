import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JpaMatch } from './jpa-match';

describe('JpaMatch', () => {
  let component: JpaMatch;
  let fixture: ComponentFixture<JpaMatch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JpaMatch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JpaMatch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
