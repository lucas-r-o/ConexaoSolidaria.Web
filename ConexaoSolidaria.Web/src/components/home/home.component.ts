import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  inject,
  computed,
  signal,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PublicCampaignDto } from '../../services/campaigns/public-campaign.dto';
import { CampaignService } from '../../services/campaigns/campaign.service';
import { AuthService, UserRole } from '../../services/auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly campaignService = inject(CampaignService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  readonly campaigns = signal<PublicCampaignDto[]>([]);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly isLoggedIn = signal(this.authService.isLoggedIn());
  readonly isDonor = signal(this.authService.hasRole(UserRole.Donor));
  readonly isOrganizationManager = signal(this.authService.hasRole(UserRole.OrganizationManager));
  readonly accessDenied = signal(false);

  readonly totalRaised = computed(() =>
    this.campaigns().reduce((total, campaign) => total + campaign.valorTotalArrecadado, 0),
  );

  constructor() {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => this.accessDenied.set(params.has('accessDenied')));

    this.campaignService
      .watchCampaigns()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (campaigns) => {
          this.campaigns.set(campaigns);
          this.isLoading.set(false);
          this.hasError.set(false);
        },
        error: () => {
          this.hasError.set(true);
          this.isLoading.set(false);
        },
      });
  }

  progressPercentage(campaign: PublicCampaignDto): number {
    if (!campaign.metaFinanceira) return 0;
    return Math.min(
      100,
      Math.round((campaign.valorTotalArrecadado / campaign.metaFinanceira) * 100),
    );
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn.set(false);
    this.isDonor.set(false);
    this.isOrganizationManager.set(false);
  }
}
