'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface BookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Clinic = 'tehran' | 'karaj'

const CLINICS = {
  tehran: {
    label: 'کلینیک تهران',
    days: [3],
    daysLabel: 'چهارشنبه‌ها',
    address: 'سعادت آباد - بلوار کوهستان - رو به روی اپال - پلاک ۱۱',
    phone: '۰۹۳۰۳۰۱۹۱۰۹',
  },
  karaj: {
    label: 'مطب کرج',
    days: [6, 0, 2],
    daysLabel: 'شنبه، یکشنبه و سه‌شنبه',
    address: 'چهاراه طالقانی به سمت میدان شهدا - برج آراد - طبقه هشتم - واحد ۸۰۳',
    phone: '۰۹۹۱۱۳۲۰۰۳۰',
  },
}

const JALALI_MONTHS = [
  'فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور',
  'مهر','آبان','آذر','دی','بهمن','اسفند',
]

const JALALI_WEEKDAYS = ['ش','ی','د','س','چ','پ','ج']

const DAY_NAMES = ['یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه','شنبه']

function toFarsi(n: number | string): string {
  return String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d])
}

function gToJ(gy: number, gm: number, gd: number): [number, number, number] {
  const g = [0,31,((gy%4===0&&gy%100!==0)||(gy%400===0))?29:28,31,30,31,30,31,31,30,31,30,31]
  let jy = gy - 1600, jm = 0, jd = 0
  let gy2 = gy - 1, gdn = 365*gy2 + Math.floor(gy2/4) - Math.floor(gy2/100) + Math.floor(gy2/400)
  let jdn = gdn - 948
  let jcycle = Math.floor(jdn/1029983), rem = jdn%1029983
  let jy1 = 0
  if (rem === 1029982) jy1 = 2820
  else {
    const h = Math.floor(rem/366), j = rem%366
    jy1 = Math.floor((2134*h + 2816*j + 2815)/1028522) + h + 1
  }
  jy = jy1 + 2820*jcycle + 474
  if (jy <= 0) jy--
  let jdn2 = gdn - (365*(jy-1) + Math.floor((jy-474)%2820/820)*683 + Math.floor(((jy-474)%2820+474+38)*682/2816) + (jy-474)*365 + 948) + 1
  jm = jdn2 <= 186 ? Math.ceil(jdn2/31) : Math.ceil((jdn2-6)/30)
  jd = jdn2 - (jm <= 6 ? (jm-1)*31 : (jm-7)*30+186)
  void jy; void jm; void jd; void g
  // Use simple algorithm
  return gregorianToJalali(gy, gm, gd)
}

function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_no = [31, ((gy%4===0 && gy%100!==0)||(gy%400===0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  const j_d_no = [31,31,31,31,31,31,30,30,30,30,30,29]
  let jy: number, jm: number, jd: number
  let g_y = gy - 1600, g_m = gm - 1, g_d = gd - 1
  let g_d_no2 = 365*g_y + Math.floor((g_y+3)/4) - Math.floor((g_y+99)/100) + Math.floor((g_y+399)/400)
  for (let i=0; i<g_m; i++) g_d_no2 += g_d_no[i]
  g_d_no2 += g_d
  let j_d_no2 = g_d_no2 - 79
  const j_np = Math.floor(j_d_no2/12053); j_d_no2 %= 12053
  jy = 979 + 33*j_np + 4*Math.floor(j_d_no2/1461); j_d_no2 %= 1461
  if (j_d_no2 >= 366) { jy += Math.floor((j_d_no2-1)/365); j_d_no2 = (j_d_no2-1)%365 }
  for (let i=0; i<11 && j_d_no2 >= j_d_no[i]; i++) { j_d_no2 -= j_d_no[i]; jy += i<11 ? 0 : 0 }
  // simplified
  jm = 1; jd = 1
  let rem2 = j_d_no2
  for (let i=0; i<12; i++) {
    if (rem2 < j_d_no[i]) { jm = i+1; jd = rem2+1; break }
    rem2 -= j_d_no[i]
  }
  return [jy, jm, jd]
}

function jalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  const j_d_no = [31,31,31,31,31,31,30,30,30,30,30,29]
  let jy2 = jy - 979, jm2 = jm - 1, jd2 = jd - 1
  let j_day_no = 365*jy2 + Math.floor(jy2/33)*8 + Math.floor((jy2%33+3)/4)
  for (let i=0; i<jm2; i++) j_day_no += j_d_no[i]
  j_day_no += jd2
  let g_day_no = j_day_no + 79
  let gy = 1600 + 400*Math.floor(g_day_no/146097); g_day_no %= 146097
  let leap = true
  if (g_day_no >= 36525) {
    g_day_no--
    gy += 100*Math.floor(g_day_no/36524); g_day_no %= 36524
    if (g_day_no >= 365) g_day_no++
    else leap = false
  }
  gy += 4*Math.floor(g_day_no/1461); g_day_no %= 1461
  if (g_day_no >= 366) { leap = false; g_day_no--; gy += Math.floor(g_day_no/365); g_day_no %= 365 }
  const g_d_no = [31, leap ? 29 : 28, 31,30,31,30,31,31,30,31,30,31]
  let gm = 0, gd = 0
  for (let i=0; g_day_no >= g_d_no[i]; i++) g_day_no -= g_d_no[i]
  gm = i+1; gd = g_day_no+1
  return [gy, gm, gd]
}

function jalaliMonthDays(jy: number, jm: number): number {
  if (jm <= 6) return 31
  if (jm <= 11) return 30
  const rem = ((jy - 474) % 2820 + 2820) % 2820
  return rem + 474 + 38 > 0 && (rem*682)%2816 < 682 ? 30 : 29
}

export function BookingDialog({ open, onOpenChange }: BookingDialogProps) {
  const [step, setStep] = useState<'clinic' | 'date'>('clinic')
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const now = new Date()
  now.setHours(0,0,0,0)
  const [ty, tm, td] = gregorianToJalali(now.getFullYear(), now.getMonth()+1, now.getDate())
  const [calYear, setCalYear] = useState(ty)
  const [calMonth, setCalMonth] = useState(tm)

  function selectClinic(c: Clinic) {
    setSelectedClinic(c)
    setSelectedDate(null)
    setCalYear(ty)
    setCalMonth(tm)
    setStep('date')
  }

  function prevMonth() {
    if (calMonth === 1) { setCalYear(y => y-1); setCalMonth(12) }
    else setCalMonth(m => m-1)
  }

  function nextMonth() {
    if (calMonth === 12) { setCalYear(y => y+1); setCalMonth(1) }
    else setCalMonth(m => m+1)
  }

  function isAvailable(jd: number): boolean {
    if (!selectedClinic) return false
    const [gy, gm, gd] = jalaliToGregorian(calYear, calMonth, jd)
    const d = new Date(gy, gm-1, gd)
    d.setHours(0,0,0,0)
    const end = new Date(now); end.setDate(end.getDate()+56)
    if (d < now || d > end) return false
    return CLINICS[selectedClinic].days.includes(d.getDay())
  }

  function buildGrid(): (number|null)[] {
    const days = jalaliMonthDays(calYear, calMonth)
    const [gy, gm, gd] = jalaliToGregorian(calYear, calMonth, 1)
    const dow = new Date(gy, gm-1, gd).getDay()
    const offset = dow === 6 ? 0 : dow+1
    const cells: (number|null)[] = Array(offset).fill(null)
    for (let d=1; d<=days; d++) cells.push(d)
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }

  const cells = buildGrid()

  function handleClose(v: boolean) {
    if (!v) { setStep('clinic'); setSelectedClinic(null); setSelectedDate(null) }
    onOpenChange(v)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm w-full p-0 overflow-hidden rounded-xl">
        <DialogHeader className="px-5 pt-5 pb-2">
          <DialogTitle className="text-lg font-bold text-primary">رزرو نوبت آنلاین</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {step === 'clinic' ? 'مطب مورد نظر را انتخاب کنید' : 'تاریخ مراجعه را انتخاب کنید'}
          </DialogDescription>
        </DialogHeader>

        {step === 'clinic' && (
          <div className="p-5 space-y-3">
            {(Object.keys(CLINICS) as Clinic[]).map((key) => (
              <button
                key={key}
                onClick={() => selectClinic(key)}
                className="w-full text-right p-4 rounded-lg border-2 border-border bg-card transition-all hover:border-primary hover:bg-primary/5"
              >
                <p className="font-bold text-base text-foreground">{CLINICS[key].label}</p>
                <p className="text-xs mt-1 font-medium text-primary">{CLINICS[key].daysLabel}</p>
                <p className="text-xs mt-1 text-muted-foreground">{CLINICS[key].address}</p>
              </button>
            ))}
          </div>
        )}

        {step === 'date' && selectedClinic && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => { setStep('clinic'); setSelectedClinic(null) }} className="text-xs px-3 py-1 rounded-full border border-border text-muted-foreground hover:bg-muted">
                تغییر مطب
              </button>
              <span className="text-sm font-semibold text-primary">{CLINICS[selectedClinic].label}</span>
            </div>

            <div className="flex items-center justify-between mb-3">
              <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted font-bold">›</button>
              <span className="font-bold text-sm">{JALALI_MONTHS[calMonth-1]} {toFarsi(calYear)}</span>
              <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted font-bold">‹</button>
            </div>

            <div className="grid grid-cols-7 mb-1">
              {JALALI_WEEKDAYS.map(d => (
                <div key={d} className="text-center text-xs font-semibold py-1 text-muted-foreground">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1">
              {cells.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} />
                const avail = isAvailable(day)
                const sel = selectedDate === `${calYear}/${calMonth}/${day}`
                const isToday = calYear === ty && calMonth === tm && day === td
                return (
                  <button
                    key={`day-${i}`}
                    disabled={!avail}
                    onClick={() => avail && setSelectedDate(`${calYear}/${calMonth}/${day}`)}
                    className={[
                      'w-full aspect-square flex items-center justify-center text-xs rounded-full transition-all',
                      sel ? 'bg-primary text-primary-foreground font-bold' : '',
                      isToday && !sel ? 'ring-2 ring-primary font-semibold' : '',
                      avail && !sel ? 'hover:bg-primary/10 cursor-pointer text-foreground' : '',
                      !avail ? 'text-muted-foreground/30 cursor-not-allowed' : '',
                    ].join(' ')}
                  >
                    {toFarsi(day)}
                  </button>
                )
              })}
            </div>

            {selectedDate && (
              <div className="mt-3 p-3 rounded-lg text-sm text-center font-semibold bg-muted text-primary">
                {(() => {
                  const [y, m, d] = selectedDate.split('/').map(Number)
                  const [gy, gm, gd] = jalaliToGregorian(y, m, d)
                  const dow = new Date(gy, gm-1, gd).getDay()
                  return `${DAY_NAMES[dow]} ${toFarsi(d)} ${JALALI_MONTHS[m-1]} ${toFarsi(y)}`
                })()}
              </div>
            )}

            <Button onClick={() => handleClose(false)} disabled={!selectedDate} className="w-full mt-3">
              تایید و ادامه رزرو
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
