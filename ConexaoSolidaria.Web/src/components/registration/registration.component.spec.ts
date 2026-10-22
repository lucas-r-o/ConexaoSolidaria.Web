import '@angular/compiler';
import { FormControl } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { RegistrationComponent, brazilianTaxIdValidator } from './registration.component';
import { UserService } from '../../services/users/user.service';

describe('Brazilian tax ID validator', () => {
  it('accepts valid values with and without formatting', () => {
    expect(brazilianTaxIdValidator(new FormControl('529.982.247-25'))).toBeNull();
    expect(brazilianTaxIdValidator(new FormControl('52998224725'))).toBeNull();
  });

  it('rejects repeated and incorrect check digits', () => {
    expect(brazilianTaxIdValidator(new FormControl('111.111.111-11'))).toEqual({
      taxIdInvalid: true,
    });
    expect(brazilianTaxIdValidator(new FormControl('529.982.247-26'))).toEqual({
      taxIdInvalid: true,
    });
  });
});

describe('RegistrationComponent', () => {
  it('displays the success message returned by the API', async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationComponent, RouterModule.forRoot([])],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { data: {} } } },
        {
          provide: UserService,
          useValue: { register: vi.fn(() => of('Usuário cadastrado com sucesso')) },
        },
      ],
    }).compileComponents();

    const fixture: ComponentFixture<RegistrationComponent> =
      TestBed.createComponent(RegistrationComponent);
    const component = fixture.componentInstance;
    component.registrationForm.setValue({
      fullName: 'Test User',
      email: 'test@example.com',
      taxId: '52998224725',
      password: 'Example-password1!',
    });
    component.register();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain(
      'Usuário cadastrado com sucesso',
    );
  });

  it('uses the manager-only API when creating an organization manager', async () => {
    const createManager = vi.fn(() => of('Gestor cadastrado com sucesso'));
    const register = vi.fn(() => of('Usuário cadastrado com sucesso'));
    await TestBed.configureTestingModule({
      imports: [RegistrationComponent, RouterModule.forRoot([])],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { data: { managerCreation: true } } } },
        {
          provide: UserService,
          useValue: { register, createManager },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(RegistrationComponent);
    const component = fixture.componentInstance;
    component.registrationForm.setValue({
      fullName: 'Manager User',
      email: 'manager@example.com',
      taxId: '52998224725',
      password: 'Example-password1!',
    });
    component.register();
    fixture.detectChanges();

    expect(createManager).toHaveBeenCalledWith({
      name: 'Manager User',
      email: 'manager@example.com',
      taxId: '52998224725',
      passwordHash: 'Example-password1!',
    });
    expect(register).not.toHaveBeenCalled();
  });
});
