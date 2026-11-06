import { useState } from 'react'
import { Menu, Bell, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getInitials } from '../../utils/helpers.js'

export default function Topbar({ title, onMenuClick, onSearch }) {
  const { user } = useAuth()
  const [searchValue, setSearchValue] = useState('')

  const handleSearch = (e) => {
    setSearchValue(e.target.value)
    if (onSearch) onSearch(e.target.value)
  }

  return (
    <header
      style={{
        height: 64,
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 20,
        paddingRight: 24,
        gap: 16,
        position: 'sticky',
        top: 0,
        zIndex: 30,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        className="topbar-menu-btn"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#64748b',
          display: 'none',
          padding: 6,
          borderRadius: 8,
        }}
      >
        <Menu size={22} />
      </button>

      {/* Page title */}
      <h1
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#0f172a',
          margin: 0,
          flexShrink: 0,
        }}
      >
        {title}
      </h1>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Search */}
      {onSearch !== undefined && (
        <div
          style={{
            position: 'relative',
            maxWidth: 280,
            width: '100%',
          }}
        >
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }}
          />
          <input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={handleSearch}
            style={{
              width: '100%',
              paddingLeft: 34,
              paddingRight: 12,
              paddingTop: 8,
              paddingBottom: 8,
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              fontSize: 13,
              color: '#0f172a',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      )}

      {/* Notification bell */}
      <button
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#64748b',
          padding: 8,
          borderRadius: 8,
          position: 'relative',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        title="Notifications"
      >
        <Bell size={20} />
        <span
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 8,
            height: 8,
            background: '#ef4444',
            borderRadius: '50%',
            border: '2px solid #fff',
          }}
        />
      </button>

      {/* Avatar */}
      {user && (
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 13,
            fontWeight: 700,
            flexShrink: 0,
            cursor: 'default',
          }}
          title={user.full_name || user.email}
        >
          {getInitials(user.full_name || user.email)}
        </div>
      )}
    </header>
  )
}
