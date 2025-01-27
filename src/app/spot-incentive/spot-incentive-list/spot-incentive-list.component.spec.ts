import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotIncentiveListComponent } from './spot-incentive-list.component';

describe('SpotIncentiveListComponent', () => {
  let component: SpotIncentiveListComponent;
  let fixture: ComponentFixture<SpotIncentiveListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpotIncentiveListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpotIncentiveListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
