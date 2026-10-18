import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
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

  readonly campaigns = signal<PublicCampaignDto[]>([]);
  readonly selectedCampaignId = signal<string | null>(null);
  readonly donationAmount = signal(0);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly loading = signal(true);
  readonly isSubmitting = signal(false);

  ngOnInit(): void {
    const initialCampaignId = this.route.snapshot.queryParamMap.get('campaign');
    this.campaignService
      .getCampaigns()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (campaigns) => {
          this.campaigns.set(campaigns);
          if (
            initialCampaignId &&
            campaigns.some((campaign) => campaign.id === initialCampaignId)
          ) {
            this.selectedCampaignId.set(initialCampaignId);
          }
          this.loading.set(false);
        },
        error: () => {
          this.errorMessage.set('Could not load campaigns. Please try again.');
          this.loading.set(false);
        },
      });
  }

  submitDonation(): void {
    const isSubmitting = this.isSubmitting();
    const campaignId = this.selectedCampaignId();
    const donationAmount = this.donationAmount();
    if (
      isSubmitting ||
      !campaignId ||
      !Number.isFinite(donationAmount) ||
      donationAmount <= 0
    ) {
      return;
    }

    const donorId = this.authService.getJwtPayload()?.nameid;
    if (!donorId) {
      this.errorMessage.set('Could not identify your account. Please sign in again to donate.');
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isSubmitting.set(true);
    const request: DonationRequestDto = {
      campaignId,
      donorId,
      amount: donationAmount,
    };

    this.userService
      .donate(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          if (!response.enviado) {
            this.errorMessage.set(response.message);
            return;
          }
          this.successMessage.set(response.message);
        },
        error: (error: unknown) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(this.getErrorMessage(error));
        },
      });
  }

  private getErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'An error occurred while processing the donation.';
    }

    const body: unknown = error.error;
    if (typeof body === 'string' && body.trim()) {
      return body;
    }

    if (this.isRecord(body)) {
      for (const key of ['mensagem', 'detail', 'title']) {
        const message = body[key];
        if (typeof message === 'string' && message.trim()) {
          return message;
        }
      }
    }

    return 'An error occurred while processing the donation.';
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
