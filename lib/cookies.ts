// Simple utility functions for managing cookies on the client side

/**
 * Set a cookie with the given name, value, and optional options
 */
export function setCookie(name: string, value: string, days?: number): void {
  let expires = ""
  if (days) {
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    expires = "; expires=" + date.toUTCString()
  }
  // Add secure and SameSite flags for better security
  document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Lax"
}

/**
 * Get a cookie by name
 */
export function getCookie(name: string): string | null {
  const nameEQ = name + "="
  const ca = document.cookie.split(";")
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === " ") c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length))
  }
  return null
}

/**
 * Remove a cookie by name
 */
export function removeCookie(name: string): void {
  setCookie(name, "", -1)
}
