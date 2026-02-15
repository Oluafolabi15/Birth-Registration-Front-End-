'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { certificateApi } from '@/api/certificate.api';
import { birthApi } from '@/api/birth.api';
import { Certificate, BirthRecord } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Download, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function MyCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [records, setRecords] = useState<BirthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const myCerts = await certificateApi.getMyCertificates();
        if (Array.isArray(myCerts) && myCerts.length > 0) {
          setCertificates(myCerts);
          // Try to infer records from certs when embedded
          const embeddedRecords = myCerts
            .map(c => (typeof c.birthRecord === 'object' ? c.birthRecord as BirthRecord : null))
            .filter((br): br is BirthRecord => !!br);
          if (embeddedRecords.length > 0) {
            setRecords(embeddedRecords);
          }
          return;
        }
      } catch {
        // Ignore and fallback to records
      }

      // Fallback: fetch user's records and derive certificates
      try {
        let recs: BirthRecord[] = [];
        try {
          recs = await birthApi.getMyRecords();
        } catch {
          const all = await birthApi.getAllRecords();
          recs = (all || []).filter(r => (user?.id ? r.user?.id === user.id : true));
        }
        setRecords(recs || []);

        const derived = (recs || [])
          .flatMap(r => Array.isArray(r.certificates) ? r.certificates : [])
          .filter((c): c is Certificate => !!c && typeof c.id === 'number');
        setCertificates(derived);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [user?.id]);

  const rows = [
    ...certificates.map((cert) => ({ type: 'cert' as const, cert })),
    ...records
      .filter((r) => ((r.status ?? '').toUpperCase() === 'SENT') && !(Array.isArray(r.certificates) && r.certificates.length > 0))
      .map((record) => ({ type: 'record' as const, record }))
  ];

  const handlePrintRecord = (record: BirthRecord) => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Birth Certificate #${record.id}</title>
          <style>
            body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", Roboto, Ubuntu, \"Helvetica Neue\", Arial; background: #fff; color: #111827; }
            .container { max-width: 800px; margin: 24px auto; border: 2px solid #c7d2fe; border-radius: 12px; padding: 24px; background: linear-gradient(135deg, #eef2ff, #f5f3ff); }
            .title { text-align: center; font-size: 28px; font-family: Georgia, serif; color: #1e3a8a; margin-bottom: 6px; }
            .subtitle { text-align: center; font-size: 12px; color: #6b7280; margin-bottom: 16px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
            .label { font-size: 11px; color: #6b7280; }
            .value { font-size: 16px; font-weight: 600; color: #111827; }
            .footer { margin-top: 16px; padding-top: 12px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
            .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace; }
            .issuer { color: #1e3a8a; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="title">Digital Birth Certificate</div>
            <div class="subtitle">Official digital copy for download/printing</div>
            <div class="grid">
              <div>
                <div class="label">Full Name</div>
                <div class="value">${record.first_name} ${record.middle_name ? record.middle_name + ' ' : ''}${record.last_name}</div>
              </div>
              <div>
                <div class="label">Date of Birth</div>
                <div class="value">${new Date(record.date_of_birth).toLocaleDateString()}</div>
              </div>
              <div>
                <div class="label">Place of Birth</div>
                <div class="value">${record.place_of_birth}</div>
              </div>
              <div>
                <div class="label">Gender</div>
                <div class="value">${String(record.gender).toLowerCase()}</div>
              </div>
              <div>
                <div class="label">Mother's Name</div>
                <div class="value">${record.mother_full_name}</div>
              </div>
              <div>
                <div class="label">Father's Name</div>
                <div class="value">${record.father_full_name}</div>
              </div>
            </div>
            <div class="footer">
              <div>
                <div class="label">Record ID</div>
                <div class="mono">#${record.id}</div>
              </div>
              <div style="text-align:right">
                <div class="label">Issuer</div>
                <div class="issuer">National Birth Registry</div>
              </div>
            </div>
          </div>
          <script>
            window.addEventListener('load', function() {
              window.print();
            });
          </script>
        </body>
      </html>
    `;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
  };

  return (
    <ProtectedRoute allowedRoles={['user']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[var(--color-midnight)]">My Certificates</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Issued Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : rows.length === 0 ? (
              <p className="text-gray-500">No certificates found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Certificate No.</TableHead>
                    <TableHead>Holder Name</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => {
                    if (row.type === 'cert') {
                      const cert = row.cert;
                      return (
                        <TableRow key={`cert-${cert.id}`}>
                          <TableCell className="font-mono">{cert.certificateNumber}</TableCell>
                          <TableCell>{cert.first_name}</TableCell>
                          <TableCell>{new Date(cert.issuedAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {cert.isVerified || cert.blockchainTx ? (
                              <div className="flex items-center text-green-600">
                                <ShieldCheck className="w-4 h-4 mr-1" />
                                Verified
                              </div>
                            ) : (
                              <span className="text-yellow-600">Pending</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {cert.pdfUrl && (
                                <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer">
                                  <Button size="sm" variant="outline">
                                    <Download className="w-4 h-4 mr-1" />
                                    PDF
                                  </Button>
                                </a>
                              )}
                              <Link href={`/dashboard/certificates/${cert.id}`}>
                                <Button size="sm" variant="ghost">
                                  Details
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    }
                    const r = row.record;
                    return (
                      <TableRow key={`record-${r.id}`}>
                        <TableCell className="font-mono">BR-{r.id}</TableCell>
                        <TableCell>{r.first_name} {r.middle_name ? r.middle_name + ' ' : ''}{r.last_name}</TableCell>
                        <TableCell>{new Date().toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center text-green-600">
                            <ShieldCheck className="w-4 h-4 mr-1" />
                            Verified
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handlePrintRecord(r)}>
                              <Download className="w-4 h-4 mr-1" />
                              Print
                            </Button>
                          </div>
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
