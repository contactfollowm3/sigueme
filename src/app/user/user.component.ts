import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // ✅ Import this

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [RouterOutlet], // ✅ Add here
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent {}
