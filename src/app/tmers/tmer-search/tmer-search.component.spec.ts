import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TmerSearchComponent } from './tmer-search.component';

describe('TmerSearchComponent', () => {
  let component: TmerSearchComponent;
  let fixture: ComponentFixture<TmerSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TmerSearchComponent]
    });
    fixture = TestBed.createComponent(TmerSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
