// 갤러리 카테고리 포맷 유틸리티

/**
 * 년도 + 반기를 "26년도 하반기" 형태로 변환
 */
export function formatCategoryName(year: number, half: string): string {
  const shortYear = year % 100;
  const halfLabel = half === "FIRST" ? "상반기" : "하반기";
  return `${shortYear}년도 ${halfLabel}`;
}

/**
 * 반기 한글 라벨
 */
export function getHalfLabel(half: string): string {
  return half === "FIRST" ? "상반기" : "하반기";
}
