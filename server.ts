import express, { Request, Response } from 'express';
import path from 'path';
import { promises as fs } from 'node:fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const customerTransactionsCsv = path.resolve(process.cwd(), 'dataset', 'customer_transactions.csv');
const customerLoginsCsv = path.resolve(process.cwd(), 'dataset', 'customer_logins.csv');
const customerTransactionHeaders = ['user_id', 'wallet', 'amount', 'recipient', 'timestamp', 'reference', 'status', 'risk_score'];
const toCsvCell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
const parseCsvLine = (line: string): string[] => {
  const cells: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"' && quoted && line[i + 1] === '"') { cell += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { cells.push(cell); cell = ''; }
    else cell += char;
  }
  cells.push(cell);
  return cells;
};

app.get('/api/customer-logins/:userId', async (req: Request, res: Response) => {
  const userId = String(req.params.userId || '').trim();
  if (!userId || userId.length > 64) return res.status(400).json({ error: 'Invalid user ID' });
  try {
    const csv = await fs.readFile(customerLoginsCsv, 'utf8').catch((error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') return '';
      throw error;
    });
    const lines = csv.split(/\r?\n/).filter(Boolean);
    const headers = lines.length ? parseCsvLine(lines.shift()!) : ['user_id', 'wallet', 'timestamp'];
    const logins = lines.map(parseCsvLine).map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] || ''])))
      .filter((row) => row.user_id === userId)
      .map((row) => ({ timestamp: row.timestamp }));
    res.json({ success: true, logins });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/customer-logins/:userId', async (req: Request, res: Response) => {
  const userId = String(req.params.userId || '').trim();
  const { wallet, timestamp } = req.body || {};
  const date = new Date(timestamp);
  if (!userId || userId.length > 64 || typeof wallet !== 'string' || !wallet.trim() || wallet.length > 64 || !Number.isFinite(date.getTime())) {
    return res.status(400).json({ error: 'Invalid customer login record' });
  }
  try {
    await fs.mkdir(path.dirname(customerLoginsCsv), { recursive: true });
    let needsHeader = false;
    try { needsHeader = (await fs.stat(customerLoginsCsv)).size === 0; }
    catch (error: any) { if (error.code === 'ENOENT') needsHeader = true; else throw error; }
    const headers = ['user_id', 'wallet', 'timestamp'];
    const values = [userId, wallet.trim(), date.toISOString()];
    await fs.appendFile(customerLoginsCsv, `${needsHeader ? `${headers.join(',')}\r\n` : ''}${values.map(toCsvCell).join(',')}\r\n`, 'utf8');
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/customer-history/:wallet', async (req: Request, res: Response) => {
  const wallet = String(req.params.wallet || '').trim();
  if (!wallet || wallet.length > 64) return res.status(400).json({ error: 'Invalid wallet' });
  try {
    const csv = await fs.readFile(customerTransactionsCsv, 'utf8').catch((error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') return '';
      throw error;
    });
    const lines = csv.split(/\r?\n/).filter(Boolean);
    const headers = lines.length ? parseCsvLine(lines.shift()!) : customerTransactionHeaders;
    const rows = lines.map(parseCsvLine).map((cells) => {
      const row = Object.fromEntries(headers.map((header, index) => [header, cells[index] || '']));
      // Older CSV rows predate user IDs, so preserve their wallet as the legacy owner key.
      const ownerId = row.user_id || row.wallet;
      if (ownerId !== wallet) return null;
      return {
        amount: Number(row.amount), recipient: row.recipient, timestamp: row.timestamp,
        reference: row.reference, status: row.status, riskScore: Number(row.risk_score) || 0,
      };
    }).filter(Boolean);
    res.json({ success: true, history: rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/customer-history/:wallet', async (req: Request, res: Response) => {
  const wallet = String(req.params.wallet || '').trim();
  const { wallet: customerWallet, amount, recipient, timestamp, reference = '', status = 'COMPLETED', riskScore = 0 } = req.body || {};
  const date = new Date(timestamp);
  if (!wallet || wallet.length > 64 || typeof customerWallet !== 'string' || !customerWallet.trim() || customerWallet.length > 64 || !Number.isFinite(Number(amount)) || Number(amount) <= 0 ||
      typeof recipient !== 'string' || !recipient.trim() || recipient.length > 128 || !Number.isFinite(date.getTime()) ||
      typeof reference !== 'string' || reference.length > 256 || !['COMPLETED', 'PROCEEDED'].includes(status) ||
      !Number.isFinite(Number(riskScore))) {
    return res.status(400).json({ error: 'Invalid customer transaction record' });
  }
  try {
    await fs.mkdir(path.dirname(customerTransactionsCsv), { recursive: true });
    let needsHeader = false;
    try {
      if ((await fs.stat(customerTransactionsCsv)).size === 0) needsHeader = true;
      else {
        const existing = await fs.readFile(customerTransactionsCsv, 'utf8');
        const [headerLine, ...oldLines] = existing.split(/\r?\n/).filter(Boolean);
        const oldHeaders = parseCsvLine(headerLine);
        if (!oldHeaders.includes('user_id')) {
          const migrated = oldLines.map((line) => {
            const oldCells = parseCsvLine(line);
            const oldRow = Object.fromEntries(oldHeaders.map((header, index) => [header, oldCells[index] || '']));
            return [oldRow.wallet, oldRow.wallet, oldRow.amount, oldRow.recipient, oldRow.timestamp, oldRow.reference, oldRow.status, oldRow.risk_score]
              .map(toCsvCell).join(',');
          });
          await fs.writeFile(customerTransactionsCsv, `${customerTransactionHeaders.join(',')}\r\n${migrated.join('\r\n')}${migrated.length ? '\r\n' : ''}`, 'utf8');
        }
      }
    } catch (error: any) { if (error.code === 'ENOENT') needsHeader = true; else throw error; }
    const values = [wallet, customerWallet.trim(), Number(amount), recipient.trim(), date.toISOString(), reference, status, Math.max(0, Math.min(100, Number(riskScore)))];
    const content = `${needsHeader ? `${customerTransactionHeaders.join(',')}\r\n` : ''}${values.map(toCsvCell).join(',')}\r\n`;
    await fs.appendFile(customerTransactionsCsv, content, 'utf8');
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// In-Memory Audit Logs Store (seeded with initial baseline audit trail)
interface AuditLogEntry {
  id: string;
  timestamp: string;
  analyst: string;
  caseId: string;
  entityType: 'TRANSACTION' | 'AGENT' | 'NETWORK' | 'REGION';
  entityId: string;
  actionTaken: 'MONITOR' | 'ADDITIONAL_VERIFICATION' | 'HOLD_FOR_REVIEW' | 'FREEZE_WALLET' | 'DISPATCH_FLOAT' | 'ACTIVATE_MONITORING' | 'DISMISSED';
  riskScore: number;
  reason: string;
  notes: string;
}

const auditLogs: AuditLogEntry[] = [
  {
    id: 'AUD-9021',
    timestamp: '2026-10-01 09:42:15',
    analyst: 'Md. Tanvir Hasan (Chief Risk Analyst & AML Supervisor)',
    caseId: 'CASE-7718',
    entityType: 'TRANSACTION',
    entityId: 'TXN-99824',
    actionTaken: 'HOLD_FOR_REVIEW',
    riskScore: 78,
    reason: 'Velocity spike (5 transfers in 8 mins) to unverified wallet',
    notes: 'Triggered step-up SMS OTP and temporary 6-hour outbound hold.',
  },
  {
    id: 'AUD-9020',
    timestamp: '2026-10-01 08:15:30',
    analyst: 'Md. Tanvir Hasan (Chief Risk Analyst & AML Supervisor)',
    caseId: 'CASE-7704',
    entityType: 'NETWORK',
    entityId: 'Cluster-12',
    actionTaken: 'FREEZE_WALLET',
    riskScore: 92,
    reason: 'Rapid circular pass-through flow of BDT 850,000 across 6 wallets',
    notes: 'Frozen central aggregator wallet 01724-XXXXXX. Forwarded to AML Compliance.',
  },
  {
    id: 'AUD-9019',
    timestamp: '2026-10-01 07:30:00',
    analyst: 'Automated Action Engine',
    caseId: 'CASE-7699',
    entityType: 'AGENT',
    entityId: 'AGT-4402',
    actionTaken: 'DISPATCH_FLOAT',
    riskScore: 65,
    reason: 'Predicted cash-out float shortfall (-BDT 220,000) prior to market day',
    notes: 'Notified Regional Distributor for morning cash replenishment.',
  },
];

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'TakaSafe AI Financial Trust & Resilience Network',
    institution: 'Daffodil International University (DIU CPC × upay)',
    geminiConfigured: !!ai,
    timestamp: new Date().toISOString(),
  });
});

// Audit Logs APIs
app.get('/api/audit-logs', (req: Request, res: Response) => {
  res.json({ success: true, logs: auditLogs });
});

app.post('/api/audit-action', (req: Request, res: Response) => {
  try {
    const { analyst, caseId, entityType, entityId, actionTaken, riskScore, reason, notes } = req.body;
    
    if (!caseId || !actionTaken) {
      return res.status(400).json({ error: 'Missing required audit parameters' });
    }

    const newEntry: AuditLogEntry = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      analyst: analyst || 'Md. Tanvir Hasan (Chief Risk Analyst & AML Supervisor)',
      caseId,
      entityType: entityType || 'TRANSACTION',
      entityId: entityId || 'N/A',
      actionTaken,
      riskScore: riskScore || 50,
      reason: reason || 'Manual operator decision',
      notes: notes || 'Logged via TakaSafe human-in-the-loop action engine.',
    };

    auditLogs.unshift(newEntry);
    res.json({ success: true, entry: newEntry, totalLogs: auditLogs.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// AI Investigation Assistant endpoint (Explainable AI & Grounded LLM)
app.post('/api/investigate', async (req: Request, res: Response) => {
  try {
    const {
      caseId,
      transaction,
      customerProfile,
      shapBreakdown,
      muleCluster,
      anomalyFactors,
      regionalContext,
    } = req.body;

    const structuredEvidence = {
      caseId: caseId || 'CASE-2026-X',
      transaction: transaction || {
        amount: 80000,
        currency: 'BDT',
        sender: '01711-239481 (Rafiqul Islam)',
        recipient: '01988-510294 (Mule W302)',
        channel: 'TakaSafe App',
        time: '03:20 AM',
        location: 'Chittagong (Usual: Dhanmondi, Dhaka)',
        device: 'Infinix Hot 30 (New device ID #dev-8819)',
      },
      baselineProfile: customerProfile || {
        avgAmount: 1500,
        txnsPerDay: 4,
        typicalHours: '09:00 - 21:00',
        primaryLocation: 'Dhaka',
      },
      shapFeatures: shapBreakdown || [
        { feature: 'Transaction Amount (+53.3x baseline)', impact: '+31%', detail: 'BDT 80,000 vs avg BDT 1,500' },
        { feature: 'Transaction Velocity Spike', impact: '+24%', detail: '6 attempts within 15 minutes' },
        { feature: 'Unrecognized Device Fingerprint', impact: '+17%', detail: 'First login from device #dev-8819' },
        { feature: 'Circadian Time Anomaly', impact: '+12%', detail: 'Initiated at 03:20 AM (Customer sleep window)' },
        { feature: 'Geographic Jump Distance', impact: '+9%', detail: 'Location jump 245km from Dhaka to Chittagong' },
        { feature: 'Recipient Risk / Mule Association', impact: '+7%', detail: 'Connected to Suspicious Network #17' },
      ],
      muleRing: muleCluster || {
        clusterId: 'Suspicious Network #17',
        totalWallets: 12,
        totalTxns: 47,
        aggregateFlow: 'BDT 1,280,000',
        pattern: 'Rapid layering & circular pass-through to aggregator wallet W302',
      },
      fusedRiskScore: req.body.riskScore || 94,
      suggestedAction: 'Escalate + Enhanced Verification / Freeze outbound flow',
    };

    if (ai) {
      const prompt = `You are the lead explainable AI investigation engine for TakaSafe, an MFS fraud trust & resilience platform.
You MUST follow the responsible AI principle:
- ML models have already computed the risk score (${structuredEvidence.fusedRiskScore}/100) and SHAP attribution.
- The LLM does NOT decide whether something is fraud. Your job is purely to narrate the structured mathematical evidence into an executive, objective, and auditable case brief for a human fraud investigator.

Structured Case Evidence:
${JSON.stringify(structuredEvidence, null, 2)}

Provide a concise, highly professional case report in Markdown format with these exact sections:
1. Executive Summary (2 sentences stating what occurred and the fused risk score)
2. SHAP Attribution Narrative (Explain the top feature drivers in clear, factual terms)
3. Graph & Mule Network Context (Explain how recipient links to Suspicious Network #17)
4. Recommended Operator Action (Clear step-by-step next action following the Action Engine guidelines: Escalate + Enhanced Verification)
5. Audit & Compliance Note (Acknowledge that human authorization is mandatory before permanent blocking).`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        return res.json({
          success: true,
          report: response.text,
          evidence: structuredEvidence,
          engine: 'gemini-3.8-flash',
        });
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, generating deterministic fallback report:', geminiError.message);
      }
    }

    // High quality deterministic fallback report if API key not available or quota limit
    const fallbackReport = `### Executive Summary
At 03:20 AM, customer Rafiqul Islam (Wallet \`01711-239481\`) attempted an outbound transfer of **BDT 80,000** to wallet \`01988-510294\`. TakaSafe's Transaction Guardian and Behavioural Anomaly models classified this event as **Critical Risk (Score: ${structuredEvidence.fusedRiskScore}/100)** due to extreme deviation from the customer's historical baseline.

### SHAP Feature Attribution Breakdown
1. **Transaction Amount Anomaly (+31% contribution):** The requested amount of BDT 80,000 is 53.3× greater than the customer's 90-day average transaction size of BDT 1,500.
2. **Velocity Acceleration (+24% contribution):** 6 consecutive transfer attempts logged within an 8-minute window, indicating urgency typical of account takeover or coercive social engineering.
3. **Hardware Fingerprint Mismatch (+17% contribution):** Originating hardware (Infinix Hot 30, \`#dev-8819\`) has never previously transacted on this account.
4. **Off-Hours Circadian Deviation (+12% contribution):** The transaction occurred at 03:20 AM; 99.4% of historical activity occurs between 09:00 AM and 09:00 PM.
5. **Geographic Distance Jump (+9% contribution):** Geolocation IP places the device in Chittagong, while the regular billing and transacting base is Dhanmondi, Dhaka.
6. **Recipient Counterparty Risk (+7% contribution):** Recipient wallet \`01988-510294\` is indexed as node W302 within **Suspicious Network #17**.

### MuleVision Graph Intelligence Context
MuleVision graph analytics linked the recipient wallet to **Suspicious Network #17**, consisting of **12 wallets, 47 transactions, and BDT 1.28M total flow**. The network exhibits high-velocity fan-in, rapid circular pass-through, and immediate cash-out hops to rural agent points.

### Action Engine Recommendation
- **Immediate Status:** **Escalate + Enhanced Verification**
- **Action Step 1:** ScamShield has presented a pre-payment warning with 24-hour delay option to the customer.
- **Action Step 2:** Operator should enforce secondary biometric / interactive voice callback verification before float release.
- **Action Step 3:** If unverified within 15 minutes, freeze outbound routing on counterparty node W302 and notify Bangladesh Bank BFIU AML desk.

### Audit & Compliance Note
All predictions are probabilistic decision-support signals. Final freezing or blacklisting requires authorization by an authorized AML Officer.`;

    res.json({
      success: true,
      report: fallbackReport,
      evidence: structuredEvidence,
      engine: 'deterministic-rule-engine',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Setup Vite Middlewares in dev mode, or static file serving in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`TakaSafe Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
