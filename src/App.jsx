import React from 'react'
import CloudBaseCalculator from './components/CloudBaseCalculator'
import TurbulencePotentialCalculator from './components/TurbulencePotentialCalculator'

function App() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Weather Calculators</h1>
      <div className="space-y-8">
        <CloudBaseCalculator />
        <TurbulencePotentialCalculator />
      </div>
    </div>
  )
}

export default App