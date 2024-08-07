import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryService } from 'src/app/services/category.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.css'],
})
export class AddCategoryComponent implements OnInit {
 
  category = {
    title: '',
    audience: '',
    description: '',
  };

  constructor(
    private _category: CategoryService,
    private _snack: MatSnackBar
  ) {}

  ngOnInit(): void {}

  formSubmit() {
    if (this.category.title.trim() == '' || this.category.title == null) {
      this._snack.open('Title Required !!', '', {
        duration: 3000,
      });
      return;
    }

    if (this.category.audience.trim() == '' || this.category.audience == null) {
      this._snack.open('Audience Required !!', '', {
        duration: 3000,
      });
      return;
    }

    //all done

    this._category.addCategory(this.category).subscribe(
      (data: any) => {
        console.log(data);
        
        this.category.title = '';
        this.category.audience = '';
        this.category.description = '';
        Swal.fire('Success !!', 'Category is added successfuly', 'success');
      },
      (error) => {
        console.log(error);
        Swal.fire('Error !!', 'Server error !!', 'error');
      }
    );
  }
}
