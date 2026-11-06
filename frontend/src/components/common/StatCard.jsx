export default function StatCard({ icon: Icon, label, value, color = '#6366f1', trend, trendLabel }) {
  const isPositive = trend > 0

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: '20px 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
        border: '1px solid #f1f5f9',
        transition: 'box-shadow 0.2s, transform 0.2s',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow =
          '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.06)'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow =
          '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: `${color}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {Icon && <Icon size={22} color={color} />}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: '#64748b',
            fontWeight: 500,
          }}
        >
          {label}
        </p>
        <p
          style={{
            margin: '4px 0 0',
            fontSize: 28,
            fontWeight: 700,
            color: '#0f172a',
            lineHeight: 1.1,
          }}
        >
          {value ?? '—'}
        </p>
        {trend !== undefined && (
          <p
            style={{
              margin: '6px 0 0',
              fontSize: 12,
              color: isPositive ? '#22c55e' : '#ef4444',
              fontWeight: 500,
            }}
          >
            {isPositive ? '↑' : '↓'} {Math.abs(trend)}%{' '}
            <span style={{ color: '#94a3b8' }}>{trendLabel || 'vs last month'}</span>
          </p>
        )}
      </div>
    </div>
  )
}
