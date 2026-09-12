import { useEffect, useRef, useState } from 'react'
import { findDestination } from '../data/mapPlaces'
import { INFRA_LABELS } from '../data/infrastructure'
import { useAppState } from '../context/AppStateContext'
import type { GeoPoint, Listing } from '../types'
import {
  buildingMarkerImage,
  destMarkerImage,
  getKakaoMaps,
  infraMarkerImage,
  KAKAO_APP_KEY,
  loadKakaoMaps,
  resetKakaoLoader,
} from '../lib/kakaoMaps'
import { formatDistanceMeters, formatWalkApprox } from '../utils/infrastructure'
import { formatManwon } from '../utils/format'
import { drawableLegsFor, transitStrokeColor, type DrawableLeg } from '../utils/routeDraw'

const INITIAL_CENTER = { latitude: 37.5894, longitude: 127.0325 }
const INITIAL_LEVEL = 5

type BuildingMarkerItem = {
  marker: KakaoMarker
  info: KakaoInfoWindow
  onClick: () => void
  onOver: () => void
  onOut: () => void
}

function latLng(point: GeoPoint) {
  const maps = getKakaoMaps()
  return new maps.LatLng(point.latitude, point.longitude)
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function tooltipHtml(building: Listing) {
  return `<div class="kakaoBuildingTip">
    <strong>${escapeHtml(building.title)}</strong>
    <span>${escapeHtml(building.room_type)} · 월세 ${escapeHtml(formatManwon(building.monthly_rent))}</span>
    <span>${escapeHtml(building.destination)} ${building.commute_min}분</span>
  </div>`
}

function clearRoute(
  lines: KakaoPolyline[],
  labels: KakaoCustomOverlay[],
) {
  for (const line of lines) line.setMap(null)
  for (const label of labels) label.setMap(null)
}

function routeLabelHtml(leg: DrawableLeg) {
  const stop = leg.startStop ? ` (${escapeHtml(leg.startStop)})` : ''
  const kindClass = leg.kind === 'subway' ? 'isSubway' : 'isBus'
  const icon = leg.kind === 'subway' ? '지' : '버'
  return `<div class="kakaoRouteLabel ${kindClass}">
    <span class="kakaoRouteIcon">${icon}</span>
    <span>${escapeHtml(leg.label)}${stop}</span>
  </div>`
}

function clearBuildingMarkers(items: BuildingMarkerItem[]) {
  const maps = window.kakao?.maps
  for (const item of items) {
    item.info.close()
    if (maps) {
      maps.event.removeListener(item.marker, 'click', item.onClick)
      maps.event.removeListener(item.marker, 'mouseover', item.onOver)
      maps.event.removeListener(item.marker, 'mouseout', item.onOut)
    }
    item.marker.setMap(null)
  }
}

export function MapView() {
  const {
    selectedBuilding,
    selectedBuildingId,
    searchConditions,
    searchDestination,
    hasSearched,
    searchResults,
    setHoveredBuildingId,
    delayClearHover,
    selectBuilding,
    mapFocusNonce,
    visibleInfrastructure,
    isSearching,
    searchError,
  } = useAppState()

  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<KakaoMap | null>(null)
  const destMarkerRef = useRef<KakaoMarker | null>(null)
  const destLabelRef = useRef<KakaoCustomOverlay | null>(null)
  const buildingMarkersRef = useRef<BuildingMarkerItem[]>([])
  const infraMarkersRef = useRef<
    Array<{ marker: KakaoMarker; info: KakaoInfoWindow; onOver: () => void; onOut: () => void }>
  >([])
  const routeLinesRef = useRef<KakaoPolyline[]>([])
  const routeLabelsRef = useRef<KakaoCustomOverlay[]>([])
  const dest = searchDestination ?? findDestination(searchConditions.destination)

  const [status, setStatus] = useState<'no-key' | 'loading' | 'ready' | 'error'>(
    KAKAO_APP_KEY ? 'loading' : 'no-key',
  )
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!KAKAO_APP_KEY) return
    const el = containerRef.current
    if (!el) return
    let cancelled = false

    loadKakaoMaps()
      .then((maps) => {
        if (cancelled) return
        const map = new maps.Map(el, {
          center: new maps.LatLng(INITIAL_CENTER.latitude, INITIAL_CENTER.longitude),
          level: INITIAL_LEVEL,
        })
        mapRef.current = map
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
      clearRoute(routeLinesRef.current, routeLabelsRef.current)
      routeLinesRef.current = []
      routeLabelsRef.current = []
      destMarkerRef.current?.setMap(null)
      destMarkerRef.current = null
      destLabelRef.current?.setMap(null)
      destLabelRef.current = null
      clearBuildingMarkers(buildingMarkersRef.current)
      buildingMarkersRef.current = []
      for (const item of infraMarkersRef.current) {
        item.info.close()
        item.marker.setMap(null)
      }
      infraMarkersRef.current = []
      el.innerHTML = ''
      mapRef.current = null
    }
  }, [retryCount])

  useEffect(() => {
    if (status !== 'ready' || !mapRef.current) return
    const maps = getKakaoMaps()
    const position = latLng(dest)
    if (!destMarkerRef.current) {
      destMarkerRef.current = new maps.Marker({
        position,
        image: destMarkerImage(maps),
        zIndex: 2,
        title: dest.name,
      })
      destMarkerRef.current.setMap(mapRef.current)
    } else {
      destMarkerRef.current.setPosition(position)
    }
    const label = `<div class="kakaoDestLabel">${escapeHtml(dest.name)}</div>`
    if (!destLabelRef.current) {
      destLabelRef.current = new maps.CustomOverlay({
        position,
        content: label,
        yAnchor: 0,
        xAnchor: 0.5,
        zIndex: 2,
        clickable: false,
      })
      destLabelRef.current.setMap(mapRef.current)
    } else {
      destLabelRef.current.setPosition(position)
      destLabelRef.current.setContent(label)
    }
  }, [status, dest])

  useEffect(() => {
    if (status !== 'ready' || !mapRef.current) return
    const maps = getKakaoMaps()
    const map = mapRef.current
    clearBuildingMarkers(buildingMarkersRef.current)
    buildingMarkersRef.current = []
    if (!hasSearched) return
    const next: BuildingMarkerItem[] = []
    for (const building of searchResults) {
      const selected = building.id === selectedBuildingId
      const marker = new maps.Marker({
        position: latLng(building),
        image: buildingMarkerImage(maps, selected),
        zIndex: selected ? 8 : 4,
        title: building.title,
        clickable: true,
      })
      const info = new maps.InfoWindow({ content: tooltipHtml(building), zIndex: 10 })
      const onClick = () => selectBuilding(building.id)
      const onOver = () => {
        info.open(map, marker)
        setHoveredBuildingId(building.id)
      }
      const onOut = () => {
        info.close()
        delayClearHover()
      }
      maps.event.addListener(marker, 'click', onClick)
      maps.event.addListener(marker, 'mouseover', onOver)
      maps.event.addListener(marker, 'mouseout', onOut)
      marker.setMap(map)
      next.push({ marker, info, onClick, onOver, onOut })
    }
    buildingMarkersRef.current = next
  }, [
    status,
    hasSearched,
    searchResults,
    selectedBuildingId,
    selectBuilding,
    setHoveredBuildingId,
    delayClearHover,
  ])

  useEffect(() => {
    if (status !== 'ready' || !mapRef.current) return
    const maps = getKakaoMaps()
    const map = mapRef.current
    clearRoute(routeLinesRef.current, routeLabelsRef.current)
    routeLinesRef.current = []
    routeLabelsRef.current = []
    if (!selectedBuilding) return

    const legs = drawableLegsFor(selectedBuilding, dest)
    const lines: KakaoPolyline[] = []
    const labels: KakaoCustomOverlay[] = []

    for (const leg of legs) {
      const path = leg.points.map(latLng)
      const color = transitStrokeColor(leg.kind, leg.lineName)
      if (leg.kind === 'walk') {
        const walkLine = new maps.Polyline({
          path,
          strokeWeight: 6,
          strokeColor: color,
          strokeOpacity: 0.92,
          strokeStyle: 'shortdot',
          zIndex: 3,
        })
        walkLine.setMap(map)
        lines.push(walkLine)
        continue
      }

      const casing = new maps.Polyline({
        path,
        strokeWeight: 9,
        strokeColor: '#ffffff',
        strokeOpacity: 0.95,
        strokeStyle: 'solid',
        zIndex: 4,
      })
      const line = new maps.Polyline({
        path,
        strokeWeight: 6,
        strokeColor: color,
        strokeOpacity: 0.98,
        strokeStyle: 'solid',
        endArrow: true,
        zIndex: 5,
      })
      casing.setMap(map)
      line.setMap(map)
      lines.push(casing, line)

      const label = new maps.CustomOverlay({
        position: path[0],
        content: routeLabelHtml(leg),
        yAnchor: 1.35,
        xAnchor: 0.1,
        zIndex: 7,
        clickable: false,
      })
      label.setMap(map)
      labels.push(label)
    }

    routeLinesRef.current = lines
    routeLabelsRef.current = labels
  }, [status, selectedBuilding, dest])

  useEffect(() => {
    if (status !== 'ready' || !mapRef.current) return
    const maps = getKakaoMaps()
    const map = mapRef.current
    for (const item of infraMarkersRef.current) {
      item.info.close()
      maps.event.removeListener(item.marker, 'mouseover', item.onOver)
      maps.event.removeListener(item.marker, 'mouseout', item.onOut)
      item.marker.setMap(null)
    }
    infraMarkersRef.current = []
    if (!selectedBuildingId) return
    for (const link of visibleInfrastructure) {
      const marker = new maps.Marker({
        position: latLng(link.match.facility),
        image: infraMarkerImage(maps, link.match.kind),
        zIndex: 5,
        title: link.match.facility.title,
        clickable: true,
      })
      const info = new maps.InfoWindow({
        content: `<div class="kakaoBuildingTip">
          <strong>${escapeHtml(link.match.facility.title)}</strong>
          <span>${escapeHtml(INFRA_LABELS[link.match.kind])}</span>
          <span>건물에서 ${escapeHtml(formatDistanceMeters(link.match.distance_m))}</span>
          <span>${escapeHtml(formatWalkApprox(link.match.walk_min))}</span>
        </div>`,
        zIndex: 11,
      })
      const onOver = () => info.open(map, marker)
      const onOut = () => info.close()
      maps.event.addListener(marker, 'mouseover', onOver)
      maps.event.addListener(marker, 'mouseout', onOut)
      marker.setMap(map)
      infraMarkersRef.current.push({ marker, info, onOver, onOut })
    }
  }, [status, visibleInfrastructure, selectedBuildingId])

  useEffect(() => {
    if (status !== 'ready' || !mapRef.current) return
    const maps = getKakaoMaps()
    const map = mapRef.current
    if (selectedBuilding) {
      const bounds = new maps.LatLngBounds()
      bounds.extend(latLng(selectedBuilding))
      bounds.extend(latLng(dest))
      for (const point of selectedBuilding.route_path) bounds.extend(latLng(point))
      for (const segment of selectedBuilding.route_segments) {
        for (const point of segment.points ?? []) bounds.extend(latLng(point))
      }
      for (const link of visibleInfrastructure) {
        bounds.extend(latLng(link.match.facility))
      }
      map.setBounds(bounds)
      return
    }
    if (hasSearched && searchResults.length > 0) {
      const bounds = new maps.LatLngBounds()
      bounds.extend(latLng(dest))
      for (const building of searchResults) bounds.extend(latLng(building))
      map.setBounds(bounds)
      return
    }
    map.setCenter(latLng(dest))
    map.setLevel(INITIAL_LEVEL)
  }, [status, hasSearched, searchResults, selectedBuilding, dest, mapFocusNonce, visibleInfrastructure])

  function zoomBy(delta: number) {
    const map = mapRef.current
    if (!map) return
    map.setLevel(Math.max(1, Math.min(10, map.getLevel() + delta)))
  }

  return (
    <div className="mapViewport">
      <div ref={containerRef} className="kakaoMap" />
      {status === 'no-key' && (
        <div className="mapFallback" role="alert">
          Kakao 지도 API 키가 설정되지 않았습니다.
        </div>
      )}
      {status === 'loading' && (
        <div className="mapFallback" role="status">
          지도를 불러오는 중입니다.
        </div>
      )}
      {status === 'error' && (
        <div className="mapFallback" role="alert">
          <p>지도를 불러오지 못했습니다.</p>
          <button
            type="button"
            className="primaryBtn sm"
            onClick={() => {
              resetKakaoLoader()
              setStatus('loading')
              setRetryCount((n) => n + 1)
            }}
          >
            다시 시도
          </button>
        </div>
      )}
      <div className="mapHud">
        {isSearching && <p className="mapCount">검색 중...</p>}
        {!isSearching && searchError && (
          <p className="mapCount isEmpty">{searchError}</p>
        )}
        {!isSearching && hasSearched && !searchError && (
          <p className={`mapCount ${searchResults.length === 0 ? 'isEmpty' : ''}`}>
            {searchResults.length === 0
              ? '조건에 맞는 건물이 없습니다.'
              : `조건에 맞는 건물 ${searchResults.length}개`}
          </p>
        )}
        {status === 'ready' && (
          <div className="zoomBtns">
            <button type="button" aria-label="확대" onClick={() => zoomBy(-1)}>
              +
            </button>
            <button type="button" aria-label="축소" onClick={() => zoomBy(1)}>
              −
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
