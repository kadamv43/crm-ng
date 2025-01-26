import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotLeadsListComponent } from './hot-leads-list.component';

describe('HotLeadsListComponent', () => {
  let component: HotLeadsListComponent;
  let fixture: ComponentFixture<HotLeadsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotLeadsListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HotLeadsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
