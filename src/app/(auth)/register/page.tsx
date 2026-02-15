'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/api/auth.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { toast } from 'react-toastify';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      const registerData = { username: formData.username, password: formData.password };
      await authApi.register(registerData);
      
      // Register response has user info but no token in the provided DTO example
      // However, usually we redirect to login or auto-login.
      // If the backend DOES NOT return a token on register, we must redirect to login.
      // If it DOES, we can login.
      // The user showed RegisterResponseDto with id, username, role. NO token.
      
      toast.success('Registration successful! Please login.');
      router.push('/login');
    } catch (error: unknown) {
      console.error(error);
      let message = 'Registration failed. Please try again.';
      
      const errObj = error as Record<string, unknown>;
      const code = errObj?.code as string | undefined;
      const response = errObj?.response as { data?: { message?: string } } | undefined;
      if (code === 'ERR_NETWORK') {
        message = 'Unable to connect to the server. Please ensure the backend is running.';
      } else if (response?.data?.message) {
        message = response.data.message as string;
      }
      
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full border-none shadow-2xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
        <p className="text-sm text-center text-gray-500">
          Enter your details to register
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="johndoe"
            label="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <Button type="submit" className="w-full" isLoading={loading}>
            Register
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--color-indigo)] hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
