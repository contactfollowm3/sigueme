import { Input, OnInit } from '@angular/core';
//this is rental list item
import { Component } from '@angular/core';

@Component({
  selector: 'app-tmer-list-item',
  templateUrl: './tmer-list-item.component.html',
  styleUrls: ['./tmer-list-item.component.scss']
})
export class TmerListItemComponent implements OnInit{

  @Input() tmer: any;

  constructor() {}

  ngOnInit(){

  }

}
