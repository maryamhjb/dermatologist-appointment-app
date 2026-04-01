'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/logo'
import { createClient } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Appointment {
  id: string
  first_name: string
  last_name: string
  national_number: string
  phone_number: string
  clinic: string
  appointment_date: string
  appointment_jalali: string
  status: string
  created_at: string
}

const ADMIN_PASSWORD = 'dr.maryam2024' // Simple password protection

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterClinic, setFilterClinic] = useState<string>('all')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setPasswordError('')
      fetchAppointments()
    } else {
      setPasswordError('رمز عبور اشتباه است')
    }
  }

  const fetchAppointments = async () => {
    setLoading(true)
    const supabase = createClient()
    
    let query = supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('Error fetching appointments:', error)
    } else {
      setAppointments(data || [])
    }
    setLoading(false)
  }

  const updateStatus = async (id: string, newStatus: string) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('appointments')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Error updating status:', error)
    } else {
      fetchAppointments()
    }
  }

  const filteredAppointments = appointments.filter(apt => {
    if (filterStatus !== 'all' && apt.status !== filterStatus) return false
    if (filterClinic !== 'all' && apt.clinic !== filterClinic) return false
    return true
  })

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    const labels: Record<string, string> = {
      pending: 'در انتظار',
      confirmed: 'تایید شده',
      cancelled: 'لغو شده',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  // Get today's appointments count
  const todayCount = appointments.filter(apt => {
    const today = new Date().toISOString().split('T')[0]
    return apt.appointment_date === today
  }).length

  const pendingCount = appointments.filter(apt => apt.status === 'pending').length

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Logo />
            </div>
            <CardTitle>ورود به پنل مدیریت</CardTitle>
            <CardDescription>لطفاً رمز عبور را وارد کنید</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">رمز عبور</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز عبور"
                  className="text-center"
                />
              </div>
              {passwordError && (
                <p className="text-destructive text-sm text-center">{passwordError}</p>
              )}
              <Button type="submit" className="w-full">
                ورود
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <h1 className="text-xl font-bold">پنل مدیریت نوبت‌ها</h1>
          <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
            خروج
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>کل نوبت‌ها</CardDescription>
              <CardTitle className="text-3xl">{appointments.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>نوبت‌های امروز</CardDescription>
              <CardTitle className="text-3xl">{todayCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>در انتظار تایید</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{pendingCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>فیلترها</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <Label>وضعیت</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه</SelectItem>
                    <SelectItem value="pending">در انتظار</SelectItem>
                    <SelectItem value="confirmed">تایید شده</SelectItem>
                    <SelectItem value="cancelled">لغو شده</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>مطب</Label>
                <Select value={filterClinic} onValueChange={setFilterClinic}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه</SelectItem>
                    <SelectItem value="tehran">تهران</SelectItem>
                    <SelectItem value="karaj">کرج</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={fetchAppointments} variant="outline">
                  بروزرسانی
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table */}
        <Card>
          <CardHeader>
            <CardTitle>لیست نوبت‌ها</CardTitle>
            <CardDescription>
              {filteredAppointments.length} نوبت یافت شد
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8">در حال بارگذاری...</p>
            ) : filteredAppointments.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">نوبتی یافت نشد</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">نام و نام خانوادگی</TableHead>
                      <TableHead className="text-right">کد ملی</TableHead>
                      <TableHead className="text-right">شماره موبایل</TableHead>
                      <TableHead className="text-right">مطب</TableHead>
                      <TableHead className="text-right">تاریخ نوبت</TableHead>
                      <TableHead className="text-right">وضعیت</TableHead>
                      <TableHead className="text-right">عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments.map((apt) => (
                      <TableRow key={apt.id}>
                        <TableCell className="font-medium">
                          {apt.first_name} {apt.last_name}
                        </TableCell>
                        <TableCell dir="ltr">{apt.national_number}</TableCell>
                        <TableCell dir="ltr">{apt.phone_number}</TableCell>
                        <TableCell>
                          {apt.clinic === 'tehran' ? 'تهران' : 'کرج'}
                        </TableCell>
                        <TableCell>{apt.appointment_jalali}</TableCell>
                        <TableCell>{getStatusBadge(apt.status)}</TableCell>
                        <TableCell>
                          <Select
                            value={apt.status}
                            onValueChange={(value) => updateStatus(apt.id, value)}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">در انتظار</SelectItem>
                              <SelectItem value="confirmed">تایید</SelectItem>
                              <SelectItem value="cancelled">لغو</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
