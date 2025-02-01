import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayOfferListComponent } from './day-offer-list.component';

describe('DayOfferListComponent', () => {
  let component: DayOfferListComponent;
  let fixture: ComponentFixture<DayOfferListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DayOfferListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DayOfferListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
