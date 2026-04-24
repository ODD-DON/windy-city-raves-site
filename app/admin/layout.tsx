export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth checks are done in middleware and individual pages
  // Layout just wraps the children
  return <>{children}</>
}
