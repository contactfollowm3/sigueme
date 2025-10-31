import { Component, Input, OnInit } from '@angular/core';
import { EditableComponent } from '../editable-component';

@Component({
  selector: 'app-editable-textarea',
  templateUrl: './editable-textarea.component.html',
  styleUrls: ['./editable-textarea.component.scss']
})
export class EditableTextareaComponent extends EditableComponent implements OnInit {
  @Input() rows: string; // Add rows input
  @Input() cols: string; // Add cols input
}
