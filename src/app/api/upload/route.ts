import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// 허용 파일 확장자
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: "인증 필요" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: "파일을 선택해주세요." },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadDir, { recursive: true });

    const uploaded: { url: string; filename: string }[] = [];

    for (const file of files) {
      // 파일 타입 검증
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: `허용되지 않는 파일 형식입니다: ${file.name}` },
          { status: 400 }
        );
      }

      // 파일 크기 검증
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { success: false, error: `파일이 너무 큽니다 (최대 5MB): ${file.name}` },
          { status: 400 }
        );
      }

      // 고유 파일명 생성
      const ext = path.extname(file.name);
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
      const filePath = path.join(uploadDir, uniqueName);

      // 파일 저장
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);

      uploaded.push({
        url: `/uploads/${uniqueName}`,
        filename: file.name,
      });
    }

    return NextResponse.json({ success: true, data: uploaded }, { status: 201 });
  } catch (error) {
    console.error("파일 업로드 오류:", error);
    return NextResponse.json(
      { success: false, error: "파일 업로드에 실패했습니다." },
      { status: 500 }
    );
  }
}
