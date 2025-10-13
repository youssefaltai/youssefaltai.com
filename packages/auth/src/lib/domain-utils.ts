/**
 * Domain utilities for handling localhost vs youssefaltai.local conversion
 */

/**
 * Converts localhost URLs to youssefaltai.local for local development
 * @param url - The URL to convert
 * @returns The converted URL with youssefaltai.local domain
 */
export function convertToLocalDomain(url: string): string {
  return url.replace('localhost', 'youssefaltai.local')
}

/**
 * Extracts and normalizes the origin from a request URL
 * @param requestUrl - The request URL string
 * @returns The normalized origin (youssefaltai.local for localhost)
 */
export function getNormalizedOrigin(requestUrl: string): string {
  const url = new URL(requestUrl)
  const origin = url.origin
  
  return origin.includes('localhost') 
    ? convertToLocalDomain(origin)
    : origin
}

/**
 * Extracts and normalizes the hostname from a request URL
 * @param requestUrl - The request URL string
 * @returns The normalized hostname (youssefaltai.local for localhost)
 */
export function getNormalizedHostname(requestUrl: string): string {
  const url = new URL(requestUrl)
  let hostname = url.hostname
  
  return hostname === 'localhost' 
    ? 'youssefaltai.local'
    : hostname
}

/**
 * Extracts the relying party ID from a hostname
 * @param hostname - The hostname to extract rpID from
 * @returns The relying party ID (parent domain)
 */
export function extractRpId(hostname: string): string {
  const parts = hostname.split('.')
  return parts.length > 2 
    ? parts.slice(-2).join('.')
    : hostname
}

/**
 * Gets the normalized relying party ID from a request URL
 * @param requestUrl - The request URL string
 * @returns The normalized relying party ID
 */
export function getNormalizedRpId(requestUrl: string): string {
  const hostname = getNormalizedHostname(requestUrl)
  return extractRpId(hostname)
}
