type StatCardProps = {
  label: string
  value: number | string
  sub?: string
  icon: string
  color?: 'default' | 'red' | 'green' | 'yellow'
}

const colors = {
  default: 'bg-white border-gray-100',
  green: 'bg-green-50 border-green-100',
  red: 'bg-red-50 border-red-100',
  yellow: 'bg-yellow-50 border-yellow-100',
}

export function StatCard({ label, value, sub, icon, color = 'default' }: StatCardProps) {
  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  )
}
