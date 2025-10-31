import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TmerDetailComponent } from './tmer-detail.component';

describe('TmerDetailComponent', () => {
  let component: TmerDetailComponent;
  let fixture: ComponentFixture<TmerDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TmerDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TmerDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
