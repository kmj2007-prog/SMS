import { useAppState } from '../context/AppStateContext'
import { SavedBuildingItem } from './SavedBuildingItem'

export function SavedBuildingPanel() {
  const { savedBuildings } = useAppState()

  return (
    <section className="panel savedPanel" aria-label="저장한 건물">
      <h2 className="panelTitle sm">저장한 건물</h2>
      {savedBuildings.length === 0 ? (
        <p className="emptyCopy">저장한 건물이 없습니다. 하트로 관심 건물을 남겨 보세요.</p>
      ) : (
        <ul className="savedList">
          {savedBuildings.map((building) => (
            <SavedBuildingItem key={building.id} building={building} />
          ))}
        </ul>
      )}
    </section>
  )
}
