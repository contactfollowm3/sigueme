import { Component, OnInit, Input, Output, EventEmitter, Directive } from '@angular/core';

@Directive()
export class EditableComponent implements OnInit {
  @Input() entity: any;
  
  @Input() set field(entityField: string) {
    this.entityField = entityField;
    this.setOriginVAlue();
  }; 
  @Input() className: string;

  /* @Input() type: string = 'text'; */
  @Input() style: any;

  @Output() entityUpdate = new EventEmitter<any>(); 
  

  isActiveInput: boolean = false;

  public entityField: string;

  public originEntityValue: any;

  constructor() {}

  ngOnInit(): void {}

  updateEntity() {
    const entityValue = this.entity[this.entityField];
    if (entityValue !== this.originEntityValue) {
      this.entityUpdate.emit({ [this.entityField]: this.entity[this.entityField] }); 
      this.setOriginVAlue();
    }
    this.isActiveInput = false;
  }

  cancelUpdate() {
    this.isActiveInput = false;
    this.entity[this.entityField] = this.originEntityValue;
  }

  setOriginVAlue() {
    this.originEntityValue = this.entity[this.entityField];
  }
}

 
 