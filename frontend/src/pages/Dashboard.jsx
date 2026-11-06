import { useState, useEffect } from 'react'
import {
  FolderKanban,
  CheckSquare,
  Clock,
  AlertTriangle,
  TrendingUp,
  Activity,
  CalendarDays,
  Users,
} from 'lucide-react'
import Layout from '../components/Layout/Layout.jsx'
import StatCard from '../components/common/StatCard.jsx'
import LoadingSpinner from '../components/common/LoadingSpinner.jsx'
import { getDashboardStats, getProjects, getTasks } from '../api/index.js'
import { useAuth } from '../context/AuthContext.jsx'
import { formatDate, getStatusColor, getPriorityColor } from '../utils/helpers.js'

const statusBadge = (status) => ({
  display: 'inline-block',
  padding: '2px 10px',
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'capitalize',
  background: `${getStatusColor(status)}20`,
  color: getStatusColor(status),
})

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentProjects, setRecentProjects] = useState([])
  const [recentTasks, setRecentTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, projectsRes, tasksRes] = await Promise.all([
          getDashboardStats(),
          getProjects({ limit: 5 }),
          getTasks({ limit: 5 }),
        ])
        setStats(statsRes.data)
        setRecentProjects(Array.isArray(projectsRes.data) ? projectsRes.data : projectsRes.data?.projects || [])
        setRecentTasks(Array.isArray(tasksRes.data) ? tasksRes.data : tasksRes.data?.tasks || [])
      } catch (err) {
        setError('Failed to load dashboard data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const statCards = stats
    ? [
        { label: 'Total Projects', value: stats.total_projects, icon: FolderKanban, color: '#6366f1' },
        { label: 'Completed Projects', value: stats.completed_projects, icon: TrendingUp, color: '#22c55e' },
        { label: 'Ongoing Projects', value: stats.ongoing_projects, icon: Activity, color: '#0ea5e9' },
        { label: 'Pending Projects', value: stats.pending_projects, icon: Clock, color: '#f59e0b' },
        { label: 'Total Tasks', value: stats.total_tasks, icon: CheckSquare, color: '#8b5cf6' },
        { label: 'Completed Tasks', value: stats.completed_tasks, icon: CheckSquare, color: '#22c55e' },
        { label: 'Pending Tasks', value: stats.pending_tasks, icon: CalendarDays, color: '#f59e0b' },
        { label: 'Overdue Tasks', value: stats.overdue_tasks, icon: AlertTriangle, color: '#ef4444' },
      ]
    : []

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <Layout title="Dashboard">
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : (
        <>
          {/* Greeting */}
          <div
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: 16,
              padding: '24px 28px',
              marginBottom: 24,
              color: '#fff',
            }}
          >
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
              {greeting}, {user?.full_name?.split(' ')[0] || 'there'} 👋
            </h2>
            <p style={{ margin: '6px 0 0', opacity: 0.85, fontSize: 14 }}>
              Here&apos;s what&apos;s happening with your projects today.
            </p>
          </div>

          {/* Stats grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 16,
              marginBottom: 28,
            }}
          >
            {statCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="dashboard-grid">
            {/* Recent Projects */}
            <div
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: 24,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                border: '1px solid #f1f5f9',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                  Recent Projects
                </h3>
                <FolderKanban size={18} color="#6366f1" />
              </div>
              {recentProjects.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                  No projects yet
                </p>
              ) : (
                recentProjects.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 0',
                      borderBottom: '1px solid #f8fafc',
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                        {p.name}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>
                        Due {formatDate(p.deadline)}
                      </p>
                    </div>
                    <span style={statusBadge(p.status)}>{p.status}</span>
                  </div>
                ))
              )}
            </div>

            {/* Recent Tasks */}
            <div
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: 24,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                border: '1px solid #f1f5f9',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                  Recent Tasks
                </h3>
                <CheckSquare size={18} color="#6366f1" />
              </div>
              {recentTasks.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                  No tasks yet
                </p>
              ) : (
                recentTasks.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 0',
                      borderBottom: '1px solid #f8fafc',
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                        {t.title}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>
                        {t.priority} priority • Due {formatDate(t.deadline)}
                      </p>
                    </div>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 10px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        background: `${getPriorityColor(t.priority)}20`,
                        color: getPriorityColor(t.priority),
                      }}
                    >
                      {t.status?.replace('_', ' ')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </Layout>
  )
}
