import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const COLORS = {
  pending: '#f59e0b',
  in_progress: '#6366f1',
  completed: '#22c55e',
}

const RADIAN = Math.PI / 180
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function TaskPieChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>
        No task data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={100}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[entry.name] || '#94a3b8'}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [value, name.replace('_', ' ')]}
          contentStyle={{
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        />
        <Legend
          formatter={(value) => value.replace('_', ' ')}
          wrapperStyle={{ fontSize: 12, textTransform: 'capitalize' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
