export function Input(props: React.ComponentProps<'input'>) {
  return <input {...props} className={(props.className ?? '') + ' border px-3 py-2 rounded'} />
}

export default Input
