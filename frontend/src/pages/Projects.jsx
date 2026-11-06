import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, Calendar, Users, CheckSquare, FolderKanban } from 'lucide-react'
import Layout from '../components/Layout/Layout.jsx'
import Modal from '../components/common/Modal.jsx'
import LoadingSpinner from '../components/common/LoadingSpinner.jsx'
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getUsers,
} from '../api/index.js'
import { useAuth } from '../context/AuthContext.jsx'
import { formatDate, getStatusColor } from '../utils/helpers.js'
import toast from 'react-hot-toast'

const STATUSES = ['pending', 'ongoing', 'completed']

const emptyForm = {
  name: '',
  description: '',
  status: 'pending',
  start_date: '',
  deadline: '',
  completion_percentage: 0,
  manager_id: '',
}

export default function Projects() {
  const { isManager, isAdmin, user } = useAuth()
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      const [pRes, uRes] = await Promise.all([getProjects(), getUsers()])
      setProjects(Array.isArray(pRes.data) ? pRes.data : pRes.data?.projects || [])
      setUsers(Array.isArray(uRes.data) ? uRes.data : uRes.data?.users || [])
    } catch {
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = projects.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter ? p.status === statusFilter : true
    return matchesSearch && matchesStatus
  })

  const openCreate = () => {
    setEditingProject(null)
    setForm({ ...emptyForm, manager_id: user?.id || '' })
    setFormErrors({})
    setModalOpen(true)
  }

  const openEdit = (project) => {
    setEditingProject(project)
    setForm({
      name: project.name || '',
      description: project.description || '',
      status: project.status || 'pending',
      start_date: project.start_date ? project.start_date.substring(0, 10) : '',
      deadline: project.deadline ? project.deadline.substring(0, 10) : '',
      completion_percentage: project.completion_percentage ?? 0,
      manager_id: project.manager_id || '',
    })
    setFormErrors({})
    setModalOpen(true)
  }

  const validateForm = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Project name is required'
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
        name: form.name,
        description: form.description || null,
        status: form.status,
        start_date: form.start_date || null,
        deadline: form.deadline || null,
        completion_percentage: Number(form.completion_percentage) || 0,
      }
      if (form.manager_id) {
        payload.manager_id = Number(form.manager_id)
      }
      if (editingProject) {
        await updateProject(editingProject.id, payload)
        toast.success('Project updated!')
      } else {
        await createProject(payload)
        toast.success('Project created!')
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save project')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteProject(id)
      toast.success('Project deleted')
      setDeleteConfirm(null)
      fetchData()
    } catch {
      toast.error('Failed to delete project')
    }
  }

  const getCompletion = (p) => {
    if (typeof p.completion_percentage === 'number') {
      return p.completion_percentage
    }
    const total = p.task_count || 0
    const done = p.completed_tasks || 0
    return total > 0 ? Math.round((done / total) * 100) : 0
  }

  const completionColor = (pct) => {
    if (pct >= 80) return '#22c55e'
    if (pct >= 40) return '#6366f1'
    return '#f59e0b'
  }

  return (
    <Layout title="Projects" onSearch={setSearch}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a' }}>All Projects</h2>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>
            {filtered.length} project{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              background: '#fff',
              fontSize: 13,
              color: '#0f172a',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          {isManager() && (
            <button
              onClick={openCreate}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 16px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none',
                borderRadius: 10,
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Plus size={16} /> New Project
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <FolderKanban size={48} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ margin: 0, fontSize: 15 }}>No projects found</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filtered.map((project) => {
            const pct = getCompletion(project)
            return (
              <div
                key={project.id}
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: 20,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  border: '1px solid #f1f5f9',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  transition: 'box-shadow 0.2s, transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* Title + badge */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a', flex: 1 }}>
                    {project.name}
                  </h3>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      flexShrink: 0,
                      background: `${getStatusColor(project.status)}18`,
                      color: getStatusColor(project.status),
                    }}
                  >
                    {project.status}
                  </span>
                </div>

                {/* Description */}
                {project.description && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      color: '#64748b',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {project.description}
                  </p>
                )}

                {/* Completion bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Completion</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: completionColor(pct) }}>{pct}%</span>
                  </div>
                  <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: completionColor(pct),
                        borderRadius: 3,
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Meta */}
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b' }}>
                    <Calendar size={13} /> {formatDate(project.deadline)}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b' }}>
                    <CheckSquare size={13} /> {project.task_count || 0} tasks
                  </span>
                  {project.manager_name && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b' }}>
                      <Users size={13} /> {project.manager_name}
                    </span>
                  )}
                </div>

                {/* Actions */}
                {isManager() && (
                  <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
                    <button
                      onClick={() => openEdit(project)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        padding: '7px',
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                        background: '#fff',
                        color: '#6366f1',
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f3ff')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    {isAdmin() && (
                      <button
                        onClick={() => setDeleteConfirm(project)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          padding: '7px',
                          borderRadius: 8,
                          border: '1px solid #fee2e2',
                          background: '#fff',
                          color: '#ef4444',
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'New Project'}
      >
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Project Name *</label>
            <input
              className={`form-input${formErrors.name ? ' error' : ''}`}
              placeholder="e.g. Website Redesign"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            {formErrors.name && <p className="form-error">{formErrors.name}</p>}
          </div>

          {/* Description */}
          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Describe the project..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-input"
                value={form.start_date}
                onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
              />
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

          {/* Status + Completion % */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label className="form-label">Status</label>
              <select
                className="form-input"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Completion % ({form.completion_percentage || 0}%)</label>
              <input
                type="range"
                min="0"
                max="100"
                style={{ width: '100%', marginTop: 8 }}
                value={form.completion_percentage}
                onChange={(e) => setForm((f) => ({ ...f, completion_percentage: e.target.value }))}
              />
            </div>
          </div>

          {/* Manager */}
          {isAdmin() && (
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Manager</label>
              <select
                className="form-input"
                value={form.manager_id}
                onChange={(e) => setForm((f) => ({ ...f, manager_id: e.target.value }))}
              >
                <option value="">Select manager...</option>
                {users
                  .filter((u) => u.role === 'manager' || u.role === 'admin')
                  .map((u) => (
                    <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
                  ))}
              </select>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Project"
        maxWidth={380}
      >
        <p style={{ color: '#64748b', margin: '0 0 20px', fontSize: 14 }}>
          Are you sure you want to delete <strong style={{ color: '#0f172a' }}>{deleteConfirm?.name}</strong>?
          This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
          <button
            onClick={() => handleDelete(deleteConfirm.id)}
            style={{
              padding: '8px 18px',
              background: '#ef4444',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Delete
          </button>
        </div>
      </Modal>
    </Layout>
  )
}
