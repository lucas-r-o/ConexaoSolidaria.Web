import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { CadastroDTO } from '../../services/usuarios/CadastroDTO';
import { UsuarioServices } from '../../services/usuarios/usuariosServices';

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;

export const cpfValidator: ValidatorFn = (control): ValidationErrors | null => {
  const cpf = typeof control.value === 'string' ? control.value.trim() : '';
  if (!cpf) {
    return null;
  }

  const isDigitsOnly = /^\d{11}$/.test(cpf);
  const isFormatted = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf);
  if (!isDigitsOnly && !isFormatted) {
    return { cpfInvalid: true };
  }

  const digits = cpf.replace(/\D/g, '');
  if (/^(\d)\1{10}$/.test(digits)) {
    return { cpfInvalid: true };
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
    return { cpfInvalid: true };
  }

  return null;
};

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cadastro {
  private readonly formBuilder = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioServices);
  private readonly destroyRef = inject(DestroyRef);

  readonly enviando = signal(false);
  readonly sucesso = signal(false);
  readonly erro = signal<string | null>(null);

  readonly formulario = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.pattern(/^\S+\s+\S+.*$/)]],
    email: ['', [Validators.required, Validators.email]],
    cpf: ['', [Validators.required, cpfValidator]],
    senhaHash: ['', [Validators.required, Validators.pattern(PASSWORD_PATTERN)]],
  });

  cadastrar(): void {
    if (this.formulario.invalid || this.enviando()) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    const dto: CadastroDTO = {
      nome: valores.nome.trim(),
      email: valores.email.trim(),
      cpf: valores.cpf.trim(),
      senhaHash: valores.senhaHash,
    };

    this.erro.set(null);
    this.enviando.set(true);
    this.usuarioService.cadastrar(dto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.enviando.set(false)),
      )
      .subscribe({
        next: () => this.sucesso.set(true),
        error: (error: unknown) => this.erro.set(this.getErrorMessage(error)),
      });
  }

  private getErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Não foi possível concluir o cadastro. Tente novamente.';
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
          .flatMap((value) => Array.isArray(value) ? value : [])
          .filter((value): value is string => typeof value === 'string');
        if (messages.length > 0) {
          return messages.join(' ');
        }
      }
    }

    return 'Não foi possível concluir o cadastro. Verifique os dados e tente novamente.';
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
