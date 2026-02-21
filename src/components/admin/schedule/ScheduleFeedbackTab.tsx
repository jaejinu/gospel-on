"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { feedbackSchema, type FeedbackFormData } from "@/lib/validations";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

interface Feedback {
  id: string;
  participantName: string;
  content: string;
  rating: number;
  isPublic: boolean;
  type: string;
  createdAt: string;
}

interface Props {
  scheduleId: string;
}

export default function ScheduleFeedbackTab({ scheduleId }: Props) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
  });

  const fetchFeedbacks = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.set("type", typeFilter);
      const res = await fetch(`/api/schedules/${scheduleId}/feedback?${params}`);
      const result = await res.json();
      if (result.success) setFeedbacks(result.data);
    } catch {
      toast("피드백 로딩 실패", "error");
    } finally {
      setIsLoading(false);
    }
  }, [scheduleId, typeFilter, toast]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const openCreateModal = () => {
    reset({ participantName: "", content: "", rating: "", isPublic: false, type: "admin" });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/schedules/${scheduleId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          rating: Number(data.rating),
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast("피드백이 등록되었습니다.", "success");
        setIsModalOpen(false);
        fetchFeedbacks();
      } else {
        toast(result.error, "error");
      }
    } catch {
      toast("등록에 실패했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 피드백을 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/schedules/${scheduleId}/feedback/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        toast("피드백이 삭제되었습니다.", "success");
        fetchFeedbacks();
      }
    } catch {
      toast("삭제에 실패했습니다.", "error");
    }
  };

  const handleTogglePublic = async (feedback: Feedback) => {
    try {
      const res = await fetch(`/api/schedules/${scheduleId}/feedback/${feedback.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantName: feedback.participantName,
          content: feedback.content,
          rating: feedback.rating,
          isPublic: !feedback.isPublic,
          type: feedback.type,
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast(feedback.isPublic ? "비공개로 변경되었습니다." : "공개로 변경되었습니다.", "success");
        fetchFeedbacks();
      }
    } catch {
      toast("변경에 실패했습니다.", "error");
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? "text-admin-accent" : "text-admin-card-border"}>
        ★
      </span>
    ));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-admin-text">피드백 / 후기</h2>
        <Button onClick={openCreateModal}>피드백 작성</Button>
      </div>

      {/* 필터 */}
      <div className="flex gap-2 mb-4">
        {[
          { value: "", label: "전체" },
          { value: "admin", label: "관리자" },
          { value: "participant", label: "참가자" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setTypeFilter(opt.value)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              typeFilter === opt.value
                ? "bg-admin-accent text-white"
                : "bg-admin-bg-light text-admin-text-muted hover:bg-admin-card-border"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-admin-text-muted">로딩 중...</div>
      ) : feedbacks.length > 0 ? (
        <div className="space-y-3">
          {feedbacks.map((f) => (
            <div
              key={f.id}
              className="bg-admin-card rounded-xl border border-admin-card-border p-5"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-admin-text">{f.participantName}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      f.type === "admin"
                        ? "bg-admin-accent/10 text-admin-accent"
                        : "bg-blue-50 text-blue-600"
                    }`}>
                      {f.type === "admin" ? "관리자" : "참가자"}
                    </span>
                    <button
                      onClick={() => handleTogglePublic(f)}
                      className={`text-xs px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                        f.isPublic
                          ? "bg-green-50 text-green-600 hover:bg-green-100"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {f.isPublic ? "공개" : "비공개"}
                    </button>
                  </div>
                  <div className="text-sm mt-0.5">{renderStars(f.rating)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-admin-text-muted">
                    {new Date(f.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(f.id)}>삭제</Button>
                </div>
              </div>
              <p className="text-sm text-admin-text leading-relaxed">{f.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-admin-card rounded-xl border border-admin-card-border p-12 text-center text-admin-text-muted">
          등록된 피드백이 없습니다.
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="피드백 작성">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="작성자명 *" id="fb-name" error={errors.participantName?.message} {...register("participantName")} />
          <Select
            label="유형"
            id="fb-type"
            options={[
              { value: "admin", label: "관리자" },
              { value: "participant", label: "참가자" },
            ]}
            {...register("type")}
          />
          <Select
            label="평점 *"
            id="fb-rating"
            error={errors.rating?.message}
            options={[
              { value: "5", label: "★★★★★ (5점)" },
              { value: "4", label: "★★★★☆ (4점)" },
              { value: "3", label: "★★★☆☆ (3점)" },
              { value: "2", label: "★★☆☆☆ (2점)" },
              { value: "1", label: "★☆☆☆☆ (1점)" },
            ]}
            {...register("rating")}
          />
          <Textarea label="내용 *" id="fb-content" error={errors.content?.message} {...register("content")} />
          <label className="flex items-center gap-2 text-sm text-admin-text">
            <input type="checkbox" {...register("isPublic")} className="rounded border-admin-card-border" />
            공개 여부
          </label>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "등록 중..." : "등록"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>취소</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
