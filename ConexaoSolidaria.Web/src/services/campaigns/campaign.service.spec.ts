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
  let httpPost: ReturnType<typeof vi.fn>;
  let httpPut: ReturnType<typeof vi.fn>;

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

    httpPost = vi.fn().mockReturnValue(of({}));
    httpPut = vi.fn().mockReturnValue(of({}));

    TestBed.configureTestingModule({
      providers: [
        CampaignService,
        { provide: HttpClient, useValue: { get: httpGet, post: httpPost, put: httpPut } },
        { provide: AuthService, useValue: { getAuthorizationHeader: () => ({ Authorization: 'Bearer token' }) } },
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

  it('creates a campaign with the backend field names and authorization header', async () => {
    const request = {
      Title: 'Community garden',
      Description: 'Build a shared garden for the neighborhood.',
      FinancialGoal: 55000,
      EndDate: null,
    };

    await firstValueFrom(campaignService.createCampaign(request));

    expect(httpPost).toHaveBeenCalledWith(`${environment.apiUrl}/campanhas/criar`, request, {
      headers: { Authorization: 'Bearer token' },
    });
  });

  it('updates a campaign through the campaign-specific endpoint', async () => {
    const request = {
      Title: 'Updated campaign',
      Description: 'Updated description.',
      FinancialGoal: 60000,
      Status: 0,
      EndDate: null,
    };
    httpPut.mockReturnValue(of({
      id: 'campaign-id',
      title: 'Updated campaign',
      financialGoal: 60000,
      totalAmountRaised: 12500,
    }));

    await expect(firstValueFrom(campaignService.updateCampaign('campaign-id', request))).resolves.toEqual({
      id: 'campaign-id',
      titulo: 'Updated campaign',
      metaFinanceira: 60000,
      valorTotalArrecadado: 12500,
    });
    expect(httpPut).toHaveBeenCalledWith(`${environment.apiUrl}/campanhas/campaign-id`, request);
  });
});
