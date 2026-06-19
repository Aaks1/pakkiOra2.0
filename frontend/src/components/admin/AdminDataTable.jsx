import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

const PAGE_SIZE = 20

const rowVariants = {
  hidden: { opacity: 0, x: -6 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: Math.min(i * 0.03, 0.3), duration: 0.25 },
  }),
}

export default function AdminDataTable({
  columns,
  rows,
  loading,
  emptyMessage = 'No results.',
  loadingMessage = 'Loading...',
  getRowKey = (row) => row.id,
}) {
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [rows])

  const total = rows.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * PAGE_SIZE
  const pageRows = useMemo(() => rows.slice(start, start + PAGE_SIZE), [rows, start])

  const showingFrom = total === 0 ? 0 : start + 1
  const showingTo = Math.min(start + PAGE_SIZE, total)

  return (
    <motion.div
      className="admin-table-wrap"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="overflow-x-auto">
        <table className="admin-table w-full min-w-[960px]">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={col.headerClassName}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-sm text-slate-400">
                  {loadingMessage}
                </td>
              </tr>
            ) : total === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-sm text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageRows.map((row, index) => (
                <motion.tr
                  key={getRowKey(row)}
                  custom={index}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={col.cellClassName}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {!loading && total > 0 ? (
        <div className="admin-table__footer">
          <p className="text-xs text-slate-500">
            Showing {showingFrom}–{showingTo} of {total}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="admin-table__btn"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="admin-table__btn"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </motion.div>
  )
}

export function AdminRowActions({ children }) {
  return <div className="flex flex-wrap gap-3">{children}</div>
}

export function AdminAction({ onClick, destructive = false, disabled, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`admin-action-btn${destructive ? ' admin-action-btn--destructive' : ''}`}
    >
      {children}
    </button>
  )
}
