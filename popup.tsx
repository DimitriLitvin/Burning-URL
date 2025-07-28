import { useEffect, useState } from "react"
import { readLinks, addLink } from "./storageHelper"
import type { SavedLink } from "./storageHelper"

function formatDate(ts: number) {
  const d = new Date(ts)
  return d.toLocaleString()
}

function IndexPopup() {
  const [links, setLinks] = useState<SavedLink[]>([])
  const [currentUrl, setCurrentUrl] = useState<string>("")
  const [saving, setSaving] = useState(false)

  // Fetch saved links on mount
  useEffect(() => {
    readLinks().then(setLinks)
    // Get current tab's URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url) setCurrentUrl(tabs[0].url)
    })
  }, [])

  // Save current URL and refresh list
  const handleSave = async () => {
    if (!currentUrl) return
    setSaving(true)
    await addLink(currentUrl)
    setLinks(await readLinks())
    setSaving(false)
  }

  return (
    <div style={{ padding: 16, minWidth: 350 }}>
      <div style={{ marginBottom: 12, fontWeight: 600 }}>
        Save links for 7 days before they self-destruct.
      </div>
      <button onClick={handleSave} disabled={saving || !currentUrl} style={{ marginBottom: 16 }}>
        {saving ? "Saving..." : "Save current URL"}
      </button>
      <div>
        {links.length === 0 ? (
          <div>No links saved yet.</div>
        ) : (
          links.map((link, idx) => (
            <div key={link.url + link.savedAt} style={{ marginBottom: 8 }}>
              <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ wordBreak: "break-all" }}>
                {link.url}
              </a>
              <div style={{ fontSize: 12, color: "#888" }}>Saved: {formatDate(link.savedAt)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default IndexPopup
