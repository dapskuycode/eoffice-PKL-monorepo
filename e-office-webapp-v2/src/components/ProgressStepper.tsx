interface Step {
  label: string
  status: 'completed' | 'active' | 'upcoming'
}

interface ProgressStepperProps {
  steps: Step[]
}

export default function ProgressStepper({ steps }: ProgressStepperProps) {
  return (
    <div className="flex items-start justify-between w-full">
      {steps.map((step, index) => (
        <div key={index} className="flex items-start" style={{ flex: index < steps.length - 1 ? 1 : 'none' }}>
          {/* Step Circle and Label */}
          <div className="flex flex-col items-center">
            <div 
              className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-base ${
                step.status === 'completed' 
                  ? 'bg-blue-600 text-white' 
                  : step.status === 'active'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {step.status === 'completed' ? '✓' : index + 1}
            </div>
            <span 
              className={`mt-2 text-sm font-medium text-center whitespace-nowrap ${
                step.status === 'completed' || step.status === 'active'
                  ? 'text-blue-600' 
                  : 'text-gray-500'
              }`}
            >
              {step.label}
            </span>
          </div>
          
          {/* Connecting Line */}
          {index < steps.length - 1 && (
            <div 
              className={`h-0.5 flex-1 ${
                step.status === 'completed' ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              style={{ 
                marginTop: '24px',
                marginLeft: '8px',
                marginRight: '8px'
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}
