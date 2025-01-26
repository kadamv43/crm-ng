import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadsBulkCreateComponent } from './leads-bulk-create.component';

describe('LeadsBulkCreateComponent', () => {
  let component: LeadsBulkCreateComponent;
  let fixture: ComponentFixture<LeadsBulkCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadsBulkCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LeadsBulkCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
