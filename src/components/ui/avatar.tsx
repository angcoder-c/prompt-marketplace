import React from 'react'

type AvatarProps = { src?: string | null; alt?: string; className?: string; children?: React.ReactNode }

export function Avatar({ src, alt, className, children }: AvatarProps) {
  return (
    <div className={`inline-block rounded-full overflow-hidden bg-gray-200 ${className ?? 'w-8 h-8'}`}>
      {src ? <img src={src} alt={alt ?? 'avatar'} className="w-full h-full object-cover" /> : children ? <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">{children}</div> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">U</div>}
    </div>
  )
}

export function AvatarImage({ src, alt }: { src?: string | null; alt?: string }) {
  return <img src={src ?? ''} alt={alt ?? 'avatar'} className="w-full h-full object-cover" />
}

export function AvatarFallback({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}

export default Avatar
