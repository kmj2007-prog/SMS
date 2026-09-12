const SCRIPT_ID = 'kakao-maps-sdk'

export const KAKAO_APP_KEY = String(import.meta.env.VITE_KAKAO_MAP_APP_KEY ?? '').trim()

let loadPromise: Promise<KakaoMaps> | null = null

export function getKakaoMaps(): KakaoMaps {
  const maps = window.kakao?.maps
  if (!maps) throw new Error('Kakao maps SDK is not loaded')
  return maps
}

export function loadKakaoMaps(): Promise<KakaoMaps> {
  if (!KAKAO_APP_KEY) {
    return Promise.reject(new Error('NO_KEY'))
  }
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    const finish = () => {
      const maps = window.kakao?.maps
      if (!maps) {
        loadPromise = null
        reject(new Error('LOAD_FAIL'))
        return
      }
      maps.load(() => resolve(maps))
    }

    if (window.kakao?.maps) {
      finish()
      return
    }

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', finish, { once: true })
      existing.addEventListener(
        'error',
        () => {
          loadPromise = null
          existing.remove()
          reject(new Error('LOAD_FAIL'))
        },
        { once: true },
      )
      return
    }

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.async = true
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(KAKAO_APP_KEY)}&autoload=false`
    script.onload = finish
    script.onerror = () => {
      loadPromise = null
      script.remove()
      reject(new Error('LOAD_FAIL'))
    }
    document.head.appendChild(script)
  })

  return loadPromise
}

export function resetKakaoLoader() {
  loadPromise = null
  document.getElementById(SCRIPT_ID)?.remove()
}

function pinSvg(fill: string, stroke = '#fff') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
    <path fill="${fill}" stroke="${stroke}" stroke-width="2"
      d="M14 2c-6.6 0-12 5.2-12 11.6 0 8.4 12 24.4 12 24.4s12-16 12-24.4C26 7.2 20.6 2 14 2z"/>
    <circle cx="14" cy="13" r="4.2" fill="${stroke}"/>
  </svg>`
}

function destSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
    <circle cx="11" cy="11" r="9" fill="#1f3d2b" stroke="#fff" stroke-width="2"/>
    <circle cx="11" cy="11" r="3.2" fill="#fff"/>
  </svg>`
}

function infraSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
    <rect x="2" y="2" width="18" height="18" rx="4" fill="#2f6fed" stroke="#fff" stroke-width="2"/>
  </svg>`
}

function toDataUri(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export function buildingMarkerImage(maps: KakaoMaps, selected: boolean) {
  const w = selected ? 34 : 28
  const h = selected ? 48 : 40
  const color = selected ? '#b01030' : '#dc143c'
  return new maps.MarkerImage(
    toDataUri(pinSvg(color)),
    new maps.Size(w, h),
    { offset: new maps.Point(w / 2, h) },
  )
}

export function destMarkerImage(maps: KakaoMaps) {
  return new maps.MarkerImage(
    toDataUri(destSvg()),
    new maps.Size(22, 22),
    { offset: new maps.Point(11, 11) },
  )
}

export function infraMarkerImage(maps: KakaoMaps) {
  return new maps.MarkerImage(
    toDataUri(infraSvg()),
    new maps.Size(22, 22),
    { offset: new maps.Point(11, 11) },
  )
}
