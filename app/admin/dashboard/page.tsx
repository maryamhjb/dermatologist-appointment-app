'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { PortalHeader } from '@/components/layout/portal-header'

export default function AdminDashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [admin, setAdmin] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (!adminUser) {
        router.push('/dashboard')
        return
      }

      setUser(user)
      setAdmin(adminUser)

      // Fetch appointments
      const { data: appts } = await supabase
        .from('appointments')
        .select(`
          *,
          patient: patients(*),
          office: offices(*),
          procedure: procedures(*)
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      if (appts) setAppointments(appts)

      // Fetch pending comments (for super_admin only or assigned to this assistant)
      const { data: cmts } = await supabase
        .from('comments')
        .select(`
          *,
          patient: patients(*)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(20)

      if (cmts) setComments(cmts)

      setLoading(false)
    }

    checkAdmin()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return <div className="p-4 text-start">درحال بارگذاری...</div>
  }

  const isSuperAdmin = admin?.role === 'super_admin'

  return (
    <div className="min-h-dvh bg-background text-start">
      <PortalHeader onLogout={handleLogout} maxWidthClass="max-w-6xl" />
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">پنل مدیریت</h1>
          <p className="text-muted-foreground">خوش آمدید، {admin?.full_name}</p>
          <p className="text-sm text-muted-foreground mt-1">
            نقش: {isSuperAdmin ? 'مدیر سیستم' : 'دستیار مدیر'}
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="appointments" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="appointments">نوبت‌ها</TabsTrigger>
            <TabsTrigger value="comments">نظرات</TabsTrigger>
            {isSuperAdmin && <TabsTrigger value="procedures">خدمات</TabsTrigger>}
            {isSuperAdmin && <TabsTrigger value="time-slots">نوبت‌های زمانی</TabsTrigger>}
            {isSuperAdmin && <TabsTrigger value="settings">تنظیمات</TabsTrigger>}
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>نوبت‌های اخیر</CardTitle>
                <CardDescription>آخرین نوبت‌های رزرو شده</CardDescription>
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
                            <p className="font-semibold">{apt.patient?.phone}</p>
                            <p className="text-sm text-muted-foreground">
                              {apt.office?.name} - {apt.procedure?.name_fa}
                            </p>
                            <p className="text-sm mt-2">
                              {apt.time_slot?.slot_date} {apt.time_slot?.start_time}
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
                              {apt.status === 'pending' && 'در انتظار'}
                              {apt.status === 'cancelled' && 'لغو'}
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

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>نظرات منتظر تایید</CardTitle>
                <CardDescription>در انتظار بررسی</CardDescription>
              </CardHeader>
              <CardContent>
                {comments.length === 0 ? (
                  <div className="py-8 text-start text-sm text-muted-foreground">
                    نظری در صف نیست.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((cmt) => (
                      <Card key={cmt.id} className="p-4 border">
                        <div>
                          <p className="font-semibold">{cmt.patient?.phone}</p>
                          <p className="text-sm mt-2">{cmt.content}</p>
                          <div className="flex gap-2 mt-4">
                            <Button size="sm" variant="default">تایید</Button>
                            <Button size="sm" variant="outline">رد</Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Procedures Tab - Super Admin Only */}
          {isSuperAdmin && (
            <TabsContent value="procedures">
              <Card>
                <CardHeader>
                  <CardTitle>مدیریت خدمات</CardTitle>
                  <CardDescription>اضافه، ویرایش یا حذف خدمات</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="py-8 text-start text-sm text-muted-foreground">
                    به‌زودی.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Time Slots Tab - Super Admin Only */}
          {isSuperAdmin && (
            <TabsContent value="time-slots">
              <Card>
                <CardHeader>
                  <CardTitle>مدیریت نوبت‌های زمانی</CardTitle>
                  <CardDescription>تنظیم نوبت‌های موجود برای هر روز</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="py-8 text-start text-sm text-muted-foreground">
                    به‌زودی.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Settings Tab - Super Admin Only */}
          {isSuperAdmin && (
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>تنظیمات سیستم</CardTitle>
                  <CardDescription>تنظیمات امتیازات، مدیران و سایر موارد</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="py-8 text-start text-sm text-muted-foreground">
                    به‌زودی.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
