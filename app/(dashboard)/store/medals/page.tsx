'use client';

import GenericStoreCategoryPage from '@/components/store/GenericStoreCategoryPage';
import { Medal } from 'lucide-react';

export default function MedalsStorePage() {
  return <GenericStoreCategoryPage categoryName="Badge" categoryTitle="Medals"
    categoryDescription="Add medal images, set diamond prices, and publish medals to the app."
    themeColor="#F59E0B" icon={Medal} defaultPrice={2500} />;
}
