import React from 'react'

export default function SidebarLink({ href, children }: { href: string; children?: React.ReactNode }) {
  return (
    <a href={href} className="text-sm text-gray-700 hover:underline">
      {children}
    </a>
  )
}
