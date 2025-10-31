import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../shared/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  
  formData: any = {};
  errors: any[] = [];

  
  constructor(private auth: AuthService,
               private router: Router,
               private cdr: ChangeDetectorRef) {}
 
 
 
  ngOnInit(): void {
  
  }

  register(){
    this.auth.register(this.formData).subscribe(
      () => {
       /*  console.log('success!'); */
        this.router.navigate(['/login', {registered: 'success'}]);
      },
      (errorResponse) => {
        this.errors = [errorResponse.error.detail];
        this.cdr.detectChanges(); 
       
       
      })
  }

}
