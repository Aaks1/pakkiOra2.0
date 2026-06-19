import { Search } from 'lucide-react'

export default function AdminSearch({ value, onChange, onKeyDown, placeholder = 'Search…' }) {
  return (
    <div className="admin-search">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="admin-search__input"
      />
    </div>
  )
}
