import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileHistoryComponent } from './mobile-history.component';

describe('MobileHistoryComponent', () => {
  let component: MobileHistoryComponent;
  let fixture: ComponentFixture<MobileHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MobileHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
