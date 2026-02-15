'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { birthApi } from '@/api/birth.api';
// import { certificateApi } from '@/api/certificate.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { FileText, Award, Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import type { BirthRecord } from '@/types';


export default function UserDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRecords: 0,
    pendingRecords: 0,
    certificates: 0,
  });
  const [myRecords, setMyRecords] = useState<BirthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return;
        let records: BirthRecord[] = [];
        try {
          records = await birthApi.getAllRecords();
          const mine = records.filter(r => Number(r.user?.id) === Number(user.id));
          setMyRecords(mine);
          const pendingOnly = mine.filter(r => (r.status ?? 'PENDING').toUpperCase() === 'PENDING');
          setStats(prev => ({
            ...prev,
            totalRecords: mine.length,
            pendingRecords: pendingOnly.length,
          }));
          setError(null);
        } catch (recErr) {
          setError('Failed to load your records.');
          setMyRecords([]);
        }
        // Certificates are optional on dashboard; avoid noisy 404s
        setStats(prev => ({ ...prev, certificates: 0 }));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <ProtectedRoute allowedRoles={['user']}>
      <div className="space-y-6 page-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-midnight)]">Welcome back, {user?.username}</h1>
          <p className="text-gray-500">Here&apos;s what&apos;s happening with your applications.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <div className="h-9 w-9 rounded-full bg-indigo-50 flex items-center justify-center">
                <FileText className="h-5 w-5 text-[var(--color-indigo)]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRecords}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <div className="h-9 w-9 rounded-full bg-orange-50 flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRecords}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Issued Certificates</CardTitle>
              <div className="h-9 w-9 rounded-full bg-green-50 flex items-center justify-center">
                <Award className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.certificates}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Link href="/dashboard/submit">
            <Button>New Application</Button>
          </Link>
          <Link href="/dashboard/certificates">
            <Button variant="outline">View Certificates</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Birth Records</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : (
              <>
                {myRecords.filter(r => (r.status ?? 'PENDING').toUpperCase() === 'PENDING').length === 0 ? (
                  <p className="text-gray-500">You have no pending birth records.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Date of Birth</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myRecords
                        .filter(r => (r.status ?? 'PENDING').toUpperCase() === 'PENDING')
                        .map(rec => (
                          <TableRow key={rec.id}>
                            <TableCell>
                              {rec.first_name} {rec.middle_name ? rec.middle_name + ' ' : ''}{rec.last_name}
                            </TableCell>
                            <TableCell>{new Date(rec.date_of_birth).toLocaleDateString()}</TableCell>
                            <TableCell>{rec.gender}</TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                {(rec.status ?? 'PENDING')}
                              </span>
                            </TableCell>
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
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Birth Records</CardTitle>
          </CardHeader>
          <CardContent>
            {myRecords.length === 0 ? (
              <p className="text-gray-500">No records yet. Submit a new application.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {myRecords.slice(0, 6).map((rec) => {
                  const status = (rec.status ?? 'PENDING').toUpperCase();
                  const statusClasses =
                    status === 'VERIFIED' || status === 'SENT'
                      ? 'bg-green-100 text-green-800'
                      : status === 'REJECTED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800';
                  return (
                    <div key={rec.id} className="rounded-xl border border-gray-200 p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-semibold text-[var(--color-midnight)]">
                          {rec.first_name} {rec.middle_name ? rec.middle_name + ' ' : ''}{rec.last_name}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${statusClasses}`}>
                          {status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p className="mb-1">
                          <span className="font-medium">DOB:</span> {new Date(rec.date_of_birth).toLocaleDateString()}
                        </p>
                        <p className="mb-3">
                          <span className="font-medium">Gender:</span> {rec.gender}
                        </p>
                        {rec.blockchainTx && (
                          <p className="mb-3 flex items-center gap-2">
                            <span className="font-medium">Verification:</span>
                            <a
                              href={`https://sepolia.basescan.org/tx/${rec.blockchainTx}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-[var(--color-indigo)] hover:underline"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View Tx
                            </a>
                          </p>
                        )}
                        <div className="flex justify-end">
                          <Link href={`/dashboard/records/${rec.id}`}>
                            <Button size="sm" variant="outline">View Details</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
