import '@angular/compiler';
import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, RouterModule, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../services/auth/auth.service';
import { CampaignService } from '../../services/campaigns/campaign.service';
import { UserService } from '../../services/users/user.service';
import { DonationComponent } from './donation.component';

describe('DonationComponent', () => {
  it('loads and selects the campaign specified in the route', async () => {
    await TestBed.configureTestingModule({
      imports: [DonationComponent, RouterModule.forRoot([])],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: convertToParamMap({ campaign: 'campaign-id' }) },
          },
        },
        {
          provide: CampaignService,
          useValue: {
            getCampaigns: () =>
              of([
                {
                  id: 'other-campaign-id',
                  titulo: 'Other cause',
                  metaFinanceira: 10000,
                  valorTotalArrecadado: 2500,
                },
                {
                  id: 'campaign-id',
                  titulo: 'Community garden',
                  metaFinanceira: 55000,
                  valorTotalArrecadado: 12500,
                },
              ]),
          },
        },
        { provide: AuthService, useValue: { getJwtPayload: () => ({ nameid: 'donor-id' }) } },
        {
          provide: UserService,
          useValue: { donate: () => of({ enviado: true, message: 'Donation received' }) },
        },
      ],
    }).compileComponents();

    const fixture: ComponentFixture<DonationComponent> =
      TestBed.createComponent(DonationComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const campaignSelect: HTMLSelectElement = fixture.nativeElement.querySelector('#campaign');
    expect(campaignSelect.value).toBe('campaign-id');
    expect(campaignSelect.disabled).toBe(false);
    expect(campaignSelect.selectedOptions[0].textContent.trim()).toBe('Community garden');
  });

  it('sends the donation using the API field names', async () => {
    const donate = vi.fn(() => of({ enviado: true, message: 'Donation received' }));
    await TestBed.configureTestingModule({
      imports: [DonationComponent, RouterModule.forRoot([])],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: convertToParamMap({ campaign: 'campaign-id' }) },
          },
        },
        { provide: CampaignService, useValue: { getCampaigns: () => of([]) } },
        { provide: AuthService, useValue: { getJwtPayload: () => ({ nameid: 'donor-id' }) } },
        { provide: UserService, useValue: { donate } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DonationComponent);
    const component = fixture.componentInstance;
    component.selectedCampaignId.set('campaign-id');
    component.donationAmount.set(0.01);
    component.submitDonation();

    expect(donate).toHaveBeenCalledWith({
      campaignId: 'campaign-id',
      donorId: 'donor-id',
      amount: 0.01,
    });
  });

  it('displays a plain-text API error response', async () => {
    await TestBed.configureTestingModule({
      imports: [DonationComponent, RouterModule.forRoot([])],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap({}) } },
        },
        { provide: CampaignService, useValue: { getCampaigns: () => of([]) } },
        { provide: AuthService, useValue: { getJwtPayload: () => ({ nameid: 'donor-id' }) } },
        {
          provide: UserService,
          useValue: {
            donate: () =>
              throwError(() => new HttpErrorResponse({ status: 400, error: 'Invalid donation' })),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DonationComponent);
    const component = fixture.componentInstance;
    component.selectedCampaignId.set('campaign-id');
    component.donationAmount.set(0.01);
    component.submitDonation();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent.trim()).toBe(
      'Invalid donation',
    );
  });

  it('shows the processing message from a successful donation response', async () => {
    await TestBed.configureTestingModule({
      imports: [DonationComponent, RouterModule.forRoot([])],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap({}) } },
        },
        { provide: CampaignService, useValue: { getCampaigns: () => of([]) } },
        { provide: AuthService, useValue: { getJwtPayload: () => ({ nameid: 'donor-id' }) } },
        {
          provide: UserService,
          useValue: {
            donate: () => of({ enviado: true, message: 'Processing donation result by email.' }),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DonationComponent);
    const component = fixture.componentInstance;
    component.selectedCampaignId.set('campaign-id');
    component.donationAmount.set(0.01);
    component.submitDonation();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="status"]').textContent.trim()).toBe(
      'Processing donation result by email.',
    );
  });
});
