import { useQuery } from '@tanstack/react-query'

import { getDashboardSummary } from '../api/dashboard'

export function useDashboardSummary() {
  return useQuery({
    queryFn: getDashboardSummary,
    queryKey: ['dashboard'],
  })
}
