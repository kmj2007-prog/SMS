import { useAppState } from '../context/AppStateContext'

export function SavedBuildingToggle() {
  const { savedBuildingIds, isSavedPanelOpen, setSavedPanelOpen } = useAppState()
  const count = savedBuildingIds.length

  return (
    <button
      className={`savedToggle ${isSavedPanelOpen ? 'isOpen' : ''}`}
      aria-pressed={isSavedPanelOpen}
      aria-label={`저장한 건물 ${count}개`}
      onClick={() => setSavedPanelOpen(!isSavedPanelOpen)}
    >
      <span aria-hidden="true">{isSavedPanelOpen ? '♥' : '♡'}</span>
      저장한 건물 {count}
    </button>
  )
}
