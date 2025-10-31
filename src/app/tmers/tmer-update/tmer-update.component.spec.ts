import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TmerUpdateComponent } from './tmer-update.component';

describe('TmerUpdateComponent', () => {
  let component: TmerUpdateComponent;
  let fixture: ComponentFixture<TmerUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TmerUpdateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TmerUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
