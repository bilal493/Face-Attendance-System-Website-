/**
 * Set a cookie with the given name, value, and optional options
 */
export function setCookie(name: string, value: string, days?: number): void {
  console.log(`Setting cookie: ${name}=${value}, expires in ${days} days`)

  // Use the most basic and reliable cookie format
  const maxAge = days ? days * 24 * 60 * 60 : undefined
  const cookieValue = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge || 86400}`

  console.log("Setting cookie with:", cookieValue)
  document.cookie = cookieValue

  // Log the current cookies for debugging
  console.log("Current cookies after setting:", document.cookie)
}

/**
 * Get a cookie by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    console.log(`getCookie: document is undefined, can't get cookie ${name}`)
    return null
  }

  console.log("All cookies:", document.cookie)

  const nameEQ = name + "="
  const ca = document.cookie.split(";")
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === " ") c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) {
      const value = decodeURIComponent(c.substring(nameEQ.length, c.length))
      console.log(`Found cookie ${name}=${value}`)
      return value
    }
  }

  console.log(`Cookie ${name} not found`)
  return null
}

/**
 * Remove a cookie by name
 */
export function removeCookie(name: string): void {
  console.log(`Removing cookie: ${name}`)
  // Set an expired cookie to remove it - using the most basic format
  document.cookie = `${name}=; path=/; max-age=0`
  console.log("Cookies after removal:", document.cookie)
}
