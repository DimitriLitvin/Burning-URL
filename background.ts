import { addLink } from "./storageHelper"

// Create the context menu item on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-url-7days",
    title: "Save url for 7 days",
    contexts: ["link", "page"]
  })
})

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  let url = ""
  if (info.linkUrl) {
    url = info.linkUrl
  } else if (info.pageUrl) {
    url = info.pageUrl
  }
  if (url) {
    addLink(url)
  }
}) 