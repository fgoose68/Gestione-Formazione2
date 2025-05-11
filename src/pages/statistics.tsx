import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button' // Importa Button direttamente
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, isThisMonth } from 'date-fns'
import { it } from 'date-fns/locale'

interface Course {
  id: string
  title: string
  start_date: string
  end_date: string
  departments: {
    name: string
    participants: number
  }[]
}

export default function StatisticsPage() {
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('courses')
          .select(`
            id,
            title,
            start_date,
            end_date,
            departments (name, participants)
          `)
          .gte('start_date', format(startOfMonth(selectedMonth), 'yyyy-MM-dd'))
          .lte('end_date', format(endOfMonth(selectedMonth), 'yyyy-MM-dd'))
          .order('start_date', { ascending: true })

        if (error) throw error
        setCourses(data as Course[])
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [selectedMonth])

  const handleMonthChange = (date: Date) => {
    setSelectedMonth(startOfMonth(date))
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <div>Statistiche corsi mensili</div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleMonthChange(subMonths(selectedMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-lg font-medium">
                {format(selectedMonth, 'MMMM yyyy', { locale: it })}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleMonthChange(addMonths(selectedMonth, 1))}
                disabled={isThisMonth(selectedMonth)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nessun corso trovato per questo periodo
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Titolo del corso</TableHead>
                  <TableHead className="w-1/3">Periodo</TableHead>
                  <TableHead className="w-1/3">Partecipanti per reparto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>
                      {format(new Date(course.start_date), 'dd MMM yyyy', { locale: it })} -{' '}
                      {format(new Date(course.end_date), 'dd MMM yyyy', { locale: it })}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {course.departments.map((dept) => (
                          <div key={dept.name} className="flex justify-between">
                            <span>{dept.name}:</span>
                            <span className="font-medium">{dept.participants}</span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}