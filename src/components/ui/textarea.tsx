export function Textarea(props: React.ComponentProps<'textarea'>) {
  return <textarea {...props} className={(props.className ?? '') + ' border px-3 py-2 rounded'} />
}

export default Textarea
