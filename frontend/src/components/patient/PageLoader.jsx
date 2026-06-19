export default function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  )
}
