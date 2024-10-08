import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionService } from 'src/app/services/question.service';
import { QuizService } from 'src/app/services/quiz.service';
import Swal from 'sweetalert2';
import { Question } from '../../../model/Question';
import { map } from 'rxjs/operators';
import { ImageProcessingService } from '../../../services/ImageProcessingService';
import { DatePipe, LocationStrategy, ViewportScroller } from '@angular/common';
import { HistoryService } from 'src/app/services/history.service';
import { MatStep, MatStepper } from '@angular/material/stepper';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Todo } from '../todo-list/Todo';
import { NavbarService } from '../../../services/navbar.service';
import {MatBottomSheet, MatBottomSheetRef} from "@angular/material/bottom-sheet";

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.css'],
  providers: [DatePipe]
})
export class StartComponent implements OnInit {
  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild('yourStep') yourStep: MatStep;

  stepDuration: number; // Duration in seconds (2 minutes)
  countdown: number;
  countdownInterval: any;
  date: string;
  myDate = new Date();
  qid;
  questions = [];
  marksGot = 0;
  correctAnswers = 0;
  isSubmit = false;
  timer: any;
  mm;
  pageNumber = 0;
  showMoreBtn;
  position = 'below';
  pause = true;
  timerInterval: any; // Property to store the interval ID
  fullTime: number;
  setterFlag = true;
  isSubmitting = false; // Flag to prevent multiple submissions

  startTime: Date; // Start time of the quiz
  timeSpent: number; // Time spent on the quiz in seconds

  progressValue: number = 0;
  bufferValue: number = 100;
  elapsedTime: number = 0;

  @ViewChild('bottomSheetTemplate') bottomSheetTemplate: TemplateRef<any>;

  bottomSheetRef: MatBottomSheetRef;

  constructor(
    private imageProcessingService: ImageProcessingService,
    private locationSt: LocationStrategy,
    private _route: ActivatedRoute,
    private _question: QuestionService,
    private _quiz: QuizService,
    private historyService: HistoryService,
    private datePipe: DatePipe,
    private router: Router,
    private viewportScroller: ViewportScroller,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private navbarService: NavbarService,
    private bottomSheet: MatBottomSheet,
  ) {
    this.startCountdown();
  }

  ngOnInit(): void {
    this.preventBackButton();
    this.qid = this._route.snapshot.params.qid;
    console.log(this.qid);
    this.loadQuestions();
    this.hideNavbar();
    this.startTime = new Date(); // Record the start time when the quiz begins
  }

  openBottomSheet(template: TemplateRef<any>): void {
    this.bottomSheetRef = this.bottomSheet.open(template);
  }

  loadQuestions() {
    this._question.getQuestionsOfQuizForTest(this.qid, this.pageNumber)
      .pipe(
        map((x: Question[], i) => x.map((question: Question) => this.imageProcessingService.creatImages(question)))
      )
      .subscribe(
        (data: Question[]) => {
          if (data.length === 5) {
            this.showMoreBtn = true;
          } else {
            this.showMoreBtn = false;
          }
          console.log(data);
          data.forEach(p => this.questions.push(p));
          console.log(this.questions.length);
          if (this.setterFlag) {
            this.setUpTime();
            this.setterFlag = false;
          }
        },
        (error) => {
          console.log(error);
          Swal.fire('Oops', 'Empty Question For Now. Questions Will Be Added ASAP', 'error');
          this.router.navigateByUrl('user-dashboard');
        }
      );
  }

  setUpTime() {
    this.timer = this.questions[0].quiz.timeDuration * 60;
    this.fullTime = this.questions[0].quiz.timeDuration * 60;
    this.startTimer();
    this.stepDuration = this.questions[0].quiz.timeDuration * 60 / this.questions[0].quiz.numberOfQuestions;
    this.countdown = this.stepDuration;
  }

  preventBackButton() {
    history.pushState(null, null, location.href);
    this.locationSt.onPopState(() => {
      history.pushState(null, null, location.href);
    });
  }

  submitQuiz() {
    Swal.fire({
      title: 'Do you want to submit the quiz?',
      showCancelButton: true,
      confirmButtonText: `Submit`,
      icon: 'info',
    }).then((e) => {
      if (e.isConfirmed) {
        this.evalQuiz();
      }
    });
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.timer <= 0) {
        clearInterval(this.timerInterval);
        this.evalQuiz();
      } else {
        this.timer--;
        this.elapsedTime++;
        this.updateProgressBar();
        if (this.timer === this.fullTime * 3 / 4 || this.timer === this.fullTime / 2 || this.timer === this.fullTime / 4) {
          this.openSnackBar('Elapsed time notification');
        }
        if (this.timer === 300) {
          this.openSnackBar('Final 5 minutes notification');
        }
      }
    }, 1000);
  }

  updateProgressBar() {
    console.log(this.bufferValue);
    console.log(this.progressValue);
    this.progressValue = (this.elapsedTime / this.fullTime) * 100;
  }

  pauseTimer() {
    this.pause = false;
    clearInterval(this.timerInterval);
    this.stopCountdown();
  }

  resumeTimer() {
    this.pause = true;
    this.startTimer();
    this.startCountdown();
  }

  getFormattedTime() {
     this.mm = Math.floor(this.timer / 60);
    const ss = this.timer - this.mm * 60;
    return `${this.mm} m : ${ss} s`;
  }

  startCountdown(): void {
    this.countdown = this.stepDuration;
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(this.countdownInterval);
        const message = 'You have spent ' + this.stepDuration / 60 + ' m on this problem. Hurry Up !!';
        this.openSnackBar(message);
      }
    }, 1000);
  }

  resetCountdown(): void {
    clearInterval(this.countdownInterval);
    this.startCountdown();
  }

  stopCountdown(): void {
    clearInterval(this.countdownInterval);
  }

  evalQuiz() {
    if (this.isSubmitting) return; // Prevent multiple submissions
    this.isSubmitting = true;

    console.log('evalQuiz called');
    this.countdown = 0;
    this.timer = 0;
    this.loadMore();
    this.questions.forEach((q, i) => {
      if (q.givenAnswer === q.answer) {
        q.accuracy = true;
        this.correctAnswers++;
        this.marksGot = this.correctAnswers;
      } else {
        q.accuracy = false;
      }
    });
    this.viewportScroller.scrollToPosition([0, 0]);

    // Calculate the time spent
    const endTime = new Date();
    this.timeSpent = Math.floor((endTime.getTime() - this.startTime.getTime()) / 1000); // Time spent in seconds
    const timeSpentFormatted = this.formatTime(this.timeSpent); // Format time spent

    this.saveHistory(timeSpentFormatted);
    this.showNavbar();
    this.isSubmit = true;
  }

  formatTime(seconds: number): string {
    const mm = Math.floor(seconds / 60);
    const ss = seconds % 60;
    return `${mm < 10 ? '0' : ''}${mm}:${ss < 10 ? '0' : ''}${ss}`;
  }

  saveHistory(timeSpent: string) {
    console.log('saveHistory called');
    this.date = this.datePipe.transform(this.myDate, 'yyyy-MM-dd  h:mm a');
    const userId = JSON.parse(localStorage.getItem('user')).id;
    const nowTime: any = this.getFormattedTime();

    const h = {
      date: this.date,
      category: this.questions[0].quiz.category.title,
      title: this.questions[0].quiz.title,
      fullMarks: this.questions[0].quiz.maxMarks,
      yourMarks: this.marksGot,
      savedTime: timeSpent,// Include the formatted time spent
      qid: this.qid,
      user: {
        id: userId,
      },
    };
    this.historyService.addHistory(h).subscribe(response => {
      console.log(response);
    }, error => {
      console.log(error);
    });
  }

  loadMore() {
    this.pageNumber = this.pageNumber + 1;
    this.loadQuestions();
  }

  getStepLabel(i: number): string {
    const answer = this.questions[i].givenAnswer;
    if (answer === null || answer === undefined) {
      return `Question ${i + 1} `;
    } else {
      return `Question ${i + 1} ✔️`;
    }
  }

  checkStatus(i: number) {
    console.log(this.questions[i].givenAnswer);
    // Updating the label directly based on the current step status
    this.stepper._steps.toArray()[i].label = this.getStepLabel(i);
  }

  onStepClick(stepper: MatStepper, step: number) {
    console.log(step);
    this.checkStatus(step);
    clearInterval(this.countdownInterval);
    this.resetCountdown();
  }


  openSnackBar(message: string): void {
    this.snackBar.open(message, 'close', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  openPopup(): void {
    const dialogRef = this.dialog.open(DialogContentComponent, {
      width: '300px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  hideNavbar(): void {
    this.navbarService.setShowNavbar(false);
  }

  showNavbar(): void {
    this.navbarService.setShowNavbar(true);
  }
}

@Component({
  selector: 'app-dialog-content',
  template: `
    <div>
      <h2>+ Add Todo</h2>
      <form>
        <mat-form-field appearance="fill" style="width: 100%;">
          <mat-label>Describe task</mat-label>
          <textarea style="height: auto" matInput placeholder="EX: refer 2002 15 Q again" [(ngModel)]="name" name="name" required></textarea>
        </mat-form-field>
        <br>
        <button style="margin-right: 5px" mat-raised-button color="primary" (click)="save()">add</button>
        <button mat-raised-button (click)="close()">Cancel</button>
      </form>
    </div>
  `,
})
export class DialogContentComponent {
  name: string;
  todos;

  constructor(private dialogRef: MatDialogRef<DialogContentComponent>,
              private snackBar: MatSnackBar,
  ) { }

  save(): void {
    const retString = localStorage.getItem('todos');
    this.todos = JSON.parse(retString);

    console.log('Name:', this.name);
    const todo = new Todo();
    todo.name = this.name;
    todo.isCompleted = true;
    this.todos.push(todo);
    const array = JSON.stringify(this.todos);
    console.log(array);
    localStorage.setItem('todos', array);
    this.name = '';
    this.dialogRef.close();
    this.snackBar.open('Task added to your list in profile', 'success', {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
