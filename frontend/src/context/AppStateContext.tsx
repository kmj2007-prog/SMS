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
import { searchBuildings } from '../api/buildings'
import {
  fetchNearbyInfrastructures,
  toInfrastructureMatch,
} from '../api/infrastructure'
import { ApiError } from '../api/client'
import { DEFAULT_SEARCH } from '../utils/filter'
import {
  INITIAL_RECENT,
  MOCK_USER,
  conditionsToRecent,
  loadRecentSearches,
  loadSavedListings,
  loadUser,
  saveRecentSearches,
  saveSavedListings,
  saveUser,
} from '../utils/storage'
import type {
  Destination,
  InfrastructureKind,
  InfrastructureMatch,
  Listing,
  RecentSearch,
  ScoredListing,
  SearchConditions,
  UserProfile,
  VisibleInfraLink,
} from '../types'

export type Page = 'map' | 'mypage'
export type MyPageTab = 'profile' | 'saved' | 'recent'

interface AppStateValue {
  page: Page
  mypageTab: MyPageTab
  user: UserProfile | null
  searchDraft: SearchConditions
  searchConditions: SearchConditions
  searchDestination: Destination | null
  hasSearched: boolean
  isSearching: boolean
  searchError: string | null
  searchResults: Listing[]
  scoredResults: ScoredListing[]
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
  visibleInfrastructure: VisibleInfraLink[]
  infraLoading: boolean
  infraError: string | null
  nearbyByKind: Array<{ kind: InfrastructureKind; match: InfrastructureMatch | null }>
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
  scoreFor: (id: number) => ScoredListing | null
}

const AppStateContext = createContext<AppStateValue | null>(null)

type NearbyByKind = Array<{
  kind: InfrastructureKind
  match: InfrastructureMatch | null
}>

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
  const [searchDestination, setSearchDestination] = useState<Destination | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [scoredResults, setScoredResults] = useState<ScoredListing[]>([])
  const [hoveredBuildingId, setHoveredBuildingIdState] = useState<number | null>(null)
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null)
  const [savedListings, setSavedListings] = useState<Listing[]>(() => loadSavedListings())
  const [isSavedPanelOpen, setSavedPanelOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(() =>
    loadRecentSearches(INITIAL_RECENT),
  )
  const [toast, setToast] = useState<string | null>(null)
  const [mapFocusNonce, setMapFocusNonce] = useState(0)
  const hoverTimer = useRef<number>(0)
  const toastTimer = useRef<number>(0)
  const searchGen = useRef(0)
  const infraGen = useRef(0)
  const infraCache = useRef(new Map<string, NearbyByKind>())
  const [infraLoading, setInfraLoading] = useState(false)
  const [infraError, setInfraError] = useState<string | null>(null)
  const [nearbyByKind, setNearbyByKind] = useState<NearbyByKind>([])

  const searchResults = useMemo(
    () => scoredResults.map((item) => item.listing),
    [scoredResults],
  )
  const savedBuildingIds = useMemo(
    () => savedListings.map((item) => item.id),
    [savedListings],
  )

  const listingById = useMemo(() => {
    const map = new Map<number, Listing>()
    savedListings.forEach((item) => map.set(item.id, item))
    searchResults.forEach((item) => map.set(item.id, item))
    return map
  }, [savedListings, searchResults])

  const findBuilding = useCallback(
    (id: number | null) => (id == null ? null : listingById.get(id) ?? null),
    [listingById],
  )

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
    saveSavedListings(savedListings)
  }, [savedListings])

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

  const savedBuildings = savedListings

  const visibleBuildings = useMemo(() => {
    const map = new Map<number, Listing>()
    if (hasSearched) {
      searchResults.forEach((item) => map.set(item.id, item))
    }
    if (selectedBuilding) map.set(selectedBuilding.id, selectedBuilding)
    return [...map.values()]
  }, [hasSearched, searchResults, selectedBuilding])

  const visibleInfrastructure = useMemo<VisibleInfraLink[]>(() => {
    if (!selectedBuilding) return []
    return nearbyByKind
      .filter((item): item is { kind: InfrastructureKind; match: InfrastructureMatch } => item.match != null)
      .map((item) => ({ fromBuilding: selectedBuilding, match: item.match }))
  }, [selectedBuilding, nearbyByKind])

  useEffect(() => {
    const types = searchDraft.infrastructure_priority
    if (!selectedBuilding || types.length === 0) {
      infraGen.current += 1
      setNearbyByKind([])
      setInfraLoading(false)
      setInfraError(null)
      return
    }

    const cacheKey = `${selectedBuilding.id}:${[...types].join(',')}`
    const cached = infraCache.current.get(cacheKey)
    if (cached) {
      setNearbyByKind(cached)
      setInfraLoading(false)
      setInfraError(null)
      return
    }

    const gen = ++infraGen.current
    setNearbyByKind([])
    setInfraLoading(true)
    setInfraError(null)

    void fetchNearbyInfrastructures({
      latitude: selectedBuilding.latitude,
      longitude: selectedBuilding.longitude,
      types,
    })
      .then((data) => {
        if (gen !== infraGen.current) return
        const next: NearbyByKind = types.map((kind, index) => {
          const place = data.items[kind]
          return {
            kind,
            match: place ? toInfrastructureMatch(kind, index + 1, place) : null,
          }
        })
        infraCache.current.set(cacheKey, next)
        setNearbyByKind(next)
        setInfraLoading(false)
      })
      .catch(() => {
        if (gen !== infraGen.current) return
        setNearbyByKind([])
        setInfraLoading(false)
        setInfraError('주변 시설 정보를 불러오지 못했습니다.')
      })
  }, [selectedBuilding, searchDraft.infrastructure_priority])

  const scoreFor = useCallback(
    (id: number) => scoredResults.find((item) => item.listing.id === id) ?? null,
    [scoredResults],
  )

  const runSearch = useCallback(
    (conditions?: SearchConditions) => {
      const applied = conditions ?? searchDraft
      const gen = ++searchGen.current
      setSearchDraft(applied)
      setSearchConditions(applied)
      setHasSearched(true)
      setIsSearching(true)
      setSearchError(null)
      setSelectedBuildingId(null)
      setHoveredBuildingIdState(null)
      setPage('map')
      window.history.pushState({}, '', '/')
      setRecentSearches((prev) => [conditionsToRecent(applied), ...prev].slice(0, 8))
      setMapFocusNonce((n) => n + 1)

      void searchBuildings(applied)
        .then((result) => {
          if (gen !== searchGen.current) return
          const ranked: ScoredListing[] = result.listings.map((listing, index) => ({
            listing,
            score: 0,
            rank: index + 1,
            nearest: [],
            badges: [],
          }))
          setSearchDestination(result.destination)
          setScoredResults(ranked)
          setIsSearching(false)
          if (ranked.length === 0) {
            showToast('조건에 맞는 건물이 없습니다.')
          } else {
            showToast(`조건에 맞는 건물 ${ranked.length}개를 표시합니다.`)
          }
        })
        .catch((error: unknown) => {
          if (gen !== searchGen.current) return
          const message =
            error instanceof ApiError ? error.message : '데이터를 불러오지 못했습니다.'
          setSearchDestination(null)
          setScoredResults([])
          setSearchError(message)
          setIsSearching(false)
          showToast(message)
        })
    },
    [searchDraft, showToast],
  )

  const selectBuilding = useCallback(
    (id: number | null) => {
      cancelHoverClose()
      setSelectedBuildingId(id)
      if (id != null) {
        setHoveredBuildingIdState(id)
        setMapFocusNonce((n) => n + 1)
      }
    },
    [cancelHoverClose],
  )

  const toggleSaved = useCallback(
    (id: number) => {
      if (!user) {
        showToast('저장하려면 먼저 로그인해 주세요.')
        return
      }
      setSavedListings((prev) => {
        if (prev.some((item) => item.id === id)) {
          showToast('저장을 해제했습니다.')
          return prev.filter((item) => item.id !== id)
        }
        const building = listingById.get(id)
        if (!building) {
          showToast('저장할 건물 정보를 찾지 못했습니다.')
          return prev
        }
        showToast(`${building.title}을(를) 저장했습니다.`)
        return [building, ...prev]
      })
    },
    [listingById, showToast, user],
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

  const openSavedBuildingOnMap = useCallback((id: number) => {
    setPage('map')
    window.history.pushState({}, '', '/')
    setSelectedBuildingId(id)
    setHoveredBuildingIdState(id)
    setMapFocusNonce((n) => n + 1)
  }, [])

  const rerunSearch = useCallback(
    (search: RecentSearch) => {
      runSearch({
        destination: search.destination,
        max_commute_min: search.max_commute_min,
        max_monthly_rent: search.max_monthly_rent,
        transport_modes: [...search.transport_modes],
        room_types: [...search.room_types],
        infrastructure_priority: [...(search.infrastructure_priority ?? [])],
      })
    },
    [runSearch],
  )

  const clearSaved = useCallback(() => {
    setSavedListings([])
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
      searchDestination,
      hasSearched,
      isSearching,
      searchError,
      searchResults,
      scoredResults,
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
      visibleInfrastructure,
      infraLoading,
      infraError,
      nearbyByKind,
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
      scoreFor,
    }),
    [
      page,
      mypageTab,
      user,
      searchDraft,
      searchConditions,
      searchDestination,
      hasSearched,
      isSearching,
      searchError,
      searchResults,
      scoredResults,
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
      visibleInfrastructure,
      infraLoading,
      infraError,
      nearbyByKind,
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
      scoreFor,
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
