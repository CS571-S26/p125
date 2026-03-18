interface SectionHeaderProps {
  number: string
  title: string
  description?: string
}

export function SectionHeader({ number, title, description }: SectionHeaderProps) {
  return (
    <div className="mb-10">
      <p className="text-xs text-muted-foreground tracking-widest font-(family-name:--font-jetbrains-mono) mb-1">
        {number}.
      </p>
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      {description && (
        <p className="mt-2 text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
