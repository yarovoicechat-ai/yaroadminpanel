'use client';
import React from 'react';
import GenericStoreCategoryPage from '@/components/store/GenericStoreCategoryPage';
import { LogIn } from 'lucide-react';
export default function EntrancesStorePage() {
  return <GenericStoreCategoryPage categoryName="Entrance" categoryTitle="Room Entrances"
    categoryDescription="Room entrance animations with an optional avatar and Coming banner."
    themeColor="#06B6D4" icon={LogIn} defaultPrice={4500} />;
}
