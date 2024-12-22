import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Observable, of, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  form: FormGroup;
  myForm: FormGroup;

  private searchTerms = new Subject<string>();
  private searchFruits = new Subject<string>();

  selectedFruit!: string;  // This will be bound to the input using ngModel
  fruits: string[] = ['Apple', 'Banana', 'Orange', 'Mango', 'Pineapple'];
  fruitsReactive: any[] = [{ id: 1, name: 'Apple' },
  { id: 2, name: 'Orange' },
  { id: 3, name: 'Banana' },
  { id: 4, name: 'Mango' }]
  filteredFruits: string[] = this.fruits;
  options: any[] = this.fruitsReactive;


  constructor(private fb: FormBuilder, private http: HttpClient) {
    // Initialize the form with a FormArray
    this.form = this.fb.group({
      name: ['', Validators.required],
      emails: this.fb.array([
        //this.fb.control('', [Validators.required, Validators.email]),
      ]),
    });


    this.searchTerms.pipe(
      debounceTime(300), // Wait for 300ms after the user stops typing
      distinctUntilChanged(), // Only emit when the input changes
      switchMap((term: string) => this._filter(term)) // Switch to the filtered fruits
    ).subscribe(filtered => this.filteredFruits = filtered);


    this.searchFruits.pipe(
      debounceTime(300), // Wait for 300ms after the user stops typing
      distinctUntilChanged(), // Only emit when the input changes
      switchMap((term: string) => this.filterObject(term)) // Switch to the filtered fruits
    ).subscribe(filtered => this.options = filtered);

    this.myForm = this.fb.group({
      fruit: ['']  // Form control for the input element
    });
  }

  ngOnInit() {
    this.http.get<any>('assets/data/tempData.json').subscribe((data: any) => {
      console.log(data);
      data.forEach((val: any) => {
        val.values.forEach((email: any) => {
          this.emails.push(this.fb.control(email, [Validators.required, Validators.email]));
        })

      });
    })
  }
  // Getter to access the 'emails' FormArray
  get emails() {
    return (this.form.get('emails') as FormArray);
  }

  // Method to add a new email control to the FormArray
  addEmail() {
    this.emails.push(this.fb.control('', [Validators.required, Validators.email]));
  }

  // Method to remove an email control
  removeEmail(index: number) {
    this.emails.removeAt(index);
  }

  // Method to submit the form data
  onSubmit() {
    console.log(this.form.value);
  }



  onInputChange(event: any): void {
    console.log(event.target.value)
    // this.filteredFruits = this._filter(event.target.value);
    this.searchTerms.next(event.target.value);
  }
  onInputReactiveChange(event: any) {
    console.log(event.target.value)
    // this.filteredFruits = this._filter(event.target.value);
    this.searchFruits.next(event.target.value);
  }

  private _filter(value: string): Observable<string[]> {
    const filterValue = value.toLowerCase();
    return of(this.fruits.filter(fruit => fruit.toLowerCase().includes(filterValue)));
  }

  private filterObject(value: string): Observable<string[]> {
    const filterValue = value.toLowerCase();
    return of(this.fruitsReactive.filter(fruit => fruit.name.toLowerCase().includes(filterValue)));
  }



}
