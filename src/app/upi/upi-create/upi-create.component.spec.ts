import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpiCreateComponent } from './upi-create.component';

describe('UpiCreateComponent', () => {
  let component: UpiCreateComponent;
  let fixture: ComponentFixture<UpiCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpiCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpiCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
