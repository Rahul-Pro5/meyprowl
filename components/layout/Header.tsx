import { ReactNode } from "react"

interface HeaderProps {
  title: string
  actions?: ReactNode
}

export function Header({ title, actions }: HeaderProps) {
  return (
    <div className="flex items-center justify-between h-14 px-6 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <h1 className="text-base font-semibold">{title}</h1>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
