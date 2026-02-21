"use client";

import { useState, useEffect, useCallback } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

interface TeamMember {
  id: string;
  name: string;
  church: string | null;
  gender: string | null;
}

interface Team {
  id: string;
  name: string;
  leaderId: string | null;
  leader: { id: string; name: string } | null;
  members: TeamMember[];
}

interface UnassignedParticipant {
  id: string;
  name: string;
  church: string | null;
  gender: string | null;
}

interface Props {
  scheduleId: string;
}

export default function ScheduleTeamsTab({ scheduleId }: Props) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [unassigned, setUnassigned] = useState<UnassignedParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assigningTeamId, setAssigningTeamId] = useState<string | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [teamsRes, partRes] = await Promise.all([
        fetch(`/api/schedules/${scheduleId}/teams`),
        fetch(`/api/schedules/${scheduleId}/participants?limit=500`),
      ]);
      const teamsResult = await teamsRes.json();
      const partResult = await partRes.json();

      if (teamsResult.success) setTeams(teamsResult.data);
      if (partResult.success) {
        const allParticipants = partResult.data.participants;
        const assignedIds = new Set(
          teamsResult.data.flatMap((t: Team) => t.members.map((m: TeamMember) => m.id))
        );
        setUnassigned(allParticipants.filter((p: UnassignedParticipant) => !assignedIds.has(p.id)));
      }
    } catch {
      toast("데이터 로딩 실패", "error");
    } finally {
      setIsLoading(false);
    }
  }, [scheduleId, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/schedules/${scheduleId}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTeamName.trim() }),
      });
      const result = await res.json();
      if (result.success) {
        toast("조가 생성되었습니다.", "success");
        setIsCreateOpen(false);
        setNewTeamName("");
        fetchData();
      } else {
        toast(result.error, "error");
      }
    } catch {
      toast("조 생성에 실패했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTeam = async (teamId: string, name: string) => {
    if (!confirm(`'${name}' 조를 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/schedules/${scheduleId}/teams/${teamId}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        toast("조가 삭제되었습니다.", "success");
        fetchData();
      } else {
        toast(result.error, "error");
      }
    } catch {
      toast("삭제에 실패했습니다.", "error");
    }
  };

  const handleSetLeader = async (teamId: string, leaderId: string) => {
    try {
      const res = await fetch(`/api/schedules/${scheduleId}/teams/${teamId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teams.find((t) => t.id === teamId)?.name,
          leaderId,
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast("조장이 지정되었습니다.", "success");
        fetchData();
      }
    } catch {
      toast("조장 지정 실패", "error");
    }
  };

  const openAssignModal = (teamId: string) => {
    setAssigningTeamId(teamId);
    setSelectedParticipants([]);
  };

  const handleAssign = async () => {
    if (!assigningTeamId || selectedParticipants.length === 0) return;
    try {
      const team = teams.find((t) => t.id === assigningTeamId);
      const existingMemberIds = team?.members.map((m) => m.id) || [];
      const allIds = [...existingMemberIds, ...selectedParticipants];

      const res = await fetch(`/api/schedules/${scheduleId}/teams/${assigningTeamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantIds: allIds }),
      });
      const result = await res.json();
      if (result.success) {
        toast("멤버가 배정되었습니다.", "success");
        setAssigningTeamId(null);
        fetchData();
      }
    } catch {
      toast("배정에 실패했습니다.", "error");
    }
  };

  const handleRemoveMember = async (teamId: string, memberId: string) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;
    const newIds = team.members.filter((m) => m.id !== memberId).map((m) => m.id);

    try {
      const res = await fetch(`/api/schedules/${scheduleId}/teams/${teamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantIds: newIds }),
      });
      const result = await res.json();
      if (result.success) {
        toast("멤버가 해제되었습니다.", "success");
        fetchData();
      }
    } catch {
      toast("해제에 실패했습니다.", "error");
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-admin-text-muted">로딩 중...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-admin-text">조 편성</h2>
        <Button onClick={() => setIsCreateOpen(true)}>조 추가</Button>
      </div>

      {/* 미배정 참가자 */}
      {unassigned.length > 0 && (
        <div className="bg-admin-bg-light rounded-xl border border-admin-card-border p-4 mb-6">
          <h3 className="text-sm font-medium text-admin-text-muted mb-3">
            미배정 참가자 ({unassigned.length}명)
          </h3>
          <div className="flex flex-wrap gap-2">
            {unassigned.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-admin-card rounded-lg border border-admin-card-border text-xs text-admin-text"
              >
                {p.name}
                {p.church && <span className="text-admin-text-muted">({p.church})</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 조 카드 목록 */}
      {teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team) => (
            <div key={team.id} className="bg-admin-card rounded-xl border border-admin-card-border p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-admin-text">{team.name}</h3>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openAssignModal(team.id)}>배정</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteTeam(team.id, team.name)}>삭제</Button>
                </div>
              </div>
              {team.leader && (
                <div className="text-xs text-admin-accent mb-2">
                  조장: {team.leader.name}
                </div>
              )}
              <div className="space-y-1.5">
                {team.members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-admin-bg-light">
                    <span className="text-admin-text">
                      {m.name}
                      {m.church && <span className="text-admin-text-muted text-xs ml-1">({m.church})</span>}
                      {team.leaderId === m.id && (
                        <span className="ml-1 text-xs text-admin-accent font-medium">조장</span>
                      )}
                    </span>
                    <div className="flex gap-1">
                      {team.leaderId !== m.id && (
                        <button
                          onClick={() => handleSetLeader(team.id, m.id)}
                          className="text-xs text-admin-accent hover:text-admin-accent-dark"
                        >
                          조장지정
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveMember(team.id, m.id)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        해제
                      </button>
                    </div>
                  </div>
                ))}
                {team.members.length === 0 && (
                  <p className="text-sm text-admin-text-muted py-2">배정된 멤버가 없습니다.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-admin-card rounded-xl border border-admin-card-border p-12 text-center text-admin-text-muted">
          생성된 조가 없습니다.
        </div>
      )}

      {/* 조 생성 모달 */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="조 추가">
        <div className="space-y-4">
          <Input
            label="조 이름 *"
            id="team-name"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="예: 1조, 믿음조"
          />
          <div className="flex gap-3">
            <Button onClick={handleCreateTeam} disabled={isSubmitting || !newTeamName.trim()}>
              {isSubmitting ? "생성 중..." : "생성"}
            </Button>
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>취소</Button>
          </div>
        </div>
      </Modal>

      {/* 멤버 배정 모달 */}
      <Modal
        isOpen={!!assigningTeamId}
        onClose={() => setAssigningTeamId(null)}
        title="멤버 배정"
      >
        <div className="space-y-4">
          {unassigned.length > 0 ? (
            <>
              <p className="text-sm text-admin-text-muted">배정할 참가자를 선택해주세요.</p>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {unassigned.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-2 px-3 py-2 rounded hover:bg-admin-bg-light cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedParticipants.includes(p.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedParticipants([...selectedParticipants, p.id]);
                        } else {
                          setSelectedParticipants(selectedParticipants.filter((id) => id !== p.id));
                        }
                      }}
                      className="rounded border-admin-card-border"
                    />
                    <span className="text-sm text-admin-text">{p.name}</span>
                    {p.church && <span className="text-xs text-admin-text-muted">({p.church})</span>}
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <Button onClick={handleAssign} disabled={selectedParticipants.length === 0}>
                  배정 ({selectedParticipants.length}명)
                </Button>
                <Button variant="secondary" onClick={() => setAssigningTeamId(null)}>취소</Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-admin-text-muted py-4">미배정 참가자가 없습니다.</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
