import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  BarChart2,
  Users,
  LogOut,
  Zap,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getInitials } from '../../utils/helpers.js'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/team', icon: Users, label: 'Team' },
]

const roleBadgeStyle = {
  admin: { background: '#6366f1', color: '#fff' },
  manager: { background: '#0ea5e9', color: '#fff' },
  employee: { background: '#64748b', color: '#fff' },
}

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 40,
          }}
          onClick={onClose}
        />
      )}

      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '256px',
          background: '#1e293b',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          transform: isOpen ? 'translateX(0)' : undefined,
          transition: 'transform 0.3s ease',
          boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
        }}
        className="sidebar"
      >
        {/* Logo */}
        <div
          style={{
            padding: '24px 20px',
            borderBottom: '1px solid #334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Zap size={20} color="#fff" />
            </div>
            <span
              style={{
                color: '#f8fafc',
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: '-0.5px',
              }}
            >
              TaskFlow
            </span>
          </div>
          <button
            onClick={onClose}
            className="sidebar-close-btn"
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'none',
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          <p
            style={{
              color: '#475569',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 8,
              paddingLeft: 8,
            }}
          >
            Menu
          </p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 10,
                marginBottom: 4,
                color: isActive ? '#f8fafc' : '#94a3b8',
                background: isActive
                  ? 'linear-gradient(90deg, rgba(99,102,241,0.25), rgba(99,102,241,0.1))'
                  : 'transparent',
                borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s',
              })}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        {user && (
          <div
            style={{
              padding: '16px',
              borderTop: '1px solid #334155',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {getInitials(user.full_name || user.email)}
              </div>
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    color: '#f8fafc',
                    fontSize: 13,
                    fontWeight: 600,
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.full_name || user.email}
                </p>
                <span
                  style={{
                    display: 'inline-block',
                    marginTop: 2,
                    padding: '1px 8px',
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    ...(roleBadgeStyle[user.role] || roleBadgeStyle.employee),
                  }}
                >
                  {user.role}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 8,
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#f87171',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
              }}
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
