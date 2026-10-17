import '@angular/compiler';
import { FormControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { brazilianTaxIdValidator } from './registration.component';

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
