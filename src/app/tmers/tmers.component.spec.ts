import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TmersComponent } from './tmers.component';

describe('TmersComponent', () => {
  let component: TmersComponent;
  let fixture: ComponentFixture<TmersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TmersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TmersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
