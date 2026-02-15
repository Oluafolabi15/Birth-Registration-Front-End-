'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { certificateApi } from '@/api/certificate.api';
import { blockchainApi } from '@/api/blockchain.api';
import { Certificate, BlockchainVerification } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function CertificateDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [verification, setVerification] = useState<BlockchainVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        const data = await certificateApi.getCertificateById(id as string);
        setCertificate(data);
      } catch (error) {
        console.error("Failed to fetch certificate details", error);
        toast.error("Certificate not found");
        router.push('/dashboard/certificates');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, router]);

  const handleVerify = async () => {
    if (!certificate) return;
    setVerifying(true);
    try {
      const result = await blockchainApi.verifyCertificate(String(certificate.id));
      setVerification(result);
      if (result.isValid) {
        toast.success("Certificate verified on blockchain!");
      } else {
        toast.error("Verification failed: Record mismatch");
      }
    } catch (error) {
      console.error("Verification error", error);
      toast.error("Failed to verify certificate");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!certificate) return null;

  return (
    <ProtectedRoute allowedRoles={['user', 'admin']}>
      <div className="space-y-6 max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Card className="border-t-4 border-t-[var(--color-indigo)]">
          <CardHeader className="text-center border-b bg-gray-50/50">
            <CardTitle className="text-3xl font-serif text-[var(--color-midnight)]">Birth Certificate</CardTitle>
            <p className="text-sm text-gray-500 font-mono mt-2">ID: {certificate.certificateNumber}</p>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="text-lg font-bold">{certificate.first_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Issue Date</p>
                <p className="text-lg font-medium">{new Date(certificate.issuedAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="mt-6 border-2 border-indigo-200 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
              <div className="text-center mb-4">
                <h3 className="text-2xl font-serif text-indigo-900">Digital Certificate</h3>
                <p className="text-xs text-gray-500">Official digital copy for download/printing</p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-500">Certificate No.</p>
                  <p className="text-sm font-mono">{certificate.certificateNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Holder</p>
                  <p className="text-sm font-semibold">{certificate.first_name}</p>
                </div>
                {typeof certificate.birthRecord === 'object' && certificate.birthRecord && (
                  <>
                    <div>
                      <p className="text-xs text-gray-500">Date of Birth</p>
                      <p className="text-sm">{new Date(certificate.birthRecord.date_of_birth).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Place of Birth</p>
                      <p className="text-sm">{certificate.birthRecord.place_of_birth}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Gender</p>
                      <p className="text-sm capitalize">{certificate.birthRecord.gender}</p>
                    </div>
                  </>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <div>
                  <p className="text-xs text-gray-500">Issued</p>
                  <p className="text-sm">{new Date(certificate.issuedAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Issuer</p>
                  <p className="text-sm font-medium text-indigo-900">National Birth Registry</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Blockchain Verification</h3>
              
              {certificate.blockchainTx ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Transaction Hash</span>
                    <a 
                      href={`https://sepolia.basescan.org/tx/${certificate.blockchainTx}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-[var(--color-indigo)] truncate max-w-[200px] hover:underline"
                    >
                      {certificate.blockchainTx}
                    </a>
                  </div>
                  
                  {verification ? (
                    <div className={`flex items-center p-2 rounded ${verification.isValid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {verification.isValid ? <CheckCircle className="w-5 h-5 mr-2" /> : <XCircle className="w-5 h-5 mr-2" />}
                      <span className="font-medium">
                        {verification.isValid ? "Verified on Blockchain" : "Verification Failed"}
                      </span>
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleVerify}
                      isLoading={verifying}
                      className="w-full mt-2"
                    >
                      Verify Authenticity
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Blockchain record pending...</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50/50 flex justify-end gap-2 p-6">
            <Button variant="outline" onClick={() => window.print()}>
              <Download className="mr-2 h-4 w-4" />
              Download / Print
            </Button>
            {certificate.pdfUrl && (
              <a href={certificate.pdfUrl} target="_blank" rel="noopener noreferrer">
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </a>
            )}
          </CardFooter>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
