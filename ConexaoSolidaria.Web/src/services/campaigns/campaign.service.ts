import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer } from 'rxjs';
import { switchMap, shareReplay, retry } from 'rxjs/operators';
import { PublicCampaignDto } from './public-campaign.dto';
import { CreateCampaignRequestDto } from './create-campaign.dto';
import { environment } from '../../environments/environment';
import { UpdateCampaignRequestDto } from './update-campaign.dto';
import { AuthService } from '../auth/auth.service';

const POLL_INTERVAL_MS = 15_000;

@Injectable({ providedIn: 'root' })
export class CampaignService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  getCampaigns(): Observable<PublicCampaignDto[]> {
    return this.http
      .get<PublicCampaignDto[]>(`${environment.apiUrl}/campanhas`)
      .pipe(retry({ count: 2, delay: 1000 }));
  }

  watchCampaigns(): Observable<PublicCampaignDto[]> {
    return timer(0, POLL_INTERVAL_MS).pipe(
      switchMap(() => this.getCampaigns()),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  getCampaign(id: string): Observable<PublicCampaignDto> {
    return this.http.get<PublicCampaignDto>(`${environment.apiUrl}/campanhas/${id}`);
  }

  updateCampaign(id: string, campaign: UpdateCampaignRequestDto): Observable<PublicCampaignDto> {
    return this.http.put<PublicCampaignDto>(`${environment.apiUrl}/campanhas/${id}`, campaign);
  }

  createCampaign(dto: CreateCampaignRequestDto): Observable<unknown> {
    const headers = this.authService.getAuthorizationHeader();
    return this.http.post<unknown>(`${environment.apiUrl}/campanhas/criar`, dto, { headers });
  }
}
