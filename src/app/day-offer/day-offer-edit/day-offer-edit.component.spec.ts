import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayOfferEditComponent } from './day-offer-edit.component';

describe('DayOfferEditComponent', () => {
  let component: DayOfferEditComponent;
  let fixture: ComponentFixture<DayOfferEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DayOfferEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DayOfferEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
