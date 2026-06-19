import { useCallback, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import AdminPageHeader from './AdminPageHeader'
import AdminSearch from './AdminSearch'
import AdminStatus from './AdminStatus'
import AdminDataTable, { AdminAction, AdminRowActions } from './AdminDataTable'
import { AdminError, AdminSuccess } from './AdminFeedback'
import CreateAdminModal from './CreateAdminModal'
import EditAdminModal from './EditAdminModal'
import { deleteAdminStaff, listAdminStaff, updateAdminStaff } from '../../api/admin'
import { getErrorMessage } from '../../api/axios'
import { normalizeList } from '../../utils/apiList'

export default function AdminStaff() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editAdmin, setEditAdmin] = useState(null)
  const [actionId, setActionId] = useState(null)

  const loadStaff = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (searchQuery.trim()) params.search = searchQuery.trim()
      const data = await listAdminStaff(params)
      setStaff(normalizeList(data))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [searchQuery])

  useEffect(() => {
    loadStaff()
  }, [loadStaff])

  const handleSearchKey = (e) => {
    if (e.key === 'Enter') setSearchQuery(searchInput)
  }

  const handleToggle = async (admin) => {
    setActionId(admin.id)
    setError('')
    setSuccess('')
    try {
      await updateAdminStaff(admin.id, { is_active: !admin.is_active })
      setSuccess(`Admin ${admin.is_active ? 'deactivated' : 'activated'}.`)
      await loadStaff()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setActionId(null)
    }
  }

  const handleDelete = async (admin) => {
    const name = admin.username || `${admin.first_name} ${admin.last_name}`.trim()
    if (!window.confirm(`Delete admin "${name}"? This cannot be undone.`)) return
    setActionId(admin.id)
    setError('')
    setSuccess('')
    try {
      await deleteAdminStaff(admin.id)
      setSuccess('Admin deleted.')
      await loadStaff()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setActionId(null)
    }
  }

  const columns = [
    { key: 'username', header: 'Username', render: (r) => r.username || '—' },
    {
      key: 'name',
      header: 'Name',
      render: (r) => `${r.first_name || ''} ${r.last_name || ''}`.trim() || '—',
    },
    { key: 'email', header: 'Email', render: (r) => r.email || '—' },
    { key: 'department', header: 'Department', render: (r) => r.department || '—' },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <AdminStatus status={r.is_active ? 'active' : 'inactive'} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <AdminRowActions>
          <AdminAction onClick={() => setEditAdmin(r)}>Edit</AdminAction>
          <AdminAction destructive disabled={actionId === r.id} onClick={() => handleToggle(r)}>
            {r.is_active ? 'Deactivate' : 'Activate'}
          </AdminAction>
          <AdminAction destructive disabled={actionId === r.id} onClick={() => handleDelete(r)}>
            Delete
          </AdminAction>
        </AdminRowActions>
      ),
    },
  ]

  return (
    <div>
      <AdminPageHeader title="Admins" subtitle="Manage staff accounts" />
      <AdminError message={error} />
      <AdminSuccess message={success} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <AdminSearch
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearchKey}
          placeholder="Search admins…"
        />
        <button
          type="button"
          onClick={() => setSearchQuery(searchInput)}
          className="admin-btn admin-btn--secondary"
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="admin-btn admin-btn--primary ml-auto"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Create admin
        </button>
      </div>

      <AdminDataTable columns={columns} rows={staff} loading={loading} emptyMessage="No admin users found." />

      <CreateAdminModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setSuccess('Admin created successfully.')
          loadStaff()
        }}
      />

      <EditAdminModal
        admin={editAdmin}
        open={Boolean(editAdmin)}
        onClose={() => setEditAdmin(null)}
        onSaved={() => {
          setSuccess('Admin updated.')
          loadStaff()
        }}
      />
    </div>
  )
}
