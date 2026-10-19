'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function AccountButton() {
  const { user } = useAuth();

  return (
    <Link
      href={user ? '/minha-conta' : '/conta'}
      className="fixed top-6 right-6 z-50 bg-white border-2 border-gray-200 shadow-lg rounded-full p-3 hover:border-black transition group"
      title={user ? 'Minha Conta' : 'Entrar'}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="20" height="20" viewBox="0 0 24 24" 
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className="text-gray-600 group-hover:text-black"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    </Link>
  );
}
