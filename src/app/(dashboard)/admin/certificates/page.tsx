'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { certificateApi } from '@/api/certificate.api';
import { Certificate } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Trash2, ExternalLink, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCertificates = async () => {
    try {
      const data = await certificateApi.getAllCertificates();
      setCertificates(data);
    } catch (error) {
      console.error("Failed to fetch certificates", error);
      toast.error("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this certificate? This action cannot be undone.')) return;
    try {
      await certificateApi.deleteCertificate(String(id));
      toast.success('Certificate deleted successfully');
      setCertificates(certificates.filter(c => c.id !== id));
    } catch (error) {
      console.error("Failed to delete certificate", error);
      toast.error("Failed to delete certificate");
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[var(--color-midnight)]">Certificate Management</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>All Issued Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : certificates.length === 0 ? (
              <p className="text-gray-500">No certificates found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cert No.</TableHead>
                    <TableHead>Holder Name</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificates.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-mono text-xs">{cert.certificateNumber}</TableCell>
                      <TableCell>{cert.first_name}</TableCell>
                      <TableCell>{new Date(cert.issuedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {cert.isVerified ? (
                          <div className="flex items-center text-green-600 text-xs">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            Verified
                          </div>
                        ) : (
                          <span className="text-yellow-600 text-xs">Pending</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link href={`/dashboard/certificates/${cert.id}`}>
                            <Button size="sm" variant="ghost">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleDelete(cert.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
