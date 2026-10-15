import { z } from 'zod'

// Form schemas, matching the backend rules. Keys are snake_case like the API, so the
// parsed values can be sent as the request body. Strings are trimmed where the old forms trimmed.

const requiredText = (label: string) => z.string().trim().min(1, `${label} is required.`)

// Trim first, then check the format, so " a@b.co " is accepted and sent trimmed.
const email = z.string().trim().pipe(z.email('Enter a valid email address.'))

// Devise validatable: 6 to 128 characters. Not trimmed, spaces are valid in a password.
const newPassword = z
  .string()
  .min(6, 'Password must be at least 6 characters.')
  .max(128, 'Password must be at most 128 characters.')

// price is decimal(10,2) in the database: up to 8 digits before the point, 2 after.
const PRICE_PATTERN = /^\d{1,8}(\.\d{1,2})?$/
const PRICE_MESSAGE = 'Price must be between 0 and 99,999,999.99 with at most 2 decimals.'

const passwordPair = z.object({ password: z.string(), password_confirmation: z.string() })

const passwordsMatch = (data: z.infer<typeof passwordPair>) =>
  data.password === data.password_confirmation

const passwordsMatchParams = {
  message: 'Passwords do not match.',
  path: ['password_confirmation'],
  // By default zod skips an object refinement when any field failed. Compare anyway,
  // so the mismatch shows together with the other errors.
  when: (payload: z.core.ParsePayload) => passwordPair.safeParse(payload.value).success,
}

const personalData = {
  first_name: requiredText('First name'),
  last_name: requiredText('Last name'),
  email,
}

export const loginSchema = z.object({
  email,
  // No length rule here: login only checks the stored password.
  password: z.string().min(1, 'Password is required.'),
})

export const signupSchema = z
  .object({ ...personalData, password: newPassword, password_confirmation: z.string() })
  .refine(passwordsMatch, passwordsMatchParams)

export const profileSchema = z.object(personalData)

export const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required.'),
    password: newPassword,
    password_confirmation: z.string(),
  })
  .refine(passwordsMatch, passwordsMatchParams)

export const adminUserSchema = z.object({ ...personalData, role: z.enum(['user', 'admin']) })

export const itemSchema = z.object({
  name: requiredText('Name'),
  description: z.string().trim(),
  price: z.string().trim().min(1, 'Price is required.').regex(PRICE_PATTERN, PRICE_MESSAGE),
})
