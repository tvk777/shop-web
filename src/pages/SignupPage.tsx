import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router'
import { FormErrors } from '@/components/FormErrors'
import { FormField } from '@/components/FormField'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { useSignup } from '@/hooks/useSignup'
import { getErrorMessages } from '@/lib/errors'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function SignupPage() {
  useDocumentTitle('Sign up')
  const location = useLocation()
  const signup = useSignup()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
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
    if (password !== passwordConfirmation) {
      setErrors(['Passwords do not match.'])
      return
    }
    setErrors([])
    signup.mutate(
      {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
      },
      { onError: (error) => setErrors(getErrorMessages(error)) },
    )
  }

  return (
    <>
      <PageHeader title="Sign up" />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          label="First name"
          autoComplete="given-name"
          required
          value={firstName}
          onChange={handleChange(setFirstName)}
        />
        <FormField
          label="Last name"
          autoComplete="family-name"
          required
          value={lastName}
          onChange={handleChange(setLastName)}
        />
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
          autoComplete="new-password"
          required
          value={password}
          onChange={handleChange(setPassword)}
        />
        <FormField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          required
          value={passwordConfirmation}
          onChange={handleChange(setPasswordConfirmation)}
        />
        <FormErrors errors={errors} />
        <Button type="submit" disabled={signup.isPending}>
          {signup.isPending ? 'Creating account…' : 'Sign up'}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm">
        Already have an account?{' '}
        <Link to="/login" state={location.state} className="underline">
          Log in
        </Link>
      </p>
    </>
  )
}
