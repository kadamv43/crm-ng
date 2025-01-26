import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadsCreateComponent } from './leads-create.component';

describe('LeadsCreateComponent', () => {
  let component: LeadsCreateComponent;
  let fixture: ComponentFixture<LeadsCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadsCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LeadsCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
