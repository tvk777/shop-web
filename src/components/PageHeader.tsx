import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  actions?: ReactNode
}

export function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
