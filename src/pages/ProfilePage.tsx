import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { User } from '@/api/types'
import { FormErrors } from '@/components/FormErrors'
import { FormField } from '@/components/FormField'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { useUpdateProfile } from '@/hooks/useUpdateProfile'
import { getErrorMessages } from '@/lib/errors'
import { passwordSchema, profileSchema } from '@/lib/schemas'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

function personalData(user: User) {
  return { first_name: user.first_name, last_name: user.last_name, email: user.email }
}

// Each form has its own mutation, so pending state and errors never mix between them.
function PersonalDataForm({ user }: { user: User }) {
  const updateProfile = useUpdateProfile()
  const { register, handleSubmit, formState, reset } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: personalData(user),
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })
  const { errors, isDirty } = formState
  const [serverErrors, setServerErrors] = useState<string[]>([])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal data</CardTitle>
        <CardAction>
          <Badge variant="secondary">{user.role}</Badge>
        </CardAction>
      </CardHeader>
      {/* onChange bubbles from every field: editing the form clears the server errors. */}
      <form
        noValidate
        onSubmit={handleSubmit((values) => {
          setServerErrors([])
          updateProfile.mutate(values, {
            // The saved user becomes the new baseline, so Save is disabled again.
            onSuccess: (saved) => reset(personalData(saved)),
            onError: (error) => setServerErrors(getErrorMessages(error)),
          })
        })}
        onChange={() => setServerErrors([])}
        className="flex flex-col gap-6"
      >
        <CardContent className="flex flex-col gap-4">
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
          <FormErrors errors={serverErrors} />
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={updateProfile.isPending || !isDirty}>
            {updateProfile.isPending ? 'Saving…' : 'Save'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

function PasswordForm() {
  const updateProfile = useUpdateProfile()
  const { register, handleSubmit, formState, reset } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: '', password: '', password_confirmation: '' },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })
  const { errors } = formState
  const [serverErrors, setServerErrors] = useState<string[]>([])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
      </CardHeader>
      <form
        noValidate
        onSubmit={handleSubmit((values) => {
          setServerErrors([])
          updateProfile.mutate(values, {
            // Only local form state here; the cache update and the toast are in the hook.
            onSuccess: () => reset(),
            onError: (error) => setServerErrors(getErrorMessages(error)),
          })
        })}
        onChange={() => setServerErrors([])}
        className="flex flex-col gap-6"
      >
        <CardContent className="flex flex-col gap-4">
          <FormField
            label="Current password"
            type="password"
            autoComplete="current-password"
            required
            error={errors.current_password?.message}
            {...register('current_password')}
          />
          {/* deps: changing the password re-checks the confirmation. */}
          <FormField
            label="New password"
            type="password"
            autoComplete="new-password"
            required
            error={errors.password?.message}
            {...register('password', { deps: 'password_confirmation' })}
          />
          <FormField
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            required
            error={errors.password_confirmation?.message}
            {...register('password_confirmation')}
          />
          <FormErrors errors={serverErrors} />
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? 'Changing…' : 'Change password'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export function ProfilePage() {
  useDocumentTitle('Profile')
  const { user } = useAuth()
  // RequireAuth only renders this page with a user; the guard is for TypeScript.
  if (!user) return null

  return (
    <>
      <PageHeader title="Profile" />
      <div className="flex flex-col gap-6">
        <PersonalDataForm user={user} />
        <PasswordForm />
      </div>
    </>
  )
}
