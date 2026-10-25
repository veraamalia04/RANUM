// RANUM mascots in public/images/mascots; main.png is the sun with the graduation cap
export const MAIN_MASCOT = '/images/mascots/main.png'
export const MASCOTS = ['1', '2', '3', '4', 'main'].map((name) => `/images/mascots/${name}.png`)

// `count` different mascots in random order
export function randomMascots(count: number) {
  const pool = [...MASCOTS]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, count)
}
