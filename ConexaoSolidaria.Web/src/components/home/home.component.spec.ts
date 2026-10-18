import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, RouterModule, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../services/auth/auth.service';
import { CampaignService } from '../../services/campaigns/campaign.service';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  const campaigns = [
    {
      id: 'campaign-id',
      titulo: 'Community garden',
      metaFinanceira: 55000,
      valorTotalArrecadado: 12500,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent, RouterModule.forRoot([])],
      providers: [
        { provide: ActivatedRoute, useValue: { queryParamMap: of(convertToParamMap({})) } },
        {
          provide: AuthService,
          useValue: { isLoggedIn: () => false, hasRole: () => false, logout: vi.fn() },
        },
        { provide: CampaignService, useValue: { watchCampaigns: () => of(campaigns) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the title of each active campaign', () => {
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.campaign-title');
    expect(title.textContent.trim()).toBe('Community garden');
  });

  it('shows a donate link with the campaign ID for donors', () => {
    component.isDonor.set(true);
    fixture.detectChanges();

    const donateLink: HTMLAnchorElement = fixture.nativeElement.querySelector(
      '.campaign-action[aria-label="Donate to Community garden"]',
    );
    expect(donateLink).toBeTruthy();
    expect(donateLink.getAttribute('href')).toBe('/donate?campaign=campaign-id');
  });
});
