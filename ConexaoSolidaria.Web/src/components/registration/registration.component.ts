import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { RegistrationRequestDto } from '../../services/users/registration.dto';
import { UserService } from '../../services/users/user.service';

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;

export const brazilianTaxIdValidator: ValidatorFn = (control): ValidationErrors | null => {
  const taxId = typeof control.value === 'string' ? control.value.trim() : '';
  if (!taxId) {
    return null;
  }

  const isDigitsOnly = /^\d{11}$/.test(taxId);
  const isFormatted = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(taxId);
  if (!isDigitsOnly && !isFormatted) {
    return { taxIdInvalid: true };
  }

  const digits = taxId.replace(/\D/g, '');
  if (/^(\d)\1{10}$/.test(digits)) {
    return { taxIdInvalid: true };
  }

  const calculateDigit = (length: number): number => {
    let total = 0;
    for (let index = 0; index < length; index += 1) {
      total += Number(digits[index]) * (length + 1 - index);
    }
    const remainder = (total * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  if (calculateDigit(9) !== Number(digits[9]) || calculateDigit(10) !== Number(digits[10])) {
    return { taxIdInvalid: true };
  }

  return null;
};

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrationComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isSubmitting = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly registrationForm = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required, Validators.pattern(/^\S+\s+\S+.*$/)]],
    email: ['', [Validators.required, Validators.email]],
    taxId: ['', [Validators.required, brazilianTaxIdValidator]],
    password: ['', [Validators.required, Validators.pattern(PASSWORD_PATTERN)]],
  });

  register(): void {
    if (this.registrationForm.invalid || this.isSubmitting()) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    const formValue = this.registrationForm.getRawValue();
    const request: RegistrationRequestDto = {
      name: formValue.fullName.trim(),
      email: formValue.email.trim(),
      taxId: formValue.taxId.trim(),
      passwordHash: formValue.password,
    };

    this.errorMessage.set(null);
    this.isSubmitting.set(true);
    this.userService
      .register(request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSubmitting.set(false)),
      )
      .subscribe({
        next: (message) => this.successMessage.set(message),
        error: (error: unknown) => this.errorMessage.set(this.getErrorMessage(error)),
      });
  }

  private getErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Registration could not be completed. Please try again.';
    }

    const body: unknown = error.error;
    if (typeof body === 'string' && body.trim()) {
      return body;
    }

    if (this.isRecord(body)) {
      const detail = body['detail'] ?? body['title'] ?? body['message'];
      if (typeof detail === 'string' && detail.trim()) {
        return detail;
      }

      const errors = body['errors'];
      if (this.isRecord(errors)) {
        const messages = Object.values(errors)
          .flatMap((value) => (Array.isArray(value) ? value : []))
          .filter((value): value is string => typeof value === 'string');
        if (messages.length > 0) {
          return messages.join(' ');
        }
      }
    }

    return 'Registration could not be completed. Check your details and try again.';
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
