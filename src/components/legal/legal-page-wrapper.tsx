import React from 'react';
import MentionsLegales from './mentions-legales';
import DonneesPersonnelles from './donnees-personnelles';

interface LegalPageWrapperProps {
  type: 'mentions' | 'privacy';
}

export default function LegalPageWrapper({ type }: LegalPageWrapperProps) {
  return type === 'mentions' ? <MentionsLegales /> : <DonneesPersonnelles />;
}
