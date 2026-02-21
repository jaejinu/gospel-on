"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { siteSettingsSchema, type SiteSettingsFormData } from "@/lib/validations";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const SETTING_LABELS: Record<string, string> = {
  contact_email: "연락처 이메일",
  contact_phone: "연락처 전화번호",
  address: "주소",
  account_info: "계좌 정보",
  site_description: "사이트 설명",
  hero_title: "히어로 제목",
  hero_subtitle: "히어로 부제목",
};

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<SiteSettingsFormData>({
    resolver: zodResolver(siteSettingsSchema),
  });

  useEffect(() => {
    fetch("/api/site-settings")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          reset(result.data);
        }
      })
      .catch(() => toast("설정을 불러오는데 실패했습니다.", "error"))
      .finally(() => setIsLoading(false));
  }, [reset, toast]);

  const onSubmit = async (data: SiteSettingsFormData) => {
    setIsSaving(true);
    try {
      const settings = Object.entries(data)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => ({ key, value: value || "" }));

      const res = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const result = await res.json();

      if (result.success) {
        toast("설정이 저장되었습니다.", "success");
      } else {
        toast(result.error, "error");
      }
    } catch {
      toast("저장에 실패했습니다.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-admin-text mb-6">사이트 설정</h1>
        <div className="bg-admin-card rounded-xl p-8 text-center text-admin-text-muted">로딩 중...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-admin-text mb-6">사이트 설정</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 히어로 섹션 */}
        <div className="bg-admin-card rounded-xl shadow-sm border border-admin-card-border p-6">
          <h2 className="text-lg font-semibold text-admin-text mb-4">히어로 배너</h2>
          <div className="space-y-4">
            <Input label={SETTING_LABELS.hero_title} id="hero_title" placeholder="복음온" {...register("hero_title")} />
            <Input label={SETTING_LABELS.hero_subtitle} id="hero_subtitle" placeholder="엘림교회에서 진행하는 복음으로 하나 되는 수련회" {...register("hero_subtitle")} />
          </div>
        </div>

        {/* 연락처 정보 */}
        <div className="bg-admin-card rounded-xl shadow-sm border border-admin-card-border p-6">
          <h2 className="text-lg font-semibold text-admin-text mb-4">연락처 정보</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label={SETTING_LABELS.contact_email} id="contact_email" placeholder="info@gospelon.org" {...register("contact_email")} />
              <Input label={SETTING_LABELS.contact_phone} id="contact_phone" placeholder="010-0000-0000" {...register("contact_phone")} />
            </div>
            <Input label={SETTING_LABELS.address} id="address" placeholder="서울시..." {...register("address")} />
            <Input label={SETTING_LABELS.account_info} id="account_info" placeholder="국민은행 000-000-000000 (복음온)" {...register("account_info")} />
          </div>
        </div>

        {/* 사이트 정보 */}
        <div className="bg-admin-card rounded-xl shadow-sm border border-admin-card-border p-6">
          <h2 className="text-lg font-semibold text-admin-text mb-4">사이트 정보</h2>
          <Textarea
            label={SETTING_LABELS.site_description}
            id="site_description"
            rows={4}
            placeholder="사이트에 대한 설명을 입력하세요"
            {...register("site_description")}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "저장 중..." : "설정 저장"}
          </Button>
        </div>
      </form>
    </div>
  );
}
