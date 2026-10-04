export interface KnowledgeItem {
  id: string;
  category: 'OVERVIEW' | 'SCAMSHIELD' | 'MULEVISION' | 'ML_AI' | 'POLICY' | 'DISASTER' | 'BFIU' | 'SLA' | 'PRODUCTS' | 'CONTACT';
  keywords: string[];
  questionExamples: string[];
  answerEn: string;
  answerBn: string;
  suggestedAction?: {
    label: string;
    view?: 'OPERATOR' | 'CUSTOMER' | 'STORYLINE';
  };
}

export const TAKASAFE_KNOWLEDGE_BASE: KnowledgeItem[] = [
  // 1. Overview
  {
    id: 'what_is_takasafe',
    category: 'OVERVIEW',
    keywords: ['what is takasafe', 'takasafe', 'about', 'overview', 'project', 'intro', 'kivabe', 'ki eita', 'টাকাসেফ', 'টাকা সেফ', 'সম্পর্কে'],
    questionExamples: ['What is TakaSafe?', 'Tell me about this project', 'টাকাসেফ কী?'],
    answerEn: 'TakaSafe is a multi-modal AI Financial Trust and Resilience Platform engineered for Bangladesh MFS networks (such as upay, bKash, and Nagad). It combines real-time AI fraud detection (< 18ms SLA), ScamShield consumer protection, MuleVision syndicate graph analytics, Cyclone Remal disaster cash float logistics, and automated BFIU Form 2 STR regulatory compliance.',
    answerBn: 'TakaSafe হলো বাংলাদেশের মোবাইল ফাইন্যান্সিয়াল সার্ভিস (MFS যেমন upay, bKash, Nagad) এর জন্য তৈরি একটি মাল্টি-মোডাল এআই ফ্রড প্রোটেকশন ও রেজিলিয়েন্স প্ল্যাটফর্ম। এটি ১৮ মিলিসেকেন্ডের মধ্যে ট্রানজ্যাকশন যাচাই, প্রতারণা প্রতিরোধ (ScamShield), মানি মিউল চক্র শনাক্তকরণ (MuleVision), প্রাকৃতিক দুর্যোগে এজেন্ট ক্যাশ ব্যবস্থাপনা এবং বিএফআইইউ রেগুলেটরি কমপ্লায়েন্স নিশ্চিত করে।',
    suggestedAction: { label: 'Explore Interactive Demo', view: 'STORYLINE' },
  },
  {
    id: 'who_is_it_for',
    category: 'OVERVIEW',
    keywords: ['who is it for', 'target', 'audience', 'user', 'customers', 'কার জন্য', 'ব্যবহারকারী'],
    questionExamples: ['Who is TakaSafe designed for?', 'Target audience?'],
    answerEn: 'TakaSafe is designed for three core groups: 1) MFS Consumers protecting themselves against coercive social engineering scams; 2) Fraud & SOC Operations Analysts monitoring real-time syndicate rings; and 3) Regulatory & BFIU Compliance Officers requiring automated, legally binding Form 2 STR reports under AMLA 2012.',
    answerBn: 'TakaSafe তিনটি মূল ব্যবহারকারীর জন্য ডিজাইন করা: ১) সাধারণ গ্রাহক (প্রতারণামূলক স্ক্যাম থেকে সুরক্ষা পেতে), ২) ফ্রড অপারেশন অ্যানালিস্ট (মিউল চক্র ও সিন্ডিকেট রিয়েল-টাইমে নজরদারি করতে), এবং ৩) বিএফআইইউ কমপ্লায়েন্স অফিসার (স্বয়ংক্রিয় ফর্ম-২ এসটিআর রিপোর্ট জমা দিতে)।',
  },

  // 2. ScamShield
  {
    id: 'scamshield_explained',
    category: 'SCAMSHIELD',
    keywords: ['scamshield', 'scam', 'fraud', 'social engineering', 'duress', 'cooling', 'cooling-off', 'delay', 'cancel', 'recall', 'প্রতারণা', 'স্ক্যাম', 'সুরক্ষা', 'কুলিং'],
    questionExamples: ['How does ScamShield work?', 'What is the 24-hour cooling-off window?'],
    answerEn: 'ScamShield is an explainable pre-payment cognitive intervention system. When a customer attempts a high-risk transfer (e.g., nocturnal unverified P2P or sudden velocity surge), ScamShield intercepts the transaction with plain-language warnings and activates a 24-Hour Cooling-Off Window. During this window, the sender can cancel the transaction and recall funds at any time before final settlement.',
    answerBn: 'ScamShield হলো পেমেন্টের পূর্বেই এআই-চালিত একটি সতর্কতামূলক ব্যবস্থা। অস্বাভাবিক লেনদেন বা অপরিচিত নম্বরে বড় অঙ্কের টাকা পাঠানোর সময় এটি গ্রাহককে সম্ভাব্য প্রতারণার কারণ সহজ ভাষায় বুঝিয়ে দেয় এবং ২৪ ঘণ্টার কুলিং-অফ সময় দেয়। এই সময়ের মধ্যে গ্রাহক যেকোনো মুহূর্তে টাকা পাঠানো বাতিল করে রিফান্ড নিতে পারেন।',
    suggestedAction: { label: 'Try ScamShield in Customer App', view: 'CUSTOMER' },
  },

  // 3. MuleVision & Graph Defense
  {
    id: 'mulevision_graph',
    category: 'MULEVISION',
    keywords: ['mule', 'mulevision', 'syndicate', 'graph', 'gnn', 'ring', 'pass-through', 'layering', 'quarantine', 'মিউল', 'সিন্ডিকেট', 'নেটওয়ার্ক', 'কোয়ারেন্টাইন'],
    questionExamples: ['What is MuleVision?', 'How does mule detection work?'],
    answerEn: 'MuleVision is a D3.js force-directed graph analytics hub that detects rapid pass-through layering rings and money mule aggregators. It evaluates betweenness centrality, in/out degree ratios, and hop distance to known illicit nodes. Fraud analysts can isolate and quarantine entire mule syndicate rings with 1-click execution.',
    answerBn: 'MuleVision হলো একটি ইন্টারেক্টিভ গ্রাফ অ্যানালিটিক্স সিস্টেম, যা মানি মিউল চক্র এবং অস্বাভাবিক ট্রানজ্যাকশন রিং শনাক্ত করে। এটি প্রতিটি অ্যাকাউন্টের সেন্ট্রালিটি ও ডিগ্রি বিশ্লেষণ করে দ্রুত অর্থ পাচার চক্র চিহ্নিত করে এবং ১-ক্লিকে ঝুঁকিপূর্ণ নোড কোয়ারেন্টাইন করতে সাহায্য করে।',
    suggestedAction: { label: 'Open MuleVision Graph Hub', view: 'OPERATOR' },
  },

  // 4. ML & XGBoost Models
  {
    id: 'ml_models',
    category: 'ML_AI',
    keywords: ['model', 'xgboost', 'isolation forest', 'algorithm', 'machine learning', 'ai', 'weights', 'formula', 'scale_pos_weight', 'মডেল', 'অ্যালগরিদম', 'এআই'],
    questionExamples: ['What machine learning models are used?', 'How is the risk score calculated?'],
    answerEn: 'TakaSafe uses a multi-modal ensemble combining: 1) Supervised XGBoost Classifier (weight: 0.30, trained with scale_pos_weight=20.68 for severe class imbalance); 2) Unsupervised Isolation Forest (weight: 0.20) for behavioral spending profile deviation; 3) Velocity Burst Multipliers (0.15); 4) Device & Geo Integrity (0.15); 5) Mule Graph Centrality (0.10); and 6) ScamShield Duress Heuristics (0.10). The final score is fused as R_final = Σ(w_i · s_i) on a 0–100 scale.',
    answerBn: 'TakaSafe একটি সমন্বিত মাল্টি-মোডাল এআই ইঞ্জিন ব্যবহার করে: ১) সুপারভাইজড XGBoost ক্লাসিফায়ার (ওজন: ০.৩০, scale_pos_weight=২০.৬৮), ২) আনসুপারভাইজড আইসোলেশন ফরেস্ট (ওজন: ০.২০), ৩) ভেলোসিটি বার্স্ট মাল্টিপ্লায়ার (০.১৫), ৪) ডিভাইস ও সিম অখণ্ডতা (০.১৫), ৫) মিউল গ্রাফ সেন্ট্রালিটি (০.১০), এবং ৬) স্ক্যামশিল্ড ডুরেজ (০.১০)। এই ৬টি স্কোরের সমন্বয়ে ০ থেকে ১০০ এর মধ্যে মোট রিস্ক স্কোর তৈরি হয়।',
    suggestedAction: { label: 'View SOC Radar Cockpit', view: 'OPERATOR' },
  },
  {
    id: 'dataset_info',
    category: 'ML_AI',
    keywords: ['dataset', 'data', 'transactions.csv', 'training', 'synthetic', 'features', 'rows', 'ডাটাবেজ', 'ডাটা'],
    questionExamples: ['What dataset is used for training?', 'Is the data real or synthetic?'],
    answerEn: 'The offline ML lab trains on dataset/transactions.csv, a high-fidelity synthetic dataset containing 8,000 transactions across 40 engineered features (circadian hour transforms, 10m/60m velocity bursts, IMEI hashes, IP ASN vs cellular division deltas). The dataset strictly contains 100% synthetic, non-PII data statistically modeled after Bangladesh MFS networks.',
    answerBn: 'অফলাইন মেশিন লার্নিং ল্যাব dataset/transactions.csv ফাইলের ওপর প্রশিক্ষিত, যাতে ৪০টি ভিন্ন ফিচারের ৮,০০০ সিন্থেটিক ট্রানজ্যাকশন ডাটা রয়েছে। এতে কোনো আসল বা ব্যক্তিগত তথ্য (PII) নেই, এটি সম্পূর্ণরূপে কৃত্রিম এবং বাংলাদেশের এমএফএস নেটওয়ার্কের গাণিতিক বৈশিষ্ট্যের ভিত্তিতে তৈরি।',
  },
  {
    id: 'shap_explainability',
    category: 'ML_AI',
    keywords: ['shap', 'explainable', 'xai', 'interpretability', 'why', 'attribution', 'শেপ', 'ব্যাখ্যা'],
    questionExamples: ['What is SHAP explainability?', 'Why was a transaction flagged?'],
    answerEn: 'SHAP (SHapley Additive exPlanations) provides game-theoretic feature attribution for every evaluation. Instead of a black box, TakaSafe breaks down the exact percentage contributions (e.g. +31% Circadian Off-Hour Spike, +24% Velocity Burst, +17% Device/SIM Mismatch). This empowers SOC analysts and regulators to verify why an action was taken.',
    answerBn: 'SHAP হলো একটি গাণিতিক ব্যাখ্যা পদ্ধতি যা প্রতিটি সিদ্ধান্তের পেছনের সুনির্দিষ্ট কারণ প্রকাশ করে। যেমন: রাতের অসময়ে লেনদেনের জন্য +৩১%, অতিরিক্ত দ্রুত লেনদেনের জন্য +২৪%, এবং ডিভাইস পরিবর্তনের জন্য +১৭% রিস্ক স্কোর বৃদ্ধি পেয়েছে। এটি কোনো অন্ধ ব্ল্যাক-বক্স নয়, বরং শতভাগ ব্যাখ্যামূলক।',
  },

  // 5. Policy Decision Tiers
  {
    id: 'policy_tiers',
    category: 'POLICY',
    keywords: ['policy', 'tiers', 'threshold', 'actions', 'low', 'medium', 'high', 'critical', 'rules', 'পলিসি', 'স্তর', 'পদক্ষেপ'],
    questionExamples: ['What are the 4 policy decision tiers?', 'What happens when risk score is high?'],
    answerEn: 'TakaSafe maps risk scores (0–100) to 4 deterministic regulatory tiers: 1) LOW (0–30): Straight-Through Pass with instant settlement (< 8ms, 95.4% volume); 2) MEDIUM (31–60): Step-Up out-of-band SMS OTP or biometric verification; 3) HIGH (61–80): ScamShield 24-hour cooling-off delay; and 4) CRITICAL (81–100): Immediate wallet outflow freeze, node quarantine, and automated BFIU STR generation.',
    answerBn: 'TakaSafe ৪টি রেগুলেটরি পলিসি স্তরে কাজ করে: ১) LOW (০–৩০): তাৎক্ষণিক লেনদেন অনুমোদন (৯৫.৪% ট্রানজ্যাকশন এই ক্যাটাগরিতে পড়ে); ২) MEDIUM (৩১–৬০): ওটিপি বা বায়োমেট্রিক ভেরিফিকেশন চ্যালেঞ্জ; ৩) HIGH (৬১–৮০): ScamShield ২৪ ঘণ্টার কুলিং-অফ সময়; এবং ৪) CRITICAL (৮১–১০০): তাৎক্ষণিক অ্যাকাউন্ট লক, মিউল কোয়ারেন্টাইন এবং বিএফআইইউ রিপোর্ট তৈরি।',
  },

  // 6. Disaster Resilience
  {
    id: 'disaster_mode',
    category: 'DISASTER',
    keywords: ['disaster', 'cyclone', 'remal', 'flood', 'coastal', 'barishal', 'patuakhali', 'float', 'armored', 'cash depletion', 'দুর্যোগ', 'ঘূর্ণিঝড়', 'রিমেল', 'বন্যা', 'ক্যাশ সংকট'],
    questionExamples: ['What is Disaster Resilience mode?', 'How does cash float logistics work during a cyclone?'],
    answerEn: 'Disaster Mode models severe climate shocks (such as Cyclone Remal in coastal Barishal and Patuakhali). It forecasts rural agent cash depletion 24 to 48 hours in advance and automates armored distributor vehicle route dispatch, ensuring vital cash-out liquidity remains available for families receiving humanitarian relief.',
    answerBn: 'দুর্যোগ মোড উপকূলীয় অঞ্চলে ঘূর্ণিঝড় (যেমন রিমেল) বা বন্যার সময় এজেন্ট পয়েন্টগুলোতে নগদ টাকার সংকট পূর্বাভাস করে। এটি ২৪ থেকে ৪৮ ঘণ্টা আগেই ক্যাশ শেষ হওয়ার ঝুঁকি চিহ্নিত করে স্বয়ংক্রিয়ভাবে সাঁজোয়া বাহন (Armored Vehicle) দিয়ে নগদ ক্যাশ পৌঁছে দেওয়ার রুট প্ল্যান তৈরি করে।',
    suggestedAction: { label: 'View 8-Division Disaster Map', view: 'OPERATOR' },
  },

  // 7. BFIU Regulatory STR
  {
    id: 'bfiu_compliance',
    category: 'BFIU',
    keywords: ['bfiu', 'str', 'form 2', 'compliance', 'bangladesh bank', 'aml', 'amla', 'section 19', 'audit', 'ledger', 'বিএফআইইউ', 'এসটিআর', 'বাংলাদেশ ব্যাংক', 'আইন'],
    questionExamples: ['What is BFIU STR compliance?', 'How does Form 2 STR generation work?'],
    answerEn: 'Under Section 19 of Bangladesh Anti-Money Laundering Act, 2012, MFS operators are legally required to file Suspicious Transaction Reports (STR). TakaSafe automatically populates official BFIU Form 2 STR dossiers from mathematical SHAP attributions, provides electronic AML officer sign-off, and logs immutable SHA-256 records into the audit ledger.',
    answerBn: 'মানি লন্ডারিং প্রতিরোধ আইন, ২০১২-এর ১৯ ধারা অনুযায়ী সন্দেহজনক লেনদেন বাংলাদেশ ব্যাংকের BFIU-তে রিপোর্ট করা বাধ্যতামূলক। TakaSafe এআই স্বয়ংক্রিয়ভাবে আনুষ্ঠানিক "Form 2 STR" রিপোর্ট তৈরি করে, অনুমোদিত কর্মকর্তার ডিজিটাল স্বাক্ষরের সুবিধা দেয় এবং ক্রিপ্টোগ্রাফিক লেজারে অডিট ট্রেইল সংরক্ষণ করে।',
  },

  // 8. SLA & Performance
  {
    id: 'sla_latency',
    category: 'SLA',
    keywords: ['sla', 'latency', 'speed', 'performance', 'real-time', 'fast', 'ms', 'millisecond', 'গতি', 'সময়'],
    questionExamples: ['What is the latency SLA?', 'How fast is the evaluation pipeline?'],
    answerEn: 'The entire TakaSafe multi-modal evaluation pipeline runs with an end-to-end SLA of < 18.0 milliseconds: ~2.1ms ingress perimeter, ~3.4ms feature store sliding windows, ~5.8ms parallel scoring ensemble, and ~1.9ms deterministic policy routing. Benign transactions settle with zero perceptible customer friction.',
    answerBn: 'TakaSafe-এর সম্পূর্ণ পাইপলাইন ১৮ মিলিসেকেন্ডের কম সময়ে প্রতিটি লেনদেন মূল্যায়ন করে: ইনগ্রেস গেটওয়েতে ~২.১ms, ফিচার স্টোরে ~৩.৪ms, এআই মডেলে ~৫.৮ms এবং পলিসি রেজোলিউশনে ~১.৯ms। ফলে স্বাভাবিক গ্রাহকদের লেনদেনে কোনো বিলম্ব বা অসুবিধা হয় না।',
  },

  // 9. Products, Centurion Card & ATM
  {
    id: 'centurion_card',
    category: 'PRODUCTS',
    keywords: ['centurion', 'card', 'sovereign', 'platinum', 'prepaid', 'কার্ড', 'সেন্টুরিয়ন'],
    questionExamples: ['What is the Sovereign Centurion Card?'],
    answerEn: 'The TakaSafe Sovereign Centurion Card is an ultra-secure dual-currency digital prepaid card integrated directly with the customer MFS balance. It includes dynamic CVV protection, ScamShield automated payment delay, and instant card freeze toggles.',
    answerBn: 'TakaSafe সভরিন সেন্টুরিয়ন কার্ড হলো একটি ডুয়াল-কারেন্সি ডিজিটাল প্রিপেইড কার্ড, যা সরাসরি এমএফএস ব্যালেন্সের সাথে সংযুক্ত। এতে রয়েছে ডায়নামিক সিভিভি সুরক্ষা, তাৎক্ষণিক কার্ড লক এবং ScamShield প্রটেকশন।',
    suggestedAction: { label: 'View Centurion Card in App', view: 'CUSTOMER' },
  },
  {
    id: 'atm_cashout_charges',
    category: 'PRODUCTS',
    keywords: ['atm', 'cash out', 'charge', 'fee', 'free', 'cost', 'খরচ', 'ক্যাশ আউট', 'চার্জ', 'ফ্রি'],
    questionExamples: ['What is the cash-out fee at ATMs?', 'Are there any hidden charges?'],
    answerEn: 'Cash-out from any affiliated TakaSafe / upay ATM booth nationwide is 100% FREE (৳0 fee) with zero hidden deductions. Standard agent counter cash-outs follow the transparent rate of ৳14 per ৳1,000.',
    answerBn: 'দেশব্যাপী যেকোনো অনুমোদিত এটিএম বুথ থেকে ক্যাশ আউট সম্পূর্ণ বিনামূল্যে (০ টাকা চার্জ)! এজেন্ট পয়েন্ট থেকে ক্যাশ আউটের ক্ষেত্রে প্রতি হাজারে নির্ধারিত মাত্র ১৪ টাকা চার্জ প্রযোজ্য।',
  },
  {
    id: 'ussd_gateway',
    category: 'PRODUCTS',
    keywords: ['ussd', '*268#', 'feature phone', 'offline', 'ইউএসএসডি', 'বাটন ফোন'],
    questionExamples: ['Can TakaSafe work on feature phones without internet?', 'What is the USSD code?'],
    answerEn: 'Yes! TakaSafe fully supports offline feature phones via the *268# USSD gateway. The backend evaluates USSD session packets with the same < 18ms AI risk engine, protecting rural non-smartphone users equally against coercion and fraud.',
    answerBn: 'হ্যাঁ! সাধারণ বাটন ফোনের গ্রাহকদের জন্য রয়েছে *268# USSD গেটওয়ে। ইন্টারনেট ছাড়াই যেকোনো সাধারণ ফোনে লেনদেন করার সময়ও TakaSafe ব্যাকএন্ড সমানভাবে ১৮ মিলিসেকেন্ডে সুরক্ষা নিশ্চিত করে।',
  },

  // 10. Contact & Help
  {
    id: 'contact_info',
    category: 'CONTACT',
    keywords: ['contact', 'hotline', 'phone', 'call', 'helpline', 'email', 'support', 'help', 'যোগাযোগ', 'ফোন', 'হেল্পলাইন', 'ঠিকানা'],
    questionExamples: ['How do I contact customer support?', 'What is the helpline number?'],
    answerEn: 'You can reach TakaSafe 24/7 Customer Care by dialing 16268 or 09610916268. You can also email us at customerservice@takasafe.com (Customer Support) or info@takasafe.com (General Inquiries). Our Gulshan Flagship Center is located at Plot CWS (A)-1, Road 34, Gulshan Avenue, Dhaka-1212.',
    answerBn: 'যেকোনো সময় আমাদের ২৪/৭ কাস্টমার সার্ভিসের জন্য ডায়াল করুন ১৬২৬৮ অথবা ০৯৬১০৯১৬২৬৮ নম্বরে। ইমেইল করতে পারেন customerservice@takasafe.com ঠিকানায়। আমাদের গুলশান প্রধান পয়েন্ট: প্লট সিডব্লিউএস (এ)-১, রোড ৩৪, গুলশান এভিনিউ, ঢাকা-১২১২।',
  },
];

/**
 * Intelligent client-side NLP matcher that scores questions against the knowledge base
 * without requiring any external network API calls!
 */
export function matchAssistantQuery(
  rawQuery: string,
  lang: 'EN' | 'BN'
): { answer: string; item?: KnowledgeItem; confidence: number; relatedTopics: string[] } {
  const query = rawQuery.toLowerCase().trim();

  // Basic greetings & pleasantries handling
  if (query.match(/^(hi|hello|hey|salam|assalam|halo|hy|good morning|good evening)$/i)) {
    return {
      confidence: 1.0,
      answer: lang === 'BN'
        ? 'আসসালামু আলাইকুম! আমি TakaSafe এআই সহকারী। আমি আপনাকে ফ্রড প্রতিরোধ, ScamShield, মিউল সিন্ডিকেট, এটিএম ক্যাশআউট, অথবা রেগুলেটরি পলিসি সম্পর্কে বিস্তারিত তথ্য দিতে পারি। আপনার প্রশ্নটি লিখুন!'
        : 'Hello! I am your TakaSafe Digital AI Assistant. I can answer any questions about our multi-modal fraud detection, ScamShield, MuleVision graph, ATM cash-out, or BFIU compliance. What would you like to know?',
      relatedTopics: ['🛡️ ScamShield 24h Delay', '⚡ < 18ms SLA Speed', '🕸️ MuleVision GNN Graph', '💳 Centurion Card'],
    };
  }

  if (query.match(/^(thank|thanks|dhonnobad|dhonnobaad|thx|great|awesome)$/i)) {
    return {
      confidence: 1.0,
      answer: lang === 'BN'
        ? 'আপনাকে স্বাগতম! TakaSafe সব সময় আপনার আর্থিক নিরাপত্তায় নিয়োজিত। অন্য কোনো তথ্য জানার থাকলে নির্দ্বিধায় জিজ্ঞাসা করুন।'
        : 'You are most welcome! TakaSafe is always dedicated to securing your financial transactions. Feel free to ask anything else!',
      relatedTopics: ['🛡️ ScamShield', '🌊 Disaster Float Mode', '📋 BFIU Form 2 STR'],
    };
  }

  // Tokenize user query
  const queryTokens = query
    .replace(/[?.,!/\\()-_#*]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);

  let bestMatch: KnowledgeItem | null = null;
  let highestScore = 0;

  for (const item of TAKASAFE_KNOWLEDGE_BASE) {
    let score = 0;

    // Check exact phrase matches in question examples or keywords
    for (const phrase of item.questionExamples) {
      if (query.includes(phrase.toLowerCase())) score += 8;
    }
    for (const kw of item.keywords) {
      const kwLower = kw.toLowerCase();
      if (query === kwLower) {
        score += 10;
      } else if (query.includes(kwLower)) {
        score += 5;
      }
    }

    // Token intersection score
    for (const token of queryTokens) {
      for (const kw of item.keywords) {
        if (kw.toLowerCase() === token) {
          score += 3;
        } else if (kw.toLowerCase().includes(token) || token.includes(kw.toLowerCase())) {
          score += 1.5;
        }
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  // If we found a confident match
  if (bestMatch && highestScore >= 3) {
    const related = TAKASAFE_KNOWLEDGE_BASE
      .filter((k) => k.id !== bestMatch!.id && k.category === bestMatch!.category)
      .slice(0, 3)
      .map((k) => (lang === 'BN' ? k.questionExamples[k.questionExamples.length - 1] || k.keywords[0] : k.questionExamples[0] || k.keywords[0]));

    return {
      confidence: Math.min(1.0, highestScore / 10),
      item: bestMatch,
      answer: lang === 'BN' ? bestMatch.answerBn : bestMatch.answerEn,
      relatedTopics: related.length > 0 ? related : ['ScamShield', 'MuleVision Graph', 'BFIU STR Compliance'],
    };
  }

  // Intelligent fallback: synthesize an informative project guide instead of dead generic message
  const fallbackEn = `I am trained on all aspects of the TakaSafe Financial Trust Network. While I didn't recognize that specific phrasing, here are the key topics I can explain in detail:
• 🛡️ **ScamShield AI**: 24-hour cooling-off window & cognitive duress defense
• ⚡ **Real-Time Performance**: < 18ms SLA & multi-modal ensemble scoring (XGBoost, Isolation Forest)
• 🕸️ **MuleVision Graph**: D3.js force network & rapid pass-through syndicate quarantine
• 🌊 **Disaster Resilience**: Coastal Cyclone Remal cash exhaustion forecasting & armored float routing
• 📋 **BFIU Compliance**: Automated Form 2 STR filing under AMLA 2012 (Section 19)
• 💳 **MFS Banking**: Free ATM cash-out, Sovereign Centurion Card, & *268# USSD

Click any suggested question below or type your query!`;

  const fallbackBn = `আমি TakaSafe প্ল্যাটফর্মের সকল বিষয়ে প্রশিক্ষণপ্রাপ্ত। আপনার সুনির্দিষ্ট প্রশ্নটি বুঝতে কিছুটা বিভ্রান্তি হয়েছে, তবে নিচের মূল বিষয়গুলো সম্পর্কে আমি বিস্তারিত উত্তর দিতে পারি:
• 🛡️ **ScamShield**: ২৪ ঘণ্টার কুলিং-অফ সময় ও প্রতারণা প্রতিরোধ
• ⚡ **রিয়েল-টাইম এআই**: ১৮ মিলিসেকেন্ডের মূল্যায়ন ও XGBoost মডেল
• 🕸️ **MuleVision গ্রাফ**: মানি মিউল সিন্ডিকেট চক্র ও ১-ক্লিক কোয়ারেন্টাইন
• 🌊 **দুর্যোগ ব্যবস্থাপনা**: ঘূর্ণিঝড় রিমেল ও উপকূলীয় ক্যাশ সংকট সমাধান
• 📋 **বিএফআইইউ আইন**: মানি লন্ডারিং প্রতিরোধ আইন ২০১২ (ধারা ১৯) ও Form 2 STR
• 💳 **সেবা ও চার্জ**: এটিএম থেকে ফ্রি ক্যাশ-আউট, সেন্টুরিয়ন কার্ড ও *268# USSD

নিচের প্রস্তাবিত প্রশ্নগুলোতে ক্লিক করুন অথবা আপনার প্রশ্নটি পরিষ্কার করে লিখুন!`;

  return {
    confidence: 0,
    answer: lang === 'BN' ? fallbackBn : fallbackEn,
    relatedTopics: [
      lang === 'BN' ? 'ScamShield কীভাবে কাজ করে?' : 'How does ScamShield work?',
      lang === 'BN' ? '১৮ মিলিসেকেন্ড SLA কী?' : 'What is the < 18ms SLA?',
      lang === 'BN' ? 'মিউল সিন্ডিকেট গ্রাফ কী?' : 'What is MuleVision Graph?',
      lang === 'BN' ? 'এটিএম ক্যাশআউট চার্জ কত?' : 'Is ATM cash-out free?',
    ],
  };
}
