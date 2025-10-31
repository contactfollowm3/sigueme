import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TmerListComponent } from './tmer-list.component';

describe('TmerListComponent', () => {
  let component: TmerListComponent;
  let fixture: ComponentFixture<TmerListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TmerListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TmerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
