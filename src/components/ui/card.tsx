export function Card({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <div className={(className ?? '') + ' border rounded bg-white p-4 shadow-sm'}>{children}</div>
}

export default Card
