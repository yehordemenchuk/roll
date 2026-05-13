import { t } from '../i18n/sk';

function te(key: string): string {
  return t(key);
}

function hintFromBackendPath(pathClean: string): string | null {
  if (!pathClean) return null;
  const p = pathClean.toLowerCase();
  if (p.includes('/ratings')) return te('errors.ratingHint');
  if (p.includes('/comments')) return te('errors.commentHint');
  if (p.includes('/scores')) return te('errors.scoreHint');
  if (p.includes('/users')) return te('errors.registerHint');
  if (p.includes('/auth/login') || p.endsWith('/auth/login')) return te('errors.loginHint');
  if (p.includes('/auth/')) return te('errors.authHint');
  return null;
}

function isBoilerplateMessage(msg: string): boolean {
  return msg.trim().toLowerCase() === 'invalid argument error';
}

function formatFieldLabel(field: string): string {
  if (!field) return te('errors.fieldLabel');
  return field.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim();
}

export function getErrorMessageFromResponse(bodyText: string | null | undefined, httpStatus: number): string {
  const statusNum = typeof httpStatus === 'number' ? httpStatus : Number(httpStatus);
  const genericTryAgain =
    Number.isFinite(statusNum) && statusNum >= 500
      ? te('errors.genericTryAgainServer')
      : te('errors.genericTryAgain');

  if (bodyText == null || String(bodyText).trim() === '') {
    return genericTryAgain;
  }

  const raw = String(bodyText).trim();

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return raw.length > 600 ? `${raw.slice(0, 600)}…` : raw;
  }

  if (!data || typeof data !== 'object' || data === null) {
    return genericTryAgain;
  }

  const d = data as Record<string, unknown>;

  const pathRaw = typeof d.path === 'string' ? d.path : '';
  const pathClean = pathRaw.replace(/^uri=/, '');

  const detailEntries =
    d.details && typeof d.details === 'object' && d.details !== null
      ? Object.entries(d.details as Record<string, unknown>).filter(
          ([, v]) => v != null && String(v).trim() !== '',
        )
      : [];

  const detailSentence = detailEntries.map(([k, v]) => `${formatFieldLabel(k)}: ${v}`).join(' ');

  let primary =
    typeof d.message === 'string' && d.message.trim() !== '' ? (d.message as string).trim() : '';

  if (primary && isBoilerplateMessage(primary)) {
    primary = '';
  }

  if (detailSentence) {
    if (primary) {
      return `${primary} ${detailSentence}`.trim();
    }
    return `${te('errors.adjustInputPrefix')} ${detailSentence}`;
  }

  if (primary) {
    return primary;
  }

  const statusName = typeof d.status === 'string' ? d.status : '';

  if (statusName === 'BAD_REQUEST') {
    return hintFromBackendPath(pathClean) ?? te('errors.badRequestGeneric');
  }
  if (statusName === 'NOT_FOUND') {
    return te('errors.notFound');
  }
  if (statusName === 'INTERNAL_SERVER_ERROR') {
    return te('errors.internalServer');
  }

  if (statusName === 'UNAUTHORIZED' || statusNum === 401) {
    return te('errors.unauthorized');
  }
  if (statusNum === 403) {
    return te('errors.forbidden');
  }

  const contextual = hintFromBackendPath(pathClean);
  if (contextual) return contextual;

  return genericTryAgain;
}
