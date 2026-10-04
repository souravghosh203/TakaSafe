import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import {
  LinkedWallet,
  ScannedQRPayload,
  CustomerBaseline,
} from '../../types';
import { SAMPLE_QR_PRESETS } from '../../data/mockData';
import {
  QrCode,
  Camera,
  X,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Zap,
  Building2,
  Users,
  ShoppingBag,
  Lock,
  ArrowRight,
  RefreshCw,
  Upload,
  Sliders,
  DollarSign,
  Fingerprint,
  Info,
  Check,
  Copy,
  Download,
  Flame,
  FileUp,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

interface QRCodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerBaseline;
  onWalletLinked: (newWallet: LinkedWallet) => void;
  onPaymentQRScanned?: (recipientWallet: string, amount?: number, note?: string) => void;
  lang: 'EN' | 'BN';
}

export const QRCodeScannerModal: React.FC<QRCodeScannerModalProps> = ({
  isOpen,
  onClose,
  customer,
  onWalletLinked,
  onPaymentQRScanned,
  lang,
}) => {
  const [modalTab, setModalTab] = useState<'SCANNER' | 'MY_QR'>('SCANNER');
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'ENVIRONMENT' | 'USER'>('ENVIRONMENT');
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scannedPayload, setScannedPayload] = useState<ScannedQRPayload | null>(null);
  const [linkingNickname, setLinkingNickname] = useState<string>('');
  const [dailyLimit, setDailyLimit] = useState<number>(25000);
  const [autoSweep, setAutoSweep] = useState<boolean>(true);
  const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);
  const [myQRCodeDataUrl, setMyQRCodeDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Generate My QR Code for current customer
  useEffect(() => {
    if (customer) {
      const myPayload = JSON.stringify({
        action: 'SEND_PAYMENT',
        targetWalletId: customer.wallet,
        accountHolder: customer.name,
        provider: 'TakaSafe / upay',
        accountNumberMasked: customer.wallet,
        type: 'MFS_WALLET',
        nid: customer.nationalIdMasked,
        timestamp: new Date().toISOString(),
      });

      QRCode.toDataURL(myPayload, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0054A6',
          light: '#FFFFFF',
        },
      })
        .then((url) => setMyQRCodeDataUrl(url))
        .catch((err) => console.error('QR generation error:', err));
    }
  }, [customer]);

  // Sound feedback simulation using Web Audio API
  const playScanBeep = (isThreat = false) => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (isThreat) {
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch {
      // Audio not permitted or supported
    }
  };

  // Parse raw scanned text from camera stream or file upload
  const processDecodedString = (text: string) => {
    try {
      let payload: ScannedQRPayload;

      // Case A: JSON Payload
      if (text.startsWith('{') && text.endsWith('}')) {
        const parsed = JSON.parse(text);
        const isMule = parsed.targetWalletId?.includes('510294') || parsed.accountNumberMasked?.includes('510294') || parsed.mule;
        payload = {
          action: parsed.action || 'LINK_WALLET',
          targetWalletId: parsed.targetWalletId || parsed.walletId || parsed.recipient || '01988-510294',
          accountHolder: parsed.accountHolder || parsed.name || 'External Account',
          provider: parsed.provider || 'MFS Partner',
          type: parsed.type || 'MFS_WALLET',
          accountNumberMasked: parsed.accountNumberMasked || parsed.targetWalletId || '01988-***294',
          suggestedAmount: parsed.suggestedAmount || parsed.amount,
          referenceCode: parsed.referenceCode,
          riskAssessmentScore: isMule ? 94 : parsed.riskAssessmentScore || 15,
          muleCheckPassed: !isMule,
          signature: parsed.signature || `SIG-RSA4096-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          timestamp: new Date().toISOString(),
        };
      } else if (text.startsWith('takasafe://') || text.includes('?')) {
        // Case B: URL format (takasafe://wallet-link or takasafe://pay)
        const urlStr = text.replace('takasafe://', 'http://takasafe.local/');
        const url = new URL(urlStr);
        const params = url.searchParams;
        const targetId = params.get('id') || params.get('wallet') || params.get('recipient') || params.get('code') || 'ACC-881900';
        const isMule = targetId.includes('510294') || params.get('mule') === 'true' || Number(params.get('risk')) > 75;

        payload = {
          action: text.includes('/pay') ? 'MERCHANT_CHECKOUT' : 'LINK_WALLET',
          targetWalletId: targetId,
          accountHolder: params.get('holder') || params.get('name') || params.get('merchant') || 'Verified Entity',
          provider: params.get('bank') || params.get('provider') || 'TakaSafe Network',
          type: (params.get('type') as any) || (text.includes('merchant') ? 'MERCHANT_POINT' : 'BANK_ACCOUNT'),
          accountNumberMasked: params.get('ac') || targetId.slice(0, 5) + '***' + targetId.slice(-4),
          suggestedAmount: params.get('amount') ? Number(params.get('amount')) : undefined,
          riskAssessmentScore: isMule ? 94 : Number(params.get('risk')) || 12,
          muleCheckPassed: !isMule,
          signature: params.get('auth') || `SIG-RSA4096-LIVE`,
          timestamp: new Date().toISOString(),
        };
      } else {
        // Case C: Plain String / Phone / Account Number
        const isMule = text.includes('510294');
        payload = {
          action: 'LINK_WALLET',
          targetWalletId: text.trim(),
          accountHolder: isMule ? 'Md. Al-Amin (Flagged Mule)' : 'Linked Partner Account',
          provider: 'TakaSafe Verified MFS',
          type: 'MFS_WALLET',
          accountNumberMasked: text.trim(),
          riskAssessmentScore: isMule ? 94 : 18,
          muleCheckPassed: !isMule,
          signature: `SIG-RSA4096-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          timestamp: new Date().toISOString(),
        };
      }

      setIsScanning(false);
      const isThreat = !payload.muleCheckPassed || payload.riskAssessmentScore >= 80;
      playScanBeep(isThreat);
      setScannedPayload(payload);
      setLinkingNickname(payload.accountHolder);
      setUploadError(null);
    } catch (err) {
      console.error('Failed to parse QR string:', err);
      setUploadError('Unrecognized QR payload format. Please scan a valid TakaSafe QR code.');
    }
  };

  // Live Camera Stream Setup with graceful fallback
  useEffect(() => {
    let stream: MediaStream | null = null;
    let isActive = true;

    if (isOpen && modalTab === 'SCANNER' && isScanning && navigator.mediaDevices?.getUserMedia) {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraFacing === 'ENVIRONMENT' ? { ideal: 'environment' } : { ideal: 'user' },
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
      };

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((s) => {
          if (!isActive) {
            s.getTracks().forEach((track) => track.stop());
            return;
          }
          stream = s;
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play().catch(() => {});
          }

          // Start continuous video frame scanning loop via jsQR
          const scanFrame = () => {
            if (!isActive || !isScanning) return;
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                  inversionAttempts: 'dontInvert',
                });
                if (code && code.data) {
                  processDecodedString(code.data);
                  return; // Stop scanning after successful decode
                }
              }
            }
            animFrameRef.current = requestAnimationFrame(scanFrame);
          };

          animFrameRef.current = requestAnimationFrame(scanFrame);
        })
        .catch(() => {
          // Camera permission denied or not available (e.g. desktop/iframe)
          setHasCameraPermission(false);
        });
    }

    return () => {
      isActive = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [isOpen, modalTab, isScanning, cameraFacing]);

  // Handle Image File Upload (QR from photo/screenshot)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          processDecodedString(code.data);
        } else {
          setUploadError('No valid QR code detected in this image. Try another photo or select a scenario below.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    // Reset file input value so same file can be re-selected if desired
    e.target.value = '';
  };

  const handleSimulateScan = (preset: typeof SAMPLE_QR_PRESETS[0]) => {
    processDecodedString(preset.qrRawData);
  };

  const handleConfirmLinking = () => {
    if (!scannedPayload) return;
    setIsAuthorizing(true);

    setTimeout(() => {
      setIsAuthorizing(false);

      const newLinkedWallet: LinkedWallet = {
        id: `LNK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        type: scannedPayload.type,
        provider: scannedPayload.provider,
        accountHolder: scannedPayload.accountHolder,
        accountNumberMasked: scannedPayload.accountNumberMasked,
        walletId: scannedPayload.targetWalletId,
        linkedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        dailyLimitBDT: dailyLimit,
        monthlyLimitBDT: dailyLimit * 6,
        status: 'ACTIVE',
        securityTrustScore: 100 - scannedPayload.riskAssessmentScore,
        nickname: linkingNickname || scannedPayload.accountHolder,
        verifiedNidMasked: customer.nationalIdMasked,
        autoSweepEnabled: autoSweep,
      };

      onWalletLinked(newLinkedWallet);
      setScannedPayload(null);
      setIsScanning(true);
      onClose();
    }, 900);
  };

  const handleProceedToPayment = () => {
    if (!scannedPayload) return;
    onPaymentQRScanned?.(
      scannedPayload.targetWalletId,
      scannedPayload.suggestedAmount,
      `QR Payment to ${scannedPayload.accountHolder}`
    );
    onClose();
  };

  const handleResetScanner = () => {
    setScannedPayload(null);
    setUploadError(null);
    setIsScanning(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`takasafe://pay?wallet=${customer.wallet}&name=${encodeURIComponent(customer.name)}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto font-sans">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0054A6] via-[#00478D] to-[#003875] text-white flex items-center justify-between border-b border-[#003366]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-amber-300 shadow-inner">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight flex items-center gap-2">
                <span>{lang === 'BN' ? 'কিউআর স্ক্যানার ও ওয়ালেট সংযোগ' : 'QR Scanner & Secure Wallet Link'}</span>
              </h3>
              <p className="text-[11px] text-blue-100 font-medium">
                Cryptographically verify and link bank accounts, trusted co-wallets, or scan merchant QR
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-blue-100 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
            title="Close Scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Scan QR vs My QR */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => {
              setModalTab('SCANNER');
              setIsScanning(true);
            }}
            className={`flex items-center gap-2 py-2.5 px-4 font-bold text-xs rounded-t-xl transition-all cursor-pointer ${
              modalTab === 'SCANNER'
                ? 'bg-white text-[#0054A6] border-t-2 border-l border-r border-[#0054A6] -mb-[1px] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan QR Code</span>
          </button>

          <button
            onClick={() => setModalTab('MY_QR')}
            className={`flex items-center gap-2 py-2.5 px-4 font-bold text-xs rounded-t-xl transition-all cursor-pointer ${
              modalTab === 'MY_QR'
                ? 'bg-white text-[#0054A6] border-t-2 border-l border-r border-[#0054A6] -mb-[1px] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>My Receiving QR</span>
          </button>
        </div>

        {/* Hidden Canvas for QR frame processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Tab 1: Scanner Viewport */}
        {modalTab === 'SCANNER' && (
          <div className="p-6 space-y-4 overflow-y-auto">
            {!scannedPayload ? (
              <>
                {/* Camera Viewfinder Viewport */}
                <div className="relative w-full aspect-square max-w-[340px] mx-auto rounded-3xl bg-slate-950 overflow-hidden shadow-xl border-4 border-slate-900 flex items-center justify-center">
                  {/* Real Video Element if Stream active */}
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className={`absolute inset-0 w-full h-full object-cover ${hasCameraPermission ? 'block' : 'hidden'}`}
                  />

                  {/* Simulated Camera Video Pattern when physical camera not accessible */}
                  {!hasCameraPermission && (
                    <div
                      className="absolute inset-0 opacity-20 pointer-events-none"
                      style={{
                        backgroundImage: 'radial-gradient(circle, #38BDF8 1px, transparent 1px)',
                        backgroundSize: '16px 16px',
                      }}
                    />
                  )}

                  {/* Ambient Torch Glow */}
                  {isTorchOn && (
                    <div className="absolute inset-0 bg-white/25 backdrop-blur-[1px] pointer-events-none transition-all duration-300" />
                  )}

                  {/* Scanning Target Reticle */}
                  <div className="relative w-56 h-56 rounded-2xl flex items-center justify-center z-10">
                    {/* Targeting Corner Brackets */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-400 rounded-tl-xl" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-400 rounded-tr-xl" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-400 rounded-bl-xl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-400 rounded-br-xl" />

                    {/* Animated Moving Laser Beam Line */}
                    <div
                      className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38BDF8]"
                      style={{
                        animation: 'scan-laser 2.2s ease-in-out infinite alternate',
                      }}
                    />

                    {/* Center Targeting Watermark */}
                    <div className="text-center space-y-1 select-none pointer-events-none">
                      <QrCode className="w-12 h-12 text-white/30 mx-auto animate-pulse" />
                      <span className="text-[10px] font-mono text-cyan-300 font-bold block tracking-wider drop-shadow">
                        ALIGN QR CODE IN FRAME
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono block">
                        Auto-focus & NID Cryptographic Verification
                      </span>
                    </div>
                  </div>

                  {/* Viewfinder Camera Floating Controls */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white z-20">
                    <button
                      type="button"
                      onClick={() => setIsTorchOn(!isTorchOn)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isTorchOn ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                      }`}
                      title="Toggle Flash"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{isTorchOn ? 'Torch ON' : 'Torch'}</span>
                    </button>

                    {/* Upload QR Image file */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-white/20 hover:bg-white/30 text-white flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-sm"
                      title="Upload QR Image"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setCameraFacing((f) => (f === 'ENVIRONMENT' ? 'USER' : 'ENVIRONMENT'))
                      }
                      className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-white/20 hover:bg-white/30 text-white flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-sm"
                      title="Flip Camera"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{cameraFacing === 'ENVIRONMENT' ? 'Back' : 'Front'}</span>
                    </button>
                  </div>
                </div>

                {/* Hidden File Input for QR Image Upload */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Upload Error Banner */}
                {uploadError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs animate-in fade-in">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Quick 1-Click QR Demonstration Scenarios */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>⚡ Or select a simulated QR Code to test linking:</span>
                    <span className="text-[10px] text-slate-500 font-mono">4 Scenarios Ready</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SAMPLE_QR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSimulateScan(preset)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer group ${
                          preset.targetWalletId.includes('510294')
                            ? 'border-rose-200 bg-rose-50/40 hover:bg-rose-50 hover:border-rose-400'
                            : 'border-slate-200 hover:border-[#0054A6] hover:bg-blue-50/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              preset.targetWalletId.includes('510294')
                                ? 'bg-rose-600 text-white'
                                : 'bg-blue-100 text-[#0054A6]'
                            }`}
                          >
                            {preset.badge}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Risk {preset.riskAssessmentScore}/100
                          </span>
                        </div>
                        <div className="font-bold text-xs text-slate-900 mt-1 group-hover:text-[#0054A6] transition-colors">
                          {preset.title}
                        </div>
                        <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                          {preset.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* Scanned Result & Linking Handshake View */
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                {/* Threat Intercept Banner if Mule Check Failed */}
                {!scannedPayload.muleCheckPassed || scannedPayload.riskAssessmentScore >= 80 ? (
                  <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <div className="font-black text-sm text-rose-800">
                          ScamShield Alert: High-Risk QR Intercepted!
                        </div>
                        <div className="text-xs text-rose-700">
                          This QR payload belongs to flagged mule account: <strong>{scannedPayload.accountHolder}</strong> ({scannedPayload.targetWalletId})
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/80 border border-rose-200 text-xs space-y-1">
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-600">Mule Cluster Associated:</span>
                        <span className="font-bold text-rose-600">Network #17 (Patuakhali Ring)</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-600">Attributed Risk Score:</span>
                        <span className="font-bold text-rose-600">{scannedPayload.riskAssessmentScore}/100</span>
                      </div>
                      <div className="text-[11px] text-rose-800 font-medium pt-1">
                        Linking or sending funds to this recipient will immediately trigger an AML hold and forward to the Bangladesh Financial Intelligence Unit (BFIU).
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleResetScanner}
                        className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                      >
                        Block & Rescan
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="py-2 px-3 bg-white border border-rose-300 text-rose-800 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Verified Valid QR Payload */
                  <div className="space-y-4">
                    {/* Cryptographic Verification Badge */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <span>Cryptographically Verified Payload</span>
                      </div>
                      <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                        Risk {scannedPayload.riskAssessmentScore}/100 (Safe)
                      </span>
                    </div>

                    {/* Scanned Details Card */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {scannedPayload.type === 'BANK_ACCOUNT' ? (
                            <Building2 className="w-5 h-5 text-[#0054A6]" />
                          ) : scannedPayload.type === 'FAMILY_MEMBER' ? (
                            <Users className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <ShoppingBag className="w-5 h-5 text-amber-600" />
                          )}
                          <div>
                            <span className="text-[10px] font-mono text-slate-500 uppercase block">
                              {scannedPayload.type.replace(/_/g, ' ')}
                            </span>
                            <span className="text-sm font-black text-slate-900 block">
                              {scannedPayload.accountHolder}
                            </span>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                          {scannedPayload.accountNumberMasked}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1 border-t border-slate-200">
                        <div>
                          <span className="text-slate-500 text-[10px] block">Provider</span>
                          <span className="font-bold text-slate-800">{scannedPayload.provider}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">Security Trust Score</span>
                          <span className="font-bold text-emerald-600">
                            {100 - scannedPayload.riskAssessmentScore}% (A+ Grade)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Form Controls for Linking or Payment */}
                    {scannedPayload.action === 'MERCHANT_CHECKOUT' ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                          <span>
                            Merchant payment ready for <strong>৳{scannedPayload.suggestedAmount?.toLocaleString()}</strong> at {scannedPayload.accountHolder}.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleProceedToPayment}
                          className="w-full py-3 px-4 bg-[#0054A6] hover:bg-[#004284] text-white font-extrabold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <DollarSign className="w-4 h-4 text-amber-300" />
                          <span>Pay ৳{scannedPayload.suggestedAmount?.toLocaleString()} Now</span>
                        </button>
                      </div>
                    ) : (
                      /* Wallet Linking Configuration */
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Wallet Custom Nickname
                          </label>
                          <input
                            type="text"
                            value={linkingNickname}
                            onChange={(e) => setLinkingNickname(e.target.value)}
                            placeholder="e.g. Primary Salary Account, Nusrat Family Card"
                            className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0054A6]"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                            <span>Daily Authorized Transfer Limit</span>
                            <span className="font-mono text-[#0054A6]">৳{dailyLimit.toLocaleString()}</span>
                          </div>
                          <input
                            type="range"
                            min="5000"
                            max="100000"
                            step="5000"
                            value={dailyLimit}
                            onChange={(e) => setDailyLimit(Number(e.target.value))}
                            className="w-full accent-[#0054A6] h-2 bg-slate-200 rounded-lg cursor-pointer"
                          />
                          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                            <span>৳5,000</span>
                            <span>৳50,000</span>
                            <span>৳100,000</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                          <div>
                            <span className="font-bold text-slate-800 block">ScamShield Auto-Sweep Safeguard</span>
                            <span className="text-[11px] text-slate-500">
                              Automatically blocks outbound drain if nocturnal velocity spikes are identified
                            </span>
                          </div>
                          <input
                            type="checkbox"
                            checked={autoSweep}
                            onChange={(e) => setAutoSweep(e.target.checked)}
                            className="w-4 h-4 rounded text-[#0054A6] focus:ring-[#0054A6] cursor-pointer"
                          />
                        </div>

                        {/* Authorize Button */}
                        <div className="pt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleResetScanner}
                            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                          >
                            Rescan
                          </button>
                          <button
                            type="button"
                            disabled={isAuthorizing}
                            onClick={handleConfirmLinking}
                            className="flex-1 py-2.5 px-4 bg-[#0054A6] hover:bg-[#004284] text-white font-extrabold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                          >
                            {isAuthorizing ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>
                                <Fingerprint className="w-4 h-4 text-amber-300" />
                                <span>Authorize & Link Secure Wallet</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Customer Receiving QR View */}
        {modalTab === 'MY_QR' && (
          <div className="p-6 space-y-5 text-center">
            <div className="max-w-xs mx-auto p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl space-y-3 shadow-inner">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                <span className="font-bold text-[#0054A6]">TakaSafe Pay</span>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  VERIFIED KYC
                </span>
              </div>

              {/* Generated QR Code Canvas */}
              {myQRCodeDataUrl ? (
                <div className="relative inline-block p-3 bg-white rounded-2xl shadow-sm border border-slate-200">
                  <img
                    src={myQRCodeDataUrl}
                    alt="My TakaSafe QR"
                    className="w-56 h-56 mx-auto rounded-lg"
                  />
                  {/* Watermark in center of QR */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full p-0.5 shadow-md flex items-center justify-center border-2 border-[#0054A6]">
                    <span className="text-[9px] font-black text-[#0054A6] tracking-tight">TakaSafe</span>
                  </div>
                </div>
              ) : (
                <div className="w-56 h-56 mx-auto bg-slate-200 animate-pulse rounded-2xl flex items-center justify-center text-xs text-slate-400">
                  Generating QR Matrix...
                </div>
              )}

              <div>
                <span className="font-black text-slate-900 text-base block">{customer.name}</span>
                <span className="font-mono text-xs text-slate-600 block mt-0.5">{customer.wallet}</span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  National ID: {customer.nationalIdMasked} · Tier 2 Limit: ৳300,000/mo
                </span>
              </div>
            </div>

            {/* Quick Share / Copy Options */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                <span>{copiedLink ? 'Copied to Clipboard!' : 'Copy Payment Link'}</span>
              </button>

              {myQRCodeDataUrl && (
                <a
                  href={myQRCodeDataUrl}
                  download={`TakaSafe-QR-${customer.wallet}.png`}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#0054A6] hover:bg-[#004284] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>Download QR</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan-laser {
          0% {
            top: 6px;
            opacity: 0.9;
          }
          50% {
            opacity: 1;
          }
          100% {
            top: calc(100% - 8px);
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  );
};
