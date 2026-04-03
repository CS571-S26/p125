export default function PaddedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-10">
      {children}
    </div>
  )
}