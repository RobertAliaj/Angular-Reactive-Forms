import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';

import {Customer} from './customer';

function ratingRange(formControlBeingValidated: AbstractControl): { [key: string]: boolean } | null {
  /**
    *if the value of the form-control is not null, is not a number, is smaller than
   * 1 and bigger than 5 then we return true because one of the validators isnt valid* */
  // tslint:disable-next-line:max-line-length
  if (formControlBeingValidated.value !== null && (isNaN(formControlBeingValidated.value) || formControlBeingValidated.value < 1 || formControlBeingValidated.value > 5)) {
    return {range: true };
  }
  return null;
}

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  customerForm: FormGroup;
  // customer = new Customer();

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      notification: [''],
      rating: [null, ratingRange],
      sendCatalog: true
    });
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
