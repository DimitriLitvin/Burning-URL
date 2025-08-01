import { useEffect, useState } from "react"
import { readLinks, addLink, removeExpiredLinks, removeLink } from "./storageHelper"
import type { SavedLink } from "./storageHelper"

function formatDate(ts: number) {
  const d = new Date(ts)
  return d.toLocaleString()
}

function formatCountdown(savedAt: number): string {
  const now = Date.now()
  const timeRemaining = (savedAt + 7 * 24 * 60 * 60 * 1000) - now // 7 days in milliseconds
  
  if (timeRemaining <= 0) {
    return "Expired"
  }
  
  const days = Math.floor(timeRemaining / (24 * 60 * 60 * 1000))
  const hours = Math.floor((timeRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000))
  const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000)
  
  return `${days}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Check if extension has required permissions
 */
const checkPermissions = async (): Promise<boolean> => {
  try {
    const permissions = await chrome.permissions.getAll()
    const required = ['storage', 'tabs', 'activeTab', 'contextMenus']
    const missing = required.filter(p => !permissions.permissions?.includes(p))
    
    if (missing.length > 0) {
      console.error(`Missing permissions: ${missing.join(', ')}`)
      return false
    }
    return true
  } catch (error) {
    console.error('Permission check failed:', error)
    return false
  }
}

function IndexPopup() {
  const [links, setLinks] = useState<SavedLink[]>([])
  const [currentUrl, setCurrentUrl] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch saved links on mount
  useEffect(() => {
    const initializeExtension = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Check permissions first
        const hasPermissions = await checkPermissions()
        if (!hasPermissions) {
          setError("Extension permissions are missing. Please reload the extension.")
          return
        }
        
        // Load saved links
        const savedLinks = await readLinks()
        setLinks(savedLinks)
        
        // Get current tab's URL
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (chrome.runtime.lastError) {
            console.error('Failed to get current tab:', chrome.runtime.lastError)
            setError("Failed to get current tab URL. Please refresh the page.")
            return
          }
          if (tabs[0]?.url) {
            setCurrentUrl(tabs[0].url)
          } else {
            setError("No active tab found. Please refresh the page.")
          }
        })
      } catch (error) {
        console.error('Failed to initialize extension:', error)
        setError("Failed to load saved links. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    
    initializeExtension()
  }, [])

  // Update countdown every second and remove expired links
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    try {
      interval = setInterval(async () => {
        try {
          setCountdown(Date.now())
          await removeExpiredLinks()
          const updatedLinks = await readLinks()
          setLinks(updatedLinks)
        } catch (error) {
          console.error('Countdown update failed:', error)
          // Don't show error to user for background operations
        }
      }, 1000)
    } catch (error) {
      console.error('Failed to start countdown timer:', error)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [])

  // Save current URL and refresh list
  const handleSave = async () => {
    if (!currentUrl) return
    
    try {
      setSaving(true)
      setError(null)
      
      await addLink(currentUrl)
      const updatedLinks = await readLinks()
      setLinks(updatedLinks)
    } catch (error) {
      console.error('Failed to save URL:', error)
      setError(error instanceof Error ? error.message : "Failed to save URL. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  // Delete a specific URL
  const handleDelete = async (urlToDelete: string) => {
    try {
      setError(null)
      await removeLink(urlToDelete)
      const updatedLinks = await readLinks()
      setLinks(updatedLinks)
    } catch (error) {
      console.error('Failed to delete URL:', error)
      setError(error instanceof Error ? error.message : "Failed to delete URL. Please try again.")
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 16, minWidth: 350 }}>
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: 16, minWidth: 350 }}>
      <div style={{ marginBottom: 12, fontWeight: 600 }}>
        Save links for 7 days before they self-destruct.
      </div>
      
      {error && (
        <div style={{ 
          color: 'red', 
          marginBottom: 12, 
          padding: '8px', 
          backgroundColor: '#ffebee', 
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          Error: {error}
        </div>
      )}
      
      <button 
        onClick={handleSave} 
        disabled={saving || !currentUrl} 
        style={{ marginBottom: 16 }}
      >
        {saving ? "Saving..." : "Save current URL"}
      </button>
      
      <div>
        {links.length === 0 ? (
          <div>No links saved yet.</div>
        ) : (
          links.map((link, idx) => (
            <div key={link.url + link.savedAt} style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ wordBreak: "break-all" }}>
                  {link.url}
                </a>
                <div style={{ fontSize: 12, color: "#888" }}>
                  Time left: {formatCountdown(link.savedAt)}
                </div>
              </div>
              <button 
                onClick={() => handleDelete(link.url)}
                style={{ 
                  marginLeft: 8, 
                  padding: '4px 8px', 
                  fontSize: '12px',
                  backgroundColor: '#ff4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default IndexPopup
