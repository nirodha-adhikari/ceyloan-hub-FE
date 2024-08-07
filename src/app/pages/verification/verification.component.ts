import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import Swal from "sweetalert2";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.css']
})
export class VerificationComponent implements OnInit {


  constructor(private selectedRoute: ActivatedRoute,
              private userService: UserService,
              private router: Router) {
  }

  email = '';
  verifyForm = new FormGroup({
    code: new FormControl('', [Validators.required])
  });

  ngOnInit(): void {
    this.selectedRoute.paramMap.subscribe(response => {
      this.email = response.get('email')!;
    });
  }

  verify() {
    if(!this.email){Swal.fire('Try Again', 'Explore Now', 'error');}
    this.userService.verify(
      this.verifyForm.get('code')?.value!,
      this.email
    ).subscribe(response=>{
      console.log(response);
      Swal.fire('Verification Success', 'Explore Now', 'success');
      this.router.navigateByUrl('/login');
    },error =>{
      Swal.fire('Verification Code Invalid!! Try again', '', 'error');
    } );
  }

  resendMail() {
    this.userService.resendMail(this.email).subscribe(resp=>{
      Swal.fire('Email Sent', 'Check out your mail & And spam Folder ', 'success');
    },error => {
        Swal.fire('Try again', '', 'error');
      });
  }
}
