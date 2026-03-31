'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { useToast } from '@/hooks/use-toast'

interface BookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBookingSuccess?: () => void
}

export function BookingDialog({ open, onOpenChange, onBookingSuccess }: BookingDialogProps) {
  const [step, setStep] = useState<'office' | 'date' | 'procedure' | 'confirm'>('office')
  const [offices, setOffices] = useState<any[]>([])
  const [procedures, setProcedures] = useState<any[]>([])
  const [timeSlots, setTimeSlots] = useState<any[]>([])
  
  const [selectedOffice, setSelectedOffice] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedProcedure, setSelectedProcedure] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const fetchOffices = async () => {
      const { data } = await supabase.from('offices').select('*')
      if (data) setOffices(data)
    }
    
    const fetchProcedures = async () => {
      const { data } = await supabase
        .from('procedures')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
      if (data) setProcedures(data)
    }

    if (open) {
      fetchOffices()
      fetchProcedures()
    }
  }, [open])

  const handleOfficeSelect = async (officeId: string) => {
    setSelectedOffice(officeId)
    setSelectedDate('')
    setSelectedTime('')
    setTimeSlots([])
    setStep('date')
  }

  const handleDateSelect = async (date: string) => {
    setSelectedDate(date)
    
    // Fetch available time slots
    const { data } = await supabase
      .from('time_slots')
      .select('*')
      .eq('office_id', selectedOffice)
      .eq('slot_date', date)
      .eq('is_available', true)
      .gt('capacity', 0)
    
    if (data) {
      setTimeSlots(data)
      setStep('procedure')
    }
  }

  const handleConfirmBooking = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: 'خطا',
          description: 'لطفاً ابتدا وارد شوید',
          variant: 'destructive'
        })
        return
      }

      // Create appointment
      const { error } = await supabase
        .from('appointments')
        .insert([
          {
            patient_id: user.id,
            office_id: selectedOffice,
            time_slot_id: selectedTime,
            procedure_id: selectedProcedure || null,
            status: 'pending'
          }
        ])

      if (error) throw error

      toast({
        title: 'نوبت رزرو شد',
        description: 'نوبت شما با موفقیت رزرو شد'
      })

      onOpenChange(false)
      onBookingSuccess?.()
      
      // Reset
      setStep('office')
      setSelectedOffice('')
      setSelectedDate('')
      setSelectedTime('')
      setSelectedProcedure('')
    } catch (err) {
      console.error(err)
      toast({
        title: 'خطا',
        description: 'خطایی در رزرو نوبت رخ داد',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>رزرو نوبت جدید</DialogTitle>
          <DialogDescription>لطفاً مراحل رزرو را تکمیل کنید</DialogDescription>
        </DialogHeader>

        {step === 'office' && (
          <FieldGroup>
            <Field>
              <FieldLabel>انتخاب مطب</FieldLabel>
              <Select value={selectedOffice} onValueChange={handleOfficeSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="مطب را انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  {offices.map((office) => (
                    <SelectItem key={office.id} value={office.id}>
                      {office.name} - {office.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        )}

        {step === 'date' && (
          <FieldGroup>
            <Field>
              <FieldLabel>انتخاب تاریخ</FieldLabel>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateSelect(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded"
              />
            </Field>
          </FieldGroup>
        )}

        {step === 'procedure' && (
          <div className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel>انتخاب ساعت</FieldLabel>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="ساعت را انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot.id} value={slot.id}>
                        {slot.start_time} - {slot.end_time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel>انتخاب خدمت (اختیاری)</FieldLabel>
                <Select value={selectedProcedure} onValueChange={setSelectedProcedure}>
                  <SelectTrigger>
                    <SelectValue placeholder="خدمت را انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    {procedures.map((proc) => (
                      <SelectItem key={proc.id} value={proc.id}>
                        {proc.name_fa} - {proc.price.toLocaleString()} ت‍ومان
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>

            <Button
              onClick={() => setStep('confirm')}
              disabled={!selectedTime}
              className="w-full"
            >
              ادامه
            </Button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded space-y-2 text-sm">
              <div>
                <span className="font-semibold">مطب:</span>
                <span className="mr-2">{offices.find(o => o.id === selectedOffice)?.name}</span>
              </div>
              <div>
                <span className="font-semibold">تاریخ:</span>
                <span className="mr-2">{selectedDate}</span>
              </div>
              <div>
                <span className="font-semibold">ساعت:</span>
                <span className="mr-2">{timeSlots.find(t => t.id === selectedTime)?.start_time}</span>
              </div>
              {selectedProcedure && (
                <div>
                  <span className="font-semibold">خدمت:</span>
                  <span className="mr-2">{procedures.find(p => p.id === selectedProcedure)?.name_fa}</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleConfirmBooking}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'درحال رزرو...' : 'تایید و رزرو'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
