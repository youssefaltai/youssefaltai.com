// Shared UI components and design system (Apple-inspired)

// Base Components
export { Button } from './components/Button'
export { Card, CardSection, ListItem } from './components/Card'
export { Input, Textarea, Select } from './components/Input'
export { CurrencySelect } from './components/CurrencySelect'
export { BiometricLoginForm } from './components/BiometricLoginForm'
export { PageHeader } from './components/PageHeader'
export { FloatingActionButton } from './components/FloatingActionButton'
export { EmptyState } from './components/EmptyState'
export { ProgressBar } from './components/ProgressBar'
export { Switch } from './components/Switch'
export { BottomNav } from './components/BottomNav'
export type { NavItem } from './components/BottomNav'
export { Modal } from './components/Modal'
export { Money } from './components/Money'
export { SegmentedControl } from './components/SegmentedControl'
export type { SegmentedControlOption } from './components/SegmentedControl'

// Form Components
export { NumberInput } from './components/NumberInput'
export { GroupedSelect } from './components/GroupedSelect'
export type { GroupedSelectOption, GroupedSelectGroup } from './components/GroupedSelect'
export { DateRangePicker } from './components/DateRangePicker'
export type { DateRange } from './components/DateRangePicker'
export { FormActions } from './components/FormActions'
export { ChipSelect } from './components/ChipSelect'
export type { ChipSelectOption } from './components/ChipSelect'

// Layout & Structure Components
export { PageLayout } from './components/PageLayout'
export { LoadingSkeleton } from './components/LoadingSkeleton'
export { GroupedList } from './components/GroupedList'
export { EntityList } from './components/EntityList'
export { EntityListItem } from './components/EntityListItem'

// Dashboard & Widget Components
export { DashboardWidget, WidgetStat } from './components/DashboardWidget'
export type { DashboardWidgetProps } from './components/DashboardWidget'
export { StatCard } from './components/StatCard'
export { ActionGrid } from './components/ActionGrid'
export type { ActionGridAction } from './components/ActionGrid'
export { ToggleList } from './components/ToggleList'
export type { ToggleListItem } from './components/ToggleList'

// Specialized Components
export { TransferItem } from './components/TransferItem'
export { ProgressCard } from './components/ProgressCard'

// Utility Components
export { Section } from './components/Section'
export { Divider } from './components/Divider'
export { Badge } from './components/Badge'
export { Tabs } from './components/Tabs'
export type { Tab } from './components/Tabs'

// Icons (lucide-react) - re-export for convenience
export * from 'lucide-react'
