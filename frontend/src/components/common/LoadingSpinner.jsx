export default function LoadingSpinner({ size = 40, text = 'Loading...' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        gap: 16,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          border: `3px solid #e2e8f0`,
          borderTopColor: '#6366f1',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }}
      />
      {text && (
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>{text}</p>
      )}
    </div>
  )
}
