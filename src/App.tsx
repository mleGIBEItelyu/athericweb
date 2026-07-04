import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'

import { Dashboard } from '@/pages/Dashboard'
import { Markets } from '@/pages/Markets'
import { Watchlist } from '@/pages/Watchlist'
import { Settings } from '@/pages/Settings'
import { Support } from '@/pages/Support'
import { Evaluasi } from '@/pages/Evaluasi'

export function App() {
  const [searchQuery, setSearchQuery] = useState('')
  return (
    <Routes>
      <Route element={<AppLayout onSearch={setSearchQuery}/>}>
        <Route path="/" element={<Dashboard/>}/>
        <Route path="/stock/:ticker" element={<Dashboard/>}/>
        <Route path="/markets" element={<Markets searchQuery={searchQuery}/>}/>
        <Route path="/watchlist" element={<Watchlist/>}/>
        <Route path="/evaluasi" element={<Evaluasi/>}/>
        <Route path="/settings" element={<Settings/>}/>
        <Route path="/support" element={<Support/>}/>
      </Route>
    </Routes>
  )
}
