import React from 'react';
import { Link } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';

export function LoginPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-6 px-6 py-16">
      <h1 className="text-2xl font-semibold">Log in</h1>
      <LoginForm />
      <p className="text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-primary-600 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
