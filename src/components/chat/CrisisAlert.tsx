export function CrisisAlert() {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-4 my-2">
      <div className="flex items-start gap-3">
        <span className="text-xl">🆘</span>
        <div>
          <p className="font-semibold text-red-800 text-sm">If you are in immediate danger</p>
          <div className="text-sm text-red-700 mt-1 space-y-1">
            <p>• <strong>988</strong> — Suicide & Crisis Lifeline (call or text, 24/7)</p>
            <p>• <strong>741741</strong> — Crisis Text Line (text HOME)</p>
            <p>• <strong>911</strong> — Emergency Services</p>
          </div>
        </div>
      </div>
    </div>
  )
}
