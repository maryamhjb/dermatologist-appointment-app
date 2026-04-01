import { redirect } from 'next/navigation'

/** Legacy URL: admins use the same passwordless flow as patients (`/auth/login`). */
export default function AdminLoginPage() {
  redirect('/auth/login')
}
