import React from 'react';
import { Link } from 'react-router-dom';
import { RegisterForm } from '../components/auth/RegisterForm';

export function RegisterPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-6 px-6 py-16">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <RegisterForm />
      <p className="text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
