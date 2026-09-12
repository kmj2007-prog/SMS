const SCRIPT_ID = 'kakao-maps-sdk'

export const KAKAO_APP_KEY = String(import.meta.env.VITE_KAKAO_MAP_APP_KEY ?? '').trim()

let loadPromise: Promise<KakaoMaps> | null = null

export function getKakaoMaps(): KakaoMaps {
  const maps = window.kakao?.maps
  if (!maps) throw new Error('Kakao maps SDK is not loaded')
  return maps
}

export function loadKakaoMaps(): Promise<KakaoMaps> {
  if (!KAKAO_APP_KEY) return Promise.reject(new Error('NO_KEY'))
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

function toDataUri(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function pinSvg(fill: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
    <path fill="${fill}" stroke="#fff" stroke-width="2"
      d="M14 2c-6.6 0-12 5.2-12 11.6 0 8.4 12 24.4 12 24.4s12-16 12-24.4C26 7.2 20.6 2 14 2z"/>
    <circle cx="14" cy="13" r="4.2" fill="#fff"/>
  </svg>`
}

export function buildingMarkerImage(maps: KakaoMaps, selected: boolean) {
  const w = selected ? 34 : 28
  const h = selected ? 48 : 40
  return new maps.MarkerImage(
    toDataUri(pinSvg(selected ? '#b01030' : '#dc143c')),
    new maps.Size(w, h),
    { offset: new maps.Point(w / 2, h) },
  )
}

export function destMarkerImage(maps: KakaoMaps) {
  return new maps.MarkerImage(
    toDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
      <circle cx="11" cy="11" r="9" fill="#1f3d2b" stroke="#fff" stroke-width="2"/>
      <circle cx="11" cy="11" r="3.2" fill="#fff"/>
    </svg>`),
    new maps.Size(22, 22),
    { offset: new maps.Point(11, 11) },
  )
}

const INFRA_ICON_PATH: Record<string, string> = {
  gym: 'M1 6.5h1.5v3H1v-3Zm2 0h1v3H3v-3Zm2-.8h6v4.6H5V5.7Zm7 .8h1v3h-1v-3Zm2 0H16v3h-1.5v-3Z',
  cinema:
    'M2 4h12v8H2V4Zm1.4 1.3v1.1h1.2V5.3H3.4Zm0 2.2v1.1h1.2V7.5H3.4Zm0 2.2v1.1h1.2v-1.1H3.4ZM11.4 5.3v1.1h1.2V5.3h-1.2Zm0 2.2v1.1h1.2V7.5h-1.2Zm0 2.2v1.1h1.2v-1.1h-1.2Z',
  park: 'M8 1.2 12.6 8H10l2.2 4.2H3.8L6 8H3.4L8 1.2ZM7.2 12.4h1.6V14.6H7.2z',
  library:
    'M3 2.5h8.2c.9 0 1.6.7 1.6 1.6V13H5.2c-.9 0-1.6-.7-1.6-1.6V3.2c0-.4-.3-.7-.6-.7H3V2.5Zm1.6 1.2v7.4c0 .3.2.5.5.5h6.1V4.2H4.6Z',
}

export function infraMarkerImage(maps: KakaoMaps, kind = 'gym') {
  const icon = INFRA_ICON_PATH[kind] ?? INFRA_ICON_PATH.gym
  return new maps.MarkerImage(
    toDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26">
      <circle cx="13" cy="13" r="11" fill="#2f6fed" stroke="#fff" stroke-width="2"/>
      <g fill="#fff" transform="translate(5 5)">${`<path d="${icon}"/>`}</g>
    </svg>`),
    new maps.Size(26, 26),
    { offset: new maps.Point(13, 13) },
  )
}
