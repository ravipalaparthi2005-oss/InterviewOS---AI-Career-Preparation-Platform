import React, { Suspense } from 'react';
import AuthForm from './AuthForm';

function AuthLoadingFallback() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col justify-center items-center font-sans bg-grid py-12 px-6">
      <div className="glow-orb w-[400px] h-[400px] bg-purple-600 top-[20%] left-[20%] animate-pulse-slow" />
      <div className="glow-orb w-[450px] h-[450px] bg-blue-600 bottom-[20%] right-[20%] animate-pulse-slow" style={{ animationDelay: '2s' }} />
      <div className="text-white">Loading...</div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthLoadingFallback />}>
      <AuthForm />
    </Suspense>
  );
}
