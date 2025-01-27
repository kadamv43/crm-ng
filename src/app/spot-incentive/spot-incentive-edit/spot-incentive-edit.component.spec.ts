import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotIncentiveEditComponent } from './spot-incentive-edit.component';

describe('SpotIncentiveEditComponent', () => {
  let component: SpotIncentiveEditComponent;
  let fixture: ComponentFixture<SpotIncentiveEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpotIncentiveEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpotIncentiveEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
