import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreeTrialFormComponent } from './free-trial-form.component';

describe('FreeTrialFormComponent', () => {
  let component: FreeTrialFormComponent;
  let fixture: ComponentFixture<FreeTrialFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FreeTrialFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FreeTrialFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
