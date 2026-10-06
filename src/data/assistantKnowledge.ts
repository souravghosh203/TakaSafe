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
  // 0. Official Abstract & Scope
  {
    id: 'project_abstract',
    category: 'OVERVIEW',
    keywords: ['abstract', 'project abstract', 'official abstract', 'summary', 'research', 'paper', 'novelty', 'novel contributions', 'à¦ªà¦¾à¦à¦šà¦Ÿà¦¿ à¦¸à¦•à§à¦·à¦®à¦¤à¦¾', 'à¦…à§à¦¯à¦¾à¦¬à¦¸à§à¦Ÿà§à¦°à¦¾à¦•à§à¦Ÿ', 'à¦¸à¦¾à¦°à¦¸à¦‚à¦•à§à¦·à§‡à¦ª'],
    questionExamples: ['What is the official project abstract?', 'Show me the abstract of TakaSafe', 'à¦…à§à¦¯à¦¾à¦¬à¦¸à§à¦Ÿà§à¦°à¦¾à¦•à§à¦Ÿ à¦¬à¦¾ à¦ªà§à¦°à¦•à¦²à§à¦ªà§‡à¦° à¦¸à¦¾à¦°à¦¸à¦‚à¦•à§à¦·à§‡à¦ª à¦•à§€?'],
    answerEn: `TakaSafe is a modular, explainable AI platform that acts as a financial trust and resilience layer for mobile financial services (MFS). It connects five core capabilities in one coherent system: Transaction Guardian, which combines gradient-boosted fraud classification with Isolation Forest behavioural anomaly detection; MuleVision, which uses transaction-graph analysis to uncover connected fraud networks; ScamShield, which warns customers before a risky payment is completed while leaving the final choice to them; Disaster Financial Resilience Mode, our first primary novel contribution, which simulates how a flood, cyclone or network disruption affects transaction demand, cash-out demand, agent liquidity and fraud vulnerability; and the Financial Early-Warning Radar, our second, which fuses fraud, scam, network, liquidity and behavioural signals into a regional risk score. Every prediction is explained with SHAP feature attribution and converted into a recommended action by an Action Engine; an LLM only narrates structured evidence, and an authorised human makes every high-impact decision. The prototype is built entirely on synthetic data. The platform supports UN SDG 8 (Decent Work and Economic Growth), SDG 9 (Industry, Innovation and Infrastructure) and SDG 16 (Peace, Justice and Strong Institutions).`,
    answerBn: `TakaSafe à¦¹à¦²à§‹ à¦à¦•à¦Ÿà¦¿ à¦®à¦¡à§à¦²à¦¾à¦°, à¦¬à§à¦¯à¦¾à¦–à§à¦¯à¦¾à¦®à§‚à¦²à¦• (Explainable) à¦à¦†à¦‡ à¦ªà§à¦²à§à¦¯à¦¾à¦Ÿà¦«à¦°à§à¦® à¦¯à¦¾ à¦®à§‹à¦¬à¦¾à¦‡à¦² à¦«à¦¾à¦‡à¦¨à§à¦¯à¦¾à¦¨à§à¦¸à¦¿à§Ÿà¦¾à¦² à¦¸à¦¾à¦°à§à¦­à¦¿à¦¸à§‡à¦° (MFS) à¦†à¦°à§à¦¥à¦¿à¦• à¦†à¦¸à§à¦¥à¦¾ à¦“ à¦¸à§à¦¥à¦¿à¦¤à¦¿à¦¸à§à¦¥à¦¾à¦ªà¦•à¦¤à¦¾à¦° à¦¸à§à¦¤à¦° à¦¹à¦¿à¦¸à§‡à¦¬à§‡ à¦•à¦¾à¦œ à¦•à¦°à§‡à¥¤ à¦à¦Ÿà¦¿ à¦ªà¦¾à¦à¦šà¦Ÿà¦¿ à¦ªà§à¦°à¦§à¦¾à¦¨ à¦¸à¦•à§à¦·à¦®à¦¤à¦¾à¦•à§‡ à¦à¦•à¦Ÿà¦¿ à¦¸à§à¦¸à¦‚à¦¹à¦¤ à¦¸à¦¿à¦¸à§à¦Ÿà§‡à¦®à§‡ à¦¯à§à¦•à§à¦¤ à¦•à¦°à§‡: à§§) Transaction Guardian (XGBoost à¦“ à¦†à¦‡à¦¸à§‹à¦²à§‡à¦¶à¦¨ à¦«à¦°à§‡à¦¸à§à¦Ÿ à¦¸à¦®à¦¨à§à¦¬à¦¿à¦¤ à¦«à§à¦°à¦¡ à¦¡à¦¿à¦Ÿà§‡à¦•à¦¶à¦¨); à§¨) MuleVision (à¦²à§‡à¦¨à¦¦à§‡à¦¨ à¦—à§à¦°à¦¾à¦« à¦¬à¦¿à¦¶à§à¦²à§‡à¦·à¦£à§‡à¦° à¦®à¦¾à¦§à§à¦¯à¦®à§‡ à¦®à¦¾à¦¨à¦¿ à¦®à¦¿à¦‰à¦² à¦¨à§‡à¦Ÿà¦“à¦¯à¦¼à¦¾à¦°à§à¦• à¦‰à¦¨à§à¦®à§‹à¦šà¦¨); à§©) ScamShield (à¦à§à¦à¦•à¦¿à¦ªà§‚à¦°à§à¦£ à¦ªà§‡à¦®à§‡à¦¨à§à¦Ÿà§‡à¦° à¦ªà§‚à¦°à§à¦¬à§‡ à¦—à§à¦°à¦¾à¦¹à¦•à¦•à§‡ à¦¸à¦¤à¦°à§à¦• à¦•à¦°à§‡ à¦šà§‚à¦¡à¦¼à¦¾à¦¨à§à¦¤ à¦¸à¦¿à¦¦à§à¦§à¦¾à¦¨à§à¦¤à§‡à¦° à¦…à¦§à¦¿à¦•à¦¾à¦° à¦¤à¦¾à¦¦à§‡à¦° à¦¹à¦¾à¦¤à§‡à¦‡ à¦°à¦¾à¦–à¦¾); à§ª) Disaster Financial Resilience Mode (à¦†à¦®à¦¾à¦¦à§‡à¦° à§§à¦® à¦®à§Œà¦²à¦¿à¦• à¦…à¦¬à¦¦à¦¾à¦¨â€”à¦¬à¦¨à§à¦¯à¦¾, à¦˜à§‚à¦°à§à¦£à¦¿à¦à§œ à¦¬à¦¾ à¦¨à§‡à¦Ÿà¦“à¦¯à¦¼à¦¾à¦°à§à¦• à¦¬à¦¿à¦­à§à¦°à¦¾à¦Ÿà§‡ à¦¨à¦—à¦¦ à¦‰à¦¤à§à¦¤à§‹à¦²à¦¨ à¦šà¦¾à¦¹à¦¿à¦¦à¦¾, à¦à¦œà§‡à¦¨à§à¦Ÿà§‡à¦° à¦•à§à¦¯à¦¾à¦¶ à¦¸à¦‚à¦•à¦Ÿ à¦“ à¦œà¦¾à¦²à¦¿à§Ÿà¦¾à¦¤à¦¿à¦° à¦ªà§à¦°à¦­à¦¾à¦¬ à¦¸à¦¿à¦®à§à¦²à§‡à¦¶à¦¨); à¦à¦¬à¦‚ à§«) Financial Early-Warning Radar (à¦†à¦®à¦¾à¦¦à§‡à¦° à§¨à¦¯à¦¼ à¦®à§Œà¦²à¦¿à¦• à¦…à¦¬à¦¦à¦¾à¦¨â€”à¦œà¦¾à¦²à¦¿à¦¯à¦¼à¦¾à¦¤à¦¿, à¦¸à§à¦•à§à¦¯à¦¾à¦®, à¦¨à§‡à¦Ÿà¦“à¦¯à¦¼à¦¾à¦°à§à¦• à¦“ à¦¤à¦¾à¦°à¦²à§à¦¯ à¦¸à¦‚à¦•à§‡à¦¤ à¦à¦•à¦¤à§à¦° à¦•à¦°à§‡ à¦¬à¦¿à¦­à¦¾à¦—à§€à¦¯à¦¼ à¦à§à¦à¦•à¦¿ à¦¸à§à¦•à§‹à¦°)à¥¤ à¦ªà§à¦°à¦¤à¦¿à¦Ÿà¦¿ à¦ªà§‚à¦°à§à¦¬à¦¾à¦­à¦¾à¦¸ SHAP à¦¦à¦¿à¦¯à¦¼à§‡ à¦¬à§à¦¯à¦¾à¦–à§à¦¯à¦¾ à¦•à¦°à¦¾ à¦¹à¦¯à¦¼ à¦à¦¬à¦‚ à¦…à§à¦¯à¦¾à¦•à¦¶à¦¨ à¦‡à¦žà§à¦œà¦¿à¦¨à§‡à¦° à¦®à¦¾à¦§à§à¦¯à¦®à§‡ à¦¸à§à¦ªà¦¾à¦°à¦¿à¦¶à§‡ à¦°à§‚à¦ªà¦¾à¦¨à§à¦¤à¦°à¦¿à¦¤ à¦¹à¦¯à¦¼; à¦à¦²à¦à¦²à¦à¦® à¦¶à§à¦§à§à¦®à¦¾à¦¤à§à¦° à¦•à¦¾à¦ à¦¾à¦®à§‹à¦—à¦¤ à¦ªà§à¦°à¦®à¦¾à¦£ à¦¬à¦°à§à¦£à¦¨à¦¾ à¦•à¦°à§‡ à¦à¦¬à¦‚ à¦…à¦¨à§à¦®à§‹à¦¦à¦¿à¦¤ à¦¬à§à¦¯à¦•à§à¦¤à¦¿ à¦ªà§à¦°à¦¤à¦¿à¦Ÿà¦¿ à¦šà§‚à¦¡à¦¼à¦¾à¦¨à§à¦¤ à¦¸à¦¿à¦¦à§à¦§à¦¾à¦¨à§à¦¤ à¦—à§à¦°à¦¹à¦£ à¦•à¦°à§‡à¦¨à¥¤ à¦ªà§à¦°à§‹à¦Ÿà§‹à¦Ÿà¦¾à¦‡à¦ªà¦Ÿà¦¿ à¦¸à¦®à§à¦ªà§‚à¦°à§à¦£ à¦¸à¦¿à¦¨à§à¦¥à§‡à¦Ÿà¦¿à¦• à¦¡à§‡à¦Ÿà¦¾à§Ÿ à¦¤à§ˆà¦°à¦¿ à¦à¦¬à¦‚ à¦œà¦¾à¦¤à¦¿à¦¸à¦‚à¦˜ SDG à§®, à§¯ à¦“ à§§à§¬ à¦¸à¦®à¦°à§à¦¥à¦¨ à¦•à¦°à§‡à¥¤`,
    suggestedAction: { label: 'View Full Research Storyline', view: 'STORYLINE' },
  },
  {
    id: 'un_sdg_alignment',
    category: 'OVERVIEW',
    keywords: ['sdg', 'un sdg', 'sustainable development', 'sdg 8', 'sdg 9', 'sdg 16', 'à¦œà¦¾à¦¤à¦¿à¦¸à¦‚à¦˜', 'à¦à¦¸à¦¡à¦¿à¦œà¦¿'],
    questionExamples: ['How does TakaSafe support UN SDGs?', 'Which Sustainable Development Goals does TakaSafe align with?'],
    answerEn: 'TakaSafe actively supports three United Nations Sustainable Development Goals: 1) SDG 8 (Decent Work & Economic Growth) by protecting over 1.5M rural agents from liquidity insolvency during disasters and shielding daily-wage earners from scam loss; 2) SDG 9 (Industry, Innovation & Infrastructure) by deploying a < 18ms SLA fault-tolerant resilient payment security layer; and 3) SDG 16 (Peace, Justice & Strong Institutions) by dismantling organized mule laundering syndicates and ensuring 100% human-in-the-loop explainable AI accountability with automated BFIU AML/CFT filings.',
    answerBn: 'TakaSafe à¦œà¦¾à¦¤à¦¿à¦¸à¦‚à¦˜à§‡à¦° à§©à¦Ÿà¦¿ à¦Ÿà§‡à¦•à¦¸à¦‡ à¦‰à¦¨à§à¦¨à§Ÿà¦¨ à¦²à¦•à§à¦·à§à¦¯à¦®à¦¾à¦¤à§à¦°à¦¾ (SDG) à¦¸à¦°à¦¾à¦¸à¦°à¦¿ à¦¸à¦®à¦°à§à¦¥à¦¨ à¦•à¦°à§‡: à§§) SDG à§® (à¦¶à§‹à¦­à¦¨ à¦•à¦¾à¦œ à¦“ à¦…à¦°à§à¦¥à¦¨à§ˆà¦¤à¦¿à¦• à¦ªà§à¦°à¦¬à§ƒà¦¦à§à¦§à¦¿)â€”à¦¦à§à¦°à§à¦¯à§‹à¦—à§‡ à§§.à§« à¦®à¦¿à¦²à¦¿à¦¯à¦¼à¦¨à§‡à¦° à¦¬à§‡à¦¶à¦¿ à¦—à§à¦°à¦¾à¦®à§€à¦£ à¦à¦œà§‡à¦¨à§à¦Ÿà§‡à¦° à¦¤à¦¾à¦°à¦²à§à¦¯ à¦¸à§à¦°à¦•à§à¦·à¦¾ à¦“ à¦¸à¦¾à¦§à¦¾à¦°à¦£ à¦¦à¦¿à¦¨à¦®à¦œà§à¦°à¦¦à§‡à¦° à¦ªà§à¦°à¦¤à¦¾à¦°à¦£à¦¾ à¦¥à§‡à¦•à§‡ à¦°à¦•à§à¦·à¦¾; à§¨) SDG à§¯ (à¦¶à¦¿à¦²à§à¦ª, à¦‰à¦¦à§à¦­à¦¾à¦¬à¦¨ à¦“ à¦…à¦¬à¦•à¦¾à¦ à¦¾à¦®à§‹)â€”à§§à§® à¦®à¦¿à¦²à¦¿à¦¸à§‡à¦•à§‡à¦¨à§à¦¡à§‡à¦° à¦¸à§à¦¥à¦¿à¦¤à¦¿à¦¸à§à¦¥à¦¾à¦ªà¦• à¦“ à¦•à§à¦²à¦¾à¦‡à¦®à§‡à¦Ÿ-à¦°à§‡à¦œà¦¿à¦²à¦¿à¦¯à¦¼à§‡à¦¨à§à¦Ÿ à¦ªà§‡à¦®à§‡à¦¨à§à¦Ÿ à¦…à¦¬à¦•à¦¾à¦ à¦¾à¦®à§‹; à¦à¦¬à¦‚ à§©) SDG à§§à§¬ (à¦¶à¦¾à¦¨à§à¦¤à¦¿, à¦¨à§à¦¯à¦¾à¦¯à¦¼à¦¬à¦¿à¦šà¦¾à¦° à¦“ à¦•à¦¾à¦°à§à¦¯à¦•à¦° à¦ªà§à¦°à¦¤à¦¿à¦·à§à¦ à¦¾à¦¨)â€”à¦®à¦¿à¦‰à¦² à¦¸à¦¿à¦¨à§à¦¡à¦¿à¦•à§‡à¦Ÿ à¦¦à¦®à¦¨, à¦¶à¦¤à¦­à¦¾à¦— à¦¸à§à¦¬à¦šà§à¦› à¦…à§à¦¯à¦¾à¦²à¦—à¦°à¦¿à¦¦à¦® à¦“ à¦¬à¦¿à¦à¦«à¦†à¦‡à¦‡à¦‰ à¦¨à¦¿à¦¯à¦¼à¦¨à§à¦¤à§à¦°à¦• à¦œà¦¬à¦¾à¦¬à¦¦à¦¿à¦¹à¦¿à¦¤à¦¾à¥¤',
    suggestedAction: { label: 'Explore Interactive Demo', view: 'STORYLINE' },
  },
  // 1. Overview
  {
    id: 'what_is_takasafe',
    category: 'OVERVIEW',
    keywords: ['what is takasafe', 'takasafe', 'about', 'overview', 'project', 'intro', 'kivabe', 'ki eita', 'à¦Ÿà¦¾à¦•à¦¾à¦¸à§‡à¦«', 'à¦Ÿà¦¾à¦•à¦¾ à¦¸à§‡à¦«', 'à¦¸à¦®à§à¦ªà¦°à§à¦•à§‡'],
    questionExamples: ['What is TakaSafe?', 'Tell me about this project', 'à¦Ÿà¦¾à¦•à¦¾à¦¸à§‡à¦« à¦•à§€?'],
    answerEn: 'TakaSafe is a multi-modal AI Financial Trust and Resilience Platform engineered for Bangladesh MFS networks (such as upay, bKash, and Nagad). It combines real-time AI fraud detection (< 18ms SLA), ScamShield consumer protection, MuleVision syndicate graph analytics, Cyclone Remal disaster cash float logistics, and automated BFIU Form 2 STR regulatory compliance.',
    answerBn: 'TakaSafe à¦¹à¦²à§‹ à¦¬à¦¾à¦‚à¦²à¦¾à¦¦à§‡à¦¶à§‡à¦° à¦®à§‹à¦¬à¦¾à¦‡à¦² à¦«à¦¾à¦‡à¦¨à§à¦¯à¦¾à¦¨à§à¦¸à¦¿à§Ÿà¦¾à¦² à¦¸à¦¾à¦°à§à¦­à¦¿à¦¸ (MFS à¦¯à§‡à¦®à¦¨ upay, bKash, Nagad) à¦à¦° à¦œà¦¨à§à¦¯ à¦¤à§ˆà¦°à¦¿ à¦à¦•à¦Ÿà¦¿ à¦®à¦¾à¦²à§à¦Ÿà¦¿-à¦®à§‹à¦¡à¦¾à¦² à¦à¦†à¦‡ à¦«à§à¦°à¦¡ à¦ªà§à¦°à§‹à¦Ÿà§‡à¦•à¦¶à¦¨ à¦“ à¦°à§‡à¦œà¦¿à¦²à¦¿à¦¯à¦¼à§‡à¦¨à§à¦¸ à¦ªà§à¦²à§à¦¯à¦¾à¦Ÿà¦«à¦°à§à¦®à¥¤ à¦à¦Ÿà¦¿ à§§à§® à¦®à¦¿à¦²à¦¿à¦¸à§‡à¦•à§‡à¦¨à§à¦¡à§‡à¦° à¦®à¦§à§à¦¯à§‡ à¦Ÿà§à¦°à¦¾à¦¨à¦œà§à¦¯à¦¾à¦•à¦¶à¦¨ à¦¯à¦¾à¦šà¦¾à¦‡, à¦ªà§à¦°à¦¤à¦¾à¦°à¦£à¦¾ à¦ªà§à¦°à¦¤à¦¿à¦°à§‹à¦§ (ScamShield), à¦®à¦¾à¦¨à¦¿ à¦®à¦¿à¦‰à¦² à¦šà¦•à§à¦° à¦¶à¦¨à¦¾à¦•à§à¦¤à¦•à¦°à¦£ (MuleVision), à¦ªà§à¦°à¦¾à¦•à§ƒà¦¤à¦¿à¦• à¦¦à§à¦°à§à¦¯à§‹à¦—à§‡ à¦à¦œà§‡à¦¨à§à¦Ÿ à¦•à§à¦¯à¦¾à¦¶ à¦¬à§à¦¯à¦¬à¦¸à§à¦¥à¦¾à¦ªà¦¨à¦¾ à¦à¦¬à¦‚ à¦¬à¦¿à¦à¦«à¦†à¦‡à¦‡à¦‰ à¦°à§‡à¦—à§à¦²à§‡à¦Ÿà¦°à¦¿ à¦•à¦®à¦ªà§à¦²à¦¾à¦¯à¦¼à§‡à¦¨à§à¦¸ à¦¨à¦¿à¦¶à§à¦šà¦¿à¦¤ à¦•à¦°à§‡à¥¤',
    suggestedAction: { label: 'Explore Interactive Demo', view: 'STORYLINE' },
  },
  {
    id: 'who_is_it_for',
    category: 'OVERVIEW',
    keywords: ['who is it for', 'target', 'audience', 'user', 'customers', 'à¦•à¦¾à¦° à¦œà¦¨à§à¦¯', 'à¦¬à§à¦¯à¦¬à¦¹à¦¾à¦°à¦•à¦¾à¦°à§€'],
    questionExamples: ['Who is TakaSafe designed for?', 'Target audience?'],
    answerEn: 'TakaSafe is designed for three core groups: 1) MFS Consumers protecting themselves against coercive social engineering scams; 2) Fraud & SOC Operations Analysts monitoring real-time syndicate rings; and 3) Regulatory & BFIU Compliance Officers requiring automated, legally binding Form 2 STR reports under AMLA 2012.',
    answerBn: 'TakaSafe à¦¤à¦¿à¦¨à¦Ÿà¦¿ à¦®à§‚à¦² à¦¬à§à¦¯à¦¬à¦¹à¦¾à¦°à¦•à¦¾à¦°à§€à¦° à¦œà¦¨à§à¦¯ à¦¡à¦¿à¦œà¦¾à¦‡à¦¨ à¦•à¦°à¦¾: à§§) à¦¸à¦¾à¦§à¦¾à¦°à¦£ à¦—à§à¦°à¦¾à¦¹à¦• (à¦ªà§à¦°à¦¤à¦¾à¦°à¦£à¦¾à¦®à§‚à¦²à¦• à¦¸à§à¦•à§à¦¯à¦¾à¦® à¦¥à§‡à¦•à§‡ à¦¸à§à¦°à¦•à§à¦·à¦¾ à¦ªà§‡à¦¤à§‡), à§¨) à¦«à§à¦°à¦¡ à¦…à¦ªà¦¾à¦°à§‡à¦¶à¦¨ à¦…à§à¦¯à¦¾à¦¨à¦¾à¦²à¦¿à¦¸à§à¦Ÿ (à¦®à¦¿à¦‰à¦² à¦šà¦•à§à¦° à¦“ à¦¸à¦¿à¦¨à§à¦¡à¦¿à¦•à§‡à¦Ÿ à¦°à¦¿à¦¯à¦¼à§‡à¦²-à¦Ÿà¦¾à¦‡à¦®à§‡ à¦¨à¦œà¦°à¦¦à¦¾à¦°à¦¿ à¦•à¦°à¦¤à§‡), à¦à¦¬à¦‚ à§©) à¦¬à¦¿à¦à¦«à¦†à¦‡à¦‡à¦‰ à¦•à¦®à¦ªà§à¦²à¦¾à¦¯à¦¼à§‡à¦¨à§à¦¸ à¦…à¦«à¦¿à¦¸à¦¾à¦° (à¦¸à§à¦¬à¦¯à¦¼à¦‚à¦•à§à¦°à¦¿à¦¯à¦¼ à¦«à¦°à§à¦®-à§¨ à¦à¦¸à¦Ÿà¦¿à¦†à¦° à¦°à¦¿à¦ªà§‹à¦°à§à¦Ÿ à¦œà¦®à¦¾ à¦¦à¦¿à¦¤à§‡)à¥¤',
  },

  // 2. ScamShield
  {
    id: 'scamshield_explained',
    category: 'SCAMSHIELD',
    keywords: ['scamshield', 'scam', 'fraud', 'social engineering', 'duress', 'cooling', 'cooling-off', 'delay', 'cancel', 'recall', 'à¦ªà§à¦°à¦¤à¦¾à¦°à¦£à¦¾', 'à¦¸à§à¦•à§à¦¯à¦¾à¦®', 'à¦¸à§à¦°à¦•à§à¦·à¦¾', 'à¦•à§à¦²à¦¿à¦‚'],
    questionExamples: ['How does ScamShield work?', 'What is the 24-hour cooling-off window?'],
    answerEn: 'ScamShield is an explainable pre-payment cognitive intervention system. When a customer attempts a high-risk transfer (e.g., nocturnal unverified P2P or sudden velocity surge), ScamShield intercepts the transaction with plain-language warnings and activates a 24-Hour Cooling-Off Window. During this window, the sender can cancel the transaction and recall funds at any time before final settlement.',
    answerBn: 'ScamShield à¦¹à¦²à§‹ à¦ªà§‡à¦®à§‡à¦¨à§à¦Ÿà§‡à¦° à¦ªà§‚à¦°à§à¦¬à§‡à¦‡ à¦à¦†à¦‡-à¦šà¦¾à¦²à¦¿à¦¤ à¦à¦•à¦Ÿà¦¿ à¦¸à¦¤à¦°à§à¦•à¦¤à¦¾à¦®à§‚à¦²à¦• à¦¬à§à¦¯à¦¬à¦¸à§à¦¥à¦¾à¥¤ à¦…à¦¸à§à¦¬à¦¾à¦­à¦¾à¦¬à¦¿à¦• à¦²à§‡à¦¨à¦¦à§‡à¦¨ à¦¬à¦¾ à¦…à¦ªà¦°à¦¿à¦šà¦¿à¦¤ à¦¨à¦®à§à¦¬à¦°à§‡ à¦¬à¦¡à¦¼ à¦…à¦™à§à¦•à§‡à¦° à¦Ÿà¦¾à¦•à¦¾ à¦ªà¦¾à¦ à¦¾à¦¨à§‹à¦° à¦¸à¦®à¦¯à¦¼ à¦à¦Ÿà¦¿ à¦—à§à¦°à¦¾à¦¹à¦•à¦•à§‡ à¦¸à¦®à§à¦­à¦¾à¦¬à§à¦¯ à¦ªà§à¦°à¦¤à¦¾à¦°à¦£à¦¾à¦° à¦•à¦¾à¦°à¦£ à¦¸à¦¹à¦œ à¦­à¦¾à¦·à¦¾à¦¯à¦¼ à¦¬à§à¦à¦¿à¦¯à¦¼à§‡ à¦¦à§‡à¦¯à¦¼ à¦à¦¬à¦‚ à§¨à§ª à¦˜à¦£à§à¦Ÿà¦¾à¦° à¦•à§à¦²à¦¿à¦‚-à¦…à¦« à¦¸à¦®à¦¯à¦¼ à¦¦à§‡à¦¯à¦¼à¥¤ à¦à¦‡ à¦¸à¦®à¦¯à¦¼à§‡à¦° à¦®à¦§à§à¦¯à§‡ à¦—à§à¦°à¦¾à¦¹à¦• à¦¯à§‡à¦•à§‹à¦¨à§‹ à¦®à§à¦¹à§‚à¦°à§à¦¤à§‡ à¦Ÿà¦¾à¦•à¦¾ à¦ªà¦¾à¦ à¦¾à¦¨à§‹ à¦¬à¦¾à¦¤à¦¿à¦² à¦•à¦°à§‡ à¦°à¦¿à¦«à¦¾à¦¨à§à¦¡ à¦¨à¦¿à¦¤à§‡ à¦ªà¦¾à¦°à§‡à¦¨à¥¤',
    suggestedAction: { label: 'Try ScamShield in Customer App', view: 'CUSTOMER' },
  },

  // 3. MuleVision & Graph Defense
  {
    id: 'mulevision_graph',
    category: 'MULEVISION',
    keywords: ['mule', 'mulevision', 'syndicate', 'graph', 'gnn', 'ring', 'pass-through', 'layering', 'quarantine', 'à¦®à¦¿à¦‰à¦²', 'à¦¸à¦¿à¦¨à§à¦¡à¦¿à¦•à§‡à¦Ÿ', 'à¦¨à§‡à¦Ÿà¦“à¦¯à¦¼à¦¾à¦°à§à¦•', 'à¦•à§‹à¦¯à¦¼à¦¾à¦°à§‡à¦¨à§à¦Ÿà¦¾à¦‡à¦¨'],
    questionExamples: ['What is MuleVision?', 'How does mule detection work?'],
    answerEn: 'MuleVision is a D3.js force-directed graph analytics hub that detects rapid pass-through layering rings and money mule aggregators. It evaluates betweenness centrality, in/out degree ratios, and hop distance to known illicit nodes. Fraud analysts can isolate and quarantine entire mule syndicate rings with 1-click execution.',
    answerBn: 'MuleVision à¦¹à¦²à§‹ à¦à¦•à¦Ÿà¦¿ à¦‡à¦¨à§à¦Ÿà¦¾à¦°à§‡à¦•à§à¦Ÿà¦¿à¦­ à¦—à§à¦°à¦¾à¦« à¦…à§à¦¯à¦¾à¦¨à¦¾à¦²à¦¿à¦Ÿà¦¿à¦•à§à¦¸ à¦¸à¦¿à¦¸à§à¦Ÿà§‡à¦®, à¦¯à¦¾ à¦®à¦¾à¦¨à¦¿ à¦®à¦¿à¦‰à¦² à¦šà¦•à§à¦° à¦à¦¬à¦‚ à¦…à¦¸à§à¦¬à¦¾à¦­à¦¾à¦¬à¦¿à¦• à¦Ÿà§à¦°à¦¾à¦¨à¦œà§à¦¯à¦¾à¦•à¦¶à¦¨ à¦°à¦¿à¦‚ à¦¶à¦¨à¦¾à¦•à§à¦¤ à¦•à¦°à§‡à¥¤ à¦à¦Ÿà¦¿ à¦ªà§à¦°à¦¤à¦¿à¦Ÿà¦¿ à¦…à§à¦¯à¦¾à¦•à¦¾à¦‰à¦¨à§à¦Ÿà§‡à¦° à¦¸à§‡à¦¨à§à¦Ÿà§à¦°à¦¾à¦²à¦¿à¦Ÿà¦¿ à¦“ à¦¡à¦¿à¦—à§à¦°à¦¿ à¦¬à¦¿à¦¶à§à¦²à§‡à¦·à¦£ à¦•à¦°à§‡ à¦¦à§à¦°à§à¦¤ à¦…à¦°à§à¦¥ à¦ªà¦¾à¦šà¦¾à¦° à¦šà¦•à§à¦° à¦šà¦¿à¦¹à§à¦¨à¦¿à¦¤ à¦•à¦°à§‡ à¦à¦¬à¦‚ à§§-à¦•à§à¦²à¦¿à¦•à§‡ à¦à§à¦à¦•à¦¿à¦ªà§‚à¦°à§à¦£ à¦¨à§‹à¦¡ à¦•à§‹à¦¯à¦¼à¦¾à¦°à§‡à¦¨à§à¦Ÿà¦¾à¦‡à¦¨ à¦•à¦°à¦¤à§‡ à¦¸à¦¾à¦¹à¦¾à¦¯à§à¦¯ à¦•à¦°à§‡à¥¤',
    suggestedAction: { label: 'Open MuleVision Graph Hub', view: 'OPERATOR' },
  },

  // 4. ML & XGBoost Models
  {
    id: 'ai1_conformal_doubt_check',
    category: 'ML_AI',
    keywords: ['ai-1', 'ai1', 'lightgbm', 'conformal', 'calibration', 'doubt check', 'novelty', 'notebook', 'shabab', 'model architecture', 'à¦²à¦¾à¦‡à¦Ÿà¦œà¦¿à¦¬à¦¿à¦à¦®'],
    questionExamples: ['What is the AI-1 Score pipeline?', 'How does the Doubt Check work with Conformal Prediction?'],
    answerEn: 'The AI-1 Engine (engineered by Model Architecture Lead Md. Sadman Al Islam Shabab) operates a 3-node tri-stage pipeline: 1) Transfer (amount, receiver, moment); 2) AI-1 Score (LightGBM gradient boosting with Isotonic & Platt probability calibration); 3) Doubt Check (Split Conformal Prediction guaranteeing 95% marginal coverage + Out-of-Distribution Novelty scoring). When model uncertainty is high or novelty flags zero-day fraud, ScamShield intercepts the transfer with a 24-hour cooling-off window. The full runnable Python Jupyter Notebook is available in the app under /api/notebook/ai1.',
    answerBn: 'AI-1 à¦‡à¦žà§à¦œà¦¿à¦¨ (à¦®à¦¡à§‡à¦² à¦†à¦°à§à¦•à¦¿à¦Ÿà§‡à¦•à¦šà¦¾à¦° à¦²à¦¿à¦¡ à¦®à§‹à¦ƒ à¦¸à¦¾à¦¦à¦®à¦¾à¦¨ à¦†à¦² à¦‡à¦¸à¦²à¦¾à¦® à¦¶à¦¾à¦¬à¦¾à¦¬ à¦•à¦°à§à¦¤à§ƒà¦• à¦ªà§à¦°à¦£à§€à¦¤) à§©-à¦¸à§à¦¤à¦°à§‡à¦° à¦ªà¦¾à¦‡à¦ªà¦²à¦¾à¦‡à¦¨à§‡ à¦•à¦¾à¦œ à¦•à¦°à§‡: à§§) à¦Ÿà§à¦°à¦¾à¦¨à§à¦¸à¦«à¦¾à¦° (à¦Ÿà¦¾à¦•à¦¾à¦° à¦ªà¦°à¦¿à¦®à¦¾à¦£, à¦ªà§à¦°à¦¾à¦ªà¦•, à¦¸à¦®à§Ÿ/à¦®à§à¦¹à§‚à¦°à§à¦¤); à§¨) AI-1 à¦¸à§à¦•à§‹à¦° (à¦†à¦‡à¦¸à§‹à¦Ÿà§‹à¦¨à¦¿à¦• à¦“ à¦ªà§à¦²à§à¦¯à¦¾à¦Ÿ à¦•à§à¦¯à¦¾à¦²à¦¿à¦¬à§à¦°à§‡à¦Ÿà§‡à¦¡ LightGBM); à§©) à¦¡à¦¾à¦‰à¦Ÿ à¦šà§‡à¦• (à§¯à§«% à¦•à¦­à¦¾à¦°à§‡à¦œ à¦—à§à¦¯à¦¾à¦°à¦¾à¦¨à§à¦Ÿà¦¿à¦¯à§à¦•à§à¦¤ à¦•à¦¨à¦«à¦°à§à¦®à¦¾à¦² à¦ªà§à¦°à§‡à¦¡à¦¿à¦•à¦¶à¦¨ à¦à¦¬à¦‚ à¦“à¦“à¦¡à¦¿ à¦¨à¦­à§‡à¦²à¦Ÿà¦¿ à¦…à§à¦¯à¦¾à¦¨à¦¾à¦²à¦¾à¦‡à¦¸à¦¿à¦¸)à¥¤ à¦¯à¦–à¦¨ à¦®à¦¡à§‡à¦²à§‡ à¦¸à¦¨à§à¦¦à§‡à¦¹ à¦¬à¦¾ à¦…à¦ªà¦°à¦¿à¦šà¦¿à¦¤ à¦ªà§à¦¯à¦¾à¦Ÿà¦¾à¦°à§à¦¨ à¦¦à§‡à¦–à¦¾ à¦¦à§‡à§Ÿ, ScamShield à§¨à§ª à¦˜à¦£à§à¦Ÿà¦¾à¦° à¦•à§à¦²à¦¿à¦‚-à¦…à¦« à¦¸à¦•à§à¦°à¦¿à§Ÿ à¦•à¦°à§‡à¥¤ à¦ªà§à¦°à§‹ à¦ªà¦¾à¦‡à¦¥à¦¨ à¦œà§à¦ªà¦¿à¦Ÿà¦¾à¦° à¦¨à§‹à¦Ÿà¦¬à§à¦•à¦Ÿà¦¿ à¦…à§à¦¯à¦¾à¦ªà§‡à¦° à¦­à§‡à¦¤à¦°à§‡à¦‡ à¦¡à¦¾à¦‰à¦¨à¦²à§‹à¦¡ à¦“ à¦ªà¦°à¦¿à¦¦à¦°à§à¦¶à¦¨à¦¯à§‹à¦—à§à¦¯à¥¤',
    suggestedAction: { label: 'Open Send Money ScamShield', view: 'CUSTOMER' },
  },
  {
    id: 'ml_models',
    category: 'ML_AI',
    keywords: ['model', 'xgboost', 'isolation forest', 'algorithm', 'machine learning', 'ai', 'weights', 'formula', 'scale_pos_weight', 'à¦®à¦¡à§‡à¦²', 'à¦…à§à¦¯à¦¾à¦²à¦—à¦°à¦¿à¦¦à¦®', 'à¦à¦†à¦‡'],
    questionExamples: ['What machine learning models are used?', 'How is the risk score calculated?'],
    answerEn: 'TakaSafe uses a multi-modal ensemble combining: 1) Supervised XGBoost Classifier (weight: 0.30, trained with scale_pos_weight=20.68 for severe class imbalance); 2) Unsupervised Isolation Forest (weight: 0.20) for behavioral spending profile deviation; 3) Velocity Burst Multipliers (0.15); 4) Device & Geo Integrity (0.15); 5) Mule Graph Centrality (0.10); and 6) ScamShield Duress Heuristics (0.10). The final score is fused as R_final = Î£(w_i Â· s_i) on a 0â€“100 scale.',
    answerBn: 'TakaSafe à¦à¦•à¦Ÿà¦¿ à¦¸à¦®à¦¨à§à¦¬à¦¿à¦¤ à¦®à¦¾à¦²à§à¦Ÿà¦¿-à¦®à§‹à¦¡à¦¾à¦² à¦à¦†à¦‡ à¦‡à¦žà§à¦œà¦¿à¦¨ à¦¬à§à¦¯à¦¬à¦¹à¦¾à¦° à¦•à¦°à§‡: à§§) à¦¸à§à¦ªà¦¾à¦°à¦­à¦¾à¦‡à¦œà¦¡ XGBoost à¦•à§à¦²à¦¾à¦¸à¦¿à¦«à¦¾à¦¯à¦¼à¦¾à¦° (à¦“à¦œà¦¨: à§¦.à§©à§¦, scale_pos_weight=à§¨à§¦.à§¬à§®), à§¨) à¦†à¦¨à¦¸à§à¦ªà¦¾à¦°à¦­à¦¾à¦‡à¦œà¦¡ à¦†à¦‡à¦¸à§‹à¦²à§‡à¦¶à¦¨ à¦«à¦°à§‡à¦¸à§à¦Ÿ (à¦“à¦œà¦¨: à§¦.à§¨à§¦), à§©) à¦­à§‡à¦²à§‹à¦¸à¦¿à¦Ÿà¦¿ à¦¬à¦¾à¦°à§à¦¸à§à¦Ÿ à¦®à¦¾à¦²à§à¦Ÿà¦¿à¦ªà§à¦²à¦¾à¦¯à¦¼à¦¾à¦° (à§¦.à§§à§«), à§ª) à¦¡à¦¿à¦­à¦¾à¦‡à¦¸ à¦“ à¦¸à¦¿à¦® à¦…à¦–à¦£à§à¦¡à¦¤à¦¾ (à§¦.à§§à§«), à§«) à¦®à¦¿à¦‰à¦² à¦—à§à¦°à¦¾à¦« à¦¸à§‡à¦¨à§à¦Ÿà§à¦°à¦¾à¦²à¦¿à¦Ÿà¦¿ (à§¦.à§§à§¦), à¦à¦¬à¦‚ à§¬) à¦¸à§à¦•à§à¦¯à¦¾à¦®à¦¶à¦¿à¦²à§à¦¡ à¦¡à§à¦°à§‡à¦œ (à§¦.à§§à§¦)à¥¤ à¦à¦‡ à§¬à¦Ÿà¦¿ à¦¸à§à¦•à§‹à¦°à§‡à¦° à¦¸à¦®à¦¨à§à¦¬à¦¯à¦¼à§‡ à§¦ à¦¥à§‡à¦•à§‡ à§§à§¦à§¦ à¦à¦° à¦®à¦§à§à¦¯à§‡ à¦®à§‹à¦Ÿ à¦°à¦¿à¦¸à§à¦• à¦¸à§à¦•à§‹à¦° à¦¤à§ˆà¦°à¦¿ à¦¹à¦¯à¦¼à¥¤',
    suggestedAction: { label: 'View SOC Radar Cockpit', view: 'OPERATOR' },
  },
  {
    id: 'dataset_info',
    category: 'ML_AI',
    keywords: ['dataset', 'data', 'transactions.csv', 'training', 'synthetic', 'features', 'rows', 'à¦¡à¦¾à¦Ÿà¦¾à¦¬à§‡à¦œ', 'à¦¡à¦¾à¦Ÿà¦¾'],
    questionExamples: ['What dataset is used for training?', 'Is the data real or synthetic?'],
    answerEn: 'The offline ML lab trains on dataset/transactions.csv, a high-fidelity synthetic dataset containing 8,000 transactions across 40 engineered features (circadian hour transforms, 10m/60m velocity bursts, IMEI hashes, IP ASN vs cellular division deltas). The dataset strictly contains 100% synthetic, non-PII data statistically modeled after Bangladesh MFS networks.',
    answerBn: 'à¦…à¦«à¦²à¦¾à¦‡à¦¨ à¦®à§‡à¦¶à¦¿à¦¨ à¦²à¦¾à¦°à§à¦¨à¦¿à¦‚ à¦²à§à¦¯à¦¾à¦¬ dataset/transactions.csv à¦«à¦¾à¦‡à¦²à§‡à¦° à¦“à¦ªà¦° à¦ªà§à¦°à¦¶à¦¿à¦•à§à¦·à¦¿à¦¤, à¦¯à¦¾à¦¤à§‡ à§ªà§¦à¦Ÿà¦¿ à¦­à¦¿à¦¨à§à¦¨ à¦«à¦¿à¦šà¦¾à¦°à§‡à¦° à§®,à§¦à§¦à§¦ à¦¸à¦¿à¦¨à§à¦¥à§‡à¦Ÿà¦¿à¦• à¦Ÿà§à¦°à¦¾à¦¨à¦œà§à¦¯à¦¾à¦•à¦¶à¦¨ à¦¡à¦¾à¦Ÿà¦¾ à¦°à¦¯à¦¼à§‡à¦›à§‡à¥¤ à¦à¦¤à§‡ à¦•à§‹à¦¨à§‹ à¦†à¦¸à¦² à¦¬à¦¾ à¦¬à§à¦¯à¦•à§à¦¤à¦¿à¦—à¦¤ à¦¤à¦¥à§à¦¯ (PII) à¦¨à§‡à¦‡, à¦à¦Ÿà¦¿ à¦¸à¦®à§à¦ªà§‚à¦°à§à¦£à¦°à§‚à¦ªà§‡ à¦•à§ƒà¦¤à§à¦°à¦¿à¦® à¦à¦¬à¦‚ à¦¬à¦¾à¦‚à¦²à¦¾à¦¦à§‡à¦¶à§‡à¦° à¦à¦®à¦à¦«à¦à¦¸ à¦¨à§‡à¦Ÿà¦“à¦¯à¦¼à¦¾à¦°à§à¦•à§‡à¦° à¦—à¦¾à¦£à¦¿à¦¤à¦¿à¦• à¦¬à§ˆà¦¶à¦¿à¦·à§à¦Ÿà§à¦¯à§‡à¦° à¦­à¦¿à¦¤à§à¦¤à¦¿à¦¤à§‡ à¦¤à§ˆà¦°à¦¿à¥¤',
  },
  {
    id: 'shap_explainability',
    category: 'ML_AI',
    keywords: ['shap', 'explainable', 'xai', 'interpretability', 'why', 'attribution', 'à¦¶à§‡à¦ª', 'à¦¬à§à¦¯à¦¾à¦–à§à¦¯à¦¾'],
    questionExamples: ['What is SHAP explainability?', 'Why was a transaction flagged?'],
    answerEn: 'SHAP (SHapley Additive exPlanations) provides game-theoretic feature attribution for every evaluation. Instead of a black box, TakaSafe breaks down the exact percentage contributions (e.g. +31% Circadian Off-Hour Spike, +24% Velocity Burst, +17% Device/SIM Mismatch). This empowers SOC analysts and regulators to verify why an action was taken.',
    answerBn: 'SHAP à¦¹à¦²à§‹ à¦à¦•à¦Ÿà¦¿ à¦—à¦¾à¦£à¦¿à¦¤à¦¿à¦• à¦¬à§à¦¯à¦¾à¦–à§à¦¯à¦¾ à¦ªà¦¦à§à¦§à¦¤à¦¿ à¦¯à¦¾ à¦ªà§à¦°à¦¤à¦¿à¦Ÿà¦¿ à¦¸à¦¿à¦¦à§à¦§à¦¾à¦¨à§à¦¤à§‡à¦° à¦ªà§‡à¦›à¦¨à§‡à¦° à¦¸à§à¦¨à¦¿à¦°à§à¦¦à¦¿à¦·à§à¦Ÿ à¦•à¦¾à¦°à¦£ à¦ªà§à¦°à¦•à¦¾à¦¶ à¦•à¦°à§‡à¥¤ à¦¯à§‡à¦®à¦¨: à¦°à¦¾à¦¤à§‡à¦° à¦…à¦¸à¦®à¦¯à¦¼à§‡ à¦²à§‡à¦¨à¦¦à§‡à¦¨à§‡à¦° à¦œà¦¨à§à¦¯ +à§©à§§%, à¦…à¦¤à¦¿à¦°à¦¿à¦•à§à¦¤ à¦¦à§à¦°à§à¦¤ à¦²à§‡à¦¨à¦¦à§‡à¦¨à§‡à¦° à¦œà¦¨à§à¦¯ +à§¨à§ª%, à¦à¦¬à¦‚ à¦¡à¦¿à¦­à¦¾à¦‡à¦¸ à¦ªà¦°à¦¿à¦¬à¦°à§à¦¤à¦¨à§‡à¦° à¦œà¦¨à§à¦¯ +à§§à§­% à¦°à¦¿à¦¸à§à¦• à¦¸à§à¦•à§‹à¦° à¦¬à§ƒà¦¦à§à¦§à¦¿ à¦ªà§‡à¦¯à¦¼à§‡à¦›à§‡à¥¤ à¦à¦Ÿà¦¿ à¦•à§‹à¦¨à§‹ à¦…à¦¨à§à¦§ à¦¬à§à¦²à§à¦¯à¦¾à¦•-à¦¬à¦•à§à¦¸ à¦¨à¦¯à¦¼, à¦¬à¦°à¦‚ à¦¶à¦¤à¦­à¦¾à¦— à¦¬à§à¦¯à¦¾à¦–à§à¦¯à¦¾à¦®à§‚à¦²à¦•à¥¤',
  },

  // 5. Policy Decision Tiers
  {
    id: 'policy_tiers',
    category: 'POLICY',
    keywords: ['policy', 'tiers', 'threshold', 'actions', 'low', 'medium', 'high', 'critical', 'rules', 'à¦ªà¦²à¦¿à¦¸à¦¿', 'à¦¸à§à¦¤à¦°', 'à¦ªà¦¦à¦•à§à¦·à§‡à¦ª'],
    questionExamples: ['What are the 4 policy decision tiers?', 'What happens when risk score is high?'],
    answerEn: 'TakaSafe maps risk scores (0â€“100) to 4 deterministic regulatory tiers: 1) LOW (0â€“30): Straight-Through Pass with instant settlement (< 8ms, 95.4% volume); 2) MEDIUM (31â€“60): Step-Up out-of-band SMS OTP or biometric verification; 3) HIGH (61â€“80): ScamShield 24-hour cooling-off delay; and 4) CRITICAL (81â€“100): Immediate wallet outflow freeze, node quarantine, and automated BFIU STR generation.',
    answerBn: 'TakaSafe à§ªà¦Ÿà¦¿ à¦°à§‡à¦—à§à¦²à§‡à¦Ÿà¦°à¦¿ à¦ªà¦²à¦¿à¦¸à¦¿ à¦¸à§à¦¤à¦°à§‡ à¦•à¦¾à¦œ à¦•à¦°à§‡: à§§) LOW (à§¦â€“à§©à§¦): à¦¤à¦¾à§Žà¦•à§à¦·à¦£à¦¿à¦• à¦²à§‡à¦¨à¦¦à§‡à¦¨ à¦…à¦¨à§à¦®à§‹à¦¦à¦¨ (à§¯à§«.à§ª% à¦Ÿà§à¦°à¦¾à¦¨à¦œà§à¦¯à¦¾à¦•à¦¶à¦¨ à¦à¦‡ à¦•à§à¦¯à¦¾à¦Ÿà¦¾à¦—à¦°à¦¿à¦¤à§‡ à¦ªà¦¡à¦¼à§‡); à§¨) MEDIUM (à§©à§§â€“à§¬à§¦): à¦“à¦Ÿà¦¿à¦ªà¦¿ à¦¬à¦¾ à¦¬à¦¾à¦¯à¦¼à§‹à¦®à§‡à¦Ÿà§à¦°à¦¿à¦• à¦­à§‡à¦°à¦¿à¦«à¦¿à¦•à§‡à¦¶à¦¨ à¦šà§à¦¯à¦¾à¦²à§‡à¦žà§à¦œ; à§©) HIGH (à§¬à§§â€“à§®à§¦): ScamShield à§¨à§ª à¦˜à¦£à§à¦Ÿà¦¾à¦° à¦•à§à¦²à¦¿à¦‚-à¦…à¦« à¦¸à¦®à¦¯à¦¼; à¦à¦¬à¦‚ à§ª) CRITICAL (à§®à§§â€“à§§à§¦à§¦): à¦¤à¦¾à§Žà¦•à§à¦·à¦£à¦¿à¦• à¦…à§à¦¯à¦¾à¦•à¦¾à¦‰à¦¨à§à¦Ÿ à¦²à¦•, à¦®à¦¿à¦‰à¦² à¦•à§‹à¦¯à¦¼à¦¾à¦°à§‡à¦¨à§à¦Ÿà¦¾à¦‡à¦¨ à¦à¦¬à¦‚ à¦¬à¦¿à¦à¦«à¦†à¦‡à¦‡à¦‰ à¦°à¦¿à¦ªà§‹à¦°à§à¦Ÿ à¦¤à§ˆà¦°à¦¿à¥¤',
  },

  // 6. Disaster Resilience
  {
    id: 'disaster_mode',
    category: 'DISASTER',
    keywords: ['disaster', 'cyclone', 'remal', 'flood', 'coastal', 'barishal', 'patuakhali', 'float', 'armored', 'cash depletion', 'à¦¦à§à¦°à§à¦¯à§‹à¦—', 'à¦˜à§‚à¦°à§à¦£à¦¿à¦à¦¡à¦¼', 'à¦°à¦¿à¦®à§‡à¦²', 'à¦¬à¦¨à§à¦¯à¦¾', 'à¦•à§à¦¯à¦¾à¦¶ à¦¸à¦‚à¦•à¦Ÿ'],
    questionExamples: ['What is Disaster Resilience mode?', 'How does cash float logistics work during a cyclone?'],
    answerEn: 'Disaster Mode models severe climate shocks (such as Cyclone Remal in coastal Barishal and Patuakhali). It forecasts rural agent cash depletion 24 to 48 hours in advance and automates armored distributor vehicle route dispatch, ensuring vital cash-out liquidity remains available for families receiving humanitarian relief.',
    answerBn: 'à¦¦à§à¦°à§à¦¯à§‹à¦— à¦®à§‹à¦¡ à¦‰à¦ªà¦•à§‚à¦²à§€à¦¯à¦¼ à¦…à¦žà§à¦šà¦²à§‡ à¦˜à§‚à¦°à§à¦£à¦¿à¦à¦¡à¦¼ (à¦¯à§‡à¦®à¦¨ à¦°à¦¿à¦®à§‡à¦²) à¦¬à¦¾ à¦¬à¦¨à§à¦¯à¦¾à¦° à¦¸à¦®à¦¯à¦¼ à¦à¦œà§‡à¦¨à§à¦Ÿ à¦ªà¦¯à¦¼à§‡à¦¨à§à¦Ÿà¦—à§à¦²à§‹à¦¤à§‡ à¦¨à¦—à¦¦ à¦Ÿà¦¾à¦•à¦¾à¦° à¦¸à¦‚à¦•à¦Ÿ à¦ªà§‚à¦°à§à¦¬à¦¾à¦­à¦¾à¦¸ à¦•à¦°à§‡à¥¤ à¦à¦Ÿà¦¿ à§¨à§ª à¦¥à§‡à¦•à§‡ à§ªà§® à¦˜à¦£à§à¦Ÿà¦¾ à¦†à¦—à§‡à¦‡ à¦•à§à¦¯à¦¾à¦¶ à¦¶à§‡à¦· à¦¹à¦“à¦¯à¦¼à¦¾à¦° à¦à§à¦à¦•à¦¿ à¦šà¦¿à¦¹à§à¦¨à¦¿à¦¤ à¦•à¦°à§‡ à¦¸à§à¦¬à¦¯à¦¼à¦‚à¦•à§à¦°à¦¿à¦¯à¦¼à¦­à¦¾à¦¬à§‡ à¦¸à¦¾à¦à¦œà§‹à¦¯à¦¼à¦¾ à¦¬à¦¾à¦¹à¦¨ (Armored Vehicle) à¦¦à¦¿à¦¯à¦¼à§‡ à¦¨à¦—à¦¦ à¦•à§à¦¯à¦¾à¦¶ à¦ªà§Œà¦à¦›à§‡ à¦¦à§‡à¦“à¦¯à¦¼à¦¾à¦° à¦°à§à¦Ÿ à¦ªà§à¦²à§à¦¯à¦¾à¦¨ à¦¤à§ˆà¦°à¦¿ à¦•à¦°à§‡à¥¤',
    suggestedAction: { label: 'View 8-Division Disaster Map', view: 'OPERATOR' },
  },

  // 7. BFIU Regulatory STR
  {
    id: 'bfiu_compliance',
    category: 'BFIU',
    keywords: ['bfiu', 'str', 'form 2', 'compliance', 'bangladesh bank', 'aml', 'amla', 'section 19', 'audit', 'ledger', 'à¦¬à¦¿à¦à¦«à¦†à¦‡à¦‡à¦‰', 'à¦à¦¸à¦Ÿà¦¿à¦†à¦°', 'à¦¬à¦¾à¦‚à¦²à¦¾à¦¦à§‡à¦¶ à¦¬à§à¦¯à¦¾à¦‚à¦•', 'à¦†à¦‡à¦¨'],
    questionExamples: ['What is BFIU STR compliance?', 'How does Form 2 STR generation work?'],
    answerEn: 'Under Section 19 of Bangladesh Anti-Money Laundering Act, 2012, MFS operators are legally required to file Suspicious Transaction Reports (STR). TakaSafe automatically populates official BFIU Form 2 STR dossiers from mathematical SHAP attributions, provides electronic AML officer sign-off, and logs immutable SHA-256 records into the audit ledger.',
    answerBn: 'à¦®à¦¾à¦¨à¦¿ à¦²à¦¨à§à¦¡à¦¾à¦°à¦¿à¦‚ à¦ªà§à¦°à¦¤à¦¿à¦°à§‹à¦§ à¦†à¦‡à¦¨, à§¨à§¦à§§à§¨-à¦à¦° à§§à§¯ à¦§à¦¾à¦°à¦¾ à¦…à¦¨à§à¦¯à¦¾à¦¯à¦¼à§€ à¦¸à¦¨à§à¦¦à§‡à¦¹à¦œà¦¨à¦• à¦²à§‡à¦¨à¦¦à§‡à¦¨ à¦¬à¦¾à¦‚à¦²à¦¾à¦¦à§‡à¦¶ à¦¬à§à¦¯à¦¾à¦‚à¦•à§‡à¦° BFIU-à¦¤à§‡ à¦°à¦¿à¦ªà§‹à¦°à§à¦Ÿ à¦•à¦°à¦¾ à¦¬à¦¾à¦§à§à¦¯à¦¤à¦¾à¦®à§‚à¦²à¦•à¥¤ TakaSafe à¦à¦†à¦‡ à¦¸à§à¦¬à¦¯à¦¼à¦‚à¦•à§à¦°à¦¿à¦¯à¦¼à¦­à¦¾à¦¬à§‡ à¦†à¦¨à§à¦·à§à¦ à¦¾à¦¨à¦¿à¦• "Form 2 STR" à¦°à¦¿à¦ªà§‹à¦°à§à¦Ÿ à¦¤à§ˆà¦°à¦¿ à¦•à¦°à§‡, à¦…à¦¨à§à¦®à§‹à¦¦à¦¿à¦¤ à¦•à¦°à§à¦®à¦•à¦°à§à¦¤à¦¾à¦° à¦¡à¦¿à¦œà¦¿à¦Ÿà¦¾à¦² à¦¸à§à¦¬à¦¾à¦•à§à¦·à¦°à§‡à¦° à¦¸à§à¦¬à¦¿à¦§à¦¾ à¦¦à§‡à¦¯à¦¼ à¦à¦¬à¦‚ à¦•à§à¦°à¦¿à¦ªà§à¦Ÿà§‹à¦—à§à¦°à¦¾à¦«à¦¿à¦• à¦²à§‡à¦œà¦¾à¦°à§‡ à¦…à¦¡à¦¿à¦Ÿ à¦Ÿà§à¦°à§‡à¦‡à¦² à¦¸à¦‚à¦°à¦•à§à¦·à¦£ à¦•à¦°à§‡à¥¤',
  },

  // 8. SLA & Performance
  {
    id: 'sla_latency',
    category: 'SLA',
    keywords: ['sla', 'latency', 'speed', 'performance', 'real-time', 'fast', 'ms', 'millisecond', 'à¦—à¦¤à¦¿', 'à¦¸à¦®à¦¯à¦¼'],
    questionExamples: ['What is the latency SLA?', 'How fast is the evaluation pipeline?'],
    answerEn: 'The entire TakaSafe multi-modal evaluation pipeline runs with an end-to-end SLA of < 18.0 milliseconds: ~2.1ms ingress perimeter, ~3.4ms feature store sliding windows, ~5.8ms parallel scoring ensemble, and ~1.9ms deterministic policy routing. Benign transactions settle with zero perceptible customer friction.',
    answerBn: 'TakaSafe-à¦à¦° à¦¸à¦®à§à¦ªà§‚à¦°à§à¦£ à¦ªà¦¾à¦‡à¦ªà¦²à¦¾à¦‡à¦¨ à§§à§® à¦®à¦¿à¦²à¦¿à¦¸à§‡à¦•à§‡à¦¨à§à¦¡à§‡à¦° à¦•à¦® à¦¸à¦®à¦¯à¦¼à§‡ à¦ªà§à¦°à¦¤à¦¿à¦Ÿà¦¿ à¦²à§‡à¦¨à¦¦à§‡à¦¨ à¦®à§‚à¦²à§à¦¯à¦¾à¦¯à¦¼à¦¨ à¦•à¦°à§‡: à¦‡à¦¨à¦—à§à¦°à§‡à¦¸ à¦—à§‡à¦Ÿà¦“à¦¯à¦¼à§‡à¦¤à§‡ ~à§¨.à§§ms, à¦«à¦¿à¦šà¦¾à¦° à¦¸à§à¦Ÿà§‹à¦°à§‡ ~à§©.à§ªms, à¦à¦†à¦‡ à¦®à¦¡à§‡à¦²à§‡ ~à§«.à§®ms à¦à¦¬à¦‚ à¦ªà¦²à¦¿à¦¸à¦¿ à¦°à§‡à¦œà§‹à¦²à¦¿à¦‰à¦¶à¦¨à§‡ ~à§§.à§¯msà¥¤ à¦«à¦²à§‡ à¦¸à§à¦¬à¦¾à¦­à¦¾à¦¬à¦¿à¦• à¦—à§à¦°à¦¾à¦¹à¦•à¦¦à§‡à¦° à¦²à§‡à¦¨à¦¦à§‡à¦¨à§‡ à¦•à§‹à¦¨à§‹ à¦¬à¦¿à¦²à¦®à§à¦¬ à¦¬à¦¾ à¦…à¦¸à§à¦¬à¦¿à¦§à¦¾ à¦¹à¦¯à¦¼ à¦¨à¦¾à¥¤',
  },

  // 9. Products, Centurion Card & ATM
  {
    id: 'centurion_card',
    category: 'PRODUCTS',
    keywords: ['centurion', 'card', 'sovereign', 'platinum', 'prepaid', 'à¦•à¦¾à¦°à§à¦¡', 'à¦¸à§‡à¦¨à§à¦Ÿà§à¦°à¦¿à¦¯à¦¼à¦¨'],
    questionExamples: ['What is the Sovereign Centurion Card?'],
    answerEn: 'The TakaSafe Sovereign Centurion Card is an ultra-secure dual-currency digital prepaid card integrated directly with the customer MFS balance. It includes dynamic CVV protection, ScamShield automated payment delay, and instant card freeze toggles.',
    answerBn: 'TakaSafe à¦¸à¦­à¦°à¦¿à¦¨ à¦¸à§‡à¦¨à§à¦Ÿà§à¦°à¦¿à¦¯à¦¼à¦¨ à¦•à¦¾à¦°à§à¦¡ à¦¹à¦²à§‹ à¦à¦•à¦Ÿà¦¿ à¦¡à§à¦¯à¦¼à¦¾à¦²-à¦•à¦¾à¦°à§‡à¦¨à§à¦¸à¦¿ à¦¡à¦¿à¦œà¦¿à¦Ÿà¦¾à¦² à¦ªà§à¦°à¦¿à¦ªà§‡à¦‡à¦¡ à¦•à¦¾à¦°à§à¦¡, à¦¯à¦¾ à¦¸à¦°à¦¾à¦¸à¦°à¦¿ à¦à¦®à¦à¦«à¦à¦¸ à¦¬à§à¦¯à¦¾à¦²à§‡à¦¨à§à¦¸à§‡à¦° à¦¸à¦¾à¦¥à§‡ à¦¸à¦‚à¦¯à§à¦•à§à¦¤à¥¤ à¦à¦¤à§‡ à¦°à¦¯à¦¼à§‡à¦›à§‡ à¦¡à¦¾à¦¯à¦¼à¦¨à¦¾à¦®à¦¿à¦• à¦¸à¦¿à¦­à¦¿à¦­à¦¿ à¦¸à§à¦°à¦•à§à¦·à¦¾, à¦¤à¦¾à§Žà¦•à§à¦·à¦£à¦¿à¦• à¦•à¦¾à¦°à§à¦¡ à¦²à¦• à¦à¦¬à¦‚ ScamShield à¦ªà§à¦°à¦Ÿà§‡à¦•à¦¶à¦¨à¥¤',
    suggestedAction: { label: 'View Centurion Card in App', view: 'CUSTOMER' },
  },
  {
    id: 'atm_cashout_charges',
    category: 'PRODUCTS',
    keywords: ['atm', 'cash out', 'charge', 'fee', 'free', 'cost', 'à¦–à¦°à¦š', 'à¦•à§à¦¯à¦¾à¦¶ à¦†à¦‰à¦Ÿ', 'à¦šà¦¾à¦°à§à¦œ', 'à¦«à§à¦°à¦¿'],
    questionExamples: ['What is the cash-out fee at ATMs?', 'Are there any hidden charges?'],
    answerEn: 'Cash-out from any affiliated TakaSafe / upay ATM booth nationwide is 100% FREE (à§³0 fee) with zero hidden deductions. Standard agent counter cash-outs follow the transparent rate of à§³14 per à§³1,000.',
    answerBn: 'à¦¦à§‡à¦¶à¦¬à§à¦¯à¦¾à¦ªà§€ à¦¯à§‡à¦•à§‹à¦¨à§‹ à¦…à¦¨à§à¦®à§‹à¦¦à¦¿à¦¤ à¦à¦Ÿà¦¿à¦à¦® à¦¬à§à¦¥ à¦¥à§‡à¦•à§‡ à¦•à§à¦¯à¦¾à¦¶ à¦†à¦‰à¦Ÿ à¦¸à¦®à§à¦ªà§‚à¦°à§à¦£ à¦¬à¦¿à¦¨à¦¾à¦®à§‚à¦²à§à¦¯à§‡ (à§¦ à¦Ÿà¦¾à¦•à¦¾ à¦šà¦¾à¦°à§à¦œ)! à¦à¦œà§‡à¦¨à§à¦Ÿ à¦ªà¦¯à¦¼à§‡à¦¨à§à¦Ÿ à¦¥à§‡à¦•à§‡ à¦•à§à¦¯à¦¾à¦¶ à¦†à¦‰à¦Ÿà§‡à¦° à¦•à§à¦·à§‡à¦¤à§à¦°à§‡ à¦ªà§à¦°à¦¤à¦¿ à¦¹à¦¾à¦œà¦¾à¦°à§‡ à¦¨à¦¿à¦°à§à¦§à¦¾à¦°à¦¿à¦¤ à¦®à¦¾à¦¤à§à¦° à§§à§ª à¦Ÿà¦¾à¦•à¦¾ à¦šà¦¾à¦°à§à¦œ à¦ªà§à¦°à¦¯à§‹à¦œà§à¦¯à¥¤',
  },
  {
    id: 'ussd_gateway',
    category: 'PRODUCTS',
    keywords: ['ussd', '*268#', 'feature phone', 'offline', 'à¦‡à¦‰à¦à¦¸à¦à¦¸à¦¡à¦¿', 'à¦¬à¦¾à¦Ÿà¦¨ à¦«à§‹à¦¨'],
    questionExamples: ['Can TakaSafe work on feature phones without internet?', 'What is the USSD code?'],
    answerEn: 'Yes! TakaSafe fully supports offline feature phones via the *268# USSD gateway. The backend evaluates USSD session packets with the same < 18ms AI risk engine, protecting rural non-smartphone users equally against coercion and fraud.',
    answerBn: 'à¦¹à§à¦¯à¦¾à¦! à¦¸à¦¾à¦§à¦¾à¦°à¦£ à¦¬à¦¾à¦Ÿà¦¨ à¦«à§‹à¦¨à§‡à¦° à¦—à§à¦°à¦¾à¦¹à¦•à¦¦à§‡à¦° à¦œà¦¨à§à¦¯ à¦°à¦¯à¦¼à§‡à¦›à§‡ *268# USSD à¦—à§‡à¦Ÿà¦“à¦¯à¦¼à§‡à¥¤ à¦‡à¦¨à§à¦Ÿà¦¾à¦°à¦¨à§‡à¦Ÿ à¦›à¦¾à¦¡à¦¼à¦¾à¦‡ à¦¯à§‡à¦•à§‹à¦¨à§‹ à¦¸à¦¾à¦§à¦¾à¦°à¦£ à¦«à§‹à¦¨à§‡ à¦²à§‡à¦¨à¦¦à§‡à¦¨ à¦•à¦°à¦¾à¦° à¦¸à¦®à¦¯à¦¼à¦“ TakaSafe à¦¬à§à¦¯à¦¾à¦•à¦à¦¨à§à¦¡ à¦¸à¦®à¦¾à¦¨à¦­à¦¾à¦¬à§‡ à§§à§® à¦®à¦¿à¦²à¦¿à¦¸à§‡à¦•à§‡à¦¨à§à¦¡à§‡ à¦¸à§à¦°à¦•à§à¦·à¦¾ à¦¨à¦¿à¦¶à§à¦šà¦¿à¦¤ à¦•à¦°à§‡à¥¤',
  },

  // 10. Contact & Help
  {
    id: 'contact_info',
    category: 'CONTACT',
    keywords: ['contact', 'hotline', 'phone', 'call', 'helpline', 'email', 'support', 'help', 'à¦¯à§‹à¦—à¦¾à¦¯à§‹à¦—', 'à¦«à§‹à¦¨', 'à¦¹à§‡à¦²à§à¦ªà¦²à¦¾à¦‡à¦¨', 'à¦ à¦¿à¦•à¦¾à¦¨à¦¾'],
    questionExamples: ['How do I contact customer support?', 'What is the helpline number?'],
    answerEn: 'You can reach TakaSafe 24/7 Customer Care by dialing 16268 or 09610916268. You can also email us at customerservice@takasafe.com (Customer Support) or info@takasafe.com (General Inquiries). Our Gulshan Flagship Center is located at Plot CWS (A)-1, Road 34, Gulshan Avenue, Dhaka-1212.',
    answerBn: 'à¦¯à§‡à¦•à§‹à¦¨à§‹ à¦¸à¦®à¦¯à¦¼ à¦†à¦®à¦¾à¦¦à§‡à¦° à§¨à§ª/à§­ à¦•à¦¾à¦¸à§à¦Ÿà¦®à¦¾à¦° à¦¸à¦¾à¦°à§à¦­à¦¿à¦¸à§‡à¦° à¦œà¦¨à§à¦¯ à¦¡à¦¾à¦¯à¦¼à¦¾à¦² à¦•à¦°à§à¦¨ à§§à§¬à§¨à§¬à§® à¦…à¦¥à¦¬à¦¾ à§¦à§¯à§¬à§§à§¦à§¯à§§à§¬à§¨à§¬à§® à¦¨à¦®à§à¦¬à¦°à§‡à¥¤ à¦‡à¦®à§‡à¦‡à¦² à¦•à¦°à¦¤à§‡ à¦ªà¦¾à¦°à§‡à¦¨ customerservice@takasafe.com à¦ à¦¿à¦•à¦¾à¦¨à¦¾à¦¯à¦¼à¥¤ à¦†à¦®à¦¾à¦¦à§‡à¦° à¦—à§à¦²à¦¶à¦¾à¦¨ à¦ªà§à¦°à¦§à¦¾à¦¨ à¦ªà¦¯à¦¼à§‡à¦¨à§à¦Ÿ: à¦ªà§à¦²à¦Ÿ à¦¸à¦¿à¦¡à¦¬à§à¦²à¦¿à¦‰à¦à¦¸ (à¦)-à§§, à¦°à§‹à¦¡ à§©à§ª, à¦—à§à¦²à¦¶à¦¾à¦¨ à¦à¦­à¦¿à¦¨à¦¿à¦‰, à¦¢à¦¾à¦•à¦¾-à§§à§¨à§§à§¨à¥¤',
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
        ? 'à¦†à¦¸à¦¸à¦¾à¦²à¦¾à¦®à§ à¦†à¦²à¦¾à¦‡à¦•à§à¦®! à¦†à¦®à¦¿ TakaSafe à¦à¦†à¦‡ à¦¸à¦¹à¦•à¦¾à¦°à§€à¥¤ à¦†à¦®à¦¿ à¦†à¦ªà¦¨à¦¾à¦•à§‡ à¦«à§à¦°à¦¡ à¦ªà§à¦°à¦¤à¦¿à¦°à§‹à¦§, ScamShield, à¦®à¦¿à¦‰à¦² à¦¸à¦¿à¦¨à§à¦¡à¦¿à¦•à§‡à¦Ÿ, à¦à¦Ÿà¦¿à¦à¦® à¦•à§à¦¯à¦¾à¦¶à¦†à¦‰à¦Ÿ, à¦…à¦¥à¦¬à¦¾ à¦°à§‡à¦—à§à¦²à§‡à¦Ÿà¦°à¦¿ à¦ªà¦²à¦¿à¦¸à¦¿ à¦¸à¦®à§à¦ªà¦°à§à¦•à§‡ à¦¬à¦¿à¦¸à§à¦¤à¦¾à¦°à¦¿à¦¤ à¦¤à¦¥à§à¦¯ à¦¦à¦¿à¦¤à§‡ à¦ªà¦¾à¦°à¦¿à¥¤ à¦†à¦ªà¦¨à¦¾à¦° à¦ªà§à¦°à¦¶à§à¦¨à¦Ÿà¦¿ à¦²à¦¿à¦–à§à¦¨!'
        : 'Hello! I am your TakaSafe Digital AI Assistant. I can answer any questions about our multi-modal fraud detection, ScamShield, MuleVision graph, ATM cash-out, or BFIU compliance. What would you like to know?',
      relatedTopics: ['ðŸ›¡ï¸ ScamShield 24h Delay', 'âš¡ < 18ms SLA Speed', 'ðŸ•¸ï¸ MuleVision GNN Graph', 'ðŸ’³ Centurion Card'],
    };
  }

  if (query.match(/^(thank|thanks|dhonnobad|dhonnobaad|thx|great|awesome)$/i)) {
    return {
      confidence: 1.0,
      answer: lang === 'BN'
        ? 'à¦†à¦ªà¦¨à¦¾à¦•à§‡ à¦¸à§à¦¬à¦¾à¦—à¦¤à¦®! TakaSafe à¦¸à¦¬ à¦¸à¦®à¦¯à¦¼ à¦†à¦ªà¦¨à¦¾à¦° à¦†à¦°à§à¦¥à¦¿à¦• à¦¨à¦¿à¦°à¦¾à¦ªà¦¤à§à¦¤à¦¾à¦¯à¦¼ à¦¨à¦¿à¦¯à¦¼à§‹à¦œà¦¿à¦¤à¥¤ à¦…à¦¨à§à¦¯ à¦•à§‹à¦¨à§‹ à¦¤à¦¥à§à¦¯ à¦œà¦¾à¦¨à¦¾à¦° à¦¥à¦¾à¦•à¦²à§‡ à¦¨à¦¿à¦°à§à¦¦à§à¦¬à¦¿à¦§à¦¾à¦¯à¦¼ à¦œà¦¿à¦œà§à¦žà¦¾à¦¸à¦¾ à¦•à¦°à§à¦¨à¥¤'
        : 'You are most welcome! TakaSafe is always dedicated to securing your financial transactions. Feel free to ask anything else!',
      relatedTopics: ['ðŸ›¡ï¸ ScamShield', 'ðŸŒŠ Disaster Float Mode', 'ðŸ“‹ BFIU Form 2 STR'],
    };
  }

  // Tokenize user query
  const queryTokens = query
    .replace(/[?.,!/\\()-_#*]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);

  let bestMatch: KnowledgeItem | null = null;
  let highestScore = 0;
  let secondHighestScore = 0;

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
      secondHighestScore = highestScore;
      highestScore = score;
      bestMatch = item;
    } else if (score > secondHighestScore) {
      secondHighestScore = score;
    }
  }

  // If we found a confident match
  if (bestMatch && highestScore >= 6 && highestScore - secondHighestScore >= 2) {
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

  // When the FAQ match is weak or ambiguous, ask for clarification instead of guessing.
  return {
    confidence: 0,
    answer: lang === 'BN'
      ? 'দুঃখিত, প্রশ্নটি বুঝতে পারিনি। TakaSafe-এর নির্দিষ্ট কোনো সুবিধা বা নীতি সম্পর্কে জিজ্ঞাসা করুন, অথবা প্রশ্নটি আরেকভাবে লিখুন।'
      : 'I’m not sure I understood. Ask about a specific TakaSafe feature or policy, or rephrase your question so I can give you a reliable answer.',
    relatedTopics: [
      lang === 'BN' ? 'ScamShield à¦•à§€à¦­à¦¾à¦¬à§‡ à¦•à¦¾à¦œ à¦•à¦°à§‡?' : 'How does ScamShield work?',
      lang === 'BN' ? 'à§§à§® à¦®à¦¿à¦²à¦¿à¦¸à§‡à¦•à§‡à¦¨à§à¦¡ SLA à¦•à§€?' : 'What is the < 18ms SLA?',
      lang === 'BN' ? 'à¦®à¦¿à¦‰à¦² à¦¸à¦¿à¦¨à§à¦¡à¦¿à¦•à§‡à¦Ÿ à¦—à§à¦°à¦¾à¦« à¦•à§€?' : 'What is MuleVision Graph?',
      lang === 'BN' ? 'à¦à¦Ÿà¦¿à¦à¦® à¦•à§à¦¯à¦¾à¦¶à¦†à¦‰à¦Ÿ à¦šà¦¾à¦°à§à¦œ à¦•à¦¤?' : 'Is ATM cash-out free?',
    ],
  };
}


