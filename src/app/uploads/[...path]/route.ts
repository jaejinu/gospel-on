import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

// standalone 서버는 시작 시점의 public/ 스냅샷만 정적 서빙하므로,
// 런타임에 업로드된 파일은 이 라우트가 대신 서빙한다.
const UPLOAD_DIR = path.join(process.cwd(), "public/uploads");

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  const filePath = path.join(UPLOAD_DIR, ...segments);
  // 경로 탈출 방지
  if (!path.resolve(filePath).startsWith(path.resolve(UPLOAD_DIR) + path.sep)) {
    return new NextResponse(null, { status: 400 });
  }

  const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()];
  if (!contentType) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const file = await readFile(filePath);
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
