import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { BUILDINGS } from '../data/buildings'
import { DEFAULT_SEARCH, filterListings } from '../utils/filter'
import {
  INITIAL_RECENT,
  MOCK_USER,
  conditionsToRecent,
  loadRecentSearches,
  loadSavedIds,
  loadUser,
  saveRecentSearches,
  saveSavedIds,
  saveUser,
} from '../utils/storage'
import type { Listing, RecentSearch, SearchConditions, UserProfile } from '../types'

export type Page = 'map' | 'mypage'
export type MyPageTab = 'profile' | 'saved' | 'recent'

interface AppStateValue {
  page: Page
  mypageTab: MyPageTab
  user: UserProfile | null
  searchDraft: SearchConditions
  searchConditions: SearchConditions
  hasSearched: boolean
  searchResults: Listing[]
  hoveredBuildingId: number | null
  selectedBuildingId: number | null
  savedBuildingIds: number[]
  isSavedPanelOpen: boolean
  recentSearches: RecentSearch[]
  toast: string | null
  mapFocusNonce: number
  displayedBuilding: Listing | null
  selectedBuilding: Listing | null
  savedBuildings: Listing[]
  visibleBuildings: Listing[]
  navigateTo: (page: Page, tab?: MyPageTab) => void
  setMypageTab: (tab: MyPageTab) => void
  setSearchDraft: (
    next: SearchConditions | ((prev: SearchConditions) => SearchConditions),
  ) => void
  runSearch: (conditions?: SearchConditions) => void
  setHoveredBuildingId: (id: number | null) => void
  delayClearHover: () => void
  cancelHoverClose: () => void
  selectBuilding: (id: number | null) => void
  toggleSaved: (id: number) => void
  isSaved: (id: number) => boolean
  setSavedPanelOpen: (open: boolean) => void
  login: (profile?: UserProfile) => void
  logout: () => void
  updateProfile: (profile: UserProfile) => void
  showToast: (message: string) => void
  openSavedBuildingOnMap: (id: number) => void
  rerunSearch: (search: RecentSearch) => void
  clearSaved: () => void
  clearRecent: () => void
}

const AppStateContext = createContext<AppStateValue | null>(null)

function findBuilding(id: number | null): Listing | null {
  if (id == null) return null
  return BUILDINGS.find((item) => item.id === id) ?? null
}

function pathFor(page: Page, tab: MyPageTab): string {
  if (page === 'mypage') {
    return tab === 'profile' ? '/mypage' : `/mypage?tab=${tab}`
  }
  return '/'
}

function readLocation(): { page: Page; tab: MyPageTab } {
  const path = window.location.pathname
  const tab = new URLSearchParams(window.location.search).get('tab')
  if (path.startsWith('/mypage')) {
    if (tab === 'saved' || tab === 'recent') return { page: 'mypage', tab }
    return { page: 'mypage', tab: 'profile' }
  }
  return { page: 'map', tab: 'profile' }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const initial = readLocation()
  const [page, setPage] = useState<Page>(initial.page)
  const [mypageTab, setMypageTabState] = useState<MyPageTab>(initial.tab)
  const [user, setUser] = useState<UserProfile | null>(() => loadUser(MOCK_USER))
  const [searchDraft, setSearchDraft] = useState<SearchConditions>(DEFAULT_SEARCH)
  const [searchConditions, setSearchConditions] =
    useState<SearchConditions>(DEFAULT_SEARCH)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchResults, setSearchResults] = useState<Listing[]>([])
  const [hoveredBuildingId, setHoveredBuildingIdState] = useState<number | null>(null)
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null)
  const [savedBuildingIds, setSavedBuildingIds] = useState<number[]>(() =>
    loadSavedIds([1, 2, 4]),
  )
  const [isSavedPanelOpen, setSavedPanelOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(() =>
    loadRecentSearches(INITIAL_RECENT),
  )
  const [toast, setToast] = useState<string | null>(null)
  const [mapFocusNonce, setMapFocusNonce] = useState(0)
  const hoverTimer = useRef<number>(0)
  const toastTimer = useRef<number>(0)

  const showToast = useCallback((message: string) => {
    window.clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = window.setTimeout(() => setToast(null), 2200)
  }, [])

  const navigateTo = useCallback((next: Page, tab: MyPageTab = 'profile') => {
    setPage(next)
    if (next === 'mypage') setMypageTabState(tab)
    window.history.pushState({}, '', pathFor(next, next === 'mypage' ? tab : 'profile'))
  }, [])

  const setMypageTab = useCallback((tab: MyPageTab) => {
    setMypageTabState(tab)
    window.history.replaceState({}, '', pathFor('mypage', tab))
  }, [])

  useEffect(() => {
    const onPop = () => {
      const loc = readLocation()
      setPage(loc.page)
      setMypageTabState(loc.tab)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    saveSavedIds(savedBuildingIds)
  }, [savedBuildingIds])

  useEffect(() => {
    saveRecentSearches(recentSearches)
  }, [recentSearches])

  useEffect(() => {
    saveUser(user)
  }, [user])

  const cancelHoverClose = useCallback(() => {
    window.clearTimeout(hoverTimer.current)
  }, [])

  const setHoveredBuildingId = useCallback(
    (id: number | null) => {
      cancelHoverClose()
      setHoveredBuildingIdState(id)
    },
    [cancelHoverClose],
  )

  const delayClearHover = useCallback(() => {
    window.clearTimeout(hoverTimer.current)
    hoverTimer.current = window.setTimeout(() => {
      setHoveredBuildingIdState(null)
    }, 220)
  }, [])

  const selectedBuilding = findBuilding(selectedBuildingId)
  const hoveredBuilding = findBuilding(hoveredBuildingId)
  const displayedBuilding = selectedBuilding ?? hoveredBuilding

  const savedBuildings = useMemo(
    () =>
      savedBuildingIds
        .map((id) => findBuilding(id))
        .filter((item): item is Listing => item != null),
    [savedBuildingIds],
  )

  const visibleBuildings = useMemo(() => {
    const map = new Map<number, Listing>()
    if (hasSearched) {
      searchResults.forEach((item) => map.set(item.id, item))
    }
    if (selectedBuilding) map.set(selectedBuilding.id, selectedBuilding)
    return [...map.values()]
  }, [hasSearched, searchResults, selectedBuilding])

  const runSearch = useCallback(
    (conditions?: SearchConditions) => {
      const applied = conditions ?? searchDraft
      const results = filterListings(BUILDINGS, applied)
      setSearchDraft(applied)
      setSearchConditions(applied)
      setHasSearched(true)
      setSearchResults(results)
      setSelectedBuildingId(null)
      setHoveredBuildingIdState(null)
      setPage('map')
      window.history.pushState({}, '', '/')
      setRecentSearches((prev) => {
        const next = [conditionsToRecent(applied), ...prev].slice(0, 8)
        return next
      })
      setMapFocusNonce((n) => n + 1)
      if (results.length === 0) {
        showToast('조건에 맞는 건물이 없습니다. 조건을 변경해 보세요.')
      } else {
        showToast(`조건에 맞는 건물 ${results.length}개를 표시합니다.`)
      }
    },
    [searchDraft, showToast],
  )

  const selectBuilding = useCallback((id: number | null) => {
    cancelHoverClose()
    setSelectedBuildingId(id)
    if (id != null) {
      setHoveredBuildingIdState(id)
      setMapFocusNonce((n) => n + 1)
    }
  }, [cancelHoverClose])

  const toggleSaved = useCallback(
    (id: number) => {
      if (!user) {
        showToast('저장하려면 먼저 로그인해 주세요.')
        return
      }
      setSavedBuildingIds((prev) => {
        if (prev.includes(id)) {
          showToast('저장을 해제했습니다.')
          return prev.filter((item) => item !== id)
        }
        const building = findBuilding(id)
        showToast(building ? `${building.title}을(를) 저장했습니다.` : '건물을 저장했습니다.')
        return [id, ...prev]
      })
    },
    [showToast, user],
  )

  const isSaved = useCallback(
    (id: number) => savedBuildingIds.includes(id),
    [savedBuildingIds],
  )

  const login = useCallback(
    (profile: UserProfile = MOCK_USER) => {
      setUser(profile)
      showToast(`${profile.name} 님, 로그인되었습니다.`)
    },
    [showToast],
  )

  const logout = useCallback(() => {
    setUser(null)
    showToast('로그아웃되었습니다. (데모)')
    navigateTo('map')
  }, [navigateTo, showToast])

  const updateProfile = useCallback(
    (profile: UserProfile) => {
      setUser(profile)
      showToast('회원 정보를 수정했습니다. (데모)')
    },
    [showToast],
  )

  const openSavedBuildingOnMap = useCallback(
    (id: number) => {
      setPage('map')
      window.history.pushState({}, '', '/')
      setSelectedBuildingId(id)
      setHoveredBuildingIdState(id)
      setMapFocusNonce((n) => n + 1)
    },
    [],
  )

  const rerunSearch = useCallback(
    (search: RecentSearch) => {
      runSearch({
        destination: search.destination,
        max_commute_min: search.max_commute_min,
        max_monthly_rent: search.max_monthly_rent,
        transport_modes: [...search.transport_modes],
        room_types: [...search.room_types],
      })
    },
    [runSearch],
  )

  const clearSaved = useCallback(() => {
    setSavedBuildingIds([])
    showToast('저장한 건물을 모두 지웠습니다.')
  }, [showToast])

  const clearRecent = useCallback(() => {
    setRecentSearches([])
    showToast('최근 검색 기록을 지웠습니다.')
  }, [showToast])

  const value = useMemo<AppStateValue>(
    () => ({
      page,
      mypageTab,
      user,
      searchDraft,
      searchConditions,
      hasSearched,
      searchResults,
      hoveredBuildingId,
      selectedBuildingId,
      savedBuildingIds,
      isSavedPanelOpen,
      recentSearches,
      toast,
      mapFocusNonce,
      displayedBuilding,
      selectedBuilding,
      savedBuildings,
      visibleBuildings,
      navigateTo,
      setMypageTab,
      setSearchDraft,
      runSearch,
      setHoveredBuildingId,
      delayClearHover,
      cancelHoverClose,
      selectBuilding,
      toggleSaved,
      isSaved,
      setSavedPanelOpen,
      login,
      logout,
      updateProfile,
      showToast,
      openSavedBuildingOnMap,
      rerunSearch,
      clearSaved,
      clearRecent,
    }),
    [
      page,
      mypageTab,
      user,
      searchDraft,
      searchConditions,
      hasSearched,
      searchResults,
      hoveredBuildingId,
      selectedBuildingId,
      savedBuildingIds,
      isSavedPanelOpen,
      recentSearches,
      toast,
      mapFocusNonce,
      displayedBuilding,
      selectedBuilding,
      savedBuildings,
      visibleBuildings,
      navigateTo,
      setMypageTab,
      runSearch,
      setHoveredBuildingId,
      delayClearHover,
      cancelHoverClose,
      selectBuilding,
      toggleSaved,
      isSaved,
      login,
      logout,
      updateProfile,
      showToast,
      openSavedBuildingOnMap,
      rerunSearch,
      clearSaved,
      clearRecent,
    ],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

// Context hook is intentionally exported from the provider module.
// eslint-disable-next-line react-refresh/only-export-components
export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
