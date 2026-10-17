import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth/auth.service';
import { CampaignService } from '../../services/campaigns/campaign.service';
import { PublicCampaignDto } from '../../services/campaigns/public-campaign.dto';
import { UserService } from '../../services/users/user.service';
import { DonationRequestDto } from '../../services/users/donation.dto';

@Component({
  selector: 'app-donation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './donation.component.html',
  styleUrl: './donation.component.css',
})
export class DonationComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly campaignService = inject(CampaignService);
  private readonly userService = inject(UserService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  campaigns: PublicCampaignDto[] = [];
  selectedCampaignId: string | null = null;
  donationAmount = 0;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  loading = true;
  isSubmitting = false;

  ngOnInit(): void {
    const initialCampaignId = this.route.snapshot.queryParamMap.get('campaign');
    this.campaignService
      .getCampaigns()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (campaigns) => {
          this.campaigns = campaigns;
          if (
            initialCampaignId &&
            campaigns.some((campaign) => campaign.id === initialCampaignId)
          ) {
            this.selectedCampaignId = initialCampaignId;
          }
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'Could not load campaigns. Please try again.';
          this.loading = false;
        },
      });
  }

  submitDonation(): void {
    if (
      this.isSubmitting ||
      !this.selectedCampaignId ||
      !Number.isFinite(this.donationAmount) ||
      this.donationAmount <= 0
    ) {
      return;
    }

    const donorId = this.authService.getJwtPayload()?.nameid;
    if (!donorId) {
      this.errorMessage = 'Could not identify your account. Please sign in again to donate.';
      return;
    }

    this.errorMessage = null;
    this.successMessage = null;
    this.isSubmitting = true;
    const request: DonationRequestDto = {
      campanhaId: this.selectedCampaignId,
      doadorId: donorId,
      valor: this.donationAmount,
    };

    this.userService
      .donate(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.successMessage = response.mensagem;
        },
        error: (error: unknown) => {
          this.isSubmitting = false;
          const responseBody = error instanceof HttpErrorResponse ? error.error : null;
          const apiMessage =
            typeof responseBody === 'object' &&
            responseBody !== null &&
            'mensagem' in responseBody &&
            typeof responseBody.mensagem === 'string'
              ? responseBody.mensagem
              : null;
          this.errorMessage = apiMessage ?? 'An error occurred while processing the donation.';
        },
      });
  }
}
