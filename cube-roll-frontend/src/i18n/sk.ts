/** Slovenské texty (iba SK, bez prepínača jazyka). */
const SK: Record<string, string> = {
  'nav.home': 'Domov',
  'nav.game': 'Hra',
  'nav.leaderboard': 'Rebríček',
  'nav.signIn': 'Prihlásiť sa',
  'nav.register': 'Registrácia',
  'nav.signOut': 'Odhlásiť sa',

  'login.title': 'Prihlásenie',
  'login.subtitle': 'Použite e-mail a heslo z účtu GameStudio.',
  'login.email': 'E-mail',
  'login.password': 'Heslo',
  'login.submit': 'Prihlásiť sa',
  'login.loading': 'Prihlasujem…',
  'login.failed': 'Prihlásenie zlyhalo',
  'login.noAccount': 'Nemáte účet?',
  'login.registerLink': 'Registrácia',
  'login.registeredOk': 'Účet bol vytvorený. Teraz sa prihláste.',

  'register.title': 'Registrácia',
  'register.username': 'Používateľské meno',
  'register.email': 'E-mail',
  'register.password': 'Heslo',
  'register.passwordAgain': 'Heslo znova',
  'register.submit': 'Vytvoriť účet',
  'register.loading': 'Odosielam…',
  'register.hasAccount': 'Už máte účet?',
  'register.signInLink': 'Prihlásiť sa',
  'register.failed': 'Registrácia zlyhala',
  'register.passwordMismatch': 'Heslá sa nezhodujú.',
  'register.passwordShort': 'Heslo je príliš krátke.',

  'session.title': 'Relácia vypršala',
  'session.text': 'Obnovenie tokenu zlyhalo. Prihláste sa znova.',
  'session.submit': 'Prihlásiť sa znova',
  'session.goLogin': 'Ísť na prihlásenie',

  'auth.missingTokens': 'Neplatná odpoveď prihlásenia: chýbajú tokeny.',

  'errors.ratingHint':
    'Hodnotenie sa nepodarilo uložiť. Skontroluj, či je celé číslo od 0 do 5, a skús to znova.',
  'errors.commentHint': 'Komentár sa nepodarilo odoslať. Skontroluj text a skús to znova.',
  'errors.scoreHint': 'Skóre sa nepodarilo uložiť. Skús to znova.',
  'errors.registerHint': 'Registráciu sa nepodarilo dokončiť. Skontroluj všetky polia a skús to znova.',
  'errors.loginHint': 'Prihlásenie neprešlo. Skontroluj e-mail a heslo.',
  'errors.authHint': 'Niečo sa pokazilo so reláciou. Skús sa prihlásiť znova.',
  'errors.badRequestGeneric': 'Údaje nevyzerajú správne. Skontroluj vstup a skús to znova.',
  'errors.notFound': 'Požadovanú položku sme nenašli.',
  'errors.internalServer': 'Na serveri sa niečo pokazilo. Skús to neskôr.',
  'errors.unauthorized': 'Nie si prihlásený alebo relácia vypršala.',
  'errors.forbidden': 'Na túto akciu nemáš oprávnenie.',
  'errors.adjustInputPrefix': 'Uprav prosím vstup:',
  'errors.genericTryAgain': 'Niečo sa pokazilo. Skús to znova.',
  'errors.genericTryAgainServer': 'Na serveri sa niečo pokazilo. Skús to o chvíľu znova.',
  'errors.fieldLabel': 'Pole',
};

export function t(key: string): string {
  return SK[key] ?? key;
}
