'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function ProceduresList() {
  const [procedures, setProcedures] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchProcedures = async () => {
      const { data } = await supabase
        .from('procedures')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
      
      if (data) setProcedures(data)
      setLoading(false)
    }

    fetchProcedures()
  }, [])

  if (loading) {
    return <div className="text-center py-8">درحال بارگذاری...</div>
  }

  // Group by category
  const categories = [...new Set(procedures.map(p => p.category))]

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const categoryProcs = procedures.filter(p => p.category === category)
        return (
          <div key={category}>
            <h3 className="text-xl font-bold mb-4">{category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryProcs.map((proc) => (
                <Card key={proc.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{proc.name_fa}</CardTitle>
                        <CardDescription>{proc.name}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {proc.description_fa && (
                      <p className="text-sm text-muted-foreground">
                        {proc.description_fa}
                      </p>
                    )}
                    <div className="flex justify-between items-end">
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          {proc.duration_minutes} دقیقه
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {(proc.price / 1000000).toFixed(1)}
                        </p>
                        <p className="text-xs text-muted-foreground">میلیون تومان</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
