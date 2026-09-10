import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer, EMPTY } from 'rxjs';
import { switchMap, catchError, shareReplay, retry } from 'rxjs/operators';
import { CampanhaPublicaDTO } from './CampanhaPublicaDTO';
import { environment } from '../../environments/environment';

const POLL_INTERVAL_MS = 15_000;

@Injectable({ providedIn: 'root' })
export class CampanhaService {
  private readonly http = inject(HttpClient);

  watchCampanhas(): Observable<CampanhaPublicaDTO[]> {
    return timer(0, POLL_INTERVAL_MS).pipe(
      switchMap(() =>
        this.http.get<CampanhaPublicaDTO[]>(`${environment.apiUrl}/campanhas`).pipe(
          retry({ count: 2, delay: 1000 }),
          catchError((err) => {
            console.error('Failed to fetch campanhas', err);
            return EMPTY;
          })
        )
      ),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }
}
