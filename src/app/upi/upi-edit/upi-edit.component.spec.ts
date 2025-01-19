import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpiEditComponent } from './upi-edit.component';

describe('UpiEditComponent', () => {
  let component: UpiEditComponent;
  let fixture: ComponentFixture<UpiEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpiEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpiEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
