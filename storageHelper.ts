// The key used to store the list of links in chrome.storage.local
const LINKS_KEY = "savedLinks"

// Represents a saved link with its URL and the time it was saved
export type SavedLink = { url: string; savedAt: number }

/**
 * Validates if an object is a valid SavedLink
 */
const validateLink = (link: any): link is SavedLink => {
  return (
    typeof link === 'object' &&
    link !== null &&
    typeof link.url === 'string' &&
    typeof link.savedAt === 'number' &&
    !isNaN(link.savedAt) &&
    link.url.length > 0
  )
}

/**
 * Fetches the list of saved links (with timestamps) from chrome.storage.local.
 */
export async function readLinks(): Promise<SavedLink[]> {
  try {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([LINKS_KEY], (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(`Storage read failed: ${chrome.runtime.lastError.message}`))
        } else {
          const links = result[LINKS_KEY] || []
          // Validate all links and filter out invalid ones
          const validLinks = links.filter(validateLink)
          if (validLinks.length !== links.length) {
            console.warn(`Filtered out ${links.length - validLinks.length} invalid links`)
          }
          resolve(validLinks)
        }
      })
    })
  } catch (error) {
    console.error('Failed to read links:', error)
    return []
  }
}

/**
 * Adds a new URL to the list of saved links with the current timestamp.
 * If the URL already exists, it replaces the old entry with the new timestamp.
 */
export async function addLink(url: string): Promise<void> {
  try {
    // Validate URL before saving
    new URL(url) // Throws if invalid URL
    
    const links = await readLinks()
    // Remove any existing entry with the same URL
    const filteredLinks = links.filter(link => link.url !== url)
    // Add the new entry with the current timestamp
    filteredLinks.push({ url, savedAt: Date.now() })
    
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [LINKS_KEY]: filteredLinks }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(`Storage write failed: ${chrome.runtime.lastError.message}`))
        } else {
          resolve()
        }
      })
    })
  } catch (error) {
    console.error('Failed to add link:', error)
    throw new Error(`Failed to save URL: ${error instanceof Error ? error.message : 'Invalid URL'}`)
  }
}

/**
 * Removes expired links (older than 7 days) from storage.
 */
export async function removeExpiredLinks(): Promise<void> {
  try {
    const links = await readLinks()
    const now = Date.now()
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000
    
    // Keep only links that are less than 7 days old
    const validLinks = links.filter(link => (now - link.savedAt) < sevenDaysInMs)
    
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [LINKS_KEY]: validLinks }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(`Storage cleanup failed: ${chrome.runtime.lastError.message}`))
        } else {
          resolve()
        }
      })
    })
  } catch (error) {
    console.error('Failed to remove expired links:', error)
    throw error
  }
}

/**
 * Removes a specific URL from storage.
 */
export async function removeLink(urlToRemove: string): Promise<void> {
  try {
    const links = await readLinks()
    const filteredLinks = links.filter(link => link.url !== urlToRemove)
    
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [LINKS_KEY]: filteredLinks }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(`Storage delete failed: ${chrome.runtime.lastError.message}`))
        } else {
          resolve()
        }
      })
    })
  } catch (error) {
    console.error('Failed to remove link:', error)
    throw new Error(`Failed to delete URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
} 