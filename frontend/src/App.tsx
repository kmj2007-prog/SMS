import { useAppState } from './context/AppStateContext'
import { Header } from './components/Header'
import { MapPage } from './pages/MapPage'
import { MyPage } from './pages/MyPage'

export function App() {
  const { page, toast } = useAppState()

  return (
    <div className="appShell">
      <Header />
      {page === 'mypage' ? <MyPage /> : <MapPage />}
      <div className="toastRegion" aria-live="polite">
        {toast && <div className="toast">{toast}</div>}
      </div>
    </div>
  )
}
