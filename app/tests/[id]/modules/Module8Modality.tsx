import { Question } from '../types'

interface Module8ModalityProps {
  questions: Question[]
  answers: Record<string, string>
  onAnswerChange: (questionNumber: number, value: string) => void
}

export function Module8Modality({ questions, answers, onAnswerChange }: Module8ModalityProps) {
  // Специальный handler для изменения ответа с ключом option
  const handleOptionChange = (questionNumber: number, optIndex: number, value: string) => {
    // Кодируем как: -1 * (questionNumber * 100 + optIndex) чтобы отличить от обычных
    // Отрицательное число будет показателем что это Module 8
    const encodedNumber = -1 * (questionNumber * 1000 + optIndex)
    onAnswerChange(encodedNumber, value)
  }

  return (
    <div className="space-y-6">
      {/* Подсказка */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800 font-regular">
          Для кожного питання оберіть оцінку від 1 до 4 для кожного варіанту. Кожна цифра може бути використана тільки один раз. Вже обрані цифри зникають зі списку.
        </p>
      </div>

      {questions.map((question, index) => {
        const options = (question as any).options || []
        
        return (
          <div key={index} className="pb-6 border-b border-gray-200 last:border-b-0 last:pb-0">
            <label className="block mb-4">
              <span className="font-semibold text-gray-900 text-sm">
                {question.number}. {question.text || ''}
              </span>
            </label>

            <div className="space-y-4">
              {options.map((option: string, optIndex: number) => {
                // Получить все уже использованные ранги для этого вопроса
                const usedRanks: string[] = []
                for (let i = 0; i < options.length; i++) {
                  const key = `q${question.number}_opt${i}`
                  if (i !== optIndex && answers[key]) {
                    usedRanks.push(answers[key])
                  }
                }

                const currentKey = `q${question.number}_opt${optIndex}`

                return (
                  <div key={optIndex} className="flex items-center gap-4 bg-gray-50 rounded-lg p-4">
                    <div className="flex-1">
                      <span className="text-gray-700 font-regular text-sm">{option}</span>
                    </div>
                    <select
                      value={answers[currentKey] || ''}
                      onChange={(e) => handleOptionChange(question.number, optIndex, e.target.value)}
                      className="w-12 py-1.5 border-2 rounded-lg cursor-pointer transition-all focus:outline-none text-center"
                      style={{
                        borderColor: answers[currentKey] ? '#0c68f5' : '#e5e7eb',
                        color: '#374151',
                      }}
                      required
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#0c68f5'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = answers[currentKey]
                          ? '#0c68f5'
                          : '#e5e7eb'
                      }}
                    >
                      <option value=""></option>
                      {[1, 2, 3, 4].map((rank) => {
                        const isUsed = usedRanks.includes(rank.toString())
                        if (isUsed) return null
                        return (
                          <option key={rank} value={rank}>
                            {rank}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
