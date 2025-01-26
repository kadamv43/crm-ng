import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotLeadsCreateComponent } from './hot-leads-create.component';

describe('HotLeadsCreateComponent', () => {
  let component: HotLeadsCreateComponent;
  let fixture: ComponentFixture<HotLeadsCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotLeadsCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HotLeadsCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
