// The key used to store the list of links in chrome.storage.local
const LINKS_KEY = "savedLinks"

// Represents a saved link with its URL and the time it was saved
export type SavedLink = { url: string; savedAt: number }

/**
 * Fetches the list of saved links (with timestamps) from chrome.storage.local.
 */
export async function readLinks(): Promise<SavedLink[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get([LINKS_KEY], (result) => {
      resolve(result[LINKS_KEY] || [])
    })
  })
}

/**
 * Adds a new URL to the list of saved links with the current timestamp.
 * If the URL already exists, it replaces the old entry with the new timestamp.
 */
export async function addLink(url: string): Promise<void> {
  const links = await readLinks()
  // Remove any existing entry with the same URL
  const filteredLinks = links.filter(link => link.url !== url)
  // Add the new entry with the current timestamp
  filteredLinks.push({ url, savedAt: Date.now() })
  return new Promise((resolve) => {
    chrome.storage.local.set({ [LINKS_KEY]: filteredLinks }, () => {
      resolve()
    })
  })
} 