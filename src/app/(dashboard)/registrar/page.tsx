'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { birthApi } from '@/api/birth.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import type { BirthRecord } from '@/types';
import { FileText, CheckCircle, XCircle, Send } from 'lucide-react';

export default function RegistrarDashboard() {
  const [records, setRecords] = useState<BirthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await birthApi.getAllRecords();
      setRecords(data || []);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load birth records: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const updateStatus = async (id: number, status: 'VERIFIED' | 'REJECTED') => {
    try {
      setUpdatingId(id);
      const updated = await birthApi.updateStatus(String(id), status);
      setRecords(prev => prev.map(r => (r.id === id ? { ...r, status: updated.status, blockchainTx: updated.blockchainTx } : r)));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to update status: ${errorMessage}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const badgeClass = (status?: string) => {
    const s = (status ?? 'PENDING').toUpperCase();
    if (s === 'VERIFIED') return 'bg-green-100 text-green-800';
    if (s === 'REJECTED') return 'bg-red-100 text-red-800';
    if (s === 'SENT') return 'bg-indigo-100 text-indigo-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <ProtectedRoute allowedRoles={['registrar', 'admin']}>
      <div className="space-y-6 min-h-[80vh] bg-gradient-to-br from-gray-50 to-white p-4 md:p-6 rounded-lg page-fade-in">
        <h1 className="text-2xl font-bold text-[var(--color-midnight)]">Registrar Dashboard</h1>
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-t-4 border-t-[var(--color-indigo)]">
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Birth Records</p>
                  <p className="text-2xl font-bold text-[var(--color-midnight)]">{records.length}</p>
                </div>
                <FileText className="w-8 h-8 text-[var(--color-indigo)]" />
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-green-500">
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Verified</p>
                  <p className="text-2xl font-bold text-green-700">
                    {records.filter(r => (r.status ?? '').toUpperCase() === 'VERIFIED').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-red-500">
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Rejected</p>
                  <p className="text-2xl font-bold text-red-700">
                    {records.filter(r => (r.status ?? '').toUpperCase() === 'REJECTED').length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-[var(--color-indigo)]">
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Sent</p>
                  <p className="text-2xl font-bold text-[var(--color-midnight)]">
                    {records.filter(r => (r.status ?? '').toUpperCase() === 'SENT').length}
                  </p>
                </div>
                <Send className="w-8 h-8 text-[var(--color-indigo)]" />
              </CardContent>
            </Card>
          </div>
        )}
        {error && (
          <Card className="border-red-300 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700">{error}</p>
              <Button size="sm" onClick={loadRecords} variant="outline" className="mt-3">Try Again</Button>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle className="text-[var(--color-midnight)]">All Birth Records</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
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
                  {records.map((rec) => {
                    const status = (rec.status ?? 'PENDING').toUpperCase();
                    const isSent = status === 'SENT';
                    const isRejected = status === 'REJECTED';
                    const isVerified = status === 'VERIFIED';
                    return (
                      <TableRow key={rec.id}>
                        <TableCell>
                          {rec.first_name} {rec.middle_name ? rec.middle_name + ' ' : ''}{rec.last_name}
                        </TableCell>
                        <TableCell>{new Date(rec.date_of_birth).toLocaleDateString()}</TableCell>
                        <TableCell className="capitalize">{rec.gender}</TableCell>
                        <TableCell>{rec.user?.username || 'N/A'}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${badgeClass(rec.status)}`}>
                            {status}
                          </span>
                        </TableCell>
                        <TableCell className="space-x-2">
                          <Button
                            size="sm"
                            onClick={() => updateStatus(rec.id, 'VERIFIED')}
                            disabled={isSent || isRejected || isVerified || updatingId === rec.id}
                          >
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(rec.id, 'REJECTED')}
                            disabled={isSent || isRejected || isVerified || updatingId === rec.id}
                          >
                            Reject
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
