'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { birthApi } from '@/api/birth.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import type { BirthRecord } from '@/types';
import { toast } from 'react-toastify';

export default function AdminBirthRecordsPage() {
  const [records, setRecords] = useState<BirthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecords = async () => {
    try {
      const data = await birthApi.getAllRecords();
      console.log('Registrar fetched records', data);
      setRecords(data);
      setError(null);
    } catch (e) {
      console.error('Registrar load error', e);
      setError('Failed to load birth records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const updateStatus = async (id: number, status: 'VERIFIED' | 'REJECTED') => {
    try {
      const updated = await birthApi.updateStatus(String(id), status);
      console.log('Updated status', updated);
      setRecords(prev => prev.map(r => (r.id === id ? { ...r, status: updated.status, blockchainTx: updated.blockchainTx } : r)));
      toast.success(`Record ${status.toLowerCase()} successfully`);
    } catch (e) {
      console.error('Update status error', e);
      toast.error('Failed to update status');
    }
  };

  const badgeClass = (status?: string) => {
    const s = (status ?? 'PENDING').toUpperCase();
    if (s === 'VERIFIED') return 'bg-green-100 text-green-800';
    if (s === 'REJECTED') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'registrar']}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[var(--color-midnight)]">Registrar Dashboard</h1>
        <Card>
          <CardHeader>
            <CardTitle>All Birth Records</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : records.length === 0 ? (
              <p className="text-gray-500">No records found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>DOB</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((rec) => (
                    <TableRow key={rec.id}>
                      <TableCell>
                        {rec.first_name} {rec.middle_name ? rec.middle_name + ' ' : ''}{rec.last_name}
                      </TableCell>
                      <TableCell>{new Date(rec.date_of_birth).toLocaleDateString()}</TableCell>
                      <TableCell>{rec.gender}</TableCell>
                      <TableCell>{rec.user?.username}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${badgeClass(rec.status)}`}>
                          {(rec.status ?? 'PENDING').toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button size="sm" onClick={() => updateStatus(rec.id, 'VERIFIED')}>Verify</Button>
                        <Button size="sm" variant="outline" onClick={() => updateStatus(rec.id, 'REJECTED')}>Reject</Button>
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
