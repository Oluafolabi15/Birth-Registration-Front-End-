'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api/auth.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authApi.login(formData);
      // The login API only returns access_token now.
      // We pass the token to login, and the context will fetch the profile.
      await login(response.access_token);
      toast.success('Login successful! Redirecting...');
    } catch (error: any) {
      console.error(error);
      let message = 'Login failed. Please check your credentials.';
      
      if (error.code === 'ERR_NETWORK') {
        message = 'Unable to connect to the server. Please ensure the backend is running.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full border-none shadow-2xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Sign in</CardTitle>
        <p className="text-sm text-center text-gray-500">
          Enter your username and password to access your account
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
          />
          <Button type="submit" className="w-full" isLoading={loading}>
            Sign In
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="text-[var(--color-indigo)] hover:underline font-medium">
            Register
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
