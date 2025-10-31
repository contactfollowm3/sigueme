import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditableTextareaComponent } from './editable-textarea.component';

describe('EditableTextareaComponent', () => {
  let component: EditableTextareaComponent;
  let fixture: ComponentFixture<EditableTextareaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditableTextareaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditableTextareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
