import { useEffect } from 'react'
import { useAppState } from '../context/AppStateContext'
import { BuildingDetailPanel } from '../components/BuildingDetailPanel'
import { CompactSearchPanel } from '../components/CompactSearchPanel'
import { MapView } from '../components/MapView'
import { SavedBuildingPanel } from '../components/SavedBuildingPanel'
import { SavedBuildingToggle } from '../components/SavedBuildingToggle'
import { SearchPanel } from '../components/SearchPanel'

export function MapPage() {
  const { displayedBuilding, isSavedPanelOpen, selectBuilding, selectedBuildingId } =
    useAppState()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') selectBuilding(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectBuilding])

  return (
    <main className={`mapPage ${displayedBuilding ? 'hasDetail' : ''}`}>
      <MapView />
      <div
        className="leftStack"
        onWheel={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <SavedBuildingToggle />
        {isSavedPanelOpen ? (
          <>
            <CompactSearchPanel />
            <SavedBuildingPanel />
          </>
        ) : (
          <SearchPanel />
        )}
      </div>
      {displayedBuilding && (
        <BuildingDetailPanel
          key={`${displayedBuilding.id}-${selectedBuildingId ?? 'hover'}`}
          building={displayedBuilding}
        />
      )}
    </main>
  )
}
