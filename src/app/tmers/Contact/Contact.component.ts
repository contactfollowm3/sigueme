import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-Contact',
  templateUrl: './Contact.component.html',
  styleUrls: ['./Contact.component.css'],
})
export class ContactComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  // Method to handle form submission
  onSubmit(form: any) {
    console.log('Form submitted:', form.value);
  }
}
