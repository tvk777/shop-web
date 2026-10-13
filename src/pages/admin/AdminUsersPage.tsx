import { useId, useState, type ChangeEvent, type FormEvent } from 'react'
import type { Role, User } from '@/api/types'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { FormErrors } from '@/components/FormErrors'
import { FormField } from '@/components/FormField'
import { LoadingState } from '@/components/LoadingState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAdminUsers, useUpdateAdminUser } from '@/hooks/useAdminUsers'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessages } from '@/lib/errors'

const ROLES: Role[] = ['user', 'admin']

function fullName(user: User) {
  return `${user.first_name} ${user.last_name}`
}

// Rendered inside DialogContent, which unmounts on close, so every open starts fresh.
function UserForm({ user, onSaved }: { user: User; onSaved: () => void }) {
  const updateUser = useUpdateAdminUser()
  const roleId = useId()
  const [firstName, setFirstName] = useState(user.first_name)
  const [lastName, setLastName] = useState(user.last_name)
  const [email, setEmail] = useState(user.email)
  const [role, setRole] = useState<Role>(user.role)
  const [errors, setErrors] = useState<string[]>([])

  function handleChange(setter: (value: string) => void) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setter(event.target.value)
      setErrors([])
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrors([])
    updateUser.mutate(
      {
        id: user.id,
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          role,
        },
      },
      // Only local UI here; invalidation, the profile cache and the toast are in the hook.
      { onSuccess: onSaved, onError: (error) => setErrors(getErrorMessages(error)) },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField
        label="First name"
        required
        value={firstName}
        onChange={handleChange(setFirstName)}
      />
      <FormField label="Last name" required value={lastName} onChange={handleChange(setLastName)} />
      <FormField
        label="Email"
        type="email"
        required
        value={email}
        onChange={handleChange(setEmail)}
      />
      <div className="flex flex-col gap-2">
        <Label htmlFor={roleId}>Role</Label>
        <Select
          value={role}
          onValueChange={(value) => {
            setRole(value as Role)
            setErrors([])
          }}
        >
          <SelectTrigger id={roleId} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <FormErrors errors={errors} />
      <DialogFooter>
        <Button type="submit" disabled={updateUser.isPending}>
          {updateUser.isPending ? 'Saving…' : 'Save'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const { data, isPending, isError, error, refetch } = useAdminUsers()
  // Kept separately from `open`, so the dialog still shows the user while it closes.
  const [editing, setEditing] = useState<User | null>(null)
  const [open, setOpen] = useState(false)

  function startEdit(user: User) {
    setEditing(user)
    setOpen(true)
  }

  if (isPending) return <LoadingState label="Loading users…" />
  if (isError) return <ErrorState error={error} onRetry={() => refetch()} />
  if (data.length === 0) return <EmptyState title="No users" />

  const youLabel = (user: User) =>
    user.id === currentUser?.id && <span className="text-muted-foreground"> (you)</span>

  const editButton = (user: User) => (
    <Button variant="outline" size="sm" onClick={() => startEdit(user)}>
      Edit<span className="sr-only"> {fullName(user)}</span>
    </Button>
  )

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        {data.length} {data.length === 1 ? 'user' : 'users'}
      </p>

      {/* md and up */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {fullName(user)}
                  {youLabel(user)}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{user.role}</Badge>
                </TableCell>
                <TableCell className="text-right">{editButton(user)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* below md */}
      <ul className="divide-y md:hidden">
        {data.map((user) => (
          <li key={user.id} className="flex items-start justify-between gap-4 py-3">
            <div className="min-w-0">
              <p className="font-medium break-words">
                {fullName(user)}
                {youLabel(user)}
              </p>
              <p className="text-sm break-all text-muted-foreground">{user.email}</p>
              <Badge variant="secondary" className="mt-1">
                {user.role}
              </Badge>
            </div>
            {editButton(user)}
          </li>
        ))}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>{editing?.email}</DialogDescription>
          </DialogHeader>
          {editing && <UserForm user={editing} onSaved={() => setOpen(false)} />}
        </DialogContent>
      </Dialog>
    </>
  )
}
