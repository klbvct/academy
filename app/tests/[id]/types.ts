export interface Question {
  number: number
  text?: string
  a?: string
  b?: string
  c?: string
}

export interface ModuleData {
  module: number
  title: string
  instruction: string
  subtitle?: string
  type: string
  scale?: string[]
  questions: Question[]
  max_rank?: number
}
