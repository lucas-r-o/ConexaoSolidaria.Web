import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer } from 'rxjs';
import { map, switchMap, shareReplay, retry } from 'rxjs/operators';
import { PublicCampaignDto } from './public-campaign.dto';
import { CreateCampaignRequestDto } from './create-campaign.dto';
import { environment } from '../../environments/environment';
import { UpdateCampaignRequestDto } from './update-campaign.dto';
import { AuthService } from '../auth/auth.service';

const POLL_INTERVAL_MS = 15_000;

interface CampaignApiResponse {
  id: string;
  title: string;
  financialGoal: number;
  totalAmountRaised: number;
}

function mapCampaignResponse(campaign: CampaignApiResponse): PublicCampaignDto {
  return {
    id: campaign.id,
    titulo: campaign.title,
    metaFinanceira: campaign.financialGoal,
    valorTotalArrecadado: campaign.totalAmountRaised,
  };
}

@Injectable({ providedIn: 'root' })
export class CampaignService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  getCampaigns(): Observable<PublicCampaignDto[]> {
    return this.http
      .get<CampaignApiResponse[]>(`${environment.apiUrl}/campanhas`)
      .pipe(
        map((campaigns) => campaigns.map(mapCampaignResponse)),
        retry({ count: 2, delay: 1000 }),
      );
  }

  watchCampaigns(): Observable<PublicCampaignDto[]> {
    return timer(0, POLL_INTERVAL_MS).pipe(
      switchMap(() => this.getCampaigns()),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  getCampaign(id: string): Observable<PublicCampaignDto> {
    return this.http
      .get<CampaignApiResponse>(`${environment.apiUrl}/campanhas/${id}`)
      .pipe(map(mapCampaignResponse));
  }

  updateCampaign(id: string, campaign: UpdateCampaignRequestDto): Observable<PublicCampaignDto> {
    return this.http
      .put<CampaignApiResponse>(`${environment.apiUrl}/campanhas/${id}`, campaign)
      .pipe(map(mapCampaignResponse));
  }

  createCampaign(dto: CreateCampaignRequestDto): Observable<unknown> {
    const headers = this.authService.getAuthorizationHeader();
    return this.http.post<unknown>(`${environment.apiUrl}/campanhas/criar`, dto, { headers });
  }
}
