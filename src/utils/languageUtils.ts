const importLocales = import.meta.glob('../locales/*.json', { eager: true });

export function getAvailableLanguages(): { [key: string]: string } {  
  const languageCodes = Object.keys(importLocales).map(path => {
    const matches = path.match(/\/locales\/([^/]+)\.json$/);
    return matches ? matches[1] : null;
  }).filter(Boolean) as string[];
  
  const nativeNames = new Intl.DisplayNames(['en'], { type: 'language' });
  
  return languageCodes.reduce((acc, code) => ({
    ...acc,
    [code]: nativeNames.of(code) || code
  }), {});
}