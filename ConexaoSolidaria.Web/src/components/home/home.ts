import { Component, OnInit, ChangeDetectorRef, computed, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CampanhaPublicaDTO } from './CampanhaPublicaDTO';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  campanhas = signal<CampanhaPublicaDTO[]>([]);
  carregando = signal(true);
  erro = signal(false);
  totalArrecadado = computed(() => this.campanhas().reduce((soma, c) => soma + c.valorTotalArrecadado, 0));

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.http.get<CampanhaPublicaDTO[]>(`${environment.apiUrl}/campanhas`).subscribe({
      next: (c) => { this.campanhas.set(c); this.carregando.set(false); },
      error: () => { this.erro.set(true); this.carregando.set(false); }
    });
  }

  progresso(campanha: CampanhaPublicaDTO): number {
    if (!campanha.metaFinanceira) {
      return 0;
    }
    return Math.min(
      100,
      Math.round(
        (campanha.valorTotalArrecadado / campanha.metaFinanceira) * 100
      )
    );
  }
}
