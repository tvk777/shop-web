import { useId, useState, type MouseEvent } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { AdminUser, Role, User } from '@/api/types'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { FormErrors } from '@/components/FormErrors'
import { FormField } from '@/components/FormField'
import { LoadingState } from '@/components/LoadingState'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
import { useAdminUsers, useDeleteAdminUser, useUpdateAdminUser } from '@/hooks/useAdminUsers'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessages } from '@/lib/errors'
import { adminUserSchema } from '@/lib/schemas'

const ROLES: Role[] = ['user', 'admin']

function fullName(user: User) {
  return `${user.first_name} ${user.last_name}`
}

function ordersLabel(count: number) {
  return `${count} ${count === 1 ? 'order' : 'orders'}`
}

// Rendered inside DialogContent, which unmounts on close, so every open starts fresh.
function UserForm({ user, onSaved }: { user: User; onSaved: () => void }) {
  const updateUser = useUpdateAdminUser()
  const roleId = useId()
  const { register, handleSubmit, formState, control } = useForm({
    resolver: zodResolver(adminUserSchema),
    defaultValues: {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })
  const { errors } = formState
  const [serverErrors, setServerErrors] = useState<string[]>([])

  return (
    // onChange bubbles from every input: editing the form clears the server errors.
    <form
      noValidate
      onSubmit={handleSubmit((values) => {
        setServerErrors([])
        updateUser.mutate(
          { id: user.id, data: values },
          // Only local UI here; invalidation, the profile cache and the toast are in the hook.
          { onSuccess: onSaved, onError: (error) => setServerErrors(getErrorMessages(error)) },
        )
      })}
      onChange={() => setServerErrors([])}
      className="flex flex-col gap-4"
    >
      <FormField
        label="First name"
        required
        error={errors.first_name?.message}
        {...register('first_name')}
      />
      <FormField
        label="Last name"
        required
        error={errors.last_name?.message}
        {...register('last_name')}
      />
      <FormField
        label="Email"
        type="email"
        required
        error={errors.email?.message}
        {...register('email')}
      />
      <div className="flex flex-col gap-2">
        <Label htmlFor={roleId}>Role</Label>
        {/* The Select is not a native input, so it is wired with Controller. */}
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value as Role)
                setServerErrors([])
              }}
            >
              <SelectTrigger id={roleId} ref={field.ref} onBlur={field.onBlur} className="w-full">
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
          )}
        />
      </div>
      <FormErrors errors={serverErrors} />
      <DialogFooter>
        <Button type="submit" disabled={updateUser.isPending}>
          {updateUser.isPending ? 'Saving…' : 'Save'}
        </Button>
      </DialogFooter>
    </form>
  )
}

// Rendered inside AlertDialogContent, so the error is cleared on every open.
function DeleteUserContent({ user, onDeleted }: { user: AdminUser; onDeleted: () => void }) {
  const deleteUser = useDeleteAdminUser()
  const [errors, setErrors] = useState<string[]>([])
  const hasOrders = user.orders_count > 0

  function handleDelete(event: MouseEvent<HTMLButtonElement>) {
    // Keep the dialog open until the server answers, so a 422 can be shown here.
    event.preventDefault()
    setErrors([])
    deleteUser.mutate(user.id, {
      onSuccess: onDeleted,
      onError: (error) => setErrors(getErrorMessages(error)),
    })
  }

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle className="break-words">Delete {fullName(user)}?</AlertDialogTitle>
        <AlertDialogDescription className="break-words">
          {user.email} will be deleted.
          {hasOrders &&
            ` This also deletes their ${ordersLabel(user.orders_count)} with all order lines.`}{' '}
          This cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <FormErrors errors={errors} />
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction variant="destructive" disabled={deleteUser.isPending} onClick={handleDelete}>
          {deleteUser.isPending ? 'Deleting…' : hasOrders ? 'Delete user and orders' : 'Delete user'}
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  )
}

export function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const { data, isPending, isError, error, refetch } = useAdminUsers()
  // Each dialog keeps its user separately from `open`, so the content stays while it closes.
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState<AdminUser | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  function startEdit(user: AdminUser) {
    setEditing(user)
    setOpen(true)
  }

  function openDelete(user: AdminUser) {
    setDeleting(user)
    setDeleteOpen(true)
  }

  if (isPending) return <LoadingState label="Loading users…" />
  if (isError) return <ErrorState error={error} onRetry={() => refetch()} />
  if (data.length === 0) return <EmptyState title="No users" />

  const youLabel = (user: User) =>
    user.id === currentUser?.id && <span className="text-muted-foreground"> (you)</span>

  // No Delete on your own row: the server refuses it anyway (422).
  const actions = (user: AdminUser) => (
    <div className="flex shrink-0 gap-2">
      <Button variant="outline" size="sm" onClick={() => startEdit(user)}>
        Edit<span className="sr-only"> {fullName(user)}</span>
      </Button>
      {user.id !== currentUser?.id && (
        <Button variant="destructive" size="sm" onClick={() => openDelete(user)}>
          Delete<span className="sr-only"> {fullName(user)}</span>
        </Button>
      )}
    </div>
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
              <TableHead className="text-right">Orders</TableHead>
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
                <TableCell className="text-right">{user.orders_count}</TableCell>
                <TableCell>
                  <div className="flex justify-end">{actions(user)}</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* below md */}
      <ul className="divide-y md:hidden">
        {data.map((user) => (
          <li key={user.id} className="flex flex-col gap-2 py-3">
            <div className="min-w-0">
              <p className="font-medium break-words">
                {fullName(user)}
                {youLabel(user)}
              </p>
              <p className="text-sm break-all text-muted-foreground">{user.email}</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="secondary">{user.role}</Badge>
                <span className="text-sm text-muted-foreground">
                  {ordersLabel(user.orders_count)}
                </span>
              </div>
            </div>
            {actions(user)}
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

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          {deleting && (
            <DeleteUserContent user={deleting} onDeleted={() => setDeleteOpen(false)} />
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
