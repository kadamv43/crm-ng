import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowUpLeadsComponent } from './follow-up-leads.component';

describe('FollowUpLeadsComponent', () => {
  let component: FollowUpLeadsComponent;
  let fixture: ComponentFixture<FollowUpLeadsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowUpLeadsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FollowUpLeadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
