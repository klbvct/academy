import { Question } from '../types'

interface Module1ChoiceABProps {
  questions: Question[]
  answers: Record<string, string>
  onAnswerChange: (questionNumber: number, value: string) => void
}

export function Module1ChoiceAB({ questions, answers, onAnswerChange }: Module1ChoiceABProps) {
  return (
    <div className="space-y-6">
      {questions.map((question, index) => (
        <div key={index} className="pb-6 border-b border-gray-200 last:border-b-0 last:pb-0">
          <label className="block mb-4">
            <span className="font-semibold text-gray-900 text-sm">
              {question.number}. {question.text || ''}
            </span>
          </label>

          <div className="ml-6 space-y-3">
            <label
              className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer transition-all hover:border-blue-600 hover:bg-gray-50"
              style={{ borderColor: answers[`q${question.number}`] === 'a' ? '#0c68f5' : '#e5e7eb' }}
              onMouseEnter={(e) => {
                if (answers[`q${question.number}`] !== 'a')
                  (e.currentTarget as any).style.borderColor = '#0c68f5'
              }}
              onMouseLeave={(e) => {
                if (answers[`q${question.number}`] !== 'a')
                  (e.currentTarget as any).style.borderColor = '#e5e7eb'
              }}
            >
              <input
                type="radio"
                name={`q${question.number}`}
                value="a"
                checked={answers[`q${question.number}`] === 'a'}
                onChange={(e) => onAnswerChange(question.number, e.target.value)}
                required
                className="mr-3"
              />
              <span className="text-gray-700 font-regular text-sm">{question.a}</span>
            </label>
            <label
              className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer transition-all hover:border-blue-600 hover:bg-gray-50"
              style={{ borderColor: answers[`q${question.number}`] === 'b' ? '#0c68f5' : '#e5e7eb' }}
              onMouseEnter={(e) => {
                if (answers[`q${question.number}`] !== 'b')
                  (e.currentTarget as any).style.borderColor = '#0c68f5'
              }}
              onMouseLeave={(e) => {
                if (answers[`q${question.number}`] !== 'b')
                  (e.currentTarget as any).style.borderColor = '#e5e7eb'
              }}
            >
              <input
                type="radio"
                name={`q${question.number}`}
                value="b"
                checked={answers[`q${question.number}`] === 'b'}
                onChange={(e) => onAnswerChange(question.number, e.target.value)}
                required
                className="mr-3"
              />
              <span className="text-gray-700 font-regular text-sm">{question.b}</span>
            </label>
          </div>
        </div>
      ))}
    </div>
  )
}
