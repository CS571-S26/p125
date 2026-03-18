import { Badge } from "@/components/ui/badge"

interface TechBadgeProps {
  tech: string
}

export function TechBadge({ tech }: TechBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className="text-xs tracking-wide font-(family-name:--font-jetbrains-mono) font-normal"
    >
      {tech}
    </Badge>
  )
}
