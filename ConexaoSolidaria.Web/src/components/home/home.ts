import { Component, ChangeDetectionStrategy, DestroyRef, inject, computed, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CampanhaPublicaDTO } from '../../services/campanhas/CampanhaPublicaDTO';
import { CampanhaService } from '../../services/campanhas/campanhaServices';
import { AuthService, UserRole } from '../../services/auth/AuthService';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly campanhaService = inject(CampanhaService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  readonly campanhas = signal<CampanhaPublicaDTO[]>([]);
  readonly carregando = signal(true);
  readonly erro = signal(false);
  readonly isLoggedIn = signal(this.authService.isLoggedIn());
  readonly isDoador = signal(this.authService.hasRole(UserRole.Doador));
  readonly isGestorOng = signal(this.authService.hasRole(UserRole.GestorOng));
  readonly acessoNegado = signal(false);

  readonly totalArrecadado = computed(() =>
    this.campanhas().reduce((soma, c) => soma + c.valorTotalArrecadado, 0)
  );

  constructor() {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => this.acessoNegado.set(params.has('acessoNegado')));

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

  sair(): void {
    this.authService.logout();
    this.isLoggedIn.set(false);
    this.isDoador.set(false);
    this.isGestorOng.set(false);
  }
}
