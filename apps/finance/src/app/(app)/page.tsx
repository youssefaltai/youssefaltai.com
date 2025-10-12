'use client'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Finance Backend Complete</h1>
        <p className="text-gray-600 mb-6">
          The backend has been redesigned and all API endpoints are ready for testing.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
          <h2 className="font-semibold mb-2">✅ Backend Features:</h2>
          <ul className="text-sm space-y-1 text-gray-700">
            <li>• Multi-account tracking</li>
            <li>• Recurring transactions</li>
            <li>• Tags system</li>
            <li>• Envelope budgeting (YNAB)</li>
            <li>• Asset tracking</li>
            <li>• Transfers between accounts</li>
          </ul>
        </div>
        <p className="text-sm text-gray-500 mt-6">
          Frontend will be rebuilt after backend testing is complete.
        </p>
      </div>
    </div>
  )
}
