import Link from "next/link"

export function PortalFooter() {
  return (
    <footer className="border-t border-border bg-muted px-6 py-3">
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Link href="#" className="hover:text-primary">References</Link>
        <span>|</span>
        <Link href="#" className="hover:text-primary">FAQs</Link>
        <span>|</span>
        <Link href="#" className="hover:text-primary">Archive</Link>
        <span>|</span>
        <span>
          <span className="font-bold text-primary">Knowledge</span>
          <span className="font-bold text-accent">Hub</span>
          {" \u00A9 2026 All rights reserved"}
        </span>
      </div>
    </footer>
  )
}
