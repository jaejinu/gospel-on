import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-warm-bg flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl sm:text-9xl font-extrabold text-primary/20 mb-4">404</p>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="text-muted mb-8">
          요청하신 페이지가 삭제되었거나 주소가 잘못되었을 수 있습니다.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-light transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
