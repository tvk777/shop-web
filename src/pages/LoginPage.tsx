import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation } from 'react-router'
import { FormErrors } from '@/components/FormErrors'
import { FormField } from '@/components/FormField'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { useLogin } from '@/hooks/useLogin'
import { getErrorMessages } from '@/lib/errors'
import { loginSchema } from '@/lib/schemas'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function LoginPage() {
  useDocumentTitle('Log in')
  const location = useLocation()
  const login = useLogin()
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })
  const { errors } = formState
  const [serverErrors, setServerErrors] = useState<string[]>([])

  return (
    <>
      <PageHeader title="Log in" />
      {/* onChange bubbles from every field: editing the form clears the server errors. */}
      <form
        noValidate
        onSubmit={handleSubmit((values) => {
          setServerErrors([])
          login.mutate(values, {
            onError: (error) =>
              setServerErrors(getErrorMessages(error, 'Invalid email or password.')),
          })
        })}
        onChange={() => setServerErrors([])}
        className="flex flex-col gap-4"
      >
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          required
          error={errors.email?.message}
          {...register('email')}
        />
        <FormField
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          error={errors.password?.message}
          {...register('password')}
        />
        <FormErrors errors={serverErrors} />
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
