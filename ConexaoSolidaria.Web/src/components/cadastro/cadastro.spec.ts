import '@angular/compiler';
import { FormControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { cpfValidator } from './cadastro';

describe('Cadastro', () => {
  it('accepts valid CPF values with and without formatting', () => {
    expect(cpfValidator(new FormControl('529.982.247-25'))).toBeNull();
    expect(cpfValidator(new FormControl('52998224725'))).toBeNull();
  });

  it('rejects repeated and incorrect CPF digits', () => {
    expect(cpfValidator(new FormControl('111.111.111-11'))).toEqual({ cpfInvalid: true });
    expect(cpfValidator(new FormControl('529.982.247-26'))).toEqual({ cpfInvalid: true });
  });
});
