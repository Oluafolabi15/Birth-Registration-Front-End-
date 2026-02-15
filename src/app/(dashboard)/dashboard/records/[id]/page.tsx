'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { birthApi } from '@/api/birth.api';
import { BirthRecord } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Download } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function RecordDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<BirthRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [certificateId, setCertificateId] = useState<number | null>(null);

  useEffect(() => {
    const fetchRecord = async () => {
      if (!id) return;
      try {
        const data = await birthApi.getRecordById(String(id));
        setRecord(data);
        const cert = Array.isArray(data.certificates) && data.certificates.length > 0 ? data.certificates[0] : null;
        setCertificateId(cert ? Number(cert.id) : null);
        setError(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!record) return null;

  return (
    <ProtectedRoute allowedRoles={['user', 'admin']}>
      <div className="space-y-6 max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Card className="border-t-4 border-t-[var(--color-indigo)]">
          <CardHeader>
            <CardTitle>Birth Record Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <p className="text-red-600">{error}</p>}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="text-lg font-semibold">
                  {record.first_name} {record.middle_name ? record.middle_name + ' ' : ''}{record.last_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="text-lg">{new Date(record.date_of_birth).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="text-lg">{record.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Place of Birth</p>
                <p className="text-lg">{record.place_of_birth}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mother's Name</p>
                <p className="text-lg">{record.mother_full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Father's Name</p>
                <p className="text-lg">{record.father_full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  {record.status || 'PENDING'}
                </span>
              </div>
              {record.blockchainTx && (
                <div>
                  <p className="text-sm text-gray-500">Blockchain Tx</p>
                  <a
                    href={`https://sepolia.basescan.org/tx/${record.blockchainTx}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-[var(--color-indigo)] truncate hover:underline"
                  >
                    {record.blockchainTx}
                  </a>
                </div>
              )}
            </div>
            {((record.status ?? '').toUpperCase() === 'SENT') && (
              <div className="flex justify-end">
                {certificateId ? (
                  <Button onClick={() => router.push(`/dashboard/certificates/${certificateId}`)}>
                    View Certificate
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    Awaiting Certificate
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </ProtectedRoute>
  );
}
