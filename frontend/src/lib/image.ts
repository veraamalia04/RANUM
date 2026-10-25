// Scale an image file down to fit `max` px (optionally center-cropped to a square) and return a JPEG data URL,
// the only image format the backend accepts
export async function resizeImage(file: File, max: number, square = false) {
  const img = await createImageBitmap(file)
  const side = Math.min(img.width, img.height)
  const [sx, sy, sw, sh] = square
    ? [(img.width - side) / 2, (img.height - side) / 2, side, side]
    : [0, 0, img.width, img.height]
  const scale = Math.min(1, max / Math.max(sw, sh))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(sw * scale)
  canvas.height = Math.round(sh * scale)
  const ctx = canvas.getContext('2d')!
  // Transparent PNGs would turn black in a JPEG
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.85)
}
