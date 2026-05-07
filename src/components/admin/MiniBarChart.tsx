type DataPoint = { date: string; count: number }

export function MiniBarChart({ data, label }: { data: DataPoint[]; label: string }) {
  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <div>
      <p className="text-sm font-medium text-gray-600 mb-3">{label}</p>
      <div className="flex items-end gap-0.5 h-20">
        {data.map((d, i) => (
          <div
            key={i}
            className="flex-1 bg-green-500 rounded-t opacity-80 hover:opacity-100 transition-opacity min-h-[2px]"
            style={{ height: `${Math.max((d.count / max) * 100, d.count > 0 ? 4 : 2)}%` }}
            title={`${d.date}: ${d.count}`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-400">{data[0]?.date?.slice(5)}</span>
        <span className="text-xs text-gray-400">{data[data.length - 1]?.date?.slice(5)}</span>
      </div>
    </div>
  )
}
