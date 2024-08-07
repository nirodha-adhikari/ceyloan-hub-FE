import {DatePipe} from '@angular/common';
import {Component, OnInit, ViewChild} from '@angular/core';
import {MatAccordion} from '@angular/material/expansion';
import {MatSnackBar} from '@angular/material/snack-bar';
import {error} from 'console';
import {CategoryService} from 'src/app/services/category.service';
import {SelectSubjectService} from 'src/app/services/select-subject.service';
import Swal from 'sweetalert2';
import {LoginService} from "../../../services/login.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-select-subject',
  templateUrl: './select-subject.component.html',
  styleUrls: ['./select-subject.component.css']
})


export class SelectSubjectComponent implements OnInit {

  userId;
  isLoggedIn;
  categories = [];
  selectedCategories: any = [];
  date = 'not yet';
  searchText: string = '';

  /* myDate = new Date(); */

  constructor(
    private selectSubjectServeice: SelectSubjectService,
    private categoryServeice: CategoryService,
    private snackBar: MatSnackBar,
    public login: LoginService,
    private _route: ActivatedRoute
    /* private datePipe: DatePipe */
  ) {
  }

  ngOnInit(): void {
    this.getAllCategories();
  }


  getAllCategories() {
    console.log();
    if (!this.login.isLoggedIn()){
      this.categoryServeice.categories(this.searchText).subscribe(
        (data: any) => {
          this.categories = data;
          console.log(data);
        },
        (error) => {
          this.snackBar.open('Error in loading categories from server', '', {
            duration: 3000,
          });
        }
      );
    }else{
      this.userId = this.login.getUser().id;
      this.categoryServeice.nonePaidCategories(this.searchText , this.userId).subscribe(
        (data: any) => {
          this.categories = data;
          console.log(data);
        },
        (error) => {
          this.snackBar.open('Error in loading categories from server', '', {
            duration: 3000,
          });
        }
      );
    }

  }

/*

  addCategory(cid, title) {
    /!*let text = 'Do you want to add ' + title + ' as your subject ?'
    let c = {
      cid: cid,
      date: this.date,
      cTitle: title,
      user: {
        id: this.userId,
      },
    };

    Swal.fire({
      title: text,
      showCancelButton: true,
      confirmButtonText: `Submit`,
      icon: 'info',
    }).then((e) => {
      console.log(c);

      if (e.isConfirmed) {
        this.selectSubjectServeice.addUserCategory(c).subscribe((Response) => {
            console.log(Response);
            this.ngOnInit();
            this.snackBar.open('Package Successfully Added', 'Success', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          },
          (error) => {
            this.snackBar.open('Sign in before buy modules', 'Oops !!', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });

          });
      }
    });*!/
    let c = {
      cid: cid,
      date: this.date,
      cTitle: title,
      user: {
        id: this.userId,
      },
    };

    this.selectSubjectServeice.addUserCategory(c).subscribe((Response) => {
        console.log(Response);
        this.ngOnInit();
        this.snackBar.open('Package Successfully Added', 'Success', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      },
      (error) => {
        console.log(error);
        if(this.isLoggedIn){
          this.snackBar.open('This package already added', 'Oops !!', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
        }else {
          this.snackBar.open('Sign in before buy modules', 'Oops !!', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
        }
       });
 }
*/



  deleteCategory(userCategoryId, cTitle) {
    console.log(userCategoryId);
    let text = 'Do you really want delete this ' + cTitle + ' Subject ?'

    Swal.fire({
      title: text,
      showCancelButton: true,
      confirmButtonText: `Submit`,
      icon: 'warning',
    }).then((e) => {

      if (e.isConfirmed) {
        this.selectSubjectServeice.deleteSelectedUserCategory(userCategoryId).subscribe((Response) => {
            console.log(Response);
            this.ngOnInit();
          },
          (error) => {
            this.snackBar.open("Error !! Try Again later", 'Oops !!', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });

          });
      }
    });

  }


  searchNow() {
    this.getAllCategories();
  }

  clear() {
    this.searchText = '';
    this.getAllCategories();
  }


}
