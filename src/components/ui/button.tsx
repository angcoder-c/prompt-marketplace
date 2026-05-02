import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'default' }

export function Button({ variant = 'default', children, ...rest }: Props) {
  const base = 'px-3 py-1 rounded '
  const cls = variant === 'primary' ? base + 'bg-blue-600 text-white' : base + 'border'
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  )
}

export default Button
