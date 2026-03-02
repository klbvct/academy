import { Question } from '../types'

interface Module3ChoiceABCProps {
  questions: Question[]
  answers: Record<string, string>
  onAnswerChange: (questionNumber: number, value: string) => void
}

export function Module3ChoiceABC({ questions, answers, onAnswerChange }: Module3ChoiceABCProps) {
  return (
    <div className="space-y-6">
      {questions.map((question, index) => (
        <div key={index} className="pb-6 border-b border-gray-200 last:border-b-0 last:pb-0">
          <p className="font-regular text-gray-900 text-sm mb-4">
            {question.number}. {question.text || ''}
          </p>

          <div className="ml-6 space-y-3">
            {(['a', 'b', 'c'] as const).map((option) => {
              const text = question[option as keyof Question] as string | undefined
              if (!text) return null
              const isSelected = answers[`q${question.number}`] === option
              return (
                <label
                  key={option}
                  className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-600 hover:bg-gray-50"
                  style={{ borderColor: isSelected ? '#0c68f5' : '#e5e7eb' }}
                >
                  <input
                    type="radio"
                    name={`q${question.number}`}
                    value={option}
                    checked={isSelected}
                    onChange={(e) => onAnswerChange(question.number, e.target.value)}
                    required
                    className="mr-3 shrink-0"
                  />
                  <span className="text-gray-700 font-regular text-sm">{text}</span>
                </label>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}