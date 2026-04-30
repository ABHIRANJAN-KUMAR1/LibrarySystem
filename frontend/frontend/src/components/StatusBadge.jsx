export default function StatusBadge({ status }) {
  const map = {
    PENDING: { cls: 'badge-pending', dot: 'bg-amber-500', label: 'Pending' },
    APPROVED: { cls: 'badge-approved', dot: 'bg-emerald-500', label: 'Approved' },
    REJECTED: { cls: 'badge-rejected', dot: 'bg-red-500', label: 'Rejected' },
  }
  const { cls, dot, label } = map[status] || map.PENDING

  return (
    <span className={cls}>
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  )
}
