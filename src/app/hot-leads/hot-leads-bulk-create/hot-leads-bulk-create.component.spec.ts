import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotLeadsBulkCreateComponent } from './hot-leads-bulk-create.component';

describe('HotLeadsBulkCreateComponent', () => {
  let component: HotLeadsBulkCreateComponent;
  let fixture: ComponentFixture<HotLeadsBulkCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotLeadsBulkCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HotLeadsBulkCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
