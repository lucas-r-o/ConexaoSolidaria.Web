import '@angular/compiler';
import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { DonationRequestDto } from './donation.dto';
import { RegistrationRequestDto } from './registration.dto';
import { UserService } from './user.service';

describe('UserService', () => {
  let userService: UserService;
  let httpPost: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    httpPost = vi.fn().mockReturnValue(of(null));
    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: HttpClient, useValue: { post: httpPost } },
        {
          provide: AuthService,
          useValue: { getAuthorizationHeader: () => ({ Authorization: 'Bearer test-token' }) },
        },
      ],
    });
    userService = TestBed.inject(UserService);
  });

  it('sends registration fields using the API contract', async () => {
    const request: RegistrationRequestDto = {
      name: 'Test User',
      email: 'test@example.com',
      taxId: '52998224725',
      passwordHash: 'Example-password1!',
    };
    httpPost.mockReturnValue(of('Usuário cadastrado com sucesso'));

    await expect(firstValueFrom(userService.register(request))).resolves.toBe(
      'Usuário cadastrado com sucesso',
    );

    expect(httpPost).toHaveBeenCalledWith(`${environment.apiUrl}/doacao`, request, {
      responseType: 'text',
    });
  });

  it('sends manager creation with authorization and without a client-supplied role', async () => {
    const request: RegistrationRequestDto = {
      name: 'Manager User',
      email: 'manager@example.com',
      taxId: '52998224725',
      passwordHash: 'Example-password1!',
    };
    httpPost.mockReturnValue(of('Usuário cadastrado com sucesso'));

    await expect(firstValueFrom(userService.createManager(request))).resolves.toBe(
      'Usuário cadastrado com sucesso',
    );

    expect(httpPost).toHaveBeenCalledWith(`${environment.apiUrl}/usuarios/gestores`, request, {
      headers: expect.objectContaining({ Authorization: expect.any(String) }),
      responseType: 'text',
    });
  });

  it('sends donation fields using the API contract with authorization', async () => {
    const donation: DonationRequestDto = {
      campaignId: 'campaign-id',
      donorId: 'donor-id',
      amount: 0.01,
    };

    await firstValueFrom(userService.donate(donation));

    expect(httpPost).toHaveBeenCalledWith(`${environment.apiUrl}/usuarios/doar`, donation, {
      headers: { Authorization: 'Bearer test-token' },
    });
  });
});
