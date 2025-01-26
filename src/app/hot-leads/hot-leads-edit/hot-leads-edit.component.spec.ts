import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotLeadsEditComponent } from './hot-leads-edit.component';

describe('HotLeadsEditComponent', () => {
  let component: HotLeadsEditComponent;
  let fixture: ComponentFixture<HotLeadsEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotLeadsEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HotLeadsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
