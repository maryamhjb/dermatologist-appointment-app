'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { BookingDialog } from '@/components/booking-dialog'
import { ProceduresList } from '@/components/procedures-list'
import { PortalHeader } from '@/components/layout/portal-header'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [patient, setPatient] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      setUser(user)

      const { data: adminRow } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()
      setIsAdmin(Boolean(adminRow))

      // Fetch patient data
      const { data: patientData } = await supabase
        .from('patients')
        .select('*')
        .eq('id', user.id)
        .single()

      if (patientData) {
        setPatient(patientData)
      }
      
      // Fetch patient data and appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          *,
          office: offices(*),
          procedure: procedures(*),
          time_slot: time_slots(*)
        `)
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false })

      if (appointments) {
        setAppointments(appointments)
      }

      setLoading(false)
    }

    checkUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return <div className="p-4 text-start">درحال بارگذاری...</div>
  }

  const meta = user?.user_metadata as Record<string, unknown> | undefined
  const metaName = typeof meta?.full_name === 'string' ? meta.full_name.trim() : ''
  const displayName =
    (patient?.full_name as string | undefined)?.trim() ||
    metaName ||
    (typeof user?.email === 'string' ? user.email : '') ||
    'کاربر'

  return (
    <div className="min-h-dvh bg-background text-start">
      <PortalHeader onLogout={handleLogout} maxWidthClass="max-w-4xl" />
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            سلام، {displayName}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground sm:text-[0.9375rem]">
            رزرو نوبت آنلاین
          </p>
          {isAdmin ? (
            <div className="mt-5">
              <Link
                href="/admin/dashboard"
                className={cn(
                  'inline-flex min-h-10 items-center justify-center rounded-lg border px-4 text-sm font-semibold transition-[background-color,border-color]',
                  'border-primary/20 bg-background text-primary hover:border-primary/30 hover:bg-primary/5',
                )}
              >
                پنل مدیریت
              </Link>
            </div>
          ) : null}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="appointments" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appointments">نوبت‌ها</TabsTrigger>
            <TabsTrigger value="booking">رزرو نوبت جدید</TabsTrigger>
            <TabsTrigger value="procedures">خدمات</TabsTrigger>
            <TabsTrigger value="points">امتیازات</TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>نوبت‌های شما</CardTitle>
                <CardDescription>نوبت‌های رزروشده</CardDescription>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="py-8 text-start text-sm text-muted-foreground">
                    نوبتی ثبت نشده است.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((apt) => (
                      <Card key={apt.id} className="p-4 border">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{apt.office?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {apt.procedure?.name_fa}
                            </p>
                            <p className="text-sm mt-2">
                              تاریخ: {apt.time_slot?.slot_date}
                            </p>
                            <p className="text-sm">
                              ساعت: {apt.time_slot?.start_time}
                            </p>
                          </div>
                          <div className="text-end">
                            <span className={`px-3 py-1 rounded text-sm font-medium ${
                              apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {apt.status === 'confirmed' && 'تایید شده'}
                              {apt.status === 'pending' && 'در انتظار تایید'}
                              {apt.status === 'cancelled' && 'لغو شده'}
                              {apt.status === 'completed' && 'انجام شده'}
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Booking Tab */}
          <TabsContent value="booking">
            <Card>
              <CardHeader>
                <CardTitle>رزرو نوبت جدید</CardTitle>
                <CardDescription>مطب، تاریخ و ساعت را انتخاب کنید.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  با دکمه زیر فرم رزرو باز می‌شود.
                </p>
                <Button onClick={() => setBookingOpen(true)} className="w-full bg-primary">
                  رزرو نوبت جدید
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Procedures Tab */}
          <TabsContent value="procedures">
            <Card>
              <CardHeader>
                <CardTitle>خدمات درماتولوژی</CardTitle>
                <CardDescription>خدمات فعال و قیمت</CardDescription>
              </CardHeader>
              <CardContent>
                <ProceduresList />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Points Tab */}
          <TabsContent value="points">
            <Card>
              <CardHeader>
                <CardTitle>سیستم امتیازات</CardTitle>
                <CardDescription>موجودی و قوانین ساده</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {patient && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="bg-primary/10 border-primary">
                        <CardContent className="pt-6">
                          <div className="text-start">
                            <p className="mb-2 text-sm text-muted-foreground">موجود</p>
                            <p className="text-3xl font-bold tabular-nums text-primary">{patient.points}</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-start">
                            <p className="mb-2 text-sm text-muted-foreground">کل کسب‌شده</p>
                            <p className="text-3xl font-bold tabular-nums">{patient.total_points_earned}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-2 rounded bg-muted p-4 text-start text-sm">
                      <p className="font-medium">قوانین</p>
                      <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                        <li>نظر تاییدشده: ۱۰۰ امتیاز</li>
                        <li>۱ امتیاز ≈ ۱۰ تومان تخفیف</li>
                        <li>مصرف در پرداخت مطب</li>
                      </ul>
                    </div>

                    <div className="rounded border border-primary bg-primary/10 p-4 text-start">
                      <p className="text-sm">
                        <span className="font-medium">ارزش موجود: </span>
                        <span className="tabular-nums">{(patient.points * 10).toLocaleString('fa-IR')} تومان</span>
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Booking Dialog */}
        <BookingDialog
          open={bookingOpen}
          onOpenChange={setBookingOpen}
          onBookingSuccess={() => {
            // Refresh appointments
            setLoading(true)
            setTimeout(() => setLoading(false), 500)
          }}
        />
      </div>
    </div>
  )
}
