import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Lock,
  Sparkles,
  Info,
  ServerOff,
  Cpu,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { RiskScore } from './RiskScore';
import { RiskLevelBadge, RiskLevel } from './RiskLevelBadge';
import { SecurityScan } from './SecurityScan';
import { RiskReasons, ReasonItem } from './RiskReasons';
import { RecipientVerification } from './RecipientVerification';
import { DecisionPanel } from './DecisionPanel';
import { PaymentConfirmation } from './PaymentConfirmation';
import { PaymentForm } from './PaymentForm';
import { AnalysisTimeline } from './AnalysisTimeline';

export type CardState =
  | 'IDLE' // State 1
  | 'PAYMENT_INPUT' // State 2
  | 'ANALYZING' // State 3
  | 'SAFE' // State 4
  | 'MEDIUM_RISK' // State 5
  | 'HIGH_RISK' // State 6
  | 'CRITICAL_RISK' // State 7
  | 'VERIFY_RECIPIENT' // Sub-flow: Verify Recipient Panel
  | 'DELAYED_PAUSE' // Sub-flow: Payment Paused
  | 'CONFIRM_OVERRIDE' // Sub-flow: Continue Anyway explicit confirmation
  | 'MODEL_NOT_CONNECTED' // Fallback / Dev mode
  | 'PAYMENT_SUCCESS'; // Completed

interface AnalyzeApiResponse {
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  prediction: string;
  confidence: number;
  reasons: ReasonItem[];
  recommended_action: string;
  can_continue: boolean;
  model_status?: string;
  model_connected?: boolean;
  message?: string;
  inference_latency_ms?: number;
}

interface ScamShieldCardProps {
  initialAmount?: string;
  initialRecipient?: string;
  recentAverage?: number;
  onPaymentCompleted?: (amount: number, recipient: string, riskScore: number) => void;
  onOpenQRScanner?: () => void;
  lang?: 'EN' | 'BN';
}

export const ScamShieldCard: React.FC<ScamShieldCardProps> = ({
  initialAmount = '',
  initialRecipient = '',
  recentAverage = 1500,
  onPaymentCompleted,
  onOpenQRScanner,
  lang = 'EN',
}) => {
  const [currentState, setCurrentState] = useState<CardState>('IDLE');
  const [amount, setAmount] = useState<string>(initialAmount);
  const [recipient, setRecipient] = useState<string>(initialRecipient);
  const [note, setNote] = useState<string>('');

  const [analysisResult, setAnalysisResult] = useState<AnalyzeApiResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [timelineStage, setTimelineStage] = useState<number>(1);
  const [stateBeforeVerification, setStateBeforeVerification] = useState<CardState>('PAYMENT_INPUT');

  // Check backend model health on initial mount
  useEffect(() => {
    fetch('/api/scamshield/health')
      .then((res) => res.json())
      .then((data) => {
        if (!data.model_loaded) {
          console.warn('[ScamShield] Backend reports model is not loaded:', data.message);
        }
      })
      .catch((err) => {
        console.warn('[ScamShield] Health check warning:', err.message);
      });
  }, []);

  // Sync when outside pre-fill buttons are clicked
  useEffect(() => {
    if (initialAmount) setAmount(initialAmount);
    if (initialRecipient) setRecipient(initialRecipient);
    if (initialAmount || initialRecipient) {
      setCurrentState('PAYMENT_INPUT');
    }
  }, [initialAmount, initialRecipient]);

  const handleStartPayment = () => {
    setCurrentState('PAYMENT_INPUT');
    setTimelineStage(1);
  };

  const handleReviewPayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!amount || !recipient) return;

    setCurrentState('ANALYZING');
    setIsAnalyzing(true);
    setTimelineStage(3);
    setModelError(null);

    const payload = {
      amount: Number(amount),
      receiver_id: recipient,
      timestamp: new Date().toISOString(),
      device_id: 'dev_browser_web',
      location: 'Dhaka',
      transaction_frequency: 1,
      customer_avg_amount: recentAverage,
      is_new_recipient: true,
      note,
    };

    try {
      const response = await fetch('/api/scamshield/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.status === 503 || data.model_connected === false || data.status === 'MODEL_NOT_CONNECTED') {
        setIsAnalyzing(false);
        setModelError(data.message || 'ML model not connected');
        setCurrentState('MODEL_NOT_CONNECTED');
        return;
      }

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Failed to analyze payment');
      }

      setAnalysisResult(data);
      setIsAnalyzing(false);
      setTimelineStage(5);

      // Map risk score to states as per requirements
      const score = data.risk_score;
      if (score <= 30) {
        setCurrentState('SAFE');
      } else if (score <= 60) {
        setCurrentState('MEDIUM_RISK');
      } else if (score <= 80) {
        setCurrentState('HIGH_RISK');
      } else {
        setCurrentState('CRITICAL_RISK');
      }
    } catch (err: any) {
      setIsAnalyzing(false);
      setModelError(err.message || 'ML model not connected');
      setCurrentState('MODEL_NOT_CONNECTED');
    }
  };

  const handleLogDecision = async (decision: 'VERIFY' | 'DELAY' | 'CONTINUE', confirmedOverride = false) => {
    try {
      await fetch('/api/scamshield/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiver_id: recipient,
          amount: Number(amount),
          risk_score: analysisResult?.risk_score ?? 0,
          decision,
          confirmed_override: confirmedOverride,
          notes: note,
        }),
      });
    } catch {
      // ignore
    }
  };

  const handleVerifyRecipientClick = () => {
    handleLogDecision('VERIFY');
    setStateBeforeVerification(currentState);
    setCurrentState('VERIFY_RECIPIENT');
  };

  const handleDelayPaymentClick = () => {
    handleLogDecision('DELAY');
    setCurrentState('DELAYED_PAUSE');
  };

  const handleContinueAnywayClick = () => {
    // If SAFE or already low/medium, proceed directly
    if (currentState === 'SAFE' || (analysisResult && analysisResult.risk_score <= 30)) {
      finalizePayment();
      return;
    }

    // For HIGH or CRITICAL risk, prompt explicit confirmation (STATE CONTINUED CONFIRMATION)
    if (analysisResult && analysisResult.risk_score > 60) {
      setCurrentState('CONFIRM_OVERRIDE');
      return;
    }

    // For medium risk, direct continue
    finalizePayment();
  };

  const finalizePayment = () => {
    handleLogDecision('CONTINUE', (analysisResult?.risk_score ?? 0) > 60);
    setCurrentState('PAYMENT_SUCCESS');
    onPaymentCompleted?.(Number(amount), recipient, analysisResult?.risk_score ?? 0);
  };

  const handleResetFlow = () => {
    setCurrentState('IDLE');
    setAnalysisResult(null);
    setTimelineStage(1);
    setAmount('');
    setRecipient('');
    setNote('');
  };

  const handleGoBack = () => {
    if (currentState === 'VERIFY_RECIPIENT') {
      setCurrentState(stateBeforeVerification);
      return;
    }
    if (currentState === 'DELAYED_PAUSE' || currentState === 'CONFIRM_OVERRIDE') {
      if (analysisResult) {
        if (analysisResult.risk_score <= 30) setCurrentState('SAFE');
        else if (analysisResult.risk_score <= 60) setCurrentState('MEDIUM_RISK');
        else if (analysisResult.risk_score <= 80) setCurrentState('HIGH_RISK');
        else setCurrentState('CRITICAL_RISK');
        return;
      }
    }
    // Return to PAYMENT_INPUT keeping user's entered amount & recipient intact
    setCurrentState('PAYMENT_INPUT');
    setTimelineStage(1);
  };

  const handlePrefillScenario = (type: 'NORMAL' | 'RISKY') => {
    if (type === 'NORMAL') {
      setAmount('1500');
      setRecipient('01710-605442');
      setNote('Family support');
    } else {
      setAmount('75000');
      setRecipient('01988-510294');
      setNote('Urgent prize processing fee');
    }
  };

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden font-sans text-slate-900 dark:text-slate-100 transition-all duration-300">
      {/* Top Brand & Security Header Bar */}
      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-[#0054A6] dark:text-sky-400 shadow-2xs">
            <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              ScamShield AI Guardian
            </h3>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mt-0.5">
              Pre-Payment Protection Active
            </span>
          </div>
        </div>

        {/* Status / Reset Trigger */}
        <div className="flex items-center gap-2">
          {currentState !== 'IDLE' && (
            <button
              type="button"
              onClick={handleGoBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
              title="Back to payment"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          {currentState !== 'IDLE' && (
            <button
              type="button"
              onClick={handleResetFlow}
              className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 font-semibold px-2 py-1 transition-colors cursor-pointer"
              title="Reset flow"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Container Area */}
      <div className="p-5 sm:p-6 space-y-5">
        {/* ============================================================ */}
        {/* STATE 1: IDLE */}
        {/* ============================================================ */}
        {currentState === 'IDLE' && (
          <div className="py-6 px-2 flex flex-col items-center justify-center text-center space-y-6 select-none animate-in fade-in duration-200">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-200 dark:border-blue-800/80 flex items-center justify-center text-[#0054A6] dark:text-sky-400 shadow-sm relative">
              <ShieldCheck className="w-10 h-10 stroke-[2]" />
              <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-600 text-white shadow-xs">
                ACTIVE
              </span>
            </div>

            <div className="space-y-1.5 max-w-sm">
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Send Money
              </h2>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800">
                ScamShield Active
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                Every outbound transfer is evaluated in real-time by an in-memory XGBoost model before funds are released.
              </p>
            </div>

            <div className="w-full max-w-xs pt-2">
              <button
                type="button"
                onClick={handleStartPayment}
                className="w-full py-3 px-6 rounded-2xl bg-[#0054A6] hover:bg-[#004080] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#003875]"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STATE 2: PAYMENT INPUT */}
        {/* ============================================================ */}
        {currentState === 'PAYMENT_INPUT' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentState('IDLE')}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Enter Payment Details
                </h4>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live ML Protected
              </span>
            </div>

            <PaymentForm
              amount={amount}
              recipient={recipient}
              note={note}
              onAmountChange={setAmount}
              onRecipientChange={setRecipient}
              onNoteChange={setNote}
              onSubmit={handleReviewPayment}
              onOpenQRScanner={onOpenQRScanner}
              onPrefillScenario={handlePrefillScenario}
              recentAverage={recentAverage}
              isAnalyzing={isAnalyzing}
              lang={lang}
            />
          </div>
        )}

        {/* ============================================================ */}
        {/* STATE 3: ANALYZING */}
        {/* ============================================================ */}
        {currentState === 'ANALYZING' && (
          <SecurityScan isAnalyzing={isAnalyzing} />
        )}

        {/* ============================================================ */}
        {/* STATE 4: SAFE (risk_score <= 30) */}
        {/* ============================================================ */}
        {currentState === 'SAFE' && analysisResult && (
          <div className="py-2 space-y-6 text-center select-none animate-in fade-in duration-200">
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-xs px-3.5 py-1 rounded-full shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>✓ PAYMENT LOOKS SAFE</span>
            </div>

            {/* Prominent Risk Score */}
            <RiskScore score={analysisResult.risk_score} size="lg" />

            <div className="flex justify-center">
              <RiskLevelBadge level="LOW" score={analysisResult.risk_score} size="md" />
            </div>

            {/* Short Calm Explanation */}
            <div className="bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
              <p className="font-medium text-emerald-900 dark:text-emerald-200">
                This payment matches your normal spending baseline. No suspicious counterparty or velocity anomalies were detected.
              </p>
              <div className="mt-2 text-[11px] text-slate-500 font-mono">
                Recipient: {recipient} · BDT ৳{Number(amount).toLocaleString()}
              </div>
            </div>

            {/* Button: Continue Payment */}
            <div className="max-w-xs mx-auto">
              <DecisionPanel
                riskLevel="LOW"
                onVerifyRecipient={handleVerifyRecipientClick}
                onDelayPayment={handleDelayPaymentClick}
                onContinueAnyway={handleContinueAnywayClick}
                onBack={handleGoBack}
              />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STATE 5: MEDIUM RISK (risk_score 31 - 60) */}
        {/* ============================================================ */}
        {currentState === 'MEDIUM_RISK' && analysisResult && (
          <div className="py-2 space-y-5 text-center select-none animate-in fade-in duration-200">
            <div className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 font-bold text-xs px-3.5 py-1 rounded-full shadow-2xs">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>REVIEW RECOMMENDED</span>
            </div>

            <RiskScore score={analysisResult.risk_score} size="lg" />

            <div className="flex justify-center">
              <RiskLevelBadge level="MEDIUM" score={analysisResult.risk_score} size="md" />
            </div>

            {/* Main Reasons */}
            <div className="max-w-md mx-auto">
              <RiskReasons
                reasons={analysisResult.reasons}
                title="Review Recommended: Notable Factors"
                variant="bullets"
              />
            </div>

            {/* Actions: Verify Recipient / Continue Anyway */}
            <div className="max-w-xs mx-auto">
              <DecisionPanel
                riskLevel="MEDIUM"
                onVerifyRecipient={handleVerifyRecipientClick}
                onDelayPayment={handleDelayPaymentClick}
                onContinueAnyway={handleContinueAnywayClick}
                onBack={handleGoBack}
              />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STATE 6: HIGH RISK (risk_score 61 - 80) */}
        {/* ============================================================ */}
        {currentState === 'HIGH_RISK' && analysisResult && (
          <div className="py-2 space-y-5 text-center select-none animate-in fade-in duration-200">
            <div className="inline-flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/60 border border-orange-300 dark:border-orange-800 text-orange-900 dark:text-orange-300 font-bold text-xs px-3.5 py-1 rounded-full shadow-2xs">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span>⚠ PAYMENT NEEDS ATTENTION</span>
            </div>

            <RiskScore score={analysisResult.risk_score} size="lg" />

            <div className="flex justify-center">
              <RiskLevelBadge level="HIGH" score={analysisResult.risk_score} size="md" />
            </div>

            {/* Why this payment is unusual */}
            <div className="max-w-md mx-auto">
              <RiskReasons
                reasons={analysisResult.reasons}
                title="Why this payment is unusual"
                variant="bullets"
              />
            </div>

            {/* Actions: Verify Recipient / Delay Payment / Continue Anyway */}
            <div className="max-w-xs mx-auto">
              <DecisionPanel
                riskLevel="HIGH"
                onVerifyRecipient={handleVerifyRecipientClick}
                onDelayPayment={handleDelayPaymentClick}
                onContinueAnyway={handleContinueAnywayClick}
                onBack={handleGoBack}
              />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STATE 7: CRITICAL RISK (risk_score >= 81) */}
        {/* ============================================================ */}
        {currentState === 'CRITICAL_RISK' && analysisResult && (
          <div className="py-2 space-y-5 text-center select-none animate-in fade-in duration-200">
            <div className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-900 text-rose-800 dark:text-rose-200 font-black text-xs px-4 py-1.5 rounded-full shadow-sm animate-pulse">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>⚠ SCAMSHIELD WARNING</span>
            </div>

            <RiskScore score={analysisResult.risk_score} size="lg" />

            <div className="flex justify-center">
              <RiskLevelBadge level="CRITICAL" score={analysisResult.risk_score} size="lg" />
            </div>

            <div className="bg-rose-50/70 dark:bg-rose-950/40 p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/60 max-w-md mx-auto text-xs text-rose-900 dark:text-rose-200 leading-relaxed font-medium">
              "This payment looks significantly different from your usual activity."
            </div>

            {/* Evidence with Impact % */}
            <div className="max-w-md mx-auto">
              <RiskReasons
                reasons={analysisResult.reasons}
                title="WHY WE FLAGGED THIS"
                variant="evidence"
              />
            </div>

            {/* Actions: [ Verify Recipient ] [ Delay Payment ] / Continue Anyway */}
            <div className="max-w-xs mx-auto">
              <DecisionPanel
                riskLevel="CRITICAL"
                onVerifyRecipient={handleVerifyRecipientClick}
                onDelayPayment={handleDelayPaymentClick}
                onContinueAnyway={handleContinueAnywayClick}
                onBack={handleGoBack}
              />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VERIFY RECIPIENT FLOW */}
        {/* ============================================================ */}
        {currentState === 'VERIFY_RECIPIENT' && (
          <RecipientVerification
            receiverId={recipient}
            onBack={() => setCurrentState(stateBeforeVerification)}
          />
        )}

        {/* ============================================================ */}
        {/* DELAY PAYMENT FLOW */}
        {/* ============================================================ */}
        {currentState === 'DELAYED_PAUSE' && (
          <PaymentConfirmation
            mode="DELAYED_PAUSE"
            riskScore={analysisResult?.risk_score ?? 70}
            riskLevel={analysisResult?.risk_level ?? 'HIGH'}
            amount={Number(amount)}
            recipient={recipient}
            onConfirmPayment={finalizePayment}
            onGoBack={() => setCurrentState('PAYMENT_INPUT')}
          />
        )}

        {/* ============================================================ */}
        {/* CONFIRM OVERRIDE FLOW */}
        {/* ============================================================ */}
        {currentState === 'CONFIRM_OVERRIDE' && analysisResult && (
          <PaymentConfirmation
            mode="CONFIRM_OVERRIDE"
            riskScore={analysisResult.risk_score}
            riskLevel={analysisResult.risk_level}
            amount={Number(amount)}
            recipient={recipient}
            onConfirmPayment={finalizePayment}
            onGoBack={() => setCurrentState(analysisResult.risk_score >= 81 ? 'CRITICAL_RISK' : 'HIGH_RISK')}
          />
        )}

        {/* ============================================================ */}
        {/* FALLBACK / DEV MODE: MODEL NOT CONNECTED */}
        {/* ============================================================ */}
        {currentState === 'MODEL_NOT_CONNECTED' && (
          <div className="py-6 px-3 flex flex-col items-center justify-center text-center space-y-4 select-none animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 flex items-center justify-center text-amber-600 shadow-sm">
              <ServerOff className="w-8 h-8" />
            </div>

            <div className="space-y-1 max-w-sm">
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                ML Model Not Connected
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {modelError || 'Please place your trained XGBoost model artifact (scamshield_xgb.json) in ./ml/model/ or set MODEL_PATH.'}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 text-left max-w-xs space-y-1">
              <div>Expected path: <span className="text-slate-800 dark:text-slate-200 font-bold">./ml/model/scamshield_xgb.json</span></div>
              <div>Backend endpoint: <span className="text-slate-800 dark:text-slate-200 font-bold">POST /api/scamshield/analyze</span></div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={handleReviewPayment}
                className="py-2 px-4 rounded-xl bg-[#0054A6] text-white font-bold text-xs shadow-sm hover:bg-[#004080] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentState('PAYMENT_INPUT')}
                className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Back to Form
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PAYMENT SUCCESS */}
        {/* ============================================================ */}
        {currentState === 'PAYMENT_SUCCESS' && (
          <div className="py-6 px-3 flex flex-col items-center justify-center text-center space-y-4 select-none animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-600 shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1 max-w-xs">
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                Payment Authorized & Dispatched
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Transfer of <strong>৳{Number(amount).toLocaleString()}</strong> to <strong>{recipient}</strong> processed successfully.
              </p>
            </div>

            <div className="pt-2 w-full max-w-xs">
              <button
                type="button"
                onClick={handleResetFlow}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                New Payment
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Timeline Indicator */}
      {currentState !== 'IDLE' && currentState !== 'PAYMENT_SUCCESS' && (
        <div className="px-3.5 sm:px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40">
          <AnalysisTimeline currentStage={timelineStage} />
        </div>
      )}
    </div>
  );
};
