import Link from "next/link";

interface FooterProps {
  settings?: Record<string, string>;
}

export default function Footer({ settings }: FooterProps) {
  const email = settings?.contact_email || "info@gospelon.org";
  const phone = settings?.contact_phone || "010-0000-0000";

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 단체 정보 */}
          <div>
            <h3 className="text-xl font-bold mb-4">복음온</h3>
            <p className="text-sm text-white/80 leading-relaxed">
              {settings?.site_description || (
                <>
                  엘림교회에서 진행하는
                  <br />
                  복음으로 하나 되는 수련회입니다.
                </>
              )}
            </p>
          </div>

          {/* 바로가기 */}
          <div>
            <h4 className="font-semibold mb-4">바로가기</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  복음온이란
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-white transition-colors">
                  갤러리
                </Link>
              </li>
              <li>
                <Link href="/notice" className="hover:text-white transition-colors">
                  공지사항
                </Link>
              </li>
              <li>
                <Link href="/reservation" className="hover:text-white transition-colors">
                  수련회 예약
                </Link>
              </li>
            </ul>
          </div>

          {/* 연락처 */}
          <div>
            <h4 className="font-semibold mb-4">연락처</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>이메일: {email}</li>
              <li>전화: {phone}</li>
              {settings?.address && <li>주소: {settings.address}</li>}
              {settings?.account_info && <li>후원계좌: {settings.account_info}</li>}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/80">
          <p>&copy; {new Date().getFullYear()} 복음온 Gospel-On. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
