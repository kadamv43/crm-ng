import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpiListComponent } from './upi-list.component';

describe('UpiListComponent', () => {
  let component: UpiListComponent;
  let fixture: ComponentFixture<UpiListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpiListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpiListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
