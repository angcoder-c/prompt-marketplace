export function Badge({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <span className={(className ?? '') + ' inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-200'}>{children}</span>
}

export default Badge
