import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

// SMTP 트랜스포터 (환경변수 미설정 시 null)
function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

interface SendNotificationParams {
  type: string;
  recipientEmail: string;
  subject: string;
  content: string;
}

/**
 * 이메일 발송 + Notification 로그 저장
 * 발송 실패해도 비즈니스 로직 중단하지 않음
 */
export async function sendNotification({
  type,
  recipientEmail,
  subject,
  content,
}: SendNotificationParams) {
  try {
    const transporter = createTransporter();
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;

    if (transporter && from) {
      await transporter.sendMail({
        from,
        to: recipientEmail,
        subject,
        html: content,
      });

      await prisma.notification.create({
        data: {
          type,
          recipientEmail,
          subject,
          content,
          status: "sent",
          sentAt: new Date(),
        },
      });
    } else {
      // SMTP 미설정 시 로그만 저장
      await prisma.notification.create({
        data: {
          type,
          recipientEmail,
          subject,
          content,
          status: "pending",
        },
      });
    }
  } catch (error) {
    console.error("이메일 발송 오류:", error);
    try {
      await prisma.notification.create({
        data: {
          type,
          recipientEmail,
          subject,
          content,
          status: "failed",
        },
      });
    } catch {
      // 로그 저장도 실패하면 무시
    }
  }
}

/** 예약 확정 이메일 HTML 템플릿 */
export function getReservationConfirmedEmail(name: string, title: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2d2a26;">수련회 예약이 확정되었습니다</h2>
      <p>${name}님, 안녕하세요!</p>
      <p><strong>${title}</strong> 수련회 예약이 확정되었습니다.</p>
      <p>자세한 안내는 추후 별도로 연락드리겠습니다.</p>
      <hr style="border: none; border-top: 1px solid #e8e4de; margin: 20px 0;" />
      <p style="color: #8b8578; font-size: 14px;">복음온 Gospel-On</p>
    </div>
  `;
}

/** 예약 취소 이메일 HTML 템플릿 */
export function getReservationCancelledEmail(name: string, title: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2d2a26;">수련회 예약이 취소되었습니다</h2>
      <p>${name}님, 안녕하세요.</p>
      <p><strong>${title}</strong> 수련회 예약이 취소되었습니다.</p>
      <p>문의사항이 있으시면 연락 부탁드립니다.</p>
      <hr style="border: none; border-top: 1px solid #e8e4de; margin: 20px 0;" />
      <p style="color: #8b8578; font-size: 14px;">복음온 Gospel-On</p>
    </div>
  `;
}
