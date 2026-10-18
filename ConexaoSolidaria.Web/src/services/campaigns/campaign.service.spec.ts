import '@angular/compiler';
import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { CampaignService } from './campaign.service';

describe('CampaignService', () => {
  let campaignService: CampaignService;
  let httpGet: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    httpGet = vi.fn().mockReturnValue(
      of([
        {
          id: 'campaign-id',
          title: 'Community garden',
          financialGoal: 55000,
          totalAmountRaised: 12500,
        },
      ]),
    );

    TestBed.configureTestingModule({
      providers: [
        CampaignService,
        { provide: HttpClient, useValue: { get: httpGet } },
        { provide: AuthService, useValue: {} },
      ],
    });
    campaignService = TestBed.inject(CampaignService);
  });

  it('maps the API campaign fields to the frontend campaign model', async () => {
    await expect(firstValueFrom(campaignService.getCampaigns())).resolves.toEqual([
      {
        id: 'campaign-id',
        titulo: 'Community garden',
        metaFinanceira: 55000,
        valorTotalArrecadado: 12500,
      },
    ]);
    expect(httpGet).toHaveBeenCalledWith(`${environment.apiUrl}/campanhas`);
  });
});
