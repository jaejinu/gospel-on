// CSV 유틸리티 — UTF-8 BOM + 셀 이스케이프

/**
 * CSV 문자열 생성
 */
export function generateCSV(
  headers: string[],
  rows: string[][]
): string {
  const escapeCell = (cell: string) => {
    if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
      return `"${cell.replace(/"/g, '""')}"`;
    }
    return cell;
  };

  const headerLine = headers.map(escapeCell).join(",");
  const bodyLines = rows.map((row) => row.map(escapeCell).join(","));

  // UTF-8 BOM으로 한글 깨짐 방지
  return "\uFEFF" + [headerLine, ...bodyLines].join("\r\n");
}

/**
 * CSV 다운로드용 Response 생성
 */
export function csvResponse(csv: string, filename: string): Response {
  const encoded = encodeURIComponent(filename);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${encoded}"; filename*=UTF-8''${encoded}`,
    },
  });
}
