import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadsEditComponent } from './leads-edit.component';

describe('LeadsEditComponent', () => {
  let component: LeadsEditComponent;
  let fixture: ComponentFixture<LeadsEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadsEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LeadsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
