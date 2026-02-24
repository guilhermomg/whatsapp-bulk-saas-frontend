interface StatusBadgeProps {
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

const statusConfig = {
  draft: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    label: 'Draft',
  },
  pending: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    label: 'Pending Approval',
  },
  approved: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    label: 'Approved',
  },
  rejected: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    label: 'Rejected',
  },
};

export function StatusBadge({ status, rejectionReason }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <div className="relative inline-block group">
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
      {rejectionReason && status === 'rejected' && (
        <div className="invisible group-hover:visible absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded whitespace-nowrap z-10">
          {rejectionReason}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}
