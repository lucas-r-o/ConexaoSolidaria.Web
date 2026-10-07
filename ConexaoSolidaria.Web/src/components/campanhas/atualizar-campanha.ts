import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AtualizarCampanhaDTO } from '../../services/campanhas/AtualizarCampanhaDTO';
import { CampanhaPublicaDTO } from '../../services/campanhas/CampanhaPublicaDTO';
import { CampanhaService } from '../../services/campanhas/campanhaServices';
import { Status } from '../../services/campanhas/Status';

@Component({
  selector: 'app-atualizar-campanha',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './atualizar-campanha.html',
  styleUrl: './atualizar-campanha.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AtualizarCampanha {
  private readonly formBuilder = inject(FormBuilder);
  private readonly campanhaService = inject(CampanhaService);
  private readonly route = inject(ActivatedRoute);

  readonly buscando = signal(false);
  readonly atualizando = signal(false);
  readonly erro = signal('');
  readonly erroAtualizacao = signal('');
  readonly sucesso = signal(false);
  readonly id = signal('');
  readonly campanha = signal<CampanhaPublicaDTO | null>(null);
  readonly statusOptions = [
    { value: Status.Ativo, label: 'Ativa' },
    { value: Status.Concluido, label: 'Concluída' },
    { value: Status.Cancelado, label: 'Cancelada' },
  ];

  readonly formulario = this.formBuilder.group({
    titulo: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(100),
      Validators.pattern(/\S/),
    ]),
    descricao: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(500),
      Validators.pattern(/\S/),
    ]),
    metaFinanceira: this.formBuilder.nonNullable.control(0, [
      Validators.required,
      Validators.min(0.01),
    ]),
    status: this.formBuilder.control<Status | null>(null, Validators.required),
    dataFim: this.formBuilder.nonNullable.control(''),
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')?.trim();
    if (id) {
      this.buscarPorId(id);
    }
  }

  buscarPorId(id: string): void {
    const idCampanha = id.trim();
    if (!idCampanha || this.buscando() || this.atualizando()) {
      return;
    }

    this.id.set(idCampanha);
    this.campanha.set(null);
    this.erro.set('');
    this.erroAtualizacao.set('');
    this.sucesso.set(false);
    this.buscando.set(true);

    this.campanhaService.getCampanha(idCampanha)
      .pipe(finalize(() => this.buscando.set(false)))
      .subscribe({
        next: (campanha) => {
          this.campanha.set(campanha);
          this.formulario.reset({
            titulo: campanha.titulo ?? '',
            descricao: '',
            metaFinanceira: campanha.metaFinanceira ?? 0,
            status: null,
            dataFim: '',
          });
        },
        error: (error: unknown) => {
          console.error('Falha ao buscar campanha por ID', error);
          this.erro.set('Não foi possível consultar a campanha. Confira o ID e tente novamente.');
        },
      });
  }

  atualizar(): void {
    if (!this.campanha() || this.formulario.invalid || this.atualizando()) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    if (valores.status === null) {
      this.formulario.controls.status.markAsTouched();
      return;
    }

    const dto: AtualizarCampanhaDTO = {
      Titulo: valores.titulo.trim(),
      Descricao: valores.descricao.trim(),
      MetaFinanceira: valores.metaFinanceira,
      Status: valores.status,
      DataFim: valores.dataFim ? `${valores.dataFim}T00:00:00` : null,
    };

    this.erroAtualizacao.set('');
    this.sucesso.set(false);
    this.atualizando.set(true);

    this.campanhaService.updateCampanha(this.id(), dto)
      .pipe(finalize(() => this.atualizando.set(false)))
      .subscribe({
        next: (campanhaAtualizada) => {
          this.campanha.set(campanhaAtualizada);
          this.sucesso.set(true);
        },
        error: (error: unknown) => {
          console.error('Falha ao atualizar campanha', error);
          this.erroAtualizacao.set(
            'Não foi possível atualizar a campanha. Verifique sua autorização e tente novamente.',
          );
        },
      });
  }
}
