'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { BookingDialog } from '@/components/booking-dialog'
import { ProceduresList } from '@/components/procedures-list'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [patient, setPatient] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingOpen, setBookingOpen] = useState(false)
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
    return <div className="p-4">درحال بارگذاری...</div>
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">سلام، {user?.phone}</h1>
            <p className="text-muted-foreground">خوش آمدید به سیستم رزرو نوبت</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            خروج
          </Button>
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
                <CardDescription>لیست تمام نوبت‌های رزرو شده</CardDescription>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    هنوز نوبتی رزرو نشده است
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
                          <div className="text-right">
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
                <CardDescription>برای رزرو نوبت، لطفاً مراحل زیر را تکمیل کنید</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  شما می‌توانید نوبت جدیدی را برای هریک از مطب‌های ما رزرو کنید. برای شروع، روی دکمه زیر کلیک کنید.
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
                <CardDescription>لیست خدمات و قیمت‌های موجود</CardDescription>
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
                <CardDescription>امتیازات شما و نحوه استفاده از آن</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {patient && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="bg-primary/10 border-primary">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-2">امتیاز موجود</p>
                            <p className="text-3xl font-bold text-primary">{patient.points}</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-2">کل امتیازات درآمدی</p>
                            <p className="text-3xl font-bold">{patient.total_points_earned}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="bg-muted p-4 rounded space-y-2 text-sm">
                      <p className="font-semibold">چگونه امتیاز کسب کنم؟</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>برای هر نظر تایید شده، 100 امتیاز کسب کنید</li>
                        <li>هر 1 امتیاز معادل 10 تومان تخفیف است</li>
                        <li>می‌توانید امتیازات خود را هنگام پرداخت در مطب استفاده کنید</li>
                      </ul>
                    </div>

                    <div className="bg-primary/10 border border-primary rounded p-4">
                      <p className="text-sm">
                        <span className="font-semibold">ارزش فعلی امتیازات شما:</span>
                        <span className="mr-2">{(patient.points * 10).toLocaleString()} تومان</span>
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
