import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation } from 'react-router'
import { FormErrors } from '@/components/FormErrors'
import { FormField } from '@/components/FormField'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { useSignup } from '@/hooks/useSignup'
import { getErrorMessages } from '@/lib/errors'
import { signupSchema } from '@/lib/schemas'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function SignupPage() {
  useDocumentTitle('Sign up')
  const location = useLocation()
  const signup = useSignup()
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })
  const { errors } = formState
  const [serverErrors, setServerErrors] = useState<string[]>([])

  return (
    <>
      <PageHeader title="Sign up" />
      {/* onChange bubbles from every field: editing the form clears the server errors. */}
      <form
        noValidate
        onSubmit={handleSubmit((values) => {
          setServerErrors([])
          signup.mutate(values, { onError: (error) => setServerErrors(getErrorMessages(error)) })
        })}
        onChange={() => setServerErrors([])}
        className="flex flex-col gap-4"
      >
        <FormField
          label="First name"
          autoComplete="given-name"
          required
          error={errors.first_name?.message}
          {...register('first_name')}
        />
        <FormField
          label="Last name"
          autoComplete="family-name"
          required
          error={errors.last_name?.message}
          {...register('last_name')}
        />
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          required
          error={errors.email?.message}
          {...register('email')}
        />
        {/* deps: changing the password re-checks the confirmation. */}
        <FormField
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          error={errors.password?.message}
          {...register('password', { deps: 'password_confirmation' })}
        />
        <FormField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          required
          error={errors.password_confirmation?.message}
          {...register('password_confirmation')}
        />
        <FormErrors errors={serverErrors} />
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
