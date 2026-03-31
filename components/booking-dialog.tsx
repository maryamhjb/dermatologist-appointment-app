'use client'

import { useState } from 'react'
import jalaali from 'jalaali-js'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface BookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Clinic = 'tehran' | 'karaj'

const CLINICS = {
  tehran: {
    label: 'کلینیک تهران',
    days: [3], // Wednesday = 3 (0=Sun, 1=Mon, ..., 3=Wed)
    daysLabel: 'چهارشنبه‌ها',
    address: 'سعادت آباد - بلوار کوهستان - رو به روی ایال - پلاک ۱۱',
    phone: '۰۹۳۰۳۰۱۹۱۰۹',
  },
  karaj: {
    label: 'مطب کرج',
    days: [6, 0, 2], // Saturday=6, Sunday=0, Tuesday=2
    daysLabel: 'شنبه، یکشنبه و سه‌شنبه‌ها',
    address: 'چهاراه طالقانی به سمت میدان شهدا - برج آراد - طبقه هشتم - واحد ۸۰۳',
    phone: '۰۹۹۱۱۳۲۰۰۳۰',
  },
}

const JALALI_MONTHS = [
  'فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور',
  'مهر','آبان','آذر','دی','بهمن','اسفند'
]

const JALALI_WEEKDAYS = ['ش','ی','د','س','چ','پ','ج']

function toFarsiNumber(n: number | string): string {
  return String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d])
}

// Get Gregorian day of week for a Jalali date
function jalaliDayOfWeek(jy: number, jm: number, jd: number): number {
  const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd)
  return new Date(gy, gm - 1, gd).getDay()
}

// Get available dates for 8 weeks from today
function getAvailableDates(allowedDays: number[]): { jy: number; jm: number; jd: number; label: string }[] {
  const dates: { jy: number; jm: number; jd: number; label: string }[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(today)
  end.setDate(end.getDate() + 56) // 8 weeks

  const cur = new Date(today)
  while (cur <= end) {
    if (allowedDays.includes(cur.getDay())) {
      const j = jalaali.toJalaali(cur.getFullYear(), cur.getMonth() + 1, cur.getDate())
      const dayName = JALALI_WEEKDAYS[cur.getDay() === 0 ? 6 : cur.getDay() - 1 === -1 ? 6 : [6,0,1,2,3,4,5][cur.getDay()]]
      dates.push({
        jy: j.jy, jm: j.jm, jd: j.jd,
        label: `${getDayName(cur.getDay())} ${toFarsiNumber(j.jd)} ${JALALI_MONTHS[j.jm - 1]} ${toFarsiNumber(j.jy)}`
      })
    }
    cur.setDate(cur.getDate() + 1)
  }
  return dates
}

function getDayName(day: number): string {
  const names = ['یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه','شنبه']
  return names[day]
}

// Build calendar grid for a Jalali month
function buildCalendarGrid(jy: number, jm: number) {
  const daysInMonth = jalaali.jalaaliMonthLength(jy, jm)
  // First day of month weekday (0=Sat in Jalali week)
  const firstDow = jalaliDayOfWeek(jy, jm, 1)
  // Jalali week starts on Saturday(6), Sun(0),Mon(1),Tue(2),Wed(3),Thu(4),Fri(5)
  const jalaliDow = [6, 0, 1, 2, 3, 4, 5].indexOf(firstDow)

  const cells: (number | null)[] = Array(jalaliDow).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export function BookingDialog({ open, onOpenChange }: BookingDialogProps) {
  const [step, setStep] = useState<'clinic' | 'date'>('clinic')
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Calendar navigation
  const todayGreg = new Date()
  const todayJalaali = jalaali.toJalaali(todayGreg.getFullYear(), todayGreg.getMonth() + 1, todayGreg.getDate())
  const [calYear, setCalYear] = useState(todayJalaali.jy)
  const [calMonth, setCalMonth] = useState(todayJalaali.jm)

  function handleClinicSelect(clinic: Clinic) {
    setSelectedClinic(clinic)
    setSelectedDate(null)
    setCalYear(todayJalaali.jy)
    setCalMonth(todayJalaali.jm)
    setStep('date')
  }

  function handleDateSelect(jy: number, jm: number, jd: number) {
    setSelectedDate(`${jy}/${jm}/${jd}`)
  }

  function prevMonth() {
    if (calMonth === 1) { setCalYear(y => y - 1); setCalMonth(12) }
    else setCalMonth(m => m - 1)
  }

  function nextMonth() {
    if (calMonth === 12) { setCalYear(y => y + 1); setCalMonth(1) }
    else setCalMonth(m => m + 1)
  }

  function isAvailable(jd: number): boolean {
    if (!selectedClinic) return false
    const { gy, gm, gd } = jalaali.toGregorian(calYear, calMonth, jd)
    const greg = new Date(gy, gm - 1, gd)
    greg.setHours(0, 0, 0, 0)
    todayGreg.setHours(0, 0, 0, 0)
    const endDate = new Date(todayGreg)
    endDate.setDate(endDate.getDate() + 56)
    if (greg < todayGreg || greg > endDate) return false
    return CLINICS[selectedClinic].days.includes(greg.getDay())
  }

  function isSelected(jd: number): boolean {
    return selectedDate === `${calYear}/${calMonth}/${jd}`
  }

  function isToday(jd: number): boolean {
    return calYear === todayJalaali.jy && calMonth === todayJalaali.jm && jd === todayJalaali.jd
  }

  const cells = buildCalendarGrid(calYear, calMonth)

  function handleConfirm() {
    // Future: redirect to login/booking flow
    onOpenChange(false)
    setStep('clinic')
    setSelectedClinic(null)
    setSelectedDate(null)
  }

  function handleBack() {
    setStep('clinic')
    setSelectedClinic(null)
    setSelectedDate(null)
  }

  function handleClose(open: boolean) {
    if (!open) {
      setStep('clinic')
      setSelectedClinic(null)
      setSelectedDate(null)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm w-full p-0 overflow-hidden" style={{ borderRadius: 'var(--radius-lg)' }}>
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle className="text-lg font-bold" style={{ color: 'var(--primary)' }}>
            رزرو نوبت آنلاین
          </DialogTitle>
        </DialogHeader>

        {/* STEP 1: Choose clinic */}
        {step === 'clinic' && (
          <div className="p-5 space-y-3">
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>لطفاً مطب مورد نظر را انتخاب کنید:</p>
            {(Object.entries(CLINICS) as [Clinic, typeof CLINICS.tehran][]).map(([key, clinic]) => (
              <button
                key={key}
                onClick={() => handleClinicSelect(key)}
                className="w-full text-right p-4 rounded-lg border-2 transition-all hover:border-primary hover:bg-primary/5"
                style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
              >
                <p className="font-bold text-base" style={{ color: 'var(--foreground)' }}>{clinic.label}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--primary)' }}>{clinic.daysLabel}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{clinic.address}</p>
              </button>
            ))}
          </div>
        )}

        {/* STEP 2: Choose date - Jalali Calendar */}
        {step === 'date' && selectedClinic && (
          <div className="p-4">
            {/* Clinic badge */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={handleBack} className="text-xs px-3 py-1 rounded-full border" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                تغییر مطب
              </button>
              <span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>
                {CLINICS[selectedClinic].label}
              </span>
            </div>

            {/* Month navigation */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-lg font-bold" style={{ color: 'var(--foreground)' }}>›</button>
              <span className="font-bold text-base" style={{ color: 'var(--foreground)' }}>
                {JALALI_MONTHS[calMonth - 1]} {toFarsiNumber(calYear)}
              </span>
              <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-lg font-bold" style={{ color: 'var(--foreground)' }}>‹</button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
              {JALALI_WEEKDAYS.map(d => (
                <div key={d} className="text-center text-xs font-semibold py-1" style={{ color: 'var(--muted-foreground)' }}>{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-y-1">
              {cells.map((day, i) => {
                if (!day) return <div key={i} />
                const available = isAvailable(day)
                const selected = isSelected(day)
                const today = isToday(day)
                return (
                  <button
                    key={i}
                    disabled={!available}
                    onClick={() => available && handleDateSelect(calYear, calMonth, day)}
                    className="w-full aspect-square flex items-center justify-center text-sm rounded-full transition-all"
                    style={{
                      background: selected ? 'var(--primary)' : today ? 'var(--muted)' : 'transparent',
                      color: selected ? 'var(--primary-foreground)' : available ? 'var(--foreground)' : 'var(--muted-foreground)',
                      fontWeight: available ? '600' : '400',
                      opacity: available ? 1 : 0.35,
                      cursor: available ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {toFarsiNumber(day)}
                  </button>
                )
              })}
            </div>

            {/* Selected date display */}
            {selectedDate && (
              <div className="mt-4 p-3 rounded-lg text-sm text-center font-semibold" style={{ background: 'var(--muted)', color: 'var(--primary)' }}>
                {(() => {
                  const [y, m, d] = selectedDate.split('/').map(Number)
                  const { gy, gm, gd } = jalaali.toGregorian(y, m, d)
                  const greg = new Date(gy, gm - 1, gd)
                  return `${getDayName(greg.getDay())} ${toFarsiNumber(d)} ${JALALI_MONTHS[m - 1]} ${toFarsiNumber(y)}`
                })()}
              </div>
            )}

            <Button
              onClick={handleConfirm}
              disabled={!selectedDate}
              className="w-full mt-4"
              style={{ background: selectedDate ? 'var(--primary)' : 'var(--muted)', color: selectedDate ? 'var(--primary-foreground)' : 'var(--muted-foreground)' }}
            >
              تایید و ادامه رزرو
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
