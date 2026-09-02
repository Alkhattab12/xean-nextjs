'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode, 
  Sparkles, 
  Copy, 
  Check, 
  Zap, 
  RefreshCw, 
  AlertCircle, 
  Clock, 
  Download, 
  ExternalLink,
  ArrowRight,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../utils/userContext';
import { QrisInvoice } from '../types';
import { toast } from 'sonner';

export const CheckoutModal: React.FC = () => {
  const { 
    showCheckoutModal, 
    setShowCheckoutModal, 
    selectedPlanForCheckout, 
    user, 
    applyActivatedUser,
    setShowAuthModal
  } = useAuth();

  const [invoice, setInvoice] = useState<QrisInvoice | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedDepositId, setCopiedDepositId] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('15:00');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const isVipPlus = selectedPlanForCheckout === 'vip_plus';
  const planName = isVipPlus ? 'VIP+ Plan' : 'VIP Plan';
  const basePrice = isVipPlus ? 10000 : 5000;
  const basePriceFormatted = isVipPlus ? 'Rp 10.000' : 'Rp 5.000';
  const dailyQuota = isVipPlus ? 1000 : 500;

  // Trigger invoice creation when modal opens
  useEffect(() => {
    if (showCheckoutModal && selectedPlanForCheckout && selectedPlanForCheckout !== 'free') {
      if (!user) {
        setShowCheckoutModal(false);
        setShowAuthModal(true);
        toast.info('Silakan login terlebih dahulu untuk melanjutkan pembayaran VIP.');
        return;
      }
      createQrisInvoice();
    } else {
      cleanupTimers();
      setInvoice(null);
      setIsSuccess(false);
      setErrorMessage(null);
    }

    return () => {
      cleanupTimers();
    };
  }, [showCheckoutModal, selectedPlanForCheckout, user?.id]);

  const cleanupTimers = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  // 1. Create QRIS invoice via Ramashop Gateway
  const createQrisInvoice = async () => {
    cleanupTimers();
    setLoadingInvoice(true);
    setErrorMessage(null);
    setIsSuccess(false);

    try {
      const res = await fetch('/api/payment/qris/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
          'x-user-email': user?.email || '',
          'x-user-tier': user?.tier || 'free'
        },
        body: JSON.stringify({
          tier: selectedPlanForCheckout,
          userId: user?.id,
          email: user?.email,
          name: user?.name
        })
      });

      const data = await res.json();

      if (data.success && data.invoice) {
        setInvoice(data.invoice);
        startCountdown(data.invoice.expiredAt);
        startAutoPolling(data.invoice.depositId);
        toast.success(`Tagihan QRIS ${planName} berhasil dibuat!`);
      } else {
        setErrorMessage(data.error || 'Gagal menghubungi server QRIS RamaShop.');
        toast.error(data.error || 'Gagal membuat QRIS.');
      }
    } catch (err: any) {
      console.error('Invoice creation error:', err);
      setErrorMessage(err.message || 'Koneksi ke gateway pembayaran terputus.');
      toast.error('Gagal membuat tagihan QRIS.');
    } finally {
      setLoadingInvoice(false);
    }
  };

  // 2. Countdown timer for QRIS validity
  const startCountdown = (expiredAtIso: string) => {
    if (countdownRef.current) clearInterval(countdownRef.current);

    const updateTimer = () => {
      const expiry = new Date(expiredAtIso).getTime();
      const now = Date.now();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('00:00');
        if (countdownRef.current) clearInterval(countdownRef.current);
        if (pollingRef.current) clearInterval(pollingRef.current);
        setErrorMessage('Masa berlaku QRIS telah habis. Silakan klik tombol "Buat Ulang Tagihan".');
        return;
      }

      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft(
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateTimer();
    countdownRef.current = setInterval(updateTimer, 1000);
  };

  // 3. Auto Polling to check Ramashop payment mutation
  const startAutoPolling = (depositId: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      await checkPaymentStatus(depositId, true);
    }, 4000);
  };

  // 4. Check payment status with strict activation sync
  const checkPaymentStatus = async (depositIdToTest?: string, isAutoPoll = false) => {
    const targetDepositId = depositIdToTest || invoice?.depositId;
    if (!targetDepositId || isSuccess) return;

    if (!isAutoPoll) {
      setCheckingStatus(true);
    }

    try {
      const res = await fetch(`/api/payment/qris/status/${targetDepositId}`, {
        headers: {
          'x-user-id': user?.id || '',
          'x-user-email': user?.email || '',
          'x-user-tier': user?.tier || 'free'
        }
      });

      const data = await res.json();

      if (data.success && data.paid && data.status === 'success') {
        // PAYMENT VERIFIED! Synchronize user tier
        cleanupTimers();
        setIsSuccess(true);
        if (data.user) {
          applyActivatedUser(data.user);
        }

        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });

        toast.success(`🎉 ${data.message || 'Pembayaran Terverifikasi! Paket VIP Anda telah aktif!'}`);

        setTimeout(() => {
          setShowCheckoutModal(false);
        }, 3200);
      } else if (!isAutoPoll) {
        if (data.status === 'pending') {
          toast.info('⏳ Uang belum masuk atau pembayaran belum terdeteksi. Silakan transfer tepat sesuai total nominal unik.');
        } else {
          toast.warning(data.message || 'Status transaksi belum berhasil.');
        }
      }
    } catch (err) {
      if (!isAutoPoll) {
        toast.error('Gagal mengecek status pembayaran ke server.');
      }
    } finally {
      if (!isAutoPoll) {
        setCheckingStatus(false);
      }
    }
  };

  const handleCopyAmount = () => {
    if (!invoice) return;
    navigator.clipboard.writeText(invoice.totalAmount.toString());
    setCopiedAmount(true);
    toast.success(`Nominal Rp ${invoice.totalAmount.toLocaleString('id-ID')} disalin!`);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleCopyDepositId = () => {
    if (!invoice) return;
    navigator.clipboard.writeText(invoice.depositId);
    setCopiedDepositId(true);
    toast.success('ID Deposit disalin!');
    setTimeout(() => setCopiedDepositId(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!invoice?.qrImage) return;
    const a = document.createElement('a');
    a.href = invoice.qrImage;
    a.download = `QRIS_XEAN_${invoice.depositId}.png`;
    a.target = '_blank';
    a.click();
  };

  if (!showCheckoutModal || !selectedPlanForCheckout || selectedPlanForCheckout === 'free') {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0D0D0D] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 relative overflow-hidden max-h-[94vh] overflow-y-auto">
        {/* Ambient Glow */}
        <div className={`absolute -top-24 -right-24 w-56 h-56 rounded-full blur-3xl pointer-events-none ${
          isVipPlus ? 'bg-[#00FF88]/20' : 'bg-[#6366F1]/25'
        }`}></div>

        {/* Close Button */}
        <button
          onClick={() => setShowCheckoutModal(false)}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#161616] hover:bg-[#222] text-[#888] hover:text-white transition-colors border border-white/5 cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
              isVipPlus 
                ? 'bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/40' 
                : 'bg-[#6366F1]/20 text-[#818CF8] border border-[#6366F1]/40'
            }`}>
              {isVipPlus ? 'ULTRA EXCLUSIVE PLAN' : 'PREMIUM TIER'}
            </span>
            <span className="text-[11px] text-[#666] font-mono flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#00FF88]" /> QRIS Gateway RamaShop
            </span>
          </div>
          <h3 className="text-2xl font-serif italic text-white font-normal">
            Pembayaran QRIS {planName}
          </h3>
          <p className="text-xs text-[#888] font-light">
            Plan hanya akan aktif setelah transfer uang terdeteksi dan terverifikasi secara otomatis oleh sistem payment gateway.
          </p>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="p-6 rounded-2xl bg-[#0A1A10] border border-[#00FF88]/40 text-center space-y-3 animate-in zoom-in-95">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#00FF88]/20 border border-[#00FF88]/50 flex items-center justify-center text-[#00FF88]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Pembayaran Berhasil Diverifikasi!</h4>
            <p className="text-xs text-[#AAA] max-w-sm mx-auto">
              Uang masuk telah terdeteksi. Akun Anda berhasil ditingkatkan ke <strong className="text-[#00FF88]">{planName}</strong> dengan kuota <strong className="text-white">{dailyQuota.toLocaleString('id-ID')} request/hari</strong>.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00FF88]/10 text-[#00FF88] text-[11px] font-mono">
              <Sparkles className="w-3.5 h-3.5" /> Sedang mengarahkan ke dashboard...
            </div>
          </div>
        ) : (
          <>
            {/* Loading Skeleton */}
            {loadingInvoice ? (
              <div className="p-8 rounded-2xl bg-[#121212] border border-white/5 text-center space-y-4">
                <div className="w-10 h-10 border-3 border-[#00FF88] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">Membuat QRIS Dinamis RamaShop...</p>
                  <p className="text-xs text-[#777]">Menghasilkan kode pembayaran unik dan mengamankan sesi transaksi.</p>
                </div>
              </div>
            ) : errorMessage ? (
              <div className="p-5 rounded-2xl bg-[#1C1012] border border-[#FF4444]/40 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-[#FF4444] mx-auto" />
                <p className="text-xs text-[#FFAAAA]">{errorMessage}</p>
                <button
                  type="button"
                  onClick={createQrisInvoice}
                  className="py-2.5 px-5 rounded-full bg-[#FF4444] hover:bg-[#FF2222] text-white font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Coba Buat QRIS Lagi</span>
                </button>
              </div>
            ) : invoice ? (
              <div className="space-y-4">
                {/* QRIS Code Box */}
                <div className="p-4 rounded-2xl bg-[#141414] border border-white/10 flex flex-col sm:flex-row items-center gap-4">
                  {/* QR Image */}
                  <div className="p-3 bg-white rounded-2xl shadow-xl shrink-0 flex flex-col items-center relative group">
                    <img
                      src={invoice.qrImage}
                      alt="QRIS RamaShop"
                      className="w-36 h-36 object-contain rounded-lg"
                    />
                    <div className="flex items-center gap-1 mt-1 text-[10px] font-mono font-bold text-black uppercase">
                      <QrCode className="w-3 h-3 text-black" />
                      <span>QRIS RESMI</span>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="space-y-2 text-xs text-[#CCC] flex-1 w-full">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#888] font-mono">Invoice ID:</span>
                      <button
                        onClick={handleCopyDepositId}
                        className="text-[10px] font-mono text-[#AAA] hover:text-white flex items-center gap-1 bg-[#1F1F1F] px-2 py-0.5 rounded border border-white/5"
                      >
                        <span>{invoice.depositId}</span>
                        {copiedDepositId ? <Check className="w-3 h-3 text-[#00FF88]" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>

                    {/* Total Amount Box */}
                    <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#00FF88]/30 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#888]">Total Harus Ditransfer:</span>
                        <span className="text-[10px] text-[#00FF88] font-mono">Wajib Tepat</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-mono font-bold text-[#00FF88]">
                          Rp {invoice.totalAmount.toLocaleString('id-ID')}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyAmount}
                          className="px-2.5 py-1 rounded-lg bg-[#1F1F1F] hover:bg-white text-[#CCC] hover:text-black font-mono text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer border border-white/10"
                        >
                          {copiedAmount ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#00FF88]" />
                              <span>Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="text-[10px] text-[#777] flex items-center justify-between pt-1 border-t border-white/5 font-mono">
                        <span>Harga Paket: {basePriceFormatted}</span>
                        <span>Kode Unik: +Rp {invoice.uniqueCode}</span>
                      </div>
                    </div>

                    {/* Countdown and Status */}
                    <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                      <span className="text-[#888] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#FFA500]" />
                        <span>Kadaluarsa:</span>
                        <strong className="text-white">{timeLeft}</strong>
                      </span>
                      <span className="text-[#00FF88] flex items-center gap-1.5 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-[#00FF88]"></span>
                        <span>Auto-Checking Realtime</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Critical Payment Notice */}
                <div className="p-3 rounded-xl bg-[#1C1608] border border-[#FFA500]/30 flex items-start gap-2.5 text-xs text-[#FFD688]">
                  <AlertCircle className="w-4 h-4 text-[#FFA500] shrink-0 mt-0.5" />
                  <div className="space-y-0.5 leading-relaxed">
                    <p className="font-bold text-[#FFA500]">PENTING: Transfer Persis Sesuai Kode Unik</p>
                    <p className="text-[11px] text-[#FFD688]/90">
                      Transfer nominal tepat <strong>Rp {invoice.totalAmount.toLocaleString('id-ID')}</strong>. Jangan dibulatkan agar gateway RamaShop memverifikasi pembayaran Anda secara instan dan mengaktifkan kuota <strong>{dailyQuota} req/hari</strong>.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    disabled={checkingStatus}
                    onClick={() => checkPaymentStatus()}
                    className="w-full py-3.5 px-6 rounded-full font-bold text-xs uppercase tracking-widest bg-white text-black hover:bg-[#00FF88] hover:text-black transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    {checkingStatus ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-black" />
                        <span>Mengecek Mutasi Bank & QRIS...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-black" />
                        <span>Cek Status Pembayaran Sekarang</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-4 text-[11px] text-[#888]">
                    <button
                      type="button"
                      onClick={handleDownloadQr}
                      className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Simpan QRIS</span>
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={createQrisInvoice}
                      className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Buat Ulang Tagihan</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};