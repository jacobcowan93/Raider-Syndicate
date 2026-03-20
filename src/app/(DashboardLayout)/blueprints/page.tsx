'use client' // This is the missing line that allows ssr: false

import dynamic from 'next/dynamic'

const BlueprintTracker = dynamic(
  () => import('@/app/components/arc/BlueprintTracker'),
  { 
    ssr: false,
    loading: () => (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0', background: '#0b0d11', minHeight: '100vh' }}>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(220,38,38,0.2)', borderTopColor: '#dc2626', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }
)

export default function BlueprintsPage() {
  return <BlueprintTracker />
}