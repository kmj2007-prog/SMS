import { useState } from 'react'
import { useAppState } from '../context/AppStateContext'
import { MOCK_USER } from '../utils/storage'

export function UserProfileCard() {
  const { user, login, logout, updateProfile, showToast } = useAppState()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')

  if (!user) {
    return (
      <section className="dashCard">
        <h2>내 정보</h2>
        <p className="emptyCopy">로그인하면 저장한 건물과 검색 기록을 이어서 볼 수 있습니다.</p>
        <button className="primaryBtn" onClick={() => login(MOCK_USER)}>
          데모 로그인
        </button>
      </section>
    )
  }

  return (
    <section className="dashCard profileCard">
      <div className="profileHead">
        <span className="userAvatar lg">{user.name.slice(0, 1)}</span>
        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
        <button
          className="ghostBtn"
          onClick={() => {
            setName(user.name)
            setEmail(user.email)
            setEditing((v) => !v)
          }}
        >
          {editing ? '닫기' : '정보 수정'}
        </button>
      </div>

      {editing && (
        <form
          className="editForm"
          onSubmit={(e) => {
            e.preventDefault()
            updateProfile({ name: name.trim() || user.name, email: email.trim() || user.email })
            setEditing(false)
          }}
        >
          <label>
            이름
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            이메일
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <button className="primaryBtn sm" type="submit">
            저장
          </button>
        </form>
      )}

      <div className="profileActions">
        <button
          className="ghostBtn"
          onClick={() => showToast('비밀번호 재설정 안내를 보냈습니다. (데모)')}
        >
          비밀번호 재설정
        </button>
        <button className="ghostBtn" onClick={logout}>
          로그아웃
        </button>
      </div>
    </section>
  )
}
