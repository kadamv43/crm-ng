import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyHotLeadsComponent } from './my-hot-leads.component';

describe('MyHotLeadsComponent', () => {
  let component: MyHotLeadsComponent;
  let fixture: ComponentFixture<MyHotLeadsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyHotLeadsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MyHotLeadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
