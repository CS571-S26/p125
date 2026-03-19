export function playSound(name: string, isMuted: boolean): void {
  if (isMuted) return
  try {
    new Audio(`/sounds/${name}.mp3`).play()
  } catch {
    // ignore playback errors (e.g. before user interaction)
  }
}
