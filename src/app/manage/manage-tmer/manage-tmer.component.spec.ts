import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageTmerComponent } from './manage-tmer.component';

describe('ManageTmerComponent', () => {
  let component: ManageTmerComponent;
  let fixture: ComponentFixture<ManageTmerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManageTmerComponent]
    });
    fixture = TestBed.createComponent(ManageTmerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
