"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { formatCategoryName } from "@/lib/gallery";

interface GalleryCategory {
  id: string;
  year: number;
  half: string;
  _count: { images: number };
}

interface GalleryImage {
  id: string;
  url: string;
  caption: string | null;
  categoryId: string;
  category: { id: string; year: number; half: string };
}

export default function AdminGalleryPage() {
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newYear, setNewYear] = useState(new Date().getFullYear().toString());
  const [newHalf, setNewHalf] = useState<"FIRST" | "SECOND">("SECOND");
  const [uploadCaption, setUploadCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/gallery/categories");
      const result = await res.json();
      if (result.success) setCategories(result.data);
    } catch {
      toast("카테고리 목록을 불러오는데 실패했습니다.", "error");
    }
  }, [toast]);

  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = selectedCategory ? `?categoryId=${selectedCategory}` : "";
      const res = await fetch(`/api/gallery/images${params}`);
      const result = await res.json();
      if (result.success) setImages(result.data);
    } catch {
      toast("이미지를 불러오는데 실패했습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleCreateCategory = async () => {
    if (!newYear.trim()) return;
    setIsCreatingCategory(true);
    try {
      let thumbnailUrl: string | null = null;
      if (thumbnailFile) {
        const formData = new FormData();
        formData.append("files", thumbnailFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadResult = await uploadRes.json();
        if (uploadResult.success && uploadResult.data.length > 0) {
          thumbnailUrl = uploadResult.data[0].url;
        } else {
          toast(uploadResult.error || "썸네일 업로드에 실패했습니다.", "error");
          return;
        }
      }

      const res = await fetch("/api/gallery/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: parseInt(newYear), half: newHalf, thumbnailUrl }),
      });
      const result = await res.json();
      if (result.success) {
        toast("카테고리가 생성되었습니다.", "success");
        setIsCategoryModalOpen(false);
        setThumbnailFile(null);
        if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
        fetchCategories();
      } else {
        toast(result.error || "카테고리 생성에 실패했습니다.", "error");
      }
    } catch {
      toast("카테고리 생성에 실패했습니다.", "error");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleUpload = async () => {
    const files = fileInputRef.current?.files;
    if (!files || files.length === 0) {
      toast("파일을 선택해주세요.", "error");
      return;
    }
    if (!selectedCategory) {
      toast("카테고리를 먼저 선택해주세요.", "error");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("files", file));

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadResult = await uploadRes.json();

      if (!uploadResult.success) {
        toast(uploadResult.error, "error");
        return;
      }

      for (const uploaded of uploadResult.data) {
        await fetch("/api/gallery/images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryId: selectedCategory,
            url: uploaded.url,
            caption: uploadCaption || null,
          }),
        });
      }

      toast(`${uploadResult.data.length}개 이미지가 업로드되었습니다.`, "success");
      setIsUploadModalOpen(false);
      setUploadCaption("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchImages();
      fetchCategories();
    } catch {
      toast("업로드에 실패했습니다.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!confirm("이 이미지를 삭제하시겠습니까?")) return;
    try {
      const res = await fetch("/api/gallery/images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (result.success) {
        toast("이미지가 삭제되었습니다.", "success");
        fetchImages();
        fetchCategories();
      }
    } catch {
      toast("삭제에 실패했습니다.", "error");
    }
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 7 }, (_, i) => currentYear + 3 - i);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-admin-text">갤러리 관리</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsCategoryModalOpen(true)}>
            카테고리 추가
          </Button>
          <Button onClick={() => setIsUploadModalOpen(true)}>
            이미지 업로드
          </Button>
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setSelectedCategory("")}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            selectedCategory === ""
              ? "bg-admin-accent text-white"
              : "bg-admin-bg-light text-admin-text-muted hover:bg-admin-card-border"
          }`}
        >
          전체 ({images.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              selectedCategory === cat.id
                ? "bg-admin-accent text-white"
                : "bg-admin-bg-light text-admin-text-muted hover:bg-admin-card-border"
            }`}
          >
            {formatCategoryName(cat.year, cat.half)} ({cat._count.images})
          </button>
        ))}
      </div>

      {/* 이미지 그리드 */}
      {isLoading ? (
        <div className="text-center py-12 text-admin-text-muted">로딩 중...</div>
      ) : images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-square rounded-xl overflow-hidden border border-admin-card-border bg-admin-table-header"
            >
              <Image
                src={image.url}
                alt={image.caption || "갤러리 이미지"}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                <div className="w-full p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  {image.caption && (
                    <p className="text-white text-sm mb-2 truncate">{image.caption}</p>
                  )}
                  <p className="text-white/70 text-xs mb-2">
                    {formatCategoryName(image.category.year, image.category.half)}
                  </p>
                  <button
                    onClick={() => handleDeleteImage(image.id)}
                    className="text-red-300 hover:text-red-100 text-xs"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-admin-card rounded-xl shadow-sm border border-admin-card-border p-12 text-center">
          <p className="text-admin-text-muted">
            {selectedCategory ? "이 카테고리에 이미지가 없습니다." : "등록된 이미지가 없습니다."}
          </p>
          <p className="text-admin-text-muted text-sm mt-2">이미지 업로드 버튼을 눌러 이미지를 추가하세요.</p>
        </div>
      )}

      {/* 카테고리 생성 모달 */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="카테고리 추가"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-admin-text mb-1">
              년도
            </label>
            <select
              className="w-full px-3 py-2 border border-admin-card-border rounded-lg text-sm bg-admin-card"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}년</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-admin-text mb-1">
              반기
            </label>
            <select
              className="w-full px-3 py-2 border border-admin-card-border rounded-lg text-sm bg-admin-card"
              value={newHalf}
              onChange={(e) => setNewHalf(e.target.value as "FIRST" | "SECOND")}
            >
              <option value="FIRST">상반기</option>
              <option value="SECOND">하반기</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-admin-text mb-1">
              썸네일 이미지 (선택)
            </label>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-admin-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-admin-accent file:text-white hover:file:bg-admin-accent-light"
            />
            <p className="text-xs text-admin-text-muted mt-1">미설정 시 첫 번째 이미지가 썸네일로 사용됩니다.</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleCreateCategory} disabled={isCreatingCategory}>
              {isCreatingCategory ? "생성 중..." : "생성"}
            </Button>
            <Button variant="secondary" onClick={() => setIsCategoryModalOpen(false)}>
              취소
            </Button>
          </div>
        </div>
      </Modal>

      {/* 이미지 업로드 모달 */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="이미지 업로드"
      >
        <div className="space-y-4">
          {categories.length === 0 ? (
            <p className="text-admin-text-muted text-sm">먼저 카테고리를 생성해주세요.</p>
          ) : (
            <>
              {!selectedCategory && (
                <div>
                  <label className="block text-sm font-medium text-admin-text mb-1">
                    카테고리 선택
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-admin-card-border rounded-lg text-sm bg-admin-card"
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    value={selectedCategory}
                  >
                    <option value="">카테고리 선택</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {formatCategoryName(cat.year, cat.half)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-admin-text mb-1">
                  이미지 파일 (최대 5MB, 복수 선택 가능)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="w-full text-sm text-admin-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-admin-accent file:text-white hover:file:bg-admin-accent-light"
                />
              </div>
              <Input
                label="설명 (선택)"
                id="caption"
                placeholder="이미지 설명"
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
              />
              <div className="flex gap-3">
                <Button onClick={handleUpload} disabled={isUploading}>
                  {isUploading ? "업로드 중..." : "업로드"}
                </Button>
                <Button variant="secondary" onClick={() => setIsUploadModalOpen(false)}>
                  취소
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
