import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';
import { extractHttpErrorMessage } from './http-error-message';

describe('extractHttpErrorMessage', () => {
  it('returns plain-text HTTP error bodies', () => {
    expect(
      extractHttpErrorMessage(new HttpErrorResponse({ status: 400, error: 'Invalid donation' })),
    ).toBe('Invalid donation');
  });

  it('returns the first supported problem-details message', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { detail: 'More specific', title: 'General title' },
    });

    expect(extractHttpErrorMessage(error)).toBe('More specific');
  });

  it('combines validation errors when no top-level message exists', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { errors: { email: ['Invalid email'], password: ['Too short', 'Required'] } },
    });

    expect(extractHttpErrorMessage(error)).toBe('Invalid email Too short Required');
  });

  it('returns null when an error has no usable response message', () => {
    expect(extractHttpErrorMessage(new Error('Network failure'))).toBeNull();
  });
});
