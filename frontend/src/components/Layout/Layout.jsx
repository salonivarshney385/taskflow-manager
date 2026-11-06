import { useState } from 'react'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

export default function Layout({ children, title, onSearch }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area — offset by sidebar width on desktop */}
      <div
        style={{
          flex: 1,
          marginLeft: 256,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
        className="main-content"
      >
        <Topbar
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
          onSearch={onSearch}
        />
        <main
          style={{
            flex: 1,
            padding: '24px',
            overflowY: 'auto',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
