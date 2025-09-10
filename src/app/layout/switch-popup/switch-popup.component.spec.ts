import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwitchPopupComponent } from './switch-popup.component';

describe('SwitchPopupComponent', () => {
  let component: SwitchPopupComponent;
  let fixture: ComponentFixture<SwitchPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SwitchPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SwitchPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
