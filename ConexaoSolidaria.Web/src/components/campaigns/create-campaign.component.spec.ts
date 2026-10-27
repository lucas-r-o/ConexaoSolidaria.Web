import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { CampaignService } from '../../services/campaigns/campaign.service';
import { CreateCampaignComponent } from './create-campaign.component';

describe('CreateCampaignComponent', () => {
  it('maps the form to the campaign API contract', () => {
    const createCampaign = vi.fn(() => of({}));

    TestBed.configureTestingModule({
      imports: [CreateCampaignComponent, RouterModule.forRoot([])],
      providers: [{ provide: CampaignService, useValue: { createCampaign } }],
    });

    const fixture: ComponentFixture<CreateCampaignComponent> = TestBed.createComponent(CreateCampaignComponent);
    const component = fixture.componentInstance;
    component.campaignForm.setValue({
      title: 'Community garden',
      description: 'Build a shared garden for the neighborhood.',
      financialGoal: 55000,
      endDate: '',
    });
    component.createCampaign();

    expect(createCampaign).toHaveBeenCalledWith({
      Title: 'Community garden',
      Description: 'Build a shared garden for the neighborhood.',
      FinancialGoal: 55000,
      EndDate: null,
    });
  });

  it('keeps API validation failures visible instead of hiding the failed request', () => {
    TestBed.configureTestingModule({
      imports: [CreateCampaignComponent, RouterModule.forRoot([])],
      providers: [{
        provide: CampaignService,
        useValue: { createCampaign: () => throwError(() => ({ error: { errors: ['Invalid title'] } })) },
      }],
    });

    const fixture = TestBed.createComponent(CreateCampaignComponent);
    const component = fixture.componentInstance;
    component.campaignForm.setValue({
      title: 'Community garden',
      description: 'Build a shared garden for the neighborhood.',
      financialGoal: 55000,
      endDate: '',
    });
    component.createCampaign();
    fixture.detectChanges();

    expect(component.errorMessage()).not.toBe('');
  });
});
