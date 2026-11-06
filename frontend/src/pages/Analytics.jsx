import { useState, useEffect } from 'react'
import { AlertTriangle, Calendar } from 'lucide-react'
import Layout from '../components/Layout/Layout.jsx'
import LoadingSpinner from '../components/common/LoadingSpinner.jsx'
import ProjectStatusChart from '../components/Charts/ProjectStatusChart.jsx'
import TaskPieChart from '../components/Charts/TaskPieChart.jsx'
import CompletionChart from '../components/Charts/CompletionChart.jsx'
import EmployeePerformanceChart from '../components/Charts/EmployeePerformanceChart.jsx'
import { getChartData } from '../api/index.js'
import { formatDate } from '../utils/helpers.js'
import toast from 'react-hot-toast'

export default function Analytics() {
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getChartData()
      .then((res) => setChartData(res.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  const chartCard = (title, children) => (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        border: '1px solid #f1f5f9',
      }}
    >
      <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
        {title}
      </h3>
      {children}
    </div>
  )

  return (
    <Layout title="Analytics">
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Charts 2x2 grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))',
              gap: 20,
              marginBottom: 28,
            }}
          >
            {chartCard(
              'Project Status Overview',
              <ProjectStatusChart
                data={(() => {
                  if (chartData?.project_status_data) {
                    const findCount = (st) =>
                      chartData.project_status_data.find((s) => s.status === st)?.count || 0
                    return [
                      {
                        name: 'Projects',
                        completed: findCount('completed'),
                        ongoing: findCount('ongoing'),
                        pending: findCount('pending'),
                      },
                    ]
                  }
                  if (chartData?.project_status) {
                    return [
                      {
                        name: 'Projects',
                        completed: chartData.project_status.completed || 0,
                        ongoing: chartData.project_status.ongoing || 0,
                        pending: chartData.project_status.pending || 0,
                      },
                    ]
                  }
                  return []
                })()}
              />
            )}

            {chartCard(
              'Task Distribution',
              <TaskPieChart
                data={(() => {
                  if (chartData?.task_status_data) {
                    return chartData.task_status_data.map((t) => ({
                      name: t.status,
                      value: t.count,
                    }))
                  }
                  if (chartData?.task_distribution) {
                    return Object.entries(chartData.task_distribution).map(([name, value]) => ({
                      name,
                      value,
                    }))
                  }
                  return []
                })()}
              />
            )}

            {chartCard(
              'Project Completion %',
              <CompletionChart
                data={
                  chartData?.project_completion
                    ? chartData.project_completion.map((p) => ({
                        name: p.name,
                        completion: p.completion_percentage || 0,
                      }))
                    : []
                }
              />
            )}

            {chartCard(
              'Employee Performance',
              <EmployeePerformanceChart
                data={
                  chartData?.employee_performance
                    ? chartData.employee_performance.map((e) => ({
                        name: (e.full_name || e.name || e.email || '').split(' ')[0],
                        total: e.total_tasks || 0,
                        completed: e.completed_tasks || 0,
                      }))
                    : []
                }
              />
            )}
          </div>

          {/* Overdue tasks */}
          {chartData?.overdue_tasks && chartData.overdue_tasks.length > 0 && (
            <div
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: 24,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                border: '1px solid #fee2e2',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <AlertTriangle size={18} color="#ef4444" />
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#ef4444' }}>
                  Overdue Tasks ({chartData.overdue_tasks.length})
                </h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                {chartData.overdue_tasks.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      background: '#fef2f2',
                      borderRadius: 10,
                      padding: '12px 14px',
                      border: '1px solid #fecaca',
                    }}
                  >
                    <p style={{ margin: 0, fontWeight: 600, color: '#0f172a', fontSize: 13 }}>
                      {task.title}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={11} />
                      Due {formatDate(task.deadline)}
                    </p>
                    {task.project_name && (
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>
                        {task.project_name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  )
}
