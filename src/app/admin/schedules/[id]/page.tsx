"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import ScheduleInfoTab from "@/components/admin/schedule/ScheduleInfoTab";
import ScheduleProgramsTab from "@/components/admin/schedule/ScheduleProgramsTab";
import ScheduleParticipantsTab from "@/components/admin/schedule/ScheduleParticipantsTab";
import ScheduleTeamsTab from "@/components/admin/schedule/ScheduleTeamsTab";
import ScheduleFeedbackTab from "@/components/admin/schedule/ScheduleFeedbackTab";

interface Schedule {
  id: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
  description: string | null;
  status: string;
}

const tabs = [
  { key: "info", label: "기본 정보" },
  { key: "programs", label: "프로그램" },
  { key: "participants", label: "참가자" },
  { key: "teams", label: "조 편성" },
  { key: "feedback", label: "피드백" },
];

export default function ScheduleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("info");
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const scheduleId = params.id as string;

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch(`/api/schedules/admin?page=1&limit=100`);
        const result = await res.json();
        if (result.success) {
          const found = result.data.schedules.find((s: { id: string }) => s.id === scheduleId);
          if (found) {
            setSchedule(found);
          } else {
            toast("일정을 찾을 수 없습니다.", "error");
            router.push("/admin/schedules");
          }
        }
      } catch {
        toast("데이터 로딩에 실패했습니다.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchedule();
  }, [scheduleId, router, toast]);

  if (isLoading) {
    return <div className="text-center py-12 text-admin-text-muted">로딩 중...</div>;
  }

  if (!schedule) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-admin-text">{schedule.title}</h1>
        <p className="text-admin-text-muted mt-1">
          {schedule.location} &middot;{" "}
          {new Date(schedule.startDate).toLocaleDateString("ko-KR")} ~{" "}
          {new Date(schedule.endDate).toLocaleDateString("ko-KR")}
        </p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-admin-card-border mb-6">
        <div className="flex gap-0 -mb-px overflow-x-auto" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              id={`tab-${tab.key}`}
              role="tab"
              aria-selected={activeTab === tab.key}
              aria-controls={`panel-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab.key
                  ? "border-admin-accent text-admin-accent"
                  : "border-transparent text-admin-text-muted hover:text-admin-text hover:border-admin-card-border"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
        {activeTab === "info" && <ScheduleInfoTab schedule={schedule} />}
        {activeTab === "programs" && <ScheduleProgramsTab scheduleId={scheduleId} schedule={schedule} />}
        {activeTab === "participants" && <ScheduleParticipantsTab scheduleId={scheduleId} />}
        {activeTab === "teams" && <ScheduleTeamsTab scheduleId={scheduleId} />}
        {activeTab === "feedback" && <ScheduleFeedbackTab scheduleId={scheduleId} />}
      </div>
    </div>
  );
}
