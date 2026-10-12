import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthService } from '../../services/auth/AuthService';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'] 
})
export class Login {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  errorMessage = signal<string | null>(null);

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.http.post(`${environment.apiUrl}/auth/login`, this.loginForm.value, { responseType: 'text' })
      .subscribe({
        next: (token) => {
          let trimmedToken = token.trim();
          if (!trimmedToken) {
            this.errorMessage.set('O servidor não retornou um token válido.');
            return;
          }

          this.authService.setToken(trimmedToken);
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          if (returnUrl?.startsWith('/') && !returnUrl.startsWith('//')) {
            this.router.navigateByUrl(returnUrl);
            return;
          }

          this.router.navigate(['/']);
        },
        error: (error: unknown) => {
          const message = error instanceof HttpErrorResponse && typeof error.error === 'string'
            ? error.error
            : 'Falha no login. Tente novamente.';
          this.errorMessage.set(message);
        }
      });
  }
}
