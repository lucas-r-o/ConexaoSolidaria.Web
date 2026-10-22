import { ValidatorFn, Validators } from '@angular/forms';

export const CAMPAIGN_TITLE_VALIDATORS: ValidatorFn[] = [
  Validators.required,
  Validators.maxLength(100),
  Validators.pattern(/\S/),
];

export const CAMPAIGN_DESCRIPTION_VALIDATORS: ValidatorFn[] = [
  Validators.required,
  Validators.maxLength(500),
  Validators.pattern(/\S/),
];

export const CAMPAIGN_FINANCIAL_GOAL_VALIDATORS: ValidatorFn[] = [
  Validators.required,
  Validators.min(0.01),
];
