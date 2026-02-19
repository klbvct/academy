import { Question } from '../types'

interface Module7ProfessionsProps {
  questions: Question[]
  answers: Record<string, string>
  onAnswerChange: (questionNumber: number, value: string) => void
}

export function Module7Professions({ questions, answers, onAnswerChange }: Module7ProfessionsProps) {
  return (
    <div className="space-y-6">
      {questions.map((question, index) => (
        <div key={index} className="pb-6 border-b border-gray-200 last:border-b-0 last:pb-0">
          <label className="block mb-4">
            <span className="font-semibold text-gray-900 text-sm">
              {question.number}. {question.text || ''}
            </span>
          </label>

          <div className="ml-6">
            <div className="flex items-center gap-6 rounded-lg p-4" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex-1">
                <label
                  className="flex items-center cursor-pointer p-3 border-2 border-gray-200 rounded-lg transition-all hover:border-blue-600"
                  style={{
                    borderColor:
                      answers[`q${question.number}`] === 'a' ? '#0c68f5' : '#e5e7eb',
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
              </div>
              <span className="font-regular text-gray-400">або</span>
              <div className="flex-1">
                <label
                  className="flex items-center cursor-pointer p-3 border-2 border-gray-200 rounded-lg transition-all hover:border-blue-600"
                  style={{
                    borderColor:
                      answers[`q${question.number}`] === 'b' ? '#0c68f5' : '#e5e7eb',
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
          </div>
        </div>
      ))}
    </div>
  )
}
