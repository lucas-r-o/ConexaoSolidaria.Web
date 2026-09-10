import { Component, ChangeDetectionStrategy, DestroyRef, inject, computed, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CampanhaPublicaDTO } from '../../services/campanhas/CampanhaPublicaDTO';
import { CampanhaService } from '../../services/campanhas/campanhaServices';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly campanhaService = inject(CampanhaService);
  private readonly destroyRef = inject(DestroyRef);

  readonly campanhas = signal<CampanhaPublicaDTO[]>([]);
  readonly carregando = signal(true);
  readonly erro = signal(false);

  readonly totalArrecadado = computed(() =>
    this.campanhas().reduce((soma, c) => soma + c.valorTotalArrecadado, 0)
  );

  constructor() {
    this.campanhaService.watchCampanhas()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (campanhas) => {
          this.campanhas.set(campanhas);
          this.carregando.set(false);
          this.erro.set(false);
        },
        error: () => {
          this.erro.set(true);
          this.carregando.set(false);
        },
      });
  }

  progresso(campanha: CampanhaPublicaDTO): number {
    if (!campanha.metaFinanceira) return 0;
    return Math.min(100, Math.round((campanha.valorTotalArrecadado / campanha.metaFinanceira) * 100));
  }
}
