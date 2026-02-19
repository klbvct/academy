'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: number
  fullName: string
  email: string
}

interface TestResult {
  testId: number
  testTitle: string
  data: Record<string, any>
  completedAt: string | null
  hasRecommendations: boolean
}

interface Question {
  number: number
  text: string
  a?: string
  b?: string
  c?: string
  options?: string[]
}

interface ModuleData {
  module: number
  title: string
  instruction: string
  type: string
  questions?: Question[]
  values?: Question[]
  scale?: any[]
  max_rank?: number
}

export default function TestAnswersPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  const testId = params.testId as string
  
  const [user, setUser] = useState<User | null>(null)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [modules, setModules] = useState<ModuleData[]>([])
  const [activeModule, setActiveModule] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        
        // Load test results
        const response = await fetch(`/api/admin/users/${userId}/test-results`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          throw new Error('Помилка завантаження даних')
        }

        const data = await response.json()
        setUser(data.user)
        
        // Find specific test result
        const result = data.results.find((r: TestResult) => r.testId === parseInt(testId))
        if (!result) {
          throw new Error('Результати тесту не знайдено')
        }
        setTestResult(result)

        // Load all module JSON files
        const modulePromises = []
        for (let i = 1; i <= 8; i++) {
          modulePromises.push(
            fetch(`/quiz/module${i}.json`).then(res => res.json())
          )
        }
        const modulesData = await Promise.all(modulePromises)
        setModules(modulesData)
        
      } catch (err: any) {
        setError(err.message || 'Помилка завантаження даних')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    if (userId && testId) {
      fetchData()
    }
  }, [userId, testId])

  const getAnswerDisplay = (moduleNum: number, question: Question, answer: string) => {
    const moduleData = modules[moduleNum - 1]
    if (!moduleData) return answer

    switch (moduleData.type) {
      case 'choice_ab':
        return answer === 'a' ? `А. ${question.a}` : `Б. ${question.b}`
      
      case 'choice_abc':
        if (answer === 'a') return `А. ${question.a}`
        if (answer === 'b') return `Б. ${question.b}`
        return `В. ${question.c}`
      
      case 'choice_professions':
        return answer === 'a' ? question.a : question.b
      
      case 'scale_5':
      case 'scale_1_5':
      case 'scale_schwartz':
        return `${answer}`
      
      case 'ranking':
        return `${answer}`
      
      case 'modality_ranking':
        // For Module 8, answers are stored as q1_opt0, q1_opt1, etc.
        return `${answer}`
      
      default:
        return answer
    }
  }

  const renderModuleAnswers = (moduleNum: number) => {
    if (!testResult || !modules[moduleNum - 1]) return null

    const moduleData = modules[moduleNum - 1]
    
    // Module 4 uses 'values' instead of 'questions'
    const items = moduleData.questions || (moduleData as any).values || []
    
    if (!items || items.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <p>Питання модуля не завантажено</p>
        </div>
      )
    }
    
    const moduleAnswers = testResult.data[`module${moduleNum}`] || {}
    
    if (Object.keys(moduleAnswers).length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <p>Модуль не пройдено</p>
        </div>
      )
    }

    // Special handling for Module 8 (modality_ranking)
    if (moduleData.type === 'modality_ranking') {
      return (
        <div className="space-y-8">
          {items.map((question: Question) => {
            const options = question.options || []
            return (
              <div key={question.number} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-blue-50 border-b border-gray-200 px-6 py-3">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Питання {question.number}: {question.text}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-2 text-left text-xs font-semibold text-gray-700">Варіант</th>
                        <th className="px-6 py-2 text-left text-xs font-semibold text-gray-700 w-24">Ранг</th>
                      </tr>
                    </thead>
                    <tbody>
                      {options.map((option: string, idx: number) => {
                        const answerKey = `q${question.number}_opt${idx}`
                        const answer = moduleAnswers[answerKey]
                        return (
                          <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-3 text-gray-700 text-sm">{option}</td>
                            <td className="px-6 py-3 text-gray-900 text-center text-sm">
                              {answer || '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      )
    }

    // Regular modules - table format
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 w-12">№</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Питання</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Відповідь</th>
              </tr>
            </thead>
            <tbody>
              {items.map((question: Question) => {
                const answerKey = `q${question.number}`
                const answer = moduleAnswers[answerKey]
                if (!answer) return null

                return (
                  <tr key={question.number} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-900 font-semibold text-sm">{question.number}</td>
                    <td className="px-6 py-3 text-gray-700 text-sm">{question.text}</td>
                    <td className="px-6 py-3 text-gray-900 text-sm">
                      {getAnswerDisplay(moduleNum, question, answer)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Завантаження...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href={`/admin/users/${userId}`} className="text-blue-600 hover:underline">
            Повернутися до користувача
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/admin/users/${userId}`} className="text-blue-600 hover:underline mb-6 inline-flex items-center gap-2">
            ← Повернутися до користувача
          </Link>
          
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Відповіді на тест
              </h1>
              {testResult?.hasRecommendations ? (
                <Link
                  href={`/admin/users/${userId}/test-report/${testId}`}
                  className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2"
                >
                  <span>↗</span>
                  Переглянути результати
                </Link>
              ) : (
                <button
                  disabled
                  title="Результати ще не згенеровані або тест не оплачено"
                  className="px-5 py-2 bg-gray-200 text-gray-400 text-sm rounded-lg font-semibold cursor-not-allowed flex items-center gap-2"
                >
                  <span>↗</span>
                  Переглянути результати
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Info */}
              <div className="border-l-4 border-blue-500 pl-6">
                <p className="text-gray-600 text-sm mb-1">Користувач</p>
                <p className="text-xl font-semibold text-gray-900 mb-2">
                  {user?.fullName}
                </p>
                <p className="text-gray-600 text-sm">
                  {user?.email}
                </p>
              </div>
              
              {/* Test Info */}
              <div className="border-l-4 border-green-500 pl-6">
                <p className="text-gray-600 text-sm mb-1">Тест</p>
                <p className="text-xl font-semibold text-gray-900 mb-2">
                  {testResult?.testTitle}
                </p>
                {testResult?.completedAt && (
                  <p className="text-gray-600 text-sm">
                    ✓ Завершено: {new Date(testResult.completedAt).toLocaleString('uk-UA')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Module Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
          <div className="flex overflow-x-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
              const moduleData = modules[num - 1]
              const hasAnswers = testResult?.data[`module${num}`] && 
                Object.keys(testResult.data[`module${num}`]).length > 0
              
              return (
                <button
                  key={num}
                  onClick={() => setActiveModule(num)}
                  className={`flex-shrink-0 px-6 py-4 font-semibold transition-colors relative ${
                    activeModule === num
                      ? 'bg-blue-600 text-white'
                      : hasAnswers
                      ? 'bg-white text-gray-700 hover:bg-gray-50'
                      : 'bg-white text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>Модуль {num}</span>
                    {hasAnswers && activeModule !== num && (
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Module Content */}
        <div>
          {modules[activeModule - 1] && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {modules[activeModule - 1].title}
              </h2>
              <p className="text-gray-600">
                {modules[activeModule - 1].instruction}
              </p>
            </div>
          )}
          
          {renderModuleAnswers(activeModule)}
        </div>
      </div>
    </div>
  )
}
