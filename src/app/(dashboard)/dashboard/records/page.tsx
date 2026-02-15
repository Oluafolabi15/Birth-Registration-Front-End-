'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { birthApi } from '@/api/birth.api';
import { BirthRecord } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function MyRecordsPage() {
  const [records, setRecords] = useState<BirthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const data = await birthApi.getAllRecords();
        const mine = user ? data.filter(r => r.user?.id === user.id) : [];
        setRecords(mine);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [user]);

  return (
    <ProtectedRoute allowedRoles={['user']}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[var(--color-midnight)]">My Applications</h1>
        <Card>
          <CardHeader>
            <CardTitle>Submitted Birth Records</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : records.length === 0 ? (
              <p className="text-gray-500">No birth records found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Child Name</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((rec) => (
                    <TableRow key={rec.id}>
                      <TableCell>{rec.first_name} {rec.middle_name ? rec.middle_name + ' ' : ''}{rec.last_name}</TableCell>
                      <TableCell>{new Date(rec.date_of_birth).toLocaleDateString()}</TableCell>
                      <TableCell>{rec.gender}</TableCell>
                      <TableCell>{rec.status || 'PENDING'}</TableCell>
                      <TableCell>
                        <Link href={`/dashboard/records/${rec.id}`}>
                          <Button size="sm" variant="ghost">View</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
