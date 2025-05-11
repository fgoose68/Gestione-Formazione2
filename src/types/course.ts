export interface Course {
  id: string
  title: string
  start_date: string
  end_date: string
  departments: DepartmentStats[]
}

export interface DepartmentStats {
  name: string
  participants: number
}