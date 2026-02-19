import { Question } from '../types'

interface Module6SchwatzProps {
  questions: Question[]
  answers: Record<string, string>
  onAnswerChange: (questionNumber: number, value: string) => void
  scale?: string[]
}

export function Module6Schwartz({ questions, answers, onAnswerChange, scale }: Module6SchwatzProps) {
  const scaleValues = scale || ['-1', '0', '1', '2', '3', '4', '5', '6', '7']

  return (
    <div className="space-y-6">
      {questions.map((question, index) => (
        <div key={index} className="pb-6 border-b border-gray-200 last:border-b-0 last:pb-0">
          <label className="block mb-4">
            <span className="font-regular text-gray-900 text-sm">
              {question.number}. {question.text || ''}
            </span>
          </label>

          <div className="ml-6">
            <div className="flex gap-2 flex-wrap">
              {scaleValues.map((val: string | number) => {
                const strVal = String(val)
                return (
                  <label key={strVal}>
                    <span
                      className="flex flex-col items-center gap-1 text-sm font-regular py-2 px-4 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-600"
                      style={{
                        borderColor:
                          answers[`q${question.number}`] === strVal
                            ? '#0c68f5'
                            : '#e5e7eb',
                        color:
                          answers[`q${question.number}`] === strVal
                            ? '#0c68f5'
                            : '#6b7280',
                      }}
                    >
                      <input
                        type="radio"
                        name={`q${question.number}`}
                        value={strVal}
                        checked={answers[`q${question.number}`] === strVal}
                        onChange={(e) => onAnswerChange(question.number, e.target.value)}
                        required
                      />
                      {strVal}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
