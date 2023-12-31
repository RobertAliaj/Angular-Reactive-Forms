import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, ValidatorFn, Validators} from '@angular/forms';

import {debounceTime} from "rxjs/operators";


function emailMatcher(formGroupBeingValidated: AbstractControl): { [key: string]: boolean } | null {
  let email: AbstractControl = formGroupBeingValidated.get('email');
  let confirmEmail: AbstractControl = formGroupBeingValidated.get('confirmEmail');

  if (email.pristine || confirmEmail.pristine) {
    return null;
  }

  if (email.value === confirmEmail.value) {
    return null;
  }

  return {match: true};
}

function ratingRange(min: number, max: number): ValidatorFn {
  return (formControlBeingValidated: AbstractControl): { [key: string]: boolean } | null => {
    //if the value of the form-control is not null, is not a number, is smaller than 1 and bigger than 5 then we return true because one of the validators isn't valid
    if (formControlBeingValidated.value !== null && (isNaN(formControlBeingValidated.value) || formControlBeingValidated.value < min || formControlBeingValidated.value > max)) {
      return {range: true};
    }
    return null;
  }
}

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  customerForm: FormGroup;

  emailMessage: string;

  get addressesFormArray(): FormArray {
    return <FormArray>this.customerForm.get('addressesFormArray');
  }

  private validationMessage = {
    required: 'Please enter your email address.',
    email: 'Please enter a valid  email address.'
  }

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      emailGroup: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        confirmEmail: ['', Validators.required],
      }, {validator: emailMatcher}),
      phone: [''],
      notification: [''],
      rating: [null, ratingRange(1, 5)],
      sendCatalog: true,
      addressesFormArray: this.fb.array([this.buildAddressesGroup()])
    });

    this.customerForm.get('notification').valueChanges.subscribe(
      value => this.setNotification(value)
    )

    const emailControl: AbstractControl = this.customerForm.get('emailGroup.email');
    emailControl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => this.setMessage(emailControl)
    )
  }

  addAddressesGroup(): void{
    this.addressesFormArray.push(this.buildAddressesGroup())
  }

  buildAddressesGroup(): FormGroup {
    return this.fb.group({
      addressType: 'home',
      street1: '',
      street2: '',
      city: '',
      state: '',
      zip: ''
    })
  }

  setMessage(formControl: AbstractControl): void {
    this.emailMessage = '';
    if ((formControl.touched || formControl.dirty) && formControl.errors) {
      this.emailMessage = Object.keys(formControl.errors).map(
        key => this.validationMessage[key]).join(' ');
    }
  }

  save(): void {
    console.log(this.customerForm);
    console.log('Saved: ' + JSON.stringify(this.customerForm.value));
  }

  setNotification(notifyVia: string): void {
    const phoneControl: AbstractControl = this.customerForm.get('phone');
    if (notifyVia === 'text') {
      phoneControl.setValidators(Validators.required);
    } else {
      phoneControl.clearValidators();
    }
    phoneControl.updateValueAndValidity();
  }

  // Test Method just to fill the Input fields
  populateTestData(): void {
    this.customerForm.patchValue({
      firstName: 'Otto',
      lastName: 'Normalo',
      email: 'ottonormalisto@mail.com',
      phone: '',
      notification: 'email',
      sendCatalog: false
    });
  }
}
