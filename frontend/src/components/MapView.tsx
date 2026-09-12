import { useCallback, useEffect, useRef, useState } from 'react'
import { MAP_BOUNDS, polylinePoints, project } from '../data/geo'
import {
  NEIGHBORHOODS,
  PARKS,
  ROADS,
  STATIONS,
  SUBWAY_LINES,
  findDestination,
} from '../data/mapPlaces'
import { useAppState } from '../context/AppStateContext'
import type { GeoPoint, Listing } from '../types'
import { BuildingMarker } from './BuildingMarker'
import { MarkerTooltip } from './MarkerTooltip'

function destForName(name: string): GeoPoint {
  return findDestination(name)
}

function cityBlocks() {
  const rects: Array<{ x: number; y: number; w: number; h: number }> = []
  for (let col = 0; col < 18; col += 1) {
    for (let row = 0; row < 24; row += 1) {
      const jitter = ((col * 13 + row * 7) % 9) - 4
      rects.push({
        x: 28 + col * 92 + jitter,
        y: 24 + row * 88 + (jitter % 5),
        w: 70,
        h: 64,
      })
    }
  }
  return rects
}

const BLOCKS = cityBlocks()

export function MapView() {
  const {
    visibleBuildings,
    displayedBuilding,
    selectedBuilding,
    selectedBuildingId,
    hoveredBuildingId,
    searchConditions,
    hasSearched,
    searchResults,
    setHoveredBuildingId,
    delayClearHover,
    selectBuilding,
    isSaved,
    mapFocusNonce,
  } = useAppState()

  const viewportRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.72)
  const [pan, setPan] = useState({ x: -220, y: -620 })
  const scaleRef = useRef(0.72)
  useEffect(() => {
    scaleRef.current = scale
  }, [scale])
  const drag = useRef<{
    active: boolean
    moved: boolean
    sx: number
    sy: number
    px: number
    py: number
  }>({ active: false, moved: false, sx: 0, sy: 0, px: 0, py: 0 })

  const panTo = useCallback((point: GeoPoint, selected: boolean) => {
    const el = viewportRef.current
    if (!el) return
    const k = scaleRef.current
    const { x, y } = project(point)
    const biasX = selected ? -36 : 80
    setPan({
      x: el.clientWidth / 2 + biasX - x * k,
      y: el.clientHeight / 2 - y * k,
    })
  }, [])

  useEffect(() => {
    panTo(
      selectedBuilding ?? destForName(searchConditions.destination),
      selectedBuilding != null,
    )
  }, [mapFocusNonce, selectedBuilding, searchConditions.destination, panTo])

  function zoomBy(delta: number, origin?: { x: number; y: number }) {
    const el = viewportRef.current
    if (!el) return
    const next = Math.min(2.4, Math.max(0.4, scale * delta))
    const rect = el.getBoundingClientRect()
    const ox = origin ? origin.x - rect.left : rect.width / 2
    const oy = origin ? origin.y - rect.top : rect.height / 2
    const wx = (ox - pan.x) / scale
    const wy = (oy - pan.y) / scale
    setScale(next)
    setPan({ x: ox - wx * next, y: oy - wy * next })
  }

  const dest = destForName(searchConditions.destination)
  const destPt = project(dest)
  const tooltipBuilding =
    visibleBuildings.find((b) => b.id === (hoveredBuildingId ?? selectedBuildingId)) ?? null

  return (
    <div
      className="mapViewport"
      ref={viewportRef}
      onWheel={(e) => {
        e.preventDefault()
        zoomBy(e.deltaY > 0 ? 0.9 : 1.1, { x: e.clientX, y: e.clientY })
      }}
      onPointerDown={(e) => {
        if (e.button !== 0) return
        drag.current = {
          active: true,
          moved: false,
          sx: e.clientX,
          sy: e.clientY,
          px: pan.x,
          py: pan.y,
        }
        ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        if (!drag.current.active) return
        const dx = e.clientX - drag.current.sx
        const dy = e.clientY - drag.current.sy
        if (Math.hypot(dx, dy) > 4) drag.current.moved = true
        setPan({ x: drag.current.px + dx, y: drag.current.py + dy })
      }}
      onPointerUp={() => {
        if (drag.current.active && !drag.current.moved) {
          selectBuilding(null)
        }
        drag.current.active = false
      }}
    >
      <div
        className="mapWorld"
        style={{
          width: MAP_BOUNDS.width,
          height: MAP_BOUNDS.height,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
        }}
      >
        <svg
          className="mapSvg"
          viewBox={`0 0 ${MAP_BOUNDS.width} ${MAP_BOUNDS.height}`}
          width={MAP_BOUNDS.width}
          height={MAP_BOUNDS.height}
        >
          <rect width="100%" height="100%" fill="#e7e2d6" />
          {BLOCKS.map((b, i) => (
            <rect
              key={i}
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              fill="#f4f0e6"
              stroke="#ddd4c4"
              strokeWidth="1"
              rx="3"
            />
          ))}
          {PARKS.map((park) => (
            <polygon
              key={park.name}
              points={polylinePoints(park.points)}
              fill="#c9d7b8"
              stroke="#b4c7a0"
            />
          ))}
          {ROADS.map((road, i) => (
            <polyline
              key={`road-${i}`}
              points={polylinePoints(road)}
              fill="none"
              stroke="#f8f6f1"
              strokeWidth="14"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
          {ROADS.map((road, i) => (
            <polyline
              key={`road-edge-${i}`}
              points={polylinePoints(road)}
              fill="none"
              stroke="#d8d0c2"
              strokeWidth="16"
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity="0.35"
            />
          ))}
          {SUBWAY_LINES.map((line) => (
            <polyline
              key={line.name}
              points={polylinePoints(line.path)}
              fill="none"
              stroke={line.color}
              strokeWidth="5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
          {displayedBuilding && (
            <polyline
              points={polylinePoints(displayedBuilding.route_path)}
              fill="none"
              stroke="#DC143C"
              strokeWidth="6"
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity="0.85"
            />
          )}
          {NEIGHBORHOODS.map((place) => {
            const p = project(place)
            return (
              <text
                key={place.name}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                fill="#8a8378"
                fontSize="18"
                fontWeight="600"
              >
                {place.name}
              </text>
            )
          })}
          {STATIONS.map((stn) => {
            const p = project(stn)
            return (
              <g key={stn.name}>
                <circle cx={p.x} cy={p.y} r="6" fill="#fff" stroke="#333" strokeWidth="2" />
                <text x={p.x + 10} y={p.y - 8} fill="#333" fontSize="13" fontWeight="700">
                  {stn.name}
                </text>
              </g>
            )
          })}
        </svg>

        <div
          className="destMarker"
          style={{
            left: destPt.x,
            top: destPt.y,
            transform: `translate(-50%, -100%) scale(${1 / scale})`,
          }}
        >
          <span className="destPin" />
          <span className="destLabel">{searchConditions.destination || '목적지'}</span>
        </div>

        {visibleBuildings.map((building: Listing) => (
          <BuildingMarker
            key={building.id}
            building={building}
            selected={selectedBuildingId === building.id}
            hovered={hoveredBuildingId === building.id}
            saved={isSaved(building.id)}
            scale={scale}
            onHover={() => setHoveredBuildingId(building.id)}
            onLeave={delayClearHover}
            onSelect={() => selectBuilding(building.id)}
          />
        ))}

        {tooltipBuilding && (
          <MarkerTooltip building={tooltipBuilding} scale={scale} />
        )}
      </div>

      <div
        className="mapHud"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {hasSearched && (
          <p className={`mapCount ${searchResults.length === 0 ? 'isEmpty' : ''}`}>
            {searchResults.length === 0
              ? '조건에 맞는 건물이 없습니다. 조건을 변경해 보세요.'
              : `조건에 맞는 건물 ${searchResults.length}개`}
          </p>
        )}
        <div className="zoomBtns">
          <button aria-label="확대" onClick={() => zoomBy(1.15)}>
            +
          </button>
          <button aria-label="축소" onClick={() => zoomBy(0.87)}>
            −
          </button>
        </div>
      </div>
    </div>
  )
}
