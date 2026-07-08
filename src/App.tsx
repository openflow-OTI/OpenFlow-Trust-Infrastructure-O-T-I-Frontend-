import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Home } from '@/pages/Home'
import { Admin } from '@/pages/Admin'
import { NotFound } from '@/pages/NotFound'
import { Landing } from '@/pages/Landing'

// Task 11A: the scoring tool (formerly at "/") now lives at "/score" and
// keeps the shared app <Layout> (navbar + status dot) exactly as before —
// zero visual change. The new marketing homepage owns "/" and renders its
// own navbar/footer chrome, so it is NOT wrapped in <Layout>.
function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/score"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />
      <Route
        path="/admin"
        element={
          <Layout>
            <Admin />
          </Layout>
        }
      />
      <Route
        path="*"
        element={
          <Layout>
            <NotFound />
          </Layout>
        }
      />
    </Routes>
  )
}

export default App
