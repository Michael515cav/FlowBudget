'use client'
export default function AdSenseSlot({ slot = 'bottom' }: { slot?: string }) {
  return (
    <div className="w-full border border-dashed border-border-subtle rounded-xl flex items-center justify-center h-16 my-4">
      <span className="text-[10px] text-border-subtle tracking-widest uppercase">Advertisement</span>
      {/* Uncomment after AdSense approval:
      <ins className="adsbygoogle" style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true" />
      */}
    </div>
  )
}
