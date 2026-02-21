import { prisma } from "@/lib/prisma";

interface LogActionParams {
  adminId?: string;
  adminName?: string;
  action: string;
  target: string;
  targetId?: string;
  detail?: string;
}

/**
 * 활동 로그 기록 (비동기, 실패해도 비즈니스 로직 중단 안 함)
 */
export async function logAction({
  adminId,
  adminName,
  action,
  target,
  targetId,
  detail,
}: LogActionParams) {
  try {
    await prisma.auditLog.create({
      data: { adminId, adminName, action, target, targetId, detail },
    });
  } catch (error) {
    console.error("활동 로그 저장 오류:", error);
  }
}

/**
 * 상태 변경 이력 기록
 */
export async function logStatusChange({
  targetType,
  targetId,
  fromStatus,
  toStatus,
  changedBy,
  note,
}: {
  targetType: string;
  targetId: string;
  fromStatus?: string;
  toStatus: string;
  changedBy?: string;
  note?: string;
}) {
  try {
    await prisma.statusHistory.create({
      data: { targetType, targetId, fromStatus, toStatus, changedBy, note },
    });
  } catch (error) {
    console.error("상태 이력 저장 오류:", error);
  }
}
