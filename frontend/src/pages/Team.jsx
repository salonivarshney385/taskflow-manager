import { useState, useEffect } from 'react'
import { Users, Mail, CheckSquare, Award } from 'lucide-react'
import Layout from '../components/Layout/Layout.jsx'
import LoadingSpinner from '../components/common/LoadingSpinner.jsx'
import { getUsers, getChartData } from '../api/index.js'
import { getInitials } from '../utils/helpers.js'
import toast from 'react-hot-toast'

const roleBadge = (role) => {
  const map = {
    admin: { bg: '#eef2ff', color: '#6366f1' },
    manager: { bg: '#e0f2fe', color: '#0ea5e9' },
    employee: { bg: '#f1f5f9', color: '#64748b' },
  }
  return map[role] || map.employee
}

export default function Team() {
  const [users, setUsers] = useState([])
  const [perfMap, setPerfMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([getUsers(), getChartData()])
      .then(([uRes, cRes]) => {
        const userList = Array.isArray(uRes.data) ? uRes.data : uRes.data?.users || []
        setUsers(userList)
        const emp = cRes.data?.employee_performance || []
        const map = {}
        emp.forEach((e) => { map[e.user_id || e.id] = e })
        setPerfMap(map)
      })
      .catch(() => toast.error('Failed to load team data'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = users.filter((u) =>
    (u.full_name || u.email)?.toLowerCase().includes(search.toLowerCase())
  )

  const completionRate = (userId) => {
    const perf = perfMap[userId]
    if (!perf || !perf.total_tasks) return 0
    return Math.round((perf.completed_tasks / perf.total_tasks) * 100)
  }

  return (
    <Layout title="Team" onSearch={setSearch}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a' }}>Team Members</h2>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>
            {filtered.length} member{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            padding: '8px 14px',
            borderRadius: 10,
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <Users size={16} /> {users.length} Total
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  {['Member', 'Email', 'Role', 'Tasks Assigned', 'Tasks Completed', 'Completion Rate'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                      No team members found
                    </td>
                  </tr>
                ) : (
                  filtered.map((member) => {
                    const perf = perfMap[member.id]
                    const rate = completionRate(member.id)
                    const rb = roleBadge(member.role)
                    return (
                      <tr
                        key={member.id}
                        style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#fafbfc')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {/* Avatar + name */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontSize: 13,
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              {getInitials(member.full_name || member.email)}
                            </div>
                            <div>
                              <p style={{ margin: 0, fontWeight: 600, color: '#0f172a' }}>
                                {member.full_name || '—'}
                              </p>
                              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>
                                ID: {member.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b' }}>
                            <Mail size={13} />
                            {member.email}
                          </span>
                        </td>

                        {/* Role badge */}
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              padding: '3px 10px',
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 600,
                              textTransform: 'capitalize',
                              background: rb.bg,
                              color: rb.color,
                            }}
                          >
                            {member.role}
                          </span>
                        </td>

                        {/* Tasks assigned */}
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b' }}>
                            <CheckSquare size={13} />
                            {perf?.total_tasks ?? 0}
                          </span>
                        </td>

                        {/* Tasks completed */}
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#22c55e' }}>
                            <Award size={13} />
                            {perf?.completed_tasks ?? 0}
                          </span>
                        </td>

                        {/* Progress bar */}
                        <td style={{ padding: '14px 16px', minWidth: 140 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div
                              style={{
                                flex: 1,
                                height: 6,
                                background: '#f1f5f9',
                                borderRadius: 3,
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  height: '100%',
                                  width: `${rate}%`,
                                  background:
                                    rate >= 80
                                      ? '#22c55e'
                                      : rate >= 50
                                      ? '#6366f1'
                                      : '#f59e0b',
                                  borderRadius: 3,
                                  transition: 'width 0.6s ease',
                                }}
                              />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', width: 34, textAlign: 'right' }}>
                              {rate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  )
}
