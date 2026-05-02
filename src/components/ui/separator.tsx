type Props = { className?: string }
export function Separator({ className }: Props) {
  return <div className={`${className ?? ''} my-3 h-px bg-gray-200 w-full`} />
}

export default Separator
