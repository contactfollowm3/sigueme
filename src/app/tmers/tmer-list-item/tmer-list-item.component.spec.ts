import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TmerListItemComponent } from './tmer-list-item.component';

describe('TmerListItemComponent', () => {
  let component: TmerListItemComponent;
  let fixture: ComponentFixture<TmerListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TmerListItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TmerListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
