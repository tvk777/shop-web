export function FormErrors({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null
  return (
    <div role="alert" className="flex flex-col gap-1 text-sm text-destructive">
      {errors.map((message) => (
        <p key={message}>{message}</p>
      ))}
    </div>
  )
}
