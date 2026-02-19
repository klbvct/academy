import { Question } from '../types'

interface Module4RankingProps {
  questions: Question[]
  answers: Record<string, string>
  onAnswerChange: (questionNumber: number, value: string) => void
  maxRank?: number
}

export function Module4Ranking({ questions, answers, onAnswerChange, maxRank = 18 }: Module4RankingProps) {
  return (
    <div className="space-y-6">
      {/* Подсказка */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <p className="text-blue-800 font-regular">
          Оберіть місце для кожної цінності від 1 до 18, де 1 - найважливіше, 18 - найменш важливе. Вже обрані місця зникають зі списку.
        </p>
      </div>

      {questions.map((question, index) => (
        <div key={index} className="pb-6 border-b border-gray-200 last:border-b-0 last:pb-0">
          <div className="flex items-center gap-4">
            <label className="flex-1">
              <span className="font-regular text-gray-900 text-sm">
                {question.number}. {question.text || ''}
              </span>
            </label>

            <div className="w-32">
              {(() => {
                // Get all used ranks except current question's rank
                const usedRanks = Object.entries(answers)
                  .filter(([key, _]) => key !== `q${question.number}`)
                  .map(([_, value]) => value)

                return (
                  <select
                    value={answers[`q${question.number}`] || ''}
                    onChange={(e) => onAnswerChange(question.number, e.target.value)}
                    className="w-full px-3 py-2 border-2 rounded-lg cursor-pointer transition-all focus:outline-none"
                    style={{
                      borderColor: answers[`q${question.number}`] ? '#0c68f5' : '#e5e7eb',
                      color: '#374151',
                      fontSize: '0.875rem',
                      textAlign: 'center',
                    }}
                    required
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#0c68f5'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = answers[`q${question.number}`]
                        ? '#0c68f5'
                        : '#e5e7eb'
                    }}
                  >
                    <option value="">Виберіть...</option>
                    {[...Array(maxRank)].map((_, i) => {
                      const rank = (i + 1).toString()
                      const isUsed = usedRanks.includes(rank)
                      if (isUsed) return null
                      return (
                        <option key={i + 1} value={rank}>
                          {i + 1}
                        </option>
                      )
                    })}
                  </select>
                )
              })()}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
