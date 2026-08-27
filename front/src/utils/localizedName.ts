interface LocalizedName {
  name: string;
  nameEn?: string | null;
  nameJa?: string | null;
}

/** 일본 선택 시 일본어, 그 외 국가는 영어를 한국어 이름 뒤에 표시한다. */
function formatLocalizedName(item: LocalizedName, country?: string | null) {
  const translated = country === 'JP' ? item.nameJa : item.nameEn;
  if (!translated || translated.trim() === item.name.trim()) {
    return item.name;
  }
  return `${item.name} (${translated.trim()})`;
}

export default formatLocalizedName;
