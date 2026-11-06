/**
 * Format a date string into "MMM dd, yyyy" using native Intl
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/**
 * Returns number of days until deadline (negative = overdue)
 */
export function getDaysUntilDeadline(deadline) {
  if (!deadline) return null
  try {
    const d = new Date(deadline)
    if (isNaN(d.getTime())) return null
    const diffTime = d.getTime() - new Date().getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  } catch {
    return null
  }
}

/**
 * Returns a CSS color string based on task/project status
 */
export function getStatusColor(status) {
  const map = {
    pending: '#f59e0b',
    ongoing: '#6366f1',
    in_progress: '#6366f1',
    completed: '#22c55e',
    cancelled: '#94a3b8',
  }
  return map[status] || '#64748b'
}

/**
 * Returns a CSS color string based on task priority
 */
export function getPriorityColor(priority) {
  const map = {
    low: '#22c55e',
    medium: '#0ea5e9',
    high: '#f59e0b',
    urgent: '#ef4444',
  }
  return map[priority] || '#64748b'
}

/**
 * Returns initials from a full name or email
 * e.g. "John Doe" → "JD", "john@example.com" → "JO"
 */
export function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return name.substring(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
