import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronDown,
  CircleHelp, Clock3, FileCheck2, Fingerprint, IdCard, Info, LockKeyhole, MapPin,
  ShieldCheck, Smartphone, Sparkles, UserRound, Upload, XCircle,
} from 'lucide-react';
import './RegistrationPage.css';
import { maskBangladeshPhone } from '../../utils/maskSensitive';

type Address = { division: string; district: string; upazila: string; detail: string };
type RegistrationData = {
  phone: string; name: string; dob: string; gender: string; present: Address; permanent: Address;
  occupation: string; email: string; nid: string;
};
type Props = {
  initialEmail?: string;
  hideTopbar?: boolean;
  lang: 'EN' | 'BN';
  theme: 'light' | 'dark';
  onLogin: () => void;
  onDashboard: () => void;
  onOpenModal: (modal: string) => void;
};

const divisions: Record<string, string[]> = {
  Dhaka: ['Dhaka', 'Faridpur', 'Gazipur', 'Gopalganj', 'Kishoreganj', 'Madaripur', 'Manikganj', 'Munshiganj', 'Narayanganj', 'Narsingdi', 'Rajbari', 'Shariatpur', 'Tangail'],
  Chattogram: ['Bandarban', 'Brahmanbaria', 'Chandpur', 'Chattogram', 'Cox’s Bazar', 'Cumilla', 'Feni', 'Khagrachhari', 'Lakshmipur', 'Noakhali', 'Rangamati'],
  Rajshahi: ['Bogura', 'Chapainawabganj', 'Joypurhat', 'Naogaon', 'Natore', 'Pabna', 'Rajshahi', 'Sirajganj'],
  Khulna: ['Bagerhat', 'Chuadanga', 'Jashore', 'Jhenaidah', 'Khulna', 'Kushtia', 'Magura', 'Meherpur', 'Narail', 'Satkhira'],
  Barishal: ['Barguna', 'Barishal', 'Bhola', 'Jhalokati', 'Patuakhali', 'Pirojpur'],
  Sylhet: ['Habiganj', 'Moulvibazar', 'Sunamganj', 'Sylhet'],
  Rangpur: ['Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari', 'Panchagarh', 'Rangpur', 'Thakurgaon'],
  Mymensingh: ['Jamalpur', 'Mymensingh', 'Netrokona', 'Sherpur'],
};

const emptyAddress: Address = { division: '', district: '', upazila: '', detail: '' };
const occupations = ['Student', 'Service Holder', 'Business Owner', 'Freelancer', 'Homemaker', 'Other'];
const stepNames = ['Mobile verification', 'Personal information', 'Identity verification', 'Account security', 'Activation status'];
const stepIcons = [Smartphone, UserRound, IdCard, LockKeyhole, CheckCircle2];

const blankRegistration = (initialEmail = ''): RegistrationData => ({
  phone: '', name: '', dob: '', gender: '', present: { ...emptyAddress }, permanent: { ...emptyAddress },
  occupation: '', email: initialEmail, nid: '',
});

const isBangladeshMobile = (value: string) => /^1[3-9]\d{8}$/.test(value);
const maskMobile = (value: string) => value.length >= 5 ? `+880 ${maskBangladeshPhone(value).slice(1)}` : '+880 ****';

export const RegistrationPage: React.FC<Props> = ({ initialEmail = '', hideTopbar = false, lang, theme, onLogin, onDashboard, onOpenModal }) => {
  const isBn = lang === 'BN';
  const t = (english: string, bangla: string) => isBn ? bangla : english;
  const localizeOption = (value: string) => {
    if (!isBn) return value;
    const translations: Record<string, string> = {
    Female: 'নারী', Male: 'পুরুষ', 'Non-binary': 'নন-বাইনারি', 'Prefer not to say': 'বলতে অনিচ্ছুক',
    Student: 'শিক্ষার্থী', 'Service Holder': 'চাকরিজীবী', 'Business Owner': 'ব্যবসায়ী', Freelancer: 'ফ্রিল্যান্সার', Homemaker: 'গৃহিণী', Other: 'অন্যান্য',
    Dhaka: 'ঢাকা', Faridpur: 'ফরিদপুর', Gazipur: 'গাজীপুর', Gopalganj: 'গোপালগঞ্জ', Kishoreganj: 'কিশোরগঞ্জ', Madaripur: 'মাদারীপুর', Manikganj: 'মানিকগঞ্জ', Munshiganj: 'মুন্সিগঞ্জ', Narayanganj: 'নারায়ণগঞ্জ', Narsingdi: 'নরসিংদী', Rajbari: 'রাজবাড়ী', Shariatpur: 'শরীয়তপুর', Tangail: 'টাঙ্গাইল',
    Chattogram: 'চট্টগ্রাম', Bandarban: 'বান্দরবান', Brahmanbaria: 'ব্রাহ্মণবাড়িয়া', Chandpur: 'চাঁদপুর', 'Cox’s Bazar': 'কক্সবাজার', Cumilla: 'কুমিল্লা', Feni: 'ফেনী', Khagrachhari: 'খাগড়াছড়ি', Lakshmipur: 'লক্ষ্মীপুর', Noakhali: 'নোয়াখালী', Rangamati: 'রাঙামাটি',
    Rajshahi: 'রাজশাহী', Bogura: 'বগুড়া', Chapainawabganj: 'চাঁপাইনবাবগঞ্জ', Joypurhat: 'জয়পুরহাট', Naogaon: 'নওগাঁ', Natore: 'নাটোর', Pabna: 'পাবনা', Sirajganj: 'সিরাজগঞ্জ',
    Khulna: 'খুলনা', Bagerhat: 'বাগেরহাট', Chuadanga: 'চুয়াডাঙ্গা', Jashore: 'যশোর', Jhenaidah: 'ঝিনাইদহ', Kushtia: 'কুষ্টিয়া', Magura: 'মাগুরা', Meherpur: 'মেহেরপুর', Narail: 'নড়াইল', Satkhira: 'সাতক্ষীরা',
    Barishal: 'বরিশাল', Barguna: 'বরগুনা', Bhola: 'ভোলা', Jhalokati: 'ঝালকাঠি', Patuakhali: 'পটুয়াখালী', Pirojpur: 'পিরোজপুর',
    Sylhet: 'সিলেট', Habiganj: 'হবিগঞ্জ', Moulvibazar: 'মৌলভীবাজার', Sunamganj: 'সুনামগঞ্জ',
    Rangpur: 'রংপুর', Dinajpur: 'দিনাজপুর', Gaibandha: 'গাইবান্ধা', Kurigram: 'কুড়িগ্রাম', Lalmonirhat: 'লালমনিরহাট', Nilphamari: 'নীলফামারী', Panchagarh: 'পঞ্চগড়', Thakurgaon: 'ঠাকুরগাঁও',
    Mymensingh: 'ময়মনসিংহ', Jamalpur: 'জামালপুর', Netrokona: 'নেত্রকোনা', Sherpur: 'শেরপুর',
    };
    return translations[value] || value;
  };
  const [step, setStep] = useState(1);
  const [data, setData] = useState<RegistrationData>(() => blankRegistration(initialEmail));
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [demoOtpAccepted, setDemoOtpAccepted] = useState(false);
  const [sameAddress, setSameAddress] = useState(true);
  const [documents, setDocuments] = useState<{ front: File | null; back: File | null; selfie: File | null }>({ front: null, back: null, selfie: null });
  const [kycStatus, setKycStatus] = useState<'NOT_SUBMITTED' | 'PENDING'>('NOT_SUBMITTED');
  const [kycLoading, setKycLoading] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [securityConsent, setSecurityConsent] = useState(false);
  const [biometricLater, setBiometricLater] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [otpError, setOtpError] = useState('');
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const divisionsList = Object.keys(divisions);
  const isNidValid = useMemo(() => /^\d{10}$|^\d{13}$|^\d{17}$/.test(data.nid.replace(/\s/g, '')), [data.nid]);
  const documentsReady = Boolean(documents.front && documents.back && documents.selfie);
  const isEmailValid = !data.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  const update = <K extends keyof RegistrationData>(key: K, value: RegistrationData[K]) => setData((current) => ({ ...current, [key]: value }));
  const updateAddress = (kind: 'present' | 'permanent', key: keyof Address, value: string) => {
    setData((current) => ({ ...current, [kind]: { ...current[kind], [key]: value, ...(key === 'division' ? { district: '' } : {}) } }));
  };

  const sendDemoOtp = () => {
    if (!isBangladeshMobile(data.phone) || otpLoading || secondsLeft > 0) return;
    setOtpLoading(true);
    setOtpError('');
    window.setTimeout(() => {
      setOtpLoading(false);
      setOtpSent(true);
      setDemoOtpAccepted(false);
      setOtp(['', '', '', '', '', '']);
      setSecondsLeft(30);
      otpRefs.current[0]?.focus();
    }, 650);
  };

  const applyOtp = (value: string, index: number) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length > 1) {
      const nextOtp = [...otp];
      digits.slice(0, 6).split('').forEach((digit, offset) => { if (index + offset < 6) nextOtp[index + offset] = digit; });
      setOtp(nextOtp);
      otpRefs.current[Math.min(index + digits.length, 5)]?.focus();
      setOtpError('');
      return;
    }
    const nextOtp = [...otp];
    nextOtp[index] = digits;
    setOtp(nextOtp);
    setOtpError('');
    if (digits && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const verifyDemoOtp = () => {
    if (otp.join('').length !== 6 || otpVerifying) return;
    const enteredCode = otp.join('');
    setOtpVerifying(true);
    window.setTimeout(() => {
      setOtpVerifying(false);
      if (enteredCode !== '123456') {
        setOtpError(t('That demo code does not match. Enter 123456 to continue.', 'ডেমো কোডটি মেলেনি। এগিয়ে যেতে ১২৩৪৫৬ লিখুন।'));
        setDemoOtpAccepted(false);
        return;
      }
      setOtpError('');
      setDemoOtpAccepted(true);
    }, 450);
  };

  const presentComplete = Boolean(data.present.division && data.present.district && data.present.upazila.trim() && data.present.detail.trim());
  const permanentComplete = sameAddress || Boolean(data.permanent.division && data.permanent.district && data.permanent.upazila.trim() && data.permanent.detail.trim());
  const personalComplete = Boolean(data.name.trim() && data.dob && data.occupation && presentComplete && permanentComplete && isEmailValid);
  const kycComplete = isNidValid && documentsReady && kycStatus === 'PENDING';
  const pinValid = /^\d{6}$/.test(pin);
  const canContinue = step === 1 ? isBangladeshMobile(data.phone) && demoOtpAccepted && termsAccepted
    : step === 2 ? personalComplete
      : step === 3 ? kycComplete
        : step === 4 ? pinValid && pin === confirmPin && securityConsent
          : false;

  const continueStep = () => {
    setAttempted(true);
    if (!canContinue) return;
    if (step === 4) {
      // The preview PIN is never stored or transmitted; clear it before the final screen.
      setPin('');
      setConfirmPin('');
    }
    setAttempted(false);
    setStep((current) => Math.min(5, current + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const backStep = () => {
    setAttempted(false);
    setStep((current) => Math.max(1, current - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitKycDemo = () => {
    if (!isNidValid || !documentsReady || kycLoading) return;
    setKycLoading(true);
    window.setTimeout(() => {
      setKycLoading(false);
      setKycStatus('PENDING');
    }, 900);
  };

  const setDocument = (key: 'front' | 'back' | 'selfie', event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file && !file.type.startsWith('image/')) return;
    setDocuments((current) => ({ ...current, [key]: file }));
    setKycStatus('NOT_SUBMITTED');
  };

  const field = (label: string, value: string, onChange: (value: string) => void, options: {
    type?: string; placeholder?: string; required?: boolean; error?: string; max?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']; autoComplete?: string;
  } = {}) => (
    <label className="registration-field">
      <span>{label}{options.required && <b aria-hidden="true"> *</b>}</span>
      <input
        type={options.type || 'text'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={options.placeholder}
        required={options.required}
        max={options.max}
        inputMode={options.inputMode}
        autoComplete={options.autoComplete}
        aria-invalid={Boolean(options.error && (attempted || step === 3))}
      />
      {attempted && options.error && <span className="registration-error">{options.error}</span>}
    </label>
  );

  const selectField = (label: string, value: string, onChange: (value: string) => void, options: string[], error?: string, disabled = false, required = true) => (
    <label className="registration-field">
          <span>{label}{required && <b aria-hidden="true"> *</b>}</span>
      <span className="registration-select-wrap">
        <select value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} aria-invalid={Boolean(attempted && error)}>
          <option value="">{isBn ? `${label} নির্বাচন করুন` : `Select ${label.toLowerCase()}`}</option>
          {options.map((option) => <option key={option} value={option}>{localizeOption(option)}</option>)}
        </select>
        <ChevronDown size={15} aria-hidden="true" />
      </span>
      {attempted && error && <span className="registration-error">{error}</span>}
    </label>
  );

  const addressFields = (kind: 'present' | 'permanent', title: string, disabled = false) => {
    const address = kind === 'present' ? data.present : data.permanent;
    const districts = address.division ? divisions[address.division] : [];
    return (
      <fieldset className={`address-fieldset${disabled ? ' is-disabled' : ''}`} disabled={disabled}>
        <legend>{title}</legend>
        <div className="registration-grid two-columns">
          {selectField(t('Division', 'বিভাগ'), address.division, (value) => updateAddress(kind, 'division', value), divisionsList, address.division ? '' : t('Choose a division.', 'বিভাগ নির্বাচন করুন।'))}
          {selectField(t('District', 'জেলা'), address.district, (value) => updateAddress(kind, 'district', value), districts, address.district ? '' : t('Choose a district.', 'জেলা নির্বাচন করুন।'), !address.division)}
          {field(t('Upazila / Thana', 'উপজেলা / থানা'), address.upazila, (value) => updateAddress(kind, 'upazila', value), { required: true, error: address.upazila ? '' : t('Enter your upazila or thana.', 'উপজেলা বা থানার নাম লিখুন।') })}
          {field(t('Detailed address', 'বিস্তারিত ঠিকানা'), address.detail, (value) => updateAddress(kind, 'detail', value), { placeholder: t('House, road, village, area', 'বাড়ি, সড়ক, গ্রাম, এলাকা'), required: true, error: address.detail ? '' : t('Enter your detailed address.', 'বিস্তারিত ঠিকানা লিখুন।') })}
        </div>
      </fieldset>
    );
  };

  const uploadTile = (key: 'front' | 'back' | 'selfie', title: string, description: string, capture?: 'user' | 'environment') => (
    <label className={`upload-tile${documents[key] ? ' has-file' : ''}`}>
      <input type="file" accept="image/*" capture={capture} onChange={(event) => setDocument(key, event)} />
      <span className="upload-icon">{documents[key] ? <Check size={18} /> : <Upload size={18} />}</span>
      <strong>{title}</strong>
      <span>{documents[key]?.name || description}</span>
      <small>{documents[key] ? t('Selected in this browser session', 'এই ব্রাউজার সেশনে নির্বাচিত') : t('Image file · JPG, PNG', 'ছবির ফাইল · JPG, PNG')}</small>
    </label>
  );

  const statusPill = (status: string, kind: 'pending' | 'success' | 'neutral' = 'neutral') => <span className={`status-pill status-${kind}`}><i />{status}</span>;

  const StepIcon = stepIcons[step - 1];
  const maskedPhone = maskMobile(data.phone);

  return (
    <div className="registration-page" lang={isBn ? 'bn' : 'en'} data-theme={theme}>
      {!hideTopbar && <header className="registration-topbar">
        <a className="public-brand registration-brand" href="/" aria-label="টাকা Safe home" onClick={(event) => { event.preventDefault(); onDashboard(); }}>
          <span className="public-brand-icon" aria-hidden="true">
            <span className="mfs-halo-pulse" />
            <span className="public-brand-icon-disc">
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <path d="M 22 45 C 22 75 78 75 78 45" fill="none" stroke="#FAB915" strokeWidth="14" strokeLinecap="round" />
                <path d="M 34 52 C 34 72 66 72 66 52" fill="none" stroke="#0054A6" strokeWidth="10" strokeLinecap="round" />
                <circle cx="50" cy="30" r="8" fill="#E11D48" />
              </svg>
            </span>
          </span>
          <span className="brand-wordmark"><span className="brand-taka">টাকা</span><span className="brand-safe">Safe</span></span>
        </a>
        <div className="registration-top-actions">
          <span className="preview-tag"><Sparkles size={13} /> {t('Secure enrollment preview', 'নিরাপদ নিবন্ধন প্রিভিউ')}</span>
          <span className="top-login-text">{t('Already have an account?', 'আগে থেকেই অ্যাকাউন্ট আছে?')}</span>
          <button type="button" className="registration-login-link" onClick={onLogin}>{t('Login', 'লগইন')}</button>
        </div>
      </header>}

      <main className="registration-main" id="registration-top">
        <div className="registration-heading">
          <div className="registration-kicker"><ShieldCheck size={14} /> টাকা Safe · {t('New customer', 'নতুন গ্রাহক')}</div>
          <h1>{t('Open your টাকা Safe account', 'আপনার টাকা Safe অ্যাকাউন্ট খুলুন')}</h1>
          <p>{t('Complete these steps to prepare your mobile financial services account.', 'আপনার মোবাইল ফাইন্যান্সিয়াল সার্ভিস অ্যাকাউন্টের জন্য ধাপগুলো সম্পন্ন করুন।')}</p>
        </div>

        <section className="registration-card" aria-label={`${t('Registration step', 'নিবন্ধনের ধাপ')} ${step} ${t('of 5', 'এর ৫')}`}>
          <div className="registration-progress-head">
            <span>{t('Step', 'ধাপ')} {isBn ? ['১','২','৩','৪','৫'][step - 1] : step} <span className="progress-of">{t('of 5', 'এর ৫')}</span></span>
            <span className="progress-caption">{t(stepNames[step - 1], ['মোবাইল যাচাই','ব্যক্তিগত তথ্য','পরিচয় যাচাই','অ্যাকাউন্ট নিরাপত্তা','সক্রিয়করণ অবস্থা'][step - 1])}</span>
          </div>
          <div className="registration-progress-track" role="progressbar" aria-valuemin={1} aria-valuemax={5} aria-valuenow={step} aria-label={`${t('Step', 'ধাপ')} ${step} ${t('of 5', 'এর ৫')}`}>
            <span style={{ width: `${step * 20}%` }} />
          </div>
          <ol className="registration-steps">
            {stepNames.map((name, index) => {
              const number = index + 1;
              const Icon = stepIcons[index];
              return <li key={name} className={`${number === step ? 'is-current' : ''}${number < step ? ' is-complete' : ''}`} aria-current={number === step ? 'step' : undefined}>
                <span className="step-marker">{number < step ? <Check size={14} /> : <Icon size={14} />}</span>
                <span className="step-name">{t(name, ['মোবাইল যাচাই','ব্যক্তিগত তথ্য','পরিচয় যাচাই','অ্যাকাউন্ট নিরাপত্তা','সক্রিয়করণ'][index])}</span>
              </li>;
            })}
          </ol>

          <div className="registration-step-content" key={step}>
            <div className="step-title-row">
              <div className="step-title-icon"><StepIcon size={22} /></div>
              <div>
                <h2>{[
                  t('Verify your mobile number', 'মোবাইল নম্বর যাচাই করুন'), t('Tell us about yourself', 'আপনার সম্পর্কে জানান'), t('Verify your identity', 'পরিচয় যাচাই করুন'), t('Secure your account', 'অ্যাকাউন্ট সুরক্ষিত করুন'), t('Your application status', 'আপনার আবেদনের অবস্থা'),
                ][step - 1]}</h2>
                <p>{[
                  t('We’ll use your number for account notices and security checks.', 'অ্যাকাউন্টের নোটিশ ও নিরাপত্তা যাচাইয়ের জন্য আপনার নম্বর ব্যবহার করা হবে।'), t('Enter your details exactly as they appear on your identity document.', 'পরিচয়পত্রে যেভাবে আছে, ঠিক সেভাবে আপনার তথ্য লিখুন।'), t('Add clear identity images for this demo review. Files stay in this browser session.', 'এই ডেমো পর্যালোচনার জন্য পরিচয়পত্রের স্পষ্ট ছবি যোগ করুন। ফাইল শুধু এই ব্রাউজার সেশনে থাকবে।'), t('Create a private PIN for the registration preview. It will not be saved or sent.', 'নিবন্ধন প্রিভিউর জন্য একটি গোপন পিন তৈরি করুন। এটি সংরক্ষণ বা পাঠানো হবে না।'), t('Your demo registration journey is complete. Real activation still requires external verification.', 'আপনার ডেমো নিবন্ধন সম্পন্ন হয়েছে। প্রকৃত অ্যাকাউন্ট চালু করতে বাহ্যিক যাচাই প্রয়োজন।'),
                ][step - 1]}</p>
              </div>
            </div>

            {step === 1 && <div className="step-panel">
              <div className="demo-notice"><Info size={16} /><p><strong>{t('Preview only.', 'শুধু প্রিভিউ।')}</strong> {t('No SMS will be sent and no phone number is verified. Use the demo code shown after requesting an OTP.', 'কোনো এসএমএস পাঠানো বা ফোন নম্বর যাচাই করা হবে না। ওটিপি চাইলে দেখানো ডেমো কোডটি ব্যবহার করুন।')}</p></div>
              <div className="registration-field">
                <span>{t('Mobile number', 'মোবাইল নম্বর')} <b>*</b></span>
              <div className="phone-entry">
                  <span className="country-prefix"><span aria-hidden="true">🇧🇩</span> +880</span>
                  <input type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} placeholder="1XXXXXXXXX" value={data.phone} onChange={(event) => {
                    update('phone', event.target.value.replace(/\D/g, '').slice(0, 10));
                    setOtpSent(false);
                    setOtp(['', '', '', '', '', '']);
                    setDemoOtpAccepted(false);
                    setSecondsLeft(0);
                  }} aria-label={t('Bangladesh mobile number without country code', 'কান্ট্রি কোড ছাড়া বাংলাদেশের মোবাইল নম্বর')} aria-invalid={attempted && !isBangladeshMobile(data.phone)} />
                  <button type="button" className="send-otp-button" disabled={!isBangladeshMobile(data.phone) || otpLoading || secondsLeft > 0} onClick={sendDemoOtp}>
                    {otpLoading ? <><span className="button-spinner" /> {t('Sending', 'পাঠানো হচ্ছে')}</> : otpSent && secondsLeft > 0 ? `${t('Resend', 'আবার পাঠান')} ${isBn ? secondsLeft.toLocaleString('bn-BD') : secondsLeft}${t('s', 'সে.')}` : otpSent ? t('Resend OTP', 'ওটিপি আবার পাঠান') : t('Send OTP', 'ওটিপি পাঠান')}
                  </button>
                </div>
                <span className="field-hint">{t('Enter 10 digits after +880, starting with 13–19.', '+৮৮০-এর পর ১৩–১৯ দিয়ে শুরু ১০টি সংখ্যা লিখুন।')}</span>
                {attempted && !isBangladeshMobile(data.phone) && <span className="registration-error">{t('Enter a valid 10-digit Bangladesh mobile number starting with 13–19.', '১৩–১৯ দিয়ে শুরু বৈধ ১০ সংখ্যার বাংলাদেশি মোবাইল নম্বর লিখুন।')}</span>}
              </div>

              {otpSent && <div className="otp-panel">
                <div className="otp-label-row"><label htmlFor="otp-0">{t('Six-digit demo code', '৬ সংখ্যার ডেমো কোড')}</label><span>{secondsLeft > 0 ? <><Clock3 size={12} /> 00:{String(isBn ? secondsLeft.toLocaleString('bn-BD') : secondsLeft).padStart(2, '0')}</> : t('Code ready', 'কোড প্রস্তুত')}</span></div>
                <div className="otp-inputs" role="group" aria-label={t('Six digit demo OTP', '৬ সংখ্যার ডেমো ওটিপি')}>
                  {otp.map((digit, index) => <input key={index} ref={(node) => { otpRefs.current[index] = node; }} id={`otp-${index}`} type="text" inputMode="numeric" autoComplete={index === 0 ? 'one-time-code' : 'off'} maxLength={1} value={digit} aria-label={`${t('OTP digit', 'ওটিপি সংখ্যা')} ${index + 1}`} onChange={(event) => applyOtp(event.target.value, index)} onKeyDown={(event) => {
                    if (event.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
                    if (event.key === 'ArrowLeft' && index > 0) otpRefs.current[index - 1]?.focus();
                    if (event.key === 'ArrowRight' && index < 5) otpRefs.current[index + 1]?.focus();
                  }} onPaste={(event) => { event.preventDefault(); applyOtp(event.clipboardData.getData('text'), 0); }} />)}
                </div>
                <div className="demo-code-hint">{t('Demo OTP:', 'ডেমো ওটিপি:')} <strong>123456</strong> <span>· {t('This does not verify a real phone.', 'এটি প্রকৃত ফোন নম্বর যাচাই করে না।')}</span></div>
                <button type="button" className="verify-code-button" disabled={otp.join('').length !== 6 || otpVerifying} onClick={verifyDemoOtp}>
                  {otpVerifying ? <><span className="button-spinner" /> {t('Checking code…', 'কোড যাচাই হচ্ছে…')}</> : t('Verify demo code', 'ডেমো কোড যাচাই করুন')}
                </button>
                {otpError && <span className="registration-error" role="alert">{otpError}</span>}
                {demoOtpAccepted && <span className="registration-success"><CheckCircle2 size={15} /> {t('Demo code accepted. Real phone verification is still pending.', 'ডেমো কোড গৃহীত হয়েছে। প্রকৃত ফোন যাচাই এখনও বাকি।')}</span>}
              </div>}

              <div className="consent-row">
                <input type="checkbox" aria-label={t('Accept the Terms and Conditions and Privacy Policy', 'শর্তাবলি ও গোপনীয়তা নীতি গ্রহণ করুন')} checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} />
                <span>{t('I agree to the', 'আমি সম্মত হচ্ছি')} <button type="button" className="inline-link" onClick={(event) => { event.preventDefault(); onOpenModal('TERMS'); }}>{t('Terms and Conditions', 'শর্তাবলি')}</button> {t('and', 'এবং')} <button type="button" className="inline-link" onClick={(event) => { event.preventDefault(); onOpenModal('PRIVACY_POLICY'); }}>{t('Privacy Policy', 'গোপনীয়তা নীতি')}</button>. <em>*</em></span>
              </div>
              {!termsAccepted && <span className="registration-error consent-error">{t('Accept the terms to continue.', 'এগিয়ে যেতে শর্তাবলি গ্রহণ করুন।')}</span>}
            </div>}

            {step === 2 && <div className="step-panel">
              <div className="registration-grid two-columns">
              {field(t('Full legal name (as on NID)', 'জাতীয় পরিচয়পত্র অনুযায়ী পূর্ণ নাম'), data.name, (value) => update('name', value), { placeholder: t('Enter your full legal name', 'আপনার পূর্ণ নাম লিখুন'), required: true, error: data.name ? '' : t('Enter your full legal name.', 'আপনার পূর্ণ নাম লিখুন।') })}
                {field(t('Date of birth', 'জন্মতারিখ'), data.dob, (value) => update('dob', value), { type: 'date', max: new Date().toISOString().slice(0, 10), required: true, error: data.dob ? '' : t('Select your date of birth.', 'আপনার জন্মতারিখ নির্বাচন করুন।') })}
                {selectField(t('Gender (optional)', 'লিঙ্গ (ঐচ্ছিক)'), data.gender, (value) => update('gender', value), ['Female', 'Male', 'Non-binary', 'Prefer not to say'], undefined, false, false)}
                {selectField(t('Occupation', 'পেশা'), data.occupation, (value) => update('occupation', value), occupations, data.occupation ? '' : t('Choose your occupation.', 'আপনার পেশা নির্বাচন করুন।'))}
                {field(t('Email address (optional)', 'ইমেইল (ঐচ্ছিক)'), data.email, (value) => update('email', value), { type: 'email', placeholder: 'name@example.com', error: isEmailValid ? '' : t('Enter a valid email address.', 'বৈধ ইমেইল ঠিকানা লিখুন।')})}
              </div>

              {addressFields('present', t('Present address', 'বর্তমান ঠিকানা'))}
              <label className="same-address-check">
                <input type="checkbox" checked={sameAddress} onChange={(event) => setSameAddress(event.target.checked)} />
                <span>{t('Permanent address is the same as present address', 'স্থায়ী ঠিকানা বর্তমান ঠিকানার মতোই')}</span>
              </label>
              {!sameAddress && addressFields('permanent', t('Permanent address', 'স্থায়ী ঠিকানা'))}
            </div>}

            {step === 3 && <div className="step-panel">
              <div className="demo-notice"><ShieldCheck size={16} /><p><strong>{t('KYC preview only.', 'শুধু কেওয়াইসি প্রিভিউ।')}</strong> {t('Documents are not sent to a provider and cannot be verified here. This demo will never mark your identity as verified.', 'নথি কোনো সেবাদাতার কাছে পাঠানো বা এখানে যাচাই করা হয় না। এই ডেমোতে আপনার পরিচয় কখনো যাচাইকৃত দেখানো হবে না।')}</p></div>
              {field(t('National ID (NID) number', 'জাতীয় পরিচয়পত্র নম্বর'), data.nid, (value) => { update('nid', value.replace(/\D/g, '').slice(0, 17)); setKycStatus('NOT_SUBMITTED'); }, { type: 'password', autoComplete: 'off', placeholder: t('10, 13, or 17 digits', '১০, ১৩ বা ১৭ সংখ্যা'), required: true, inputMode: 'numeric', error: isNidValid ? '' : t('Enter a 10, 13, or 17-digit NID number.', '১০, ১৩ বা ১৭ সংখ্যার জাতীয় পরিচয়পত্র নম্বর লিখুন।') })}
              {!isNidValid && <span className="registration-error">{t('Enter a 10, 13, or 17-digit NID number.', '১০, ১৩ বা ১৭ সংখ্যার জাতীয় পরিচয়পত্র নম্বর লিখুন।')}</span>}
              <div className="upload-heading"><h3>{t('Identity images', 'পরিচয়পত্রের ছবি')}</h3><span>{t('All three are required for this preview', 'এই প্রিভিউর জন্য তিনটি ছবিই প্রয়োজন')}</span></div>
              <div className="upload-grid">
                {uploadTile('front', t('NID front side', 'জাতীয় পরিচয়পত্রের সামনের দিক'), t('Upload or take a photo', 'ছবি আপলোড বা তুলুন'), 'environment')}
                {uploadTile('back', t('NID back side', 'জাতীয় পরিচয়পত্রের পেছনের দিক'), t('Upload or take a photo', 'ছবি আপলোড বা তুলুন'), 'environment')}
                {uploadTile('selfie', t('Selfie photo', 'সেলফি ছবি'), t('Face the camera in good light', 'ভালো আলোতে ক্যামেরার দিকে তাকান'), 'user')}
              </div>
              {!documentsReady && <span className="registration-error">{t('Add the front, back, and a selfie image to submit this demo review.', 'ডেমো পর্যালোচনার জন্য পরিচয়পত্রের সামনে, পেছন ও সেলফির ছবি যোগ করুন।')}</span>}
              <div className="kyc-instructions"><Info size={15} /><span>{t('Use clear, unedited images. Keep your face and all NID details visible. Files remain in memory and are cleared when you leave.', 'পরিষ্কার, সম্পাদনাহীন ছবি ব্যবহার করুন। মুখ ও পরিচয়পত্রের সব তথ্য স্পষ্ট রাখুন। পৃষ্ঠা ছাড়লে ফাইল মুছে যাবে।')}</span></div>
              <div className="kyc-submit-row">
                <div><strong>{t('Identity review', 'পরিচয় পর্যালোচনা')}</strong><span>{kycStatus === 'PENDING' ? t('Demo review submitted. External verification is still pending.', 'ডেমো পর্যালোচনা জমা হয়েছে। বাহ্যিক যাচাই এখনও বাকি।') : t('Not submitted', 'জমা দেওয়া হয়নি')}</span></div>
                {statusPill(kycStatus === 'PENDING' ? t('Pending', 'অপেক্ষমাণ') : t('Not verified', 'যাচাই হয়নি'), kycStatus === 'PENDING' ? 'pending' : 'neutral')}
              </div>
              <button type="button" className="secondary-submit-button" disabled={!isNidValid || !documentsReady || kycLoading || kycStatus === 'PENDING'} onClick={submitKycDemo}>
                {kycLoading ? <><span className="button-spinner" /> {t('Submitting preview…', 'প্রিভিউ জমা হচ্ছে…')}</> : kycStatus === 'PENDING' ? <><CheckCircle2 size={16} /> {t('Demo review submitted', 'ডেমো পর্যালোচনা জমা হয়েছে')}</> : <><FileCheck2 size={16} /> {t('Submit for demo review', 'ডেমো পর্যালোচনার জন্য জমা দিন')}</>}
              </button>
              <p className="pending-note">{t('You may continue with this preview while real KYC remains pending. Account activation is blocked until an authorized provider verifies your identity.', 'প্রকৃত কেওয়াইসি যাচাই অপেক্ষমাণ থাকলেও আপনি প্রিভিউ চালিয়ে যেতে পারেন। অনুমোদিত সেবাদাতা পরিচয় যাচাই না করা পর্যন্ত অ্যাকাউন্ট চালু হবে না।')}</p>
            </div>}

            {step === 4 && <div className="step-panel">
              <div className="demo-notice"><LockKeyhole size={16} /><p><strong>{t('PIN preview only.', 'শুধু পিন প্রিভিউ।')}</strong> {t('This PIN is held temporarily in this page, never saved to storage or sent to a server, and cleared when you continue.', 'এই পিন সাময়িকভাবে এই পৃষ্ঠায় থাকবে; সংরক্ষণ বা সার্ভারে পাঠানো হবে না এবং এগিয়ে গেলে মুছে যাবে।')}</p></div>
              <div className="registration-grid two-columns">
                <label className="registration-field">
                  <span>{t('Create a 6-digit PIN', '৬ সংখ্যার পিন তৈরি করুন')} <b>*</b></span>
                  <input type="password" inputMode="numeric" autoComplete="new-password" maxLength={6} placeholder={t('6 digits', '৬ সংখ্যা')} value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))} aria-invalid={attempted && !pinValid} />
                  {attempted && !pinValid && <span className="registration-error">{t('Choose a 6-digit numeric PIN.', '৬ সংখ্যার পিন নির্বাচন করুন।')}</span>}
                </label>
                <label className="registration-field">
                  <span>{t('Confirm PIN', 'পিন নিশ্চিত করুন')} <b>*</b></span>
                  <input type="password" inputMode="numeric" autoComplete="new-password" maxLength={6} placeholder={t('Enter the PIN again', 'আবার পিন লিখুন')} value={confirmPin} onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, '').slice(0, 6))} aria-invalid={attempted && pin !== confirmPin} />
                  {attempted && pin !== confirmPin && <span className="registration-error">{t('PINs do not match.', 'পিন দুটি মেলেনি।')}</span>}
                </label>
              </div>
              <label className="biometric-option"><input type="checkbox" checked={biometricLater} onChange={(event) => setBiometricLater(event.target.checked)} /><Fingerprint size={19} /><div><strong>{t('Biometric sign-in', 'বায়োমেট্রিক লগইন')}</strong><span>{t('Optional setup can be completed in a supported app after activation. This preview does not enroll biometrics.', 'অ্যাকাউন্ট চালু হলে সমর্থিত অ্যাপে ঐচ্ছিকভাবে সেটআপ করা যাবে। এই প্রিভিউতে বায়োমেট্রিক নিবন্ধন হয় না।')}</span></div><span className="optional-chip">{t('Optional', 'ঐচ্ছিক')}</span></label>
              <div className="security-tips">
                <strong><ShieldCheck size={15} /> {t('Keep your PIN private', 'আপনার পিন গোপন রাখুন')}</strong>
                <ul><li>{t('Never share your PIN, OTP, or NID photos with anyone.', 'আপনার পিন, ওটিপি বা পরিচয়পত্রের ছবি কারও সঙ্গে শেয়ার করবেন না।')}</li><li>{t('Avoid birthdays or repeated digits in a real account PIN.', 'প্রকৃত অ্যাকাউন্টের পিনে জন্মতারিখ বা একই সংখ্যা বারবার ব্যবহার করবেন না।')}</li><li>{t('টাকা Safe support will never ask you to disclose your PIN.', 'টাকা Safe সহায়তা কখনো আপনার পিন জানতে চাইবে না।')}</li></ul>
              </div>
              <label className="consent-row security-consent">
                <input type="checkbox" checked={securityConsent} onChange={(event) => setSecurityConsent(event.target.checked)} />
                <span>{t('I understand this is a registration preview and my PIN will not be used to secure a real account.', 'এটি নিবন্ধনের প্রিভিউ এবং আমার পিন কোনো প্রকৃত অ্যাকাউন্ট সুরক্ষায় ব্যবহৃত হবে না—আমি বুঝেছি।')} <em>*</em></span>
              </label>
              {attempted && !securityConsent && <span className="registration-error consent-error">{t('Confirm the security notice to continue.', 'এগিয়ে যেতে নিরাপত্তা বিজ্ঞপ্তিতে সম্মতি দিন।')}</span>}
            </div>}

            {step === 5 && <div className="step-panel completion-panel">
              <div className="completion-mark"><Check size={31} /></div>
              <div className="completion-eyebrow">{t('DEMO APPLICATION COMPLETE', 'ডেমো আবেদন সম্পন্ন')}</div>
              <h3>{t('Your Registration Is Complete!', 'আপনার নিবন্ধন সম্পন্ন হয়েছে!')}</h3>
              <p className="completion-subtitle">{data.name || t('Your application', 'আপনার আবেদন')} {t('has been prepared in this browser session.', 'এই ব্রাউজার সেশনে প্রস্তুত করা হয়েছে।')}</p>
              <div className="completion-summary">
                <div><span>{t('Customer', 'গ্রাহক')}</span><strong>{data.name || '—'}</strong></div>
                <div><span>{t('Mobile number', 'মোবাইল নম্বর')}</span><strong>{maskedPhone}</strong></div>
              </div>
              <div className="activation-status-card">
                <div><span className="status-icon"><Clock3 size={17} /></span><div><strong>{t('Account activation', 'অ্যাকাউন্ট চালু')}</strong><span>{t('No account has been created or activated.', 'কোনো অ্যাকাউন্ট তৈরি বা চালু করা হয়নি।')}</span></div>{statusPill(t('Not active', 'চালু নয়'), 'neutral')}</div>
                <div><span className="status-icon status-icon-pending"><IdCard size={17} /></span><div><strong>{t('Identity verification', 'পরিচয় যাচাই')}</strong><span>{t('Real provider review is still required.', 'প্রকৃত সেবাদাতার যাচাই এখনও প্রয়োজন।')}</span></div>{statusPill(t('Pending', 'অপেক্ষমাণ'), 'pending')}</div>
                <div><span className="status-icon"><Smartphone size={17} /></span><div><strong>{t('Mobile verification', 'মোবাইল যাচাই')}</strong><span>{t('The test OTP did not verify a real phone.', 'পরীক্ষামূলক ওটিপি প্রকৃত ফোন নম্বর যাচাই করেনি।')}</span></div>{statusPill(t('Demo only', 'শুধু ডেমো'), 'neutral')}</div>
              </div>
              <div className="no-account-id"><Info size={14} /> {t('No account number or customer ID has been assigned.', 'কোনো অ্যাকাউন্ট নম্বর বা গ্রাহক আইডি দেওয়া হয়নি।')}</div>
              <div className="completion-actions">
                <button type="button" className="primary-submit-button" onClick={onDashboard}>{t('Go to Dashboard', 'ড্যাশবোর্ডে যান')} <ArrowRight size={16} /></button>
                <button type="button" className="text-support-link" onClick={() => onOpenModal('NEED_HELP')}><CircleHelp size={15} /> {t('Help Center', 'সহায়তা কেন্দ্র')}</button>
                <button type="button" className="text-support-link" onClick={() => onOpenModal('LIVE_CHAT')}><Smartphone size={15} /> {t('Customer Support', 'গ্রাহক সহায়তা')}</button>
              </div>
            </div>}

            {step < 5 && <div className="registration-actions">
              {step > 1 ? <button type="button" className="back-button" onClick={backStep}><ArrowLeft size={16} /> {t('Back', 'পেছনে')}</button> : <span />}
              {step === 3 && kycStatus !== 'PENDING' && <span className="action-helper">{t('Submit the demo review to continue.', 'এগিয়ে যেতে ডেমো পর্যালোচনা জমা দিন।')}</span>}
              <button type="button" className="primary-submit-button" disabled={(step === 1 || step === 3) && !canContinue} onClick={continueStep}>
                {t('Continue', 'চালিয়ে যান')} <ArrowRight size={16} />
              </button>
            </div>}
          </div>
        </section>

        <div className="registration-security-foot"><ShieldCheck size={14} /> Your information stays in this tab for this demo only. Do not enter real identity details.</div>
        <button type="button" className="registration-bottom-login" onClick={onLogin}>Already have an account? <strong>Login</strong></button>
      </main>
    </div>
  );
};
