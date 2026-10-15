import { useId, useState, type MouseEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import type { Item } from '@/api/types'
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
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
  useAdminItems,
  useCreateAdminItem,
  useDeleteAdminItem,
  useUpdateAdminItem,
} from '@/hooks/useAdminItems'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { getErrorMessages } from '@/lib/errors'
import { formatPrice } from '@/lib/format'
import { itemSchema } from '@/lib/schemas'

// item undefined = create. Rendered inside DialogContent, so every open starts fresh.
function ItemForm({ item, onSaved }: { item?: Item; onSaved: () => void }) {
  const createItem = useCreateAdminItem()
  const updateItem = useUpdateAdminItem()
  const descriptionId = useId()
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: item?.name ?? '',
      description: item?.description ?? '',
      price: item?.price ?? '',
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })
  const { errors } = formState
  const [serverErrors, setServerErrors] = useState<string[]>([])
  const isPending = createItem.isPending || updateItem.isPending

  return (
    // onChange bubbles from every field: editing the form clears the server errors.
    <form
      noValidate
      onSubmit={handleSubmit((data) => {
        setServerErrors([])
        // Only local UI here; invalidation and the toast are in the hooks.
        const callbacks = {
          onSuccess: onSaved,
          onError: (error: unknown) => setServerErrors(getErrorMessages(error)),
        }
        if (item) updateItem.mutate({ id: item.id, data }, callbacks)
        else createItem.mutate(data, callbacks)
      })}
      onChange={() => setServerErrors([])}
      className="flex flex-col gap-4"
    >
      <FormField label="Name" required error={errors.name?.message} {...register('name')} />
      <div className="flex flex-col gap-2">
        <Label htmlFor={descriptionId}>Description (optional)</Label>
        <Textarea id={descriptionId} rows={3} {...register('description')} />
      </div>
      {/* Text, not type="number": the browser's number input would accept "1e5" and hide typos. */}
      <FormField
        label="Price (USD)"
        inputMode="decimal"
        placeholder="0.00"
        required
        error={errors.price?.message}
        {...register('price')}
      />
      <FormErrors errors={serverErrors} />
      <DialogFooter>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : item ? 'Save' : 'Create'}
        </Button>
      </DialogFooter>
    </form>
  )
}

// Rendered inside AlertDialogContent, so the error is cleared on every open.
function DeleteItemContent({ item, onDeleted }: { item: Item; onDeleted: () => void }) {
  const deleteItem = useDeleteAdminItem()
  const [errors, setErrors] = useState<string[]>([])

  function handleDelete(event: MouseEvent<HTMLButtonElement>) {
    // Keep the dialog open until the server answers, so a 422 can be shown here.
    event.preventDefault()
    setErrors([])
    deleteItem.mutate(item, {
      onSuccess: onDeleted,
      onError: (error) => setErrors(getErrorMessages(error)),
    })
  }

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete {item.name}?</AlertDialogTitle>
        <AlertDialogDescription>
          The item is removed from the catalog. Items used in orders cannot be deleted.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <FormErrors errors={errors} />
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction variant="destructive" disabled={deleteItem.isPending} onClick={handleDelete}>
          {deleteItem.isPending ? 'Deleting…' : 'Delete'}
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  )
}

export function AdminItemsPage() {
  const [input, setInput] = useState('')
  const q = useDebouncedValue(input, 300).trim()
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useAdminItems(q)

  // Each dialog keeps its item separately from `open`, so the content stays while it closes.
  const [formItem, setFormItem] = useState<Item | undefined>(undefined)
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<Item | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  function openForm(item?: Item) {
    setFormItem(item)
    setFormOpen(true)
  }

  function openDelete(item: Item) {
    setDeleting(item)
    setDeleteOpen(true)
  }

  const actions = (item: Item) => (
    <div className="flex shrink-0 gap-2">
      <Button variant="outline" size="sm" onClick={() => openForm(item)}>
        Edit<span className="sr-only"> {item.name}</span>
      </Button>
      <Button variant="destructive" size="sm" onClick={() => openDelete(item)}>
        Delete<span className="sr-only"> {item.name}</span>
      </Button>
    </div>
  )

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        <Input
          type="search"
          aria-label="Search items"
          placeholder="Search items…"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="min-w-0 flex-1"
        />
        <Button onClick={() => openForm()}>
          <Plus />
          New item
        </Button>
      </div>

      {isPending ? (
        <LoadingState label="Loading items…" />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : data.length === 0 ? (
        <EmptyState
          title={q ? `No items match “${q}”` : 'No items yet'}
          description={q ? undefined : 'Create the first item with “New item”.'}
          action={
            q ? (
              <Button variant="outline" onClick={() => setInput('')}>
                Clear search
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className={isPlaceholderData ? 'opacity-60' : undefined}>
          <p aria-live="polite" className="mb-4 text-sm text-muted-foreground">
            {data.length} {data.length === 1 ? 'item' : 'items'}
          </p>

          {/* md and up; whitespace-normal lets long descriptions wrap inside the table. */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium whitespace-normal">{item.name}</TableCell>
                    <TableCell className="whitespace-normal text-muted-foreground">
                      {item.description}
                    </TableCell>
                    <TableCell className="text-right">{formatPrice(item.price)}</TableCell>
                    <TableCell>{actions(item)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* below md */}
          <ul className="divide-y md:hidden">
            {data.map((item) => (
              <li key={item.id} className="flex flex-col gap-2 py-3">
                <div className="flex items-start justify-between gap-4">
                  <p className="min-w-0 font-medium break-words">{item.name}</p>
                  <p className="shrink-0 font-medium">{formatPrice(item.price)}</p>
                </div>
                {item.description && (
                  <p className="text-sm break-words text-muted-foreground">{item.description}</p>
                )}
                {actions(item)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formItem ? 'Edit item' : 'New item'}</DialogTitle>
            <DialogDescription>
              {formItem ? formItem.name : 'Add an item to the catalog.'}
            </DialogDescription>
          </DialogHeader>
          <ItemForm item={formItem} onSaved={() => setFormOpen(false)} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          {deleting && (
            <DeleteItemContent item={deleting} onDeleted={() => setDeleteOpen(false)} />
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
