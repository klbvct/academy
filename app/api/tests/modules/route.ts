import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

interface Question {
  number: number
  text?: string
  a?: string
  b?: string
  c?: string
  [key: string]: any
}

interface ModuleData {
  module: number
  title: string
  instruction: string
  subtitle?: string
  type: string
  scale?: string[]
  questions: Question[]
}

// GET - получить вопросы модуля
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const moduleNumber = searchParams.get('module')

    if (!moduleNumber || isNaN(Number(moduleNumber))) {
      return NextResponse.json(
        { success: false, message: 'Номер модуля обов\'язковий' },
        { status: 400 }
      )
    }

    const module = parseInt(moduleNumber)

    if (module < 1 || module > 8) {
      return NextResponse.json(
        { success: false, message: 'Модуль має бути від 1 до 8' },
        { status: 400 }
      )
    }

    // Читаем JSON файл с вопросами
    const filePath = path.join(
      process.cwd(),
      'public',
      'quiz',
      `module${module}.json`
    )

    const fileContent = await fs.readFile(filePath, 'utf-8')
    const moduleData = JSON.parse(fileContent)

    // Normalize: some modules use 'values' instead of 'questions'
    if (!moduleData.questions && moduleData.values) {
      moduleData.questions = moduleData.values
    }

    return NextResponse.json({
      success: true,
      data: moduleData,
    })
  } catch (error) {
    console.error('Error loading module:', error)

    if (error instanceof Error && error.message.includes('ENOENT')) {
      return NextResponse.json(
        { success: false, message: 'Модуль не знайдений' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Помилка при завантаженні модуля' },
      { status: 500 }
    )
  }
}
