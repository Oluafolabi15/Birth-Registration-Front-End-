'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { birthApi } from '@/api/birth.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function SubmitRecordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'FEMALE',
    place_of_birth: '',
    mother_full_name: '',
    father_full_name: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        first_name: formData.first_name,
        middle_name: formData.middle_name || undefined,
        last_name: formData.last_name,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender as 'MALE' | 'FEMALE',
        place_of_birth: formData.place_of_birth,
        mother_full_name: formData.mother_full_name,
        father_full_name: formData.father_full_name,
      };

      console.log('Submitting payload:', payload);

      await birthApi.createRecord(payload);
      toast.success('Birth record submitted successfully!');
      router.push('/dashboard');
    } catch (error: unknown) {
      console.error('Submit error:', error);
      const errObj = error as Record<string, unknown>;
      const response = errObj?.response as { data?: { message?: string } } | undefined;
      const message = response?.data?.message || 'Failed to submit record. Please try again.';
      toast.error(message as string);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['user']}>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Submit Birth Record Application</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Child's First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Child's Middle Name"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleChange}
                />
                <Input
                  label="Child's Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <Input
                label="Date of Birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value as 'MALE' | 'FEMALE' })
                    }
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-indigo)] focus:border-transparent text-gray-900"
                  >
                    <option value="FEMALE">FEMALE</option>
                    <option value="MALE">MALE</option>
                  </select>
                </div>
                <Input
                  label="Place of Birth"
                  name="place_of_birth"
                  value={formData.place_of_birth}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Mother's Full Name"
                  name="mother_full_name"
                  value={formData.mother_full_name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Father's Full Name"
                  name="father_full_name"
                  value={formData.father_full_name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={loading}
                >
                  Submit Application
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
