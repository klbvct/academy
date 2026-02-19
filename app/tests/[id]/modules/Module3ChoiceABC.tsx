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
          <label className="block mb-4">
            <span className="font-regular text-gray-900 text-sm">
              {question.number}. {question.text || ''}
            </span>
          </label>

          <div className="ml-6">
            <div className="flex gap-2 flex-wrap">
              {['a', 'b', 'c'].map((option) => (
                <label key={option} className="cursor-pointer">
                  <span
                    className="flex flex-col items-center gap-1 text-sm font-regular py-2 px-4 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-600"
                    style={{
                      borderColor:
                        answers[`q${question.number}`] === option
                          ? '#0c68f5'
                          : '#e5e7eb',
                      color:
                        answers[`q${question.number}`] === option
                          ? '#0c68f5'
                          : '#6b7280',
                    }}
                  >
                    <input
                      type="radio"
                      name={`q${question.number}`}
                      value={option}
                      checked={answers[`q${question.number}`] === option}
                      onChange={(e) => onAnswerChange(question.number, e.target.value)}
                      required
                    />
                    {question[option as keyof Question] as string}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}