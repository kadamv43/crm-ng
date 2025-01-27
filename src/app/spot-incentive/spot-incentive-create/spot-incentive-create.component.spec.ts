import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotIncentiveCreateComponent } from './spot-incentive-create.component';

describe('SpotIncentiveCreateComponent', () => {
  let component: SpotIncentiveCreateComponent;
  let fixture: ComponentFixture<SpotIncentiveCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpotIncentiveCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpotIncentiveCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
