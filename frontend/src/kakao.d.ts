interface KakaoLatLng {
  getLat(): number
  getLng(): number
}

interface KakaoLatLngBounds {
  extend(latlng: KakaoLatLng): void
}

interface KakaoSize {
  width: number
  height: number
}

interface KakaoPoint {
  x: number
  y: number
}

interface KakaoMarkerImage {
  getImageSrc(): string
}

interface KakaoMarker {
  setMap(map: KakaoMap | null): void
  setImage(image: KakaoMarkerImage): void
  setPosition(position: KakaoLatLng): void
  getPosition(): KakaoLatLng
}

interface KakaoPolyline {
  setMap(map: KakaoMap | null): void
  setPath(path: KakaoLatLng[]): void
}

interface KakaoCustomOverlay {
  setMap(map: KakaoMap | null): void
  setPosition(position: KakaoLatLng): void
  setContent(content: string | HTMLElement): void
}

interface KakaoInfoWindow {
  open(map: KakaoMap, marker: KakaoMarker): void
  close(): void
}

interface KakaoMap {
  setCenter(latlng: KakaoLatLng): void
  setLevel(level: number): void
  getLevel(): number
  setBounds(bounds: KakaoLatLngBounds): void
  relayout(): void
  panTo(latlng: KakaoLatLng): void
}

interface KakaoMaps {
  load(callback: () => void): void
  Map: new (
    container: HTMLElement,
    options: { center: KakaoLatLng; level: number },
  ) => KakaoMap
  LatLng: new (lat: number, lng: number) => KakaoLatLng
  LatLngBounds: new () => KakaoLatLngBounds
  Size: new (width: number, height: number) => KakaoSize
  Point: new (x: number, y: number) => KakaoPoint
  Marker: new (options: {
    position: KakaoLatLng
    image?: KakaoMarkerImage
    zIndex?: number
    title?: string
    clickable?: boolean
  }) => KakaoMarker
  MarkerImage: new (
    src: string,
    size: KakaoSize,
    options?: { offset?: KakaoPoint },
  ) => KakaoMarkerImage
  Polyline: new (options: {
    path: KakaoLatLng[]
    strokeWeight?: number
    strokeColor?: string
    strokeOpacity?: number
    strokeStyle?: string
    endArrow?: boolean
    zIndex?: number
  }) => KakaoPolyline
  CustomOverlay: new (options: {
    position: KakaoLatLng
    content: string | HTMLElement
    xAnchor?: number
    yAnchor?: number
    zIndex?: number
    clickable?: boolean
  }) => KakaoCustomOverlay
  InfoWindow: new (options: {
    content: string | HTMLElement
    zIndex?: number
  }) => KakaoInfoWindow
  event: {
    addListener(
      target: object,
      type: string,
      handler: (...args: unknown[]) => void,
    ): void
    removeListener(
      target: object,
      type: string,
      handler: (...args: unknown[]) => void,
    ): void
  }
}

interface Window {
  kakao?: {
    maps: KakaoMaps
  }
}
