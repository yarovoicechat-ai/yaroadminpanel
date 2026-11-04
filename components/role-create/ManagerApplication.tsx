'use client';

import CountryManagerApplyPage from '@/app/apply/country-manager/page';
import StateManagerApplyPage from '@/app/apply/state-manager/page';

export function ManagerApplication({ role }: { role: 'country-manager' | 'state-manager' }) {
  return role === 'country-manager' ? <CountryManagerApplyPage /> : <StateManagerApplyPage />;
}
