import { useEffect, useRef, useState } from 'react'
import { useAppState } from '../context/AppStateContext'

export function Header() {
  const { page, navigateTo, user, login, logout, clearSaved, clearRecent, showToast } =
    useAppState()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!settingsRef.current?.contains(e.target as Node)) setSettingsOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <header className="header">
      <button
        className="logoBtn"
        onClick={() => navigateTo('map')}
        aria-label="살면살아 홈"
      >
        <span className="logoMark" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="22" height="22">
            <path
              fill="currentColor"
              d="M16 3c5.1 0 9.2 4.1 9.2 9.6 0 6.8-9.2 16.4-9.2 16.4S6.8 19.4 6.8 12.6C6.8 7.1 10.9 3 16 3z"
            />
            <path fill="#fff" d="M11.6 13.2 16 9.4l4.4 3.8v6.2h-3.1v-3.4h-2.6v3.4h-3.1z" />
          </svg>
        </span>
        <span className="logoText">살면살아</span>
      </button>

      <div className="headerRight">
        <div className="settingsWrap" ref={settingsRef}>
          <button
            className="headerGhost"
            aria-expanded={settingsOpen}
            aria-haspopup="true"
            onClick={() => setSettingsOpen((v) => !v)}
          >
            설정
          </button>
          {settingsOpen && (
            <div className="settingsMenu" role="menu">
              <button
                role="menuitem"
                onClick={() => {
                  clearSaved()
                  setSettingsOpen(false)
                }}
              >
                저장한 건물 초기화
              </button>
              <button
                role="menuitem"
                onClick={() => {
                  clearRecent()
                  setSettingsOpen(false)
                }}
              >
                최근 검색 초기화
              </button>
              <p className="settingsNote">이 화면은 교통 API 없이 mock 데이터로 동작합니다.</p>
            </div>
          )}
        </div>

        {user ? (
          <button
            className={`userChip ${page === 'mypage' ? 'isActive' : ''}`}
            onClick={() => navigateTo('mypage')}
            aria-label={`${user.name} 마이페이지`}
          >
            <span className="userAvatar" aria-hidden="true">
              {user.name.slice(0, 1)}
            </span>
            <span>{user.name}</span>
          </button>
        ) : (
          <div className="authBtns">
            <button className="headerGhost" onClick={() => login()}>
              로그인
            </button>
            <button
              className="headerPrimary"
              onClick={() => {
                login()
                showToast('데모 계정으로 가입되었습니다.')
              }}
            >
              회원가입
            </button>
          </div>
        )}
        {user && (
          <button className="headerGhost headerLogout" onClick={logout}>
            로그아웃
          </button>
        )}
      </div>
    </header>
  )
}
