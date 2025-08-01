import type { CSSProperties } from "react"

export const containerStyle: CSSProperties = { padding: 16, minWidth: 350 }
export const titleStyle: CSSProperties = { marginBottom: 12, fontWeight: 600 }
export const errorStyle: CSSProperties = {
  color: "red",
  marginBottom: 12,
  padding: "8px",
  backgroundColor: "#ffebee",
  borderRadius: "4px",
  fontSize: "14px"
}
export const saveButtonStyle: CSSProperties = { marginBottom: 16 }
export const linkItemStyle: CSSProperties = {
  marginBottom: 8,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start"
}
export const linkInfoStyle: CSSProperties = { flex: 1 }
export const linkAnchorStyle: CSSProperties = { wordBreak: "break-all" }
export const countdownStyle: CSSProperties = { fontSize: 12, color: "#888" }
export const deleteButtonStyle: CSSProperties = {
  marginLeft: 8,
  padding: "4px 8px",
  fontSize: "12px",
  backgroundColor: "#ff4444",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer"
}
