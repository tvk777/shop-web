import { useState, type ChangeEvent, type FormEvent } from 'react'
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
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

// Each form has its own mutation, so pending state and errors never mix between them.
function PersonalDataForm({ user }: { user: User }) {
  const updateProfile = useUpdateProfile()
  const [firstName, setFirstName] = useState(user.first_name)
  const [lastName, setLastName] = useState(user.last_name)
  const [email, setEmail] = useState(user.email)
  const [errors, setErrors] = useState<string[]>([])

  const data = { first_name: firstName.trim(), last_name: lastName.trim(), email: email.trim() }
  // After a save the cache holds the new user, so this turns false again by itself.
  const changed =
    data.first_name !== user.first_name ||
    data.last_name !== user.last_name ||
    data.email !== user.email

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
    updateProfile.mutate(data, { onError: (error) => setErrors(getErrorMessages(error)) })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal data</CardTitle>
        <CardAction>
          <Badge variant="secondary">{user.role}</Badge>
        </CardAction>
      </CardHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <CardContent className="flex flex-col gap-4">
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
          <FormErrors errors={errors} />
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={updateProfile.isPending || !changed}>
            {updateProfile.isPending ? 'Saving…' : 'Save'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

function PasswordForm() {
  const updateProfile = useUpdateProfile()
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [errors, setErrors] = useState<string[]>([])

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
    updateProfile.mutate(
      {
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      },
      {
        // Only local form state here; the cache update and the toast are in the hook.
        onSuccess: () => {
          setCurrentPassword('')
          setPassword('')
          setPasswordConfirmation('')
        },
        onError: (error) => setErrors(getErrorMessages(error)),
      },
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <CardContent className="flex flex-col gap-4">
          <FormField
            label="Current password"
            type="password"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={handleChange(setCurrentPassword)}
          />
          <FormField
            label="New password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={handleChange(setPassword)}
          />
          <FormField
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            required
            value={passwordConfirmation}
            onChange={handleChange(setPasswordConfirmation)}
          />
          <FormErrors errors={errors} />
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
