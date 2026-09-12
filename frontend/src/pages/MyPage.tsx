import { useAppState } from '../context/AppStateContext'
import { RecentSearchCard } from '../components/RecentSearchCard'
import { SavedBuildingCard } from '../components/SavedBuildingCard'
import { UserProfileCard } from '../components/UserProfileCard'

const TABS = [
  { id: 'profile', label: '내 정보' },
  { id: 'saved', label: '저장한 건물' },
  { id: 'recent', label: '최근 검색' },
] as const

export function MyPage() {
  const { mypageTab, setMypageTab, savedBuildings, recentSearches } = useAppState()

  return (
    <main className="myPage">
      <div className="myLayout">
        <nav className="myNav" aria-label="마이페이지">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={mypageTab === tab.id ? 'isActive' : ''}
              onClick={() => setMypageTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="myContent">
          {mypageTab === 'profile' && <UserProfileCard />}

          {mypageTab === 'saved' && (
            <section className="dashCard">
              <h2>저장한 건물 {savedBuildings.length}</h2>
              {savedBuildings.length === 0 ? (
                <p className="emptyCopy">아직 저장한 건물이 없습니다.</p>
              ) : (
                <div className="savedGrid">
                  {savedBuildings.map((building) => (
                    <SavedBuildingCard key={building.id} building={building} />
                  ))}
                </div>
              )}
            </section>
          )}

          {mypageTab === 'recent' && (
            <section className="dashCard">
              <h2>최근 검색</h2>
              {recentSearches.length === 0 ? (
                <p className="emptyCopy">최근 검색 기록이 없습니다.</p>
              ) : (
                <div className="recentList">
                  {recentSearches.map((search) => (
                    <RecentSearchCard key={search.id} search={search} />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
