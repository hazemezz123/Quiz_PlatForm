const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/

export function isArabic(text: string): boolean {
  return ARABIC_REGEX.test(text)
}

export function rtlStyle(text: string): { dir?: 'rtl'; textAlign?: 'right' } {
  if (isArabic(text)) {
    return { dir: 'rtl', textAlign: 'right' }
  }
  return {}
}

export function rtlDir(text: string): 'rtl' | 'ltr' {
  return isArabic(text) ? 'rtl' : 'ltr'
}