import { Route, Routes } from 'react-router-dom'

import { ErrorBoundary } from './components/ErrorBoundary'
import { CustomersPage } from './pages/Customers'
import { DashboardPage } from './pages/Dashboard'
import { NotFoundPage } from './pages/NotFound'
import { OrdersPage } from './pages/Orders'
import { ProductsPage } from './pages/Products'

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  )
}

export default App
