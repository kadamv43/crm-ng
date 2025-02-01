import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayOfferCreateComponent } from './day-offer-create.component';

describe('DayOfferCreateComponent', () => {
  let component: DayOfferCreateComponent;
  let fixture: ComponentFixture<DayOfferCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DayOfferCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DayOfferCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
