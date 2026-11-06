import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, CheckCircle, ChevronDown } from 'lucide-react'
import Layout from '../components/Layout/Layout.jsx'
import Modal from '../components/common/Modal.jsx'
import LoadingSpinner from '../components/common/LoadingSpinner.jsx'
import { getTasks, createTask, updateTask, deleteTask, getProjects, getUsers } from '../api/index.js'
import { useAuth } from '../context/AuthContext.jsx'
import { formatDate, getStatusColor, getPriorityColor } from '../utils/helpers.js'
import toast from 'react-hot-toast'

const STATUSES = ['pending', 'in_progress', 'completed']
const PRIORITIES = ['low', 'medium', 'high', 'urgent']

const emptyForm = {
  title: '',
  description: '',
  project_id: '',
  assignee_id: '',
  status: 'pending',
  priority: 'medium',
  deadline: '',
}

export default function Tasks() {
  const { isManager, isAdmin, user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      const [tRes, pRes, uRes] = await Promise.all([getTasks(), getProjects(), getUsers()])
      setTasks(Array.isArray(tRes.data) ? tRes.data : tRes.data?.tasks || [])
      setProjects(Array.isArray(pRes.data) ? pRes.data : pRes.data?.projects || [])
      setUsers(Array.isArray(uRes.data) ? uRes.data : uRes.data?.users || [])
    } catch {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = tasks.filter((t) => {
    const matchSearch = t.title?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter ? t.status === statusFilter : true
    const matchPriority = priorityFilter ? t.priority === priorityFilter : true
    return matchSearch && matchStatus && matchPriority
  })

  const openCreate = () => {
    setEditingTask(null)
    setForm(emptyForm)
    setFormErrors({})
    setModalOpen(true)
  }

  const openEdit = (task) => {
    setEditingTask(task)
    setForm({
      title: task.title || '',
      description: task.description || '',
      project_id: task.project_id || '',
      assignee_id: task.assignee_id || task.assignee?.id || '',
      status: task.status || 'pending',
      priority: task.priority || 'medium',
      deadline: task.deadline ? task.deadline.substring(0, 10) : '',
    })
    setFormErrors({})
    setModalOpen(true)
  }

  const validateForm = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.project_id) e.project_id = 'Project is required'
    if (!form.deadline) e.deadline = 'Deadline is required'
    setFormErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setSubmitting(true)
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        project_id: Number(form.project_id),
        status: form.status,
        priority: form.priority,
        deadline: form.deadline || null,
      }
      if (form.assignee_id) {
        payload.assignee_id = Number(form.assignee_id)
      }
      if (editingTask) {
        await updateTask(editingTask.id, payload)
        toast.success('Task updated!')
      } else {
        await createTask(payload)
        toast.success('Task created!')
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save task')
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkComplete = async (task) => {
    try {
      await updateTask(task.id, { status: 'completed' })
      toast.success('Task marked as complete!')
      fetchData()
    } catch {
      toast.error('Failed to update task')
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteTask(id)
      toast.success('Task deleted')
      setDeleteConfirm(null)
      fetchData()
    } catch {
      toast.error('Failed to delete task')
    }
  }

  const badge = (text, color) => ({
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'capitalize',
    background: `${color}20`,
    color,
    whiteSpace: 'nowrap',
  })

  return (
    <Layout title="Tasks" onSearch={setSearch}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a' }}>All Tasks</h2>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>
            {filtered.length} task{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, outline: 'none', cursor: 'pointer' }}
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, outline: 'none', cursor: 'pointer' }}
          >
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
          {isManager() && (
            <button
              onClick={openCreate}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              <Plus size={16} /> New Task
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: '1px solid #f1f5f9',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  {['Title', 'Project', 'Assignee', 'Status', 'Priority', 'Deadline', 'Actions'].map((h) => (
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
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                      No tasks found
                    </td>
                  </tr>
                ) : (
                  filtered.map((task) => (
                    <tr
                      key={task.id}
                      style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#fafbfc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, color: '#0f172a' }}>{task.title}</p>
                          {task.description && (
                            <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: 11, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: 200 }}>
                              {task.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{task.project_name || '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{task.assignee?.full_name || task.assignee?.email || task.assignee_name || 'Unassigned'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={badge(task.status, getStatusColor(task.status))}>
                          {task.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={badge(task.priority, getPriorityColor(task.priority))}>
                          {task.priority}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {formatDate(task.deadline)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {task.status !== 'completed' && (
                            <button
                              onClick={() => handleMarkComplete(task)}
                              title="Mark Complete"
                              style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 7, padding: '5px 8px', cursor: 'pointer', color: '#22c55e', display: 'flex', alignItems: 'center' }}
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}
                          {isManager() && (
                            <button
                              onClick={() => openEdit(task)}
                              title="Edit"
                              style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 7, padding: '5px 8px', cursor: 'pointer', color: '#6366f1', display: 'flex', alignItems: 'center' }}
                            >
                              <Edit2 size={14} />
                            </button>
                          )}
                          {isAdmin() && (
                            <button
                              onClick={() => setDeleteConfirm(task)}
                              title="Delete"
                              style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 7, padding: '5px 8px', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingTask ? 'Edit Task' : 'New Task'}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Title *</label>
            <input
              className={`form-input${formErrors.title ? ' error' : ''}`}
              placeholder="Task title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
            {formErrors.title && <p className="form-error">{formErrors.title}</p>}
          </div>

          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Task details..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label className="form-label">Project *</label>
              <select
                className={`form-input${formErrors.project_id ? ' error' : ''}`}
                value={form.project_id}
                onChange={(e) => setForm((f) => ({ ...f, project_id: e.target.value }))}
              >
                <option value="">Select project...</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {formErrors.project_id && <p className="form-error">{formErrors.project_id}</p>}
            </div>
            <div>
              <label className="form-label">Assignee</label>
              <select
                className="form-input"
                value={form.assignee_id}
                onChange={(e) => setForm((f) => ({ ...f, assignee_id: e.target.value }))}
              >
                <option value="">Unassigned</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div>
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Priority</label>
              <select className="form-input" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Deadline *</label>
              <input
                type="date"
                className={`form-input${formErrors.deadline ? ' error' : ''}`}
                value={form.deadline}
                onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
              />
              {formErrors.deadline && <p className="form-error">{formErrors.deadline}</p>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Task" maxWidth={380}>
        <p style={{ color: '#64748b', margin: '0 0 20px', fontSize: 14 }}>
          Delete task <strong style={{ color: '#0f172a' }}>{deleteConfirm?.title}</strong>? This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
          <button
            onClick={() => handleDelete(deleteConfirm.id)}
            style={{ padding: '8px 18px', background: '#ef4444', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            Delete
          </button>
        </div>
      </Modal>
    </Layout>
  )
}
