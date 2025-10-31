import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EditableComponent } from '../editable-component';
import { retry } from 'rxjs';

@Component({
  selector: 'app-editable-input',
  templateUrl: './editable-input.component.html',
  styleUrls: ['./editable-input.component.scss']
})
export class EditableInputComponent extends EditableComponent implements OnInit {
  @Input() type: string = 'text';
  @Input() transformView = (value: any) => value;
}

 
 
  