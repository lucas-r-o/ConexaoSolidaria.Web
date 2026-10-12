import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer, EMPTY, of } from 'rxjs';
import { switchMap, catchError, shareReplay, retry, map } from 'rxjs/operators';
import { CampanhaPublicaDTO } from './CampanhaPublicaDTO';
import { CriarCampanhaDTO } from './CriarCampanhaDTO';
import { environment } from '../../environments/environment';
import { AtualizarCampanhaDTO } from './AtualizarCampanhaDTO';
import { AuthService } from '../auth/AuthService';

const POLL_INTERVAL_MS = 15_000;

@Injectable({ providedIn: 'root' })
export class CampanhaService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  getCampanhas(): Observable<CampanhaPublicaDTO[]> {
    return this.http.get<CampanhaPublicaDTO[]>(`${environment.apiUrl}/campanhas`).pipe(
      retry({ count: 2, delay: 1000 }),
      catchError((err) => {
        console.error('Failed to fetch campanhas', err);
        return of([]);
      })
    );
  }

  watchCampanhas(): Observable<CampanhaPublicaDTO[]> {
    return timer(0, POLL_INTERVAL_MS).pipe(
      switchMap(() => this.getCampanhas()),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  getCampanha(id: string): Observable<CampanhaPublicaDTO> {
    return this.http.get<CampanhaPublicaDTO>(`${environment.apiUrl}/campanhas/${id}`);
  }

  updateCampanha(id: string, campanha: AtualizarCampanhaDTO): Observable<CampanhaPublicaDTO> {
    return this.http.put<CampanhaPublicaDTO>(`${environment.apiUrl}/campanhas/${id}`, campanha);
  }

  criar(dto: CriarCampanhaDTO): Observable<unknown> {
    const headers = this.authService.getHeaderToken();
    return this.http.post<unknown>(`${environment.apiUrl}/campanhas/criar`, dto, { headers });
  }
}
