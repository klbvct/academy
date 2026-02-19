'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ModuleData } from './types'
import { Module1ChoiceAB } from './modules/Module1ChoiceAB'
import { Module2Scale5 } from './modules/Module2Scale5'
import { Module3ChoiceABC } from './modules/Module3ChoiceABC'
import { Module4Ranking } from './modules/Module4Ranking'
import { Module5Scale15 } from './modules/Module5Scale15'
import { Module6Schwartz } from './modules/Module6Schwartz'
import { Module7Professions } from './modules/Module7Professions'
import { Module8Modality } from './modules/Module8Modality'
import { useLoadingAction } from '@/app/hooks/useLoadingAction'

export default function TestPage() {
  const router = useRouter()
  const params = useParams()
  const testId = params.id as string
  const { executeWithLoading } = useLoadingAction()

  const [currentModule, setCurrentModule] = useState(1)
  const [moduleData, setModuleData] = useState<ModuleData | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [progressLoaded, setProgressLoaded] = useState(false)

  // Загрузить прогресс теста при инициализации
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/tests/${testId}/progress`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.lastCompletedModule > 0) {
            // Начать с следующего модуля после последнего пройденного
            setCurrentModule(data.lastCompletedModule + 1)
          }
        }
      } catch (err) {
        console.error('Error loading progress:', err)
        // В случае ошибки начинаем с модуля 1
      } finally {
        setProgressLoaded(true)
      }
    }

    loadProgress()
  }, [testId])

  // Загружаем модуль при изменении номера
  useEffect(() => {
    // Не загружать модуль пока не загрузили прогресс
    if (!progressLoaded) return

    const loadModule = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(`/api/tests/modules?module=${currentModule}`)
        const data = await response.json()

        if (!data.success) {
          setError('Помилка при завантаженні модуля')
          return
        }

        setModuleData(data.data)
        setAnswers({})
      } catch (err) {
        console.error('Error loading module:', err)
        setError('Помилка при завантаженні модуля')
      } finally {
        setLoading(false)
      }
    }

    loadModule()
  }, [currentModule, progressLoaded])

  const handleAnswerChange = (questionNumber: number, value: string) => {
    // Для модуля 8: если questionNumber < 0, то это закодированное значение
    // формата: -1 * (questionNumber * 1000 + optIndex)
    if (questionNumber < 0) {
      const decoded = -1 * questionNumber
      const actualQuestionNumber = Math.floor(decoded / 1000)
      const optIndex = decoded % 1000
      const key = `q${actualQuestionNumber}_opt${optIndex}`
      setAnswers(prev => ({
        ...prev,
        [key]: value,
      }))
    } else {
      setAnswers(prev => ({
        ...prev,
        [`q${questionNumber}`]: value,
      }))
    }
  }



  const handleNextModule = async () => {
    // Браузер автоматически заблокирует отправку и покажет ошибку валидации
    if (currentModule === 8) {
      // Завершить тест
      await handleCompleteTest()
      return
    }

    await executeWithLoading(async () => {
      // Сохранить ответы перед переходом
      const saved = await saveAnswers()
      
      // Переходить только если ответы успешно сохранены
      if (saved) {
        setCurrentModule(currentModule + 1)
        setAnswers({})
      } else {
        alert('Помилка при збереженні відповідей. Спробуйте ще раз.')
      }
    })
  }

  const saveAnswers = async (): Promise<boolean> => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')

      const response = await fetch('/api/tests/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          testId: parseInt(testId),
          module: currentModule,
          answers,
        }),
      })

      if (!response.ok) {
        console.error('Server returned error:', response.status)
        return false
      }

      return true
    } catch (err) {
      console.error('Error saving answers:', err)
      return false
    } finally {
      setSaving(false)
    }
  }

  const handleCompleteTest = async () => {
    setSaving(true)
    await executeWithLoading(async () => {
      try {
        const token = localStorage.getItem('token')

        // Зберегти финальні відповіді
        const saved = await saveAnswers()
        
        if (!saved) {
          setError('Помилка при збереженні відповідей модуля 8')
          return
        }

        // Завершить тест
        const response = await fetch(`/api/tests/${testId}/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            answers,
          }),
        })

        if (response.ok) {
          router.push('/dashboard')
        } else {
          setError('Помилка при завершенні тесту')
        }
      } catch (err) {
        console.error('Error completing test:', err)
        setError('Помилка при завершенні тесту')
      } finally {
        setSaving(false)
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Завантаження модуля...</p>
        </div>
      </div>
    )
  }

  if (error || !moduleData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Помилка при завантаженні'}</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Повернутися до кабінету
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0c68f5 0%, #764ba2 100%)' }}>
      <div className="min-h-screen bg-gray-50" style={{ marginTop: '-100vh', paddingTop: '100vh' }}>
        <div className="max-w-[900px] mx-auto px-4">
          {/* Header */}
          <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50" style={{ boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)' }}>
            <div className="max-w-[900px] mx-auto px-4 py-4 flex items-center justify-between gap-4">
              <h1 className="text-2xl font-bold" style={{ color: '#0c68f5' }}>
                {moduleData.title}
              </h1>
              <div className="flex-1 mx-4">
                <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all rounded-full"
                    style={{ 
                      width: `${(currentModule / 8) * 100}%`,
                      background: 'linear-gradient(135deg, #0c68f5 0%, #764ba2 100%)'
                    }}
                  />
                </div>
              </div>
              <span className="text-sm font-semibold whitespace-nowrap" style={{ color: '#0c68f5' }}>
                Модуль {currentModule} з 8
              </span>
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all hover:bg-red-50"
                style={{ color: '#dc2626' }}
              >
                Вихід
              </Link>
            </div>
          </div>

        {/* Instruction */}
        <div className="mt-24 mb-8">
          <div className="bg-gray-100 rounded-lg p-6 mb-8" style={{ backgroundColor: '#f3f4f6' }}>
            <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
              {moduleData.instruction}
            </p>
            {moduleData.subtitle && (
              <p className="text-sm font-semibold mt-3" style={{ color: '#0c68f5' }}>
                {moduleData.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Questions */}
        <form onSubmit={(e) => { e.preventDefault(); handleNextModule() }}>
          <div className="bg-white rounded-2xl p-8 mb-8" style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)' }}>
            {moduleData.type === 'choice_ab' && (
              <Module1ChoiceAB questions={moduleData.questions} answers={answers} onAnswerChange={handleAnswerChange} />
            )}

            {moduleData.type === 'scale_5' && (
              <Module2Scale5 questions={moduleData.questions} answers={answers} onAnswerChange={handleAnswerChange} scale={moduleData.scale} />
            )}

            {moduleData.type === 'choice_abc' && (
              <Module3ChoiceABC questions={moduleData.questions} answers={answers} onAnswerChange={handleAnswerChange} />
            )}

            {moduleData.type === 'scale_1_5' && (
              <Module5Scale15 questions={moduleData.questions} answers={answers} onAnswerChange={handleAnswerChange} />
            )}

            {moduleData.type === 'ranking' && (
              <Module4Ranking questions={moduleData.questions} answers={answers} onAnswerChange={handleAnswerChange} maxRank={moduleData.max_rank} />
            )}

            {moduleData.type === 'scale_schwartz' && (
              <Module6Schwartz questions={moduleData.questions} answers={answers} onAnswerChange={handleAnswerChange} scale={moduleData.scale} />
            )}

            {moduleData.type === 'choice_professions' && (
              <Module7Professions questions={moduleData.questions} answers={answers} onAnswerChange={handleAnswerChange} />
            )}

            {moduleData.type === 'modality_ranking' && (
              <Module8Modality questions={moduleData.questions} answers={answers} onAnswerChange={handleAnswerChange} />
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center mb-8">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 text-white rounded-lg font-semibold transition-all hover:shadow-lg disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #0c68f5 0%, #764ba2 100%)'
              }}
            >
              {saving ? 'Завантаження...' : currentModule === 8 ? 'Завершити тест' : 'Далі'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  )
}
