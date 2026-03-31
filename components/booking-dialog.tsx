'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface BookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Clinic = 'tehran' | 'karaj'

// Generate 15-minute time slots between startTime and endTime inclusive
function generateTimeSlots(start: string, end: string, stepMinutes: number): string[] {
  const slots: string[] = []
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  let totalStart = sh * 60 + sm
  const totalEnd = eh * 60 + em
  while (totalStart <= totalEnd) {
    const h = Math.floor(totalStart / 60)
    const m = totalStart % 60
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    totalStart += stepMinutes
  }
  return slots
}

const CLINICS: Record<Clinic, {
  label: string
  days: number[]
  daysLabel: string
  address: string
  phone: string
  timeSlots: string[]
}> = {
  tehran: {
    label: 'کلینیک تهران',
    days: [3], // Wednesday in JS: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    daysLabel: 'چهارشنبه‌ها',
    address: 'سعادت آباد - بلوار کوهستان - رو به روی ایال - پلاک ۱۱',
    phone: '۰۹۳۰۳۰۱۹۱۰۹',
    timeSlots: generateTimeSlots('14:30', '20:30', 15),
  },
  karaj: {
    label: 'مطب کرج',
    days: [6, 0, 2], // Saturday=6, Sunday=0, Tuesday=2
    daysLabel: 'شنبه، یکشنبه و سه‌شنبه',
    address: 'چهاراه طالقانی به سمت میدان شهدا - برج آراد - طبقه هشتم - واحد ۸۰۳',
    phone: '۰۹۹۱۱۳۲۰۰۳۰',
    timeSlots: generateTimeSlots('09:00', '13:00', 15),
  },
}

const JALALI_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
]

const JALALI_WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

const DAY_NAMES = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه']

function toFarsiNumber(n: number | string): string {
  return String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d])
}

// Jalali to Gregorian conversion
function jalaliToGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number } {
  const jy1 = jy - 979
  const jm1 = jm - 1
  const jd1 = jd - 1

  const jdn = 365 * jy1 + Math.floor(jy1 / 33) * 8 + Math.floor((jy1 % 33 + 3) / 4)
    + (jm1 < 6 ? jm1 * 31 : 6 * 31 + (jm1 - 6) * 30) + jd1 + 584101

  const l = jdn + 68569
  const n = Math.floor(4 * l / 146097)
  const l2 = l - Math.floor((146097 * n + 3) / 4)
  const i = Math.floor(4000 * (l2 + 1) / 1461001)
  const l3 = l2 - Math.floor(1461 * i / 4) + 31
  const j = Math.floor(80 * l3 / 2447)
  const gd = l3 - Math.floor(2447 * j / 80)
  const l4 = Math.floor(j / 11)
  const gm = j + 2 - 12 * l4
  const gy = 100 * (n - 49) + i + l4

  return { gy, gm, gd }
}

// Gregorian to Jalali conversion
function gregorianToJalali(gy: number, gm: number, gd: number): { jy: number; jm: number; jd: number } {
  const gy1 = gy - 1600
  const gm1 = gm - 1
  const gd1 = gd - 1

  const gdn = 365 * gy1 + Math.floor((gy1 + 3) / 4) - Math.floor((gy1 + 99) / 100) + Math.floor((gy1 + 399) / 400)
    + gd1 + Math.floor((gm1 * 153 + (gm1 >= 2 ? -30 : 0) + (gm1 >= 8 ? 1 : 0)) / 5)
    + (gm1 >= 2 ? (gy % 4 === 0 && (gy % 100 !== 0 || gy % 400 === 0) ? -1 : -2) : 0)

  let jdn = gdn - 79
  const j33 = Math.floor(jdn / 12053)
  jdn = jdn % 12053
  const j4 = Math.floor(jdn / 1461)
  jdn = jdn % 1461

  let jy: number, jm: number, jd: number

  if (jdn >= 366) {
    const j1 = Math.floor((jdn - 1) / 365)
    jdn = (jdn - 1) % 365
    jy = 979 + 33 * j33 + 4 * j4 + j1
  } else {
    jy = 979 + 33 * j33 + 4 * j4
  }

  if (jdn < 186) {
    jm = 1 + Math.floor(jdn / 31)
    jd = 1 + (jdn % 31)
  } else {
    jm = 7 + Math.floor((jdn - 186) / 30)
    jd = 1 + ((jdn - 186) % 30)
  }

  return { jy, jm, jd }
}

// Get days in Jalali month
function jalaliMonthLength(jy: number, jm: number): number {
  if (jm <= 6) return 31
  if (jm <= 11) return 30
  const isLeap = ((jy - 474) % 2820 + 2820) % 2820
  const cycle = Math.floor(isLeap / 2820)
  const rem = isLeap % 2820
  const a = Math.floor((rem * 682) / 2816)
  const leap = (a + 474) % 128 < 47 || (a + 474) % 2820 === 0
  return leap ? 30 : 29
}

export function BookingDialog({ open, onOpenChange }: BookingDialogProps) {
  const [step, setStep] = useState<'clinic' | 'date' | 'time'>('clinic')
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const todayGreg = new Date()
  todayGreg.setHours(0, 0, 0, 0)
  const todayJalali = gregorianToJalali(todayGreg.getFullYear(), todayGreg.getMonth() + 1, todayGreg.getDate())
  const [calYear, setCalYear] = useState(todayJalali.jy)
  const [calMonth, setCalMonth] = useState(todayJalali.jm)

  function handleClinicSelect(clinic: Clinic) {
    setSelectedClinic(clinic)
    setSelectedDate(null)
    setSelectedTime(null)
    setCalYear(todayJalali.jy)
    setCalMonth(todayJalali.jm)
    setStep('date')
  }

  function handleDateSelect(jy: number, jm: number, jd: number) {
    setSelectedDate(`${jy}/${jm}/${jd}`)
    setSelectedTime(null)
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
    const { gy, gm, gd } = jalaliToGregorian(calYear, calMonth, jd)
    // Use UTC to avoid timezone issues with getDay()
    const greg = new Date(Date.UTC(gy, gm - 1, gd))
    const todayUTC = new Date(Date.UTC(todayGreg.getFullYear(), todayGreg.getMonth(), todayGreg.getDate()))
    const endUTC = new Date(todayUTC)
    endUTC.setUTCDate(endUTC.getUTCDate() + 56)
    if (greg < todayUTC || greg > endUTC) return false
    // getUTCDay(): 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
    return CLINICS[selectedClinic].days.includes(greg.getUTCDay())
  }

  function isSelected(jd: number): boolean {
    return selectedDate === `${calYear}/${calMonth}/${jd}`
  }

  function isToday(jd: number): boolean {
    return calYear === todayJalali.jy && calMonth === todayJalali.jm && jd === todayJalali.jd
  }

  // Build calendar grid
  function buildGrid() {
    const daysInMonth = jalaliMonthLength(calYear, calMonth)
    const { gy, gm, gd } = jalaliToGregorian(calYear, calMonth, 1)
    // Use UTC to get consistent day-of-week
    const firstDow = new Date(Date.UTC(gy, gm - 1, gd)).getUTCDay()
    // Convert JS day (0=Sun..6=Sat) to Jalali week col (0=Sat..6=Fri)
    const jalaliDow = firstDow === 6 ? 0 : firstDow + 1
    const cells: (number | null)[] = Array(jalaliDow).fill(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }

  const cells = buildGrid()

  function getSelectedDateLabel(): string {
    if (!selectedDate) return ''
    const [y, m, d] = selectedDate.split('/').map(Number)
    const { gy, gm, gd } = jalaliToGregorian(y, m, d)
    const greg = new Date(Date.UTC(gy, gm - 1, gd))
    return `${DAY_NAMES[greg.getUTCDay()]} ${toFarsiNumber(d)} ${JALALI_MONTHS[m - 1]} ${toFarsiNumber(y)}`
  }

  function handleConfirmDate() {
    if (selectedDate) setStep('time')
  }

  function handleConfirmBooking() {
    onOpenChange(false)
    setStep('clinic')
    setSelectedClinic(null)
    setSelectedDate(null)
    setSelectedTime(null)
  }

  function handleBack() {
    if (step === 'time') {
      setStep('date')
      setSelectedTime(null)
    } else {
      setStep('clinic')
      setSelectedClinic(null)
      setSelectedDate(null)
      setSelectedTime(null)
    }
  }

  function handleClose(isOpen: boolean) {
    if (!isOpen) {
      setStep('clinic')
      setSelectedClinic(null)
      setSelectedDate(null)
      setSelectedTime(null)
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm w-full p-0 overflow-hidden rounded-xl pointer-events-auto">
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle className="text-lg font-bold text-primary">
            رزرو نوبت آنلاین
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Choose clinic */}
        {step === 'clinic' && (
          <div className="p-5 space-y-3">
            <p className="text-sm text-muted-foreground">لطفا مطب مورد نظر را انتخاب کنید:</p>
            {(Object.entries(CLINICS) as [Clinic, typeof CLINICS.tehran][]).map(([key, clinic]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleClinicSelect(key)}
                className="w-full text-right p-4 rounded-lg border-2 border-border bg-card transition-all hover:border-primary hover:bg-primary/5"
              >
                <p className="font-bold text-base text-foreground">{clinic.label}</p>
                <p className="text-xs mt-1 text-primary">{clinic.daysLabel}</p>
                <p className="text-xs mt-1 text-muted-foreground">{clinic.address}</p>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Choose date */}
        {step === 'date' && selectedClinic && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <button type="button" onClick={handleBack} className="text-xs px-3 py-1 rounded-full border border-border text-muted-foreground hover:bg-muted">
                تغییر مطب
              </button>
              <span className="text-sm font-semibold text-primary">
                {CLINICS[selectedClinic].label}
              </span>
            </div>

            <div className="flex items-center justify-between mb-3">
              <button type="button" onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-lg font-bold text-foreground">›</button>
              <span className="font-bold text-base text-foreground">
                {JALALI_MONTHS[calMonth - 1]} {toFarsiNumber(calYear)}
              </span>
              <button type="button" onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-lg font-bold text-foreground">‹</button>
            </div>

            <div className="grid grid-cols-7 mb-1">
              {JALALI_WEEKDAYS.map(d => (
                <div key={d} className="text-center text-xs font-semibold py-1 text-muted-foreground">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1">
              {cells.map((day, i) => {
                if (!day) return <div key={i} />
                const available = isAvailable(day)
                const selected = isSelected(day)
                const today = isToday(day)
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={!available}
                    onClick={() => available && handleDateSelect(calYear, calMonth, day)}
                    className={[
                      'w-full aspect-square flex items-center justify-center text-sm rounded-full transition-all',
                      selected ? 'bg-primary text-primary-foreground font-semibold' : '',
                      today && !selected ? 'ring-2 ring-primary ring-offset-1 font-semibold' : '',
                      available && !selected ? 'hover:bg-primary/10 cursor-pointer font-medium text-foreground' : '',
                      !available ? 'text-muted-foreground/30 cursor-not-allowed' : '',
                    ].join(' ')}
                  >
                    {toFarsiNumber(day)}
                  </button>
                )
              })}
            </div>

            {selectedDate && (
              <div className="mt-4 p-3 rounded-lg text-sm text-center font-semibold bg-muted text-primary">
                {getSelectedDateLabel()}
              </div>
            )}

            <Button
              type="button"
              onClick={handleConfirmDate}
              disabled={!selectedDate}
              className="w-full mt-4"
            >
              انتخاب ساعت
            </Button>
          </div>
        )}

        {/* Step 3: Choose time slot */}
        {step === 'time' && selectedClinic && selectedDate && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <button type="button" onClick={handleBack} className="text-xs px-3 py-1 rounded-full border border-border text-muted-foreground hover:bg-muted">
                تغییر تاریخ
              </button>
              <span className="text-sm font-semibold text-primary">
                {getSelectedDateLabel()}
              </span>
            </div>

            <p className="text-xs text-muted-foreground mb-3 text-center">ساعت مورد نظر را انتخاب کنید:</p>

            <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
              {CLINICS[selectedClinic].timeSlots.map((slot) => {
                const isSelectedTime = selectedTime === slot
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={[
                      'py-2 px-1 rounded-lg text-sm font-medium border-2 transition-all text-center',
                      isSelectedTime
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-foreground hover:border-primary hover:bg-primary/5',
                    ].join(' ')}
                  >
                    {toFarsiNumber(slot)}
                  </button>
                )
              })}
            </div>

            {selectedTime && (
              <div className="mt-4 p-3 rounded-lg text-sm text-center font-semibold bg-muted text-primary">
                {getSelectedDateLabel()} — ساعت {toFarsiNumber(selectedTime)}
              </div>
            )}

            <Button
              type="button"
              onClick={handleConfirmBooking}
              disabled={!selectedTime}
              className="w-full mt-4"
            >
              تایید و ادامه رزرو
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
