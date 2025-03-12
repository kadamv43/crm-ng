import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignedHotLeadsComponent } from './assigned-hot-leads.component';

describe('AssignedHotLeadsComponent', () => {
  let component: AssignedHotLeadsComponent;
  let fixture: ComponentFixture<AssignedHotLeadsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignedHotLeadsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssignedHotLeadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
