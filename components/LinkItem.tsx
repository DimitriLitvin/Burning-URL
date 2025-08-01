import type { FC } from "react"
import type { SavedLink } from "../storageHelper"
import { formatCountdown } from "../utils"
import {
  linkItemStyle,
  linkInfoStyle,
  linkAnchorStyle,
  countdownStyle,
  deleteButtonStyle
} from "../styles"

export interface LinkItemProps {
  link: SavedLink
  onDelete: (url: string) => void
}

export const LinkItem: FC<LinkItemProps> = ({ link, onDelete }) => {
  return (
    <div style={linkItemStyle}>
      <div style={linkInfoStyle}>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          style={linkAnchorStyle}
        >
          {link.url}
        </a>
        <div style={countdownStyle}>Time left: {formatCountdown(link.savedAt)}</div>
      </div>
      <button onClick={() => onDelete(link.url)} style={deleteButtonStyle}>
        Delete
      </button>
    </div>
  )
}
