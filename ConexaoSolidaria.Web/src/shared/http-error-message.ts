import { HttpErrorResponse } from '@angular/common/http';

const MESSAGE_KEYS = ['detail', 'title', 'message', 'mensagem'];

export function extractHttpErrorMessage(
  error: unknown,
  messageKeys: readonly string[] = MESSAGE_KEYS,
): string | null {
  const body = getErrorBody(error);
  if (typeof body === 'string') {
    return body.trim() ? body : null;
  }

  if (!isRecord(body)) {
    return null;
  }

  for (const key of messageKeys) {
    const message = body[key];
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  const errors = body['errors'];
  if (!isRecord(errors)) {
    return null;
  }

  const messages = Object.values(errors)
    .flatMap((value) => (Array.isArray(value) ? value : []))
    .filter((value): value is string => typeof value === 'string');

  return messages.length > 0 ? messages.join(' ') : null;
}

function getErrorBody(error: unknown): unknown {
  if (error instanceof HttpErrorResponse) {
    return error.error;
  }

  return isRecord(error) ? error['error'] : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
