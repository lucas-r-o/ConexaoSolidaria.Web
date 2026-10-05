import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { CampanhaService } from '../../services/campanhas/campanhaServices';
import { CriarCampanhaDTO } from '../../services/campanhas/CriarCampanhaDTO';

@Component({
  selector: 'app-criar-campanha',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './criar-campanha.html',
  styleUrl: './criar-campanha.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CriarCampanha {
  private readonly formBuilder = inject(FormBuilder);
  private readonly campanhaService = inject(CampanhaService);

  readonly enviando = signal(false);
  readonly sucesso = signal(false);
  readonly erro = signal<string | null>(null);

  readonly formulario = this.formBuilder.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/\S/)]],
    descricao: ['', [Validators.required, Validators.maxLength(500), Validators.pattern(/\S/)]],
    metaFinanceira: [0, [Validators.required, Validators.min(0.01)]],
    dataFim: [''],
  });

  criar(): void {
    if (this.formulario.invalid || this.enviando()) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    const dto: CriarCampanhaDTO = {
      titulo: valores.titulo.trim(),
      descricao: valores.descricao.trim(),
      metaFinanceira: valores.metaFinanceira,
      dataFim: valores.dataFim || null,
    };

    this.erro.set(null);
    this.sucesso.set(false);
    this.enviando.set(true);

    this.campanhaService.criar(dto)
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => {
          this.sucesso.set(true);
          this.formulario.reset({ titulo: '', descricao: '', metaFinanceira: 0, dataFim: '' });
        },
        error: (error: unknown) => {
          const mensagem = typeof error === 'object' && error !== null && 'error' in error
            ? (error as { error?: { detail?: string; title?: string } | string }).error
            : null;
          const detalhe = typeof mensagem === 'string'
            ? mensagem
            : mensagem?.detail ?? mensagem?.title;
          this.erro.set(detalhe ?? 'Não foi possível criar a campanha. Verifique sua autorização e tente novamente.');
        },
      });
  }
}