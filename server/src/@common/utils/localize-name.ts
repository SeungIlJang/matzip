const TRANSLATE_TIMEOUT_MS = 4000;

/** 공개 식당/메뉴 이름만 번역한다. 실패해도 등록 흐름을 막지 않는다. */
async function translateName(text: string, target: 'en' | 'ja') {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TRANSLATE_TIMEOUT_MS);
  try {
    const query = new URLSearchParams({ q: text, langpair: `ko|${target}` });
    const response = await fetch(
      `https://api.mymemory.translated.net/get?${query}`,
      { signal: controller.signal },
    );
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      responseStatus?: number;
      responseData?: { translatedText?: string };
    };
    if (payload.responseStatus !== 200) return null;
    const translated = payload.responseData?.translatedText?.trim();
    return translated && translated !== text ? translated : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function localizeName(name: string) {
  const [nameEn, nameJa] = await Promise.all([
    translateName(name, 'en'),
    translateName(name, 'ja'),
  ]);
  return { nameEn, nameJa };
}
