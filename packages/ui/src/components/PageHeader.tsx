interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

/**
 * Page header component with title, optional subtitle, and actions
 * Provides consistent header styling across all pages
 */
export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-ios-title-1 font-bold text-ios-label-primary">{title}</h1>
          {subtitle && <p className="text-ios-body text-ios-gray-1 mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex gap-3">{actions}</div>}
      </div>
    </div>
  )
}

