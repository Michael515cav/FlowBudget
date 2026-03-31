export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-accent-blue rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                <path d="M2 10 L8 4 L14 8 L14 14 L2 14 Z" />
              </svg>
            </div>
            <span className="text-xl font-medium text-text-primary">FlowBudget</span>
          </div>
          <p className="text-text-muted text-sm">Free personal finance tracker</p>
        </div>
        {children}
      </div>
    </div>
  )
}
