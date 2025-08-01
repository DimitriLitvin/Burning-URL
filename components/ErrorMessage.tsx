import type { FC } from "react"
import { errorStyle } from "../styles"

interface ErrorMessageProps {
  message: string | null
}

export const ErrorMessage: FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null
  return <div style={errorStyle}>Error: {message}</div>
}
