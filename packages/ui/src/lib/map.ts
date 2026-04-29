import mapboxgl from "mapbox-gl"

export type MapImage = {
  src: string
  lng: number
  lat: number
}

const POPUP_ANIMATION_MS = 80
const THUMB_SIZE = 128

export function thumbUrl(src: string) {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${THUMB_SIZE}&q=75`
}

export function createMarkerWithPopup(
  map: mapboxgl.Map,
  imageUrl: string,
  lngLat: [number, number]
) {
  const el = document.createElement("div")
  el.className = "map-image-marker"
  el.style.width = "4rem"
  el.style.height = "4rem"
  el.style.borderRadius = "33%"
  el.style.overflow = "hidden"
  el.style.border = "4px solid var(--muted)"
  el.style.cursor = "pointer"

  const img = document.createElement("img")
  img.src = thumbUrl(imageUrl)
  img.alt = "Photo"
  img.loading = "lazy"
  img.style.width = "100%"
  img.style.height = "100%"
  img.style.objectFit = "cover"
  el.appendChild(img)

  const popupContent = document.createElement("div")
  popupContent.className = "map-fullscreen-popup-content"
  const popupImg = document.createElement("img")
  popupImg.alt = "Photo"
  popupImg.className = "map-fullscreen-popup-img"
  popupContent.appendChild(popupImg)

  const popup = new mapboxgl.Popup({
    className: "map-fullscreen-popup",
    offset: 0,
    closeOnClick: false,
  }).setDOMContent(popupContent)

  const onBackdropClick = (e: MouseEvent) => {
    if (e.target !== popupContent) return
    const popupEl = document.querySelector(".map-fullscreen-popup")
    popupEl?.classList.remove("map-fullscreen-popup-visible")
    setTimeout(() => popup.remove(), POPUP_ANIMATION_MS)
  }

  popup.on("open", () => {
    if (!popupImg.src) popupImg.src = imageUrl
    const popupEl = document.querySelector(".map-fullscreen-popup")
    if (popupEl?.parentElement) document.body.appendChild(popupEl)
    popupEl?.classList.remove("map-fullscreen-popup-visible")
    popupContent.addEventListener("click", onBackdropClick)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        popupEl?.classList.add("map-fullscreen-popup-visible")
      })
    })
  })

  popup.on("close", () => {
    popupContent.removeEventListener("click", onBackdropClick)
    document
      .querySelector(".map-fullscreen-popup")
      ?.classList.remove("map-fullscreen-popup-visible")
  })

  return new mapboxgl.Marker({ element: el })
    .setLngLat(lngLat)
    .setPopup(popup)
    .addTo(map)
}
