import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router'
import { FormErrors } from '@/components/FormErrors'
import { FormField } from '@/components/FormField'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { useLogin } from '@/hooks/useLogin'
import { getErrorMessages } from '@/lib/errors'

export function LoginPage() {
  const location = useLocation()
  const login = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  // Editing a field clears the errors.
  function handleChange(setter: (value: string) => void) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setter(event.target.value)
      setErrors([])
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrors([])
    login.mutate(
      { email: email.trim(), password },
      { onError: (error) => setErrors(getErrorMessages(error, 'Invalid email or password.')) },
    )
  }

  return (
    <>
      <PageHeader title="Log in" />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={handleChange(setEmail)}
        />
        <FormField
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={handleChange(setPassword)}
        />
        <FormErrors errors={errors} />
        <Button type="submit" disabled={login.isPending}>
          {login.isPending ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm">
        No account?{' '}
        <Link to="/signup" state={location.state} className="underline">
          Sign up
        </Link>
      </p>
    </>
  )
}
