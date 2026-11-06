import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const getBarColor = (value) => {
  if (value >= 80) return '#22c55e'
  if (value >= 50) return '#6366f1'
  return '#f59e0b'
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          padding: '10px 14px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <p style={{ margin: 0, fontWeight: 600, color: '#0f172a', fontSize: 13 }}>
          {label}
        </p>
        <p style={{ margin: '4px 0 0', color: '#6366f1', fontSize: 13 }}>
          Completion: {payload[0].value}%
        </p>
      </div>
    )
  }
  return null
}

export default function CompletionChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>
        No completion data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#64748b' }}
          interval={0}
          angle={-30}
          textAnchor="end"
          height={50}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: '#64748b' }}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="completion" name="Completion %" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry.completion)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
