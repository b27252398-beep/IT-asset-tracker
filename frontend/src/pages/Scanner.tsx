import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useQuery } from '@tanstack/react-query';
import { fetchAssets } from '../api/assetApi';
import { QrCode, Monitor, Laptop, Smartphone, Server, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const getCategoryIcon = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'laptop': return <Laptop className="w-5 h-5" />;
    case 'desktop': return <Monitor className="w-5 h-5" />;
    case 'mobile': return <Smartphone className="w-5 h-5" />;
    case 'server': return <Server className="w-5 h-5" />;
    default: return <Monitor className="w-5 h-5" />;
  }
};

const Scanner = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  // We fetch all assets to do local lookup, since we don't have a direct /api/assets/scan endpoint
  const { data: assets = [] } = useQuery<any[]>({
    queryKey: ['assets'],
    queryFn: () => fetchAssets()
  });

  useEffect(() => {
    if (!isScanning) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        setScanResult(decodedText);
        setIsScanning(false);
        scanner.clear();
      },
      (error) => {
        // Ignore errors to avoid console spam during scanning
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [isScanning]);

  const matchedAsset = scanResult ? assets.find((a: any) => a.id === scanResult || a.assetTag === scanResult) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">QR Scanner</h1>
          <p className="mt-1 text-sm text-slate-500">Scan an asset's QR code to view its details instantly.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[400px]">
        {isScanning ? (
          <div className="max-w-md mx-auto">
            <div id="reader" className="overflow-hidden rounded-xl border-2 border-indigo-100"></div>
            <p className="text-center text-slate-500 mt-4 text-sm">Please grant camera permissions to scan.</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center space-y-6">
            
            {matchedAsset ? (
              <div className="bg-slate-50 rounded-xl p-8 border border-slate-100 text-left">
                <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-slate-200">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                    {getCategoryIcon(matchedAsset.category)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{matchedAsset.name}</h2>
                    <p className="text-slate-500">{matchedAsset.assetTag}</p>
                  </div>
                  <div className="ml-auto">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      matchedAsset.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                      matchedAsset.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {matchedAsset.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="text-slate-500 mb-1">Serial Number</p>
                    <p className="font-medium text-slate-900">{matchedAsset.serialNumber}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Vendor</p>
                    <p className="font-medium text-slate-900">{matchedAsset.vendor}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Purchase Date</p>
                    <p className="font-medium text-slate-900">{new Date(matchedAsset.purchaseDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Location</p>
                    <p className="font-medium text-slate-900">{matchedAsset.location || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12">
                <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900">Asset Not Found</h2>
                <p className="text-slate-500 mt-2">The scanned QR code ({scanResult}) did not match any active asset in the system.</p>
              </div>
            )}

            <button 
              onClick={() => {
                setScanResult(null);
                setIsScanning(true);
              }}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <QrCode className="w-5 h-5 mr-2" />
              Scan Another Asset
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Scanner;
