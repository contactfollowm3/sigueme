import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TmerDetailBookingComponent } from './tmer-detail-booking.component';

describe('TmerDetailBookingComponent', () => {
  let component: TmerDetailBookingComponent;
  let fixture: ComponentFixture<TmerDetailBookingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TmerDetailBookingComponent]
    });
    fixture = TestBed.createComponent(TmerDetailBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
