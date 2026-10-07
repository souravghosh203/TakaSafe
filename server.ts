import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { promises as fs } from 'node:fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const require = createRequire(import.meta.url);
const { WebSocketServer, WebSocket } = require('ws') as {
  WebSocketServer: new (options: { server: ReturnType<typeof createServer>; path: string }) => any;
  WebSocket: { OPEN: number };
};
let liveWebSocketServer: any = null;
const eventClients = new Set<Response>();
let eventSequence = 0;
const recentEvents: Array<{ id: number; name: string; data: Record<string, unknown> }> = [];

const publishServerEvent = (name: string, data: Record<string, unknown>) => {
  const event = { id: ++eventSequence, name, data };
  recentEvents.push(event);
  if (recentEvents.length > 100) recentEvents.shift();
  const frame = `id: ${event.id}\nevent: ${name}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of eventClients) {
    try { client.write(frame); } catch { eventClients.delete(client); }
  }
};

const appendToRedisStream = async (event: Record<string, unknown>) => {
  const redisUrl = process.env.REDIS_STREAM_REST_URL?.replace(/\/+$/, '');
  const redisToken = process.env.REDIS_STREAM_REST_TOKEN;
  if (!redisUrl || !redisToken) return;
  const streamKey = process.env.REDIS_STREAM_KEY || 'takasafe:transactions';
  const serialized = JSON.stringify(event);
  try {
    const response = await fetch(`${redisUrl}/xadd/${encodeURIComponent(streamKey)}/*/event/${encodeURIComponent(serialized)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${redisToken}` },
      signal: AbortSignal.timeout(2500),
    });
    if (!response.ok) console.warn(`[Redis Streams] XADD failed: HTTP ${response.status}`);
  } catch (error) {
    console.warn('[Redis Streams] XADD unavailable:', error instanceof Error ? error.message : error);
  }
};

const publishLiveTransaction = (transaction: Record<string, unknown>) => {
  const event = { type: 'transaction', transaction, emittedAt: new Date().toISOString() };
  const payload = JSON.stringify(event);
  for (const client of liveWebSocketServer?.clients || []) {
    if (client.readyState === WebSocket.OPEN) client.send(payload);
  }
  void appendToRedisStream(event);
};

app.use(express.json({ limit: '2mb' }));

const customerTransactionsCsv = path.resolve(process.cwd(), 'dataset', 'customer_transactions.csv');
const customerLoginsCsv = path.resolve(process.cwd(), 'dataset', 'customer_logins.csv');
const alertFeedbackCsv = path.resolve(process.cwd(), 'dataset', 'alert_feedback.csv');
const customerTransactionHeaders = ['user_id', 'wallet', 'amount', 'recipient', 'timestamp', 'reference', 'status', 'risk_score', 'service_type', 'direction', 'fee'];
const customerTransactionThreatHeaders = [...customerTransactionHeaders, 'is_threat', 'suspicious_reason', 'device'];
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
    const headers = lines.length ? parseCsvLine(lines.shift()!) : ['user_id', 'wallet', 'timestamp', 'device'];
    const logins = lines.map(parseCsvLine).map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] || ''])))
      .filter((row) => row.user_id === userId)
      .map((row) => ({ timestamp: row.timestamp, device: row.device || '' }));
    res.json({ success: true, logins });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/customer-logins/:userId', async (req: Request, res: Response) => {
  const userId = String(req.params.userId || '').trim();
  const { wallet, timestamp, device = '' } = req.body || {};
  const date = new Date(timestamp);
  if (!userId || userId.length > 64 || typeof wallet !== 'string' || !wallet.trim() || wallet.length > 64 || !Number.isFinite(date.getTime()) || typeof device !== 'string' || device.length > 512) {
    return res.status(400).json({ error: 'Invalid customer login record' });
  }
  try {
    let alert: Record<string, unknown> | null = null;
    const txnCsv = await fs.readFile(customerTransactionsCsv, 'utf8').catch((error: NodeJS.ErrnoException) => error.code === 'ENOENT' ? '' : Promise.reject(error));
    const txnLines = txnCsv.split(/\r?\n/).filter(Boolean);
    if (txnLines.length > 1) {
      const txnHeaders = parseCsvLine(txnLines.shift()!);
      const records = txnLines.map((line) => { const cells = parseCsvLine(line); return Object.fromEntries(txnHeaders.map((header, index) => [header, cells[index] || ''])); });
      const owned = records.filter((row) => row.user_id === userId && row.direction !== 'IN' && row.service_type === 'SEND_MONEY' && ['COMPLETED', 'PROCEEDED'].includes(row.status));
      const hour = (value: string) => (new Date(value).getUTCHours() + 6) % 24;
      const prior = owned.filter((row) => row.is_threat !== 'true');
      const amounts = prior.map((row) => Number(row.amount)).filter(Number.isFinite).sort((a, b) => a - b);
      const median = amounts.length ? amounts[Math.floor(amounts.length / 2)] : 0;
      const txn = [...owned].reverse()[0];
      if (txn && median > 0 && Number(txn.amount) >= Math.max(median * 3, 10000) && hour(txn.timestamp) < 6) {
        const txHour = hour(txn.timestamp);
        const reason = `Large transaction at ${String(txHour).padStart(2, '0')}:${String(new Date(txn.timestamp).getUTCMinutes()).padStart(2, '0')} Bangladesh time, outside usual activity; amount is ${(Number(txn.amount) / median).toFixed(1)}x the customer's median.`;
        const devices = ['Samsung Galaxy A54', 'Xiaomi Redmi Note 12', 'Infinix Hot 30', 'iPhone 13'];
        const alertDevice = devices[[...userId].reduce((sum, char) => sum + char.charCodeAt(0), 0) % devices.length];
        const updated = records.map((row) => row === txn ? { ...row, is_threat: 'true', suspicious_reason: reason, device: alertDevice } : row);
        await fs.writeFile(customerTransactionsCsv, `${customerTransactionThreatHeaders.join(',')}\r\n${updated.map((row) => customerTransactionThreatHeaders.map((header) => toCsvCell(row[header] || '')).join(',')).join('\r\n')}\r\n`, 'utf8');
        alert = { amount: Number(txn.amount), timestamp: txn.timestamp, device: alertDevice, reason };
        publishServerEvent('state-change', { kind: 'suspicious-transaction', userId });
      }
    }
    await fs.mkdir(path.dirname(customerLoginsCsv), { recursive: true });
    const headers = ['user_id', 'wallet', 'timestamp', 'device'];
    let needsHeader = false;
    try {
      if ((await fs.stat(customerLoginsCsv)).size === 0) needsHeader = true;
      else {
        const existing = await fs.readFile(customerLoginsCsv, 'utf8');
        const [headerLine, ...oldLines] = existing.split(/\r?\n/).filter(Boolean);
        const oldHeaders = parseCsvLine(headerLine);
        if (!oldHeaders.includes('device')) {
          const migrated = oldLines.map((line) => {
            const oldCells = parseCsvLine(line);
            const oldRow = Object.fromEntries(oldHeaders.map((header, index) => [header, oldCells[index] || '']));
            return [oldRow.user_id, oldRow.wallet, oldRow.timestamp, ''].map(toCsvCell).join(',');
          });
          await fs.writeFile(customerLoginsCsv, `${headers.join(',')}\r\n${migrated.join('\r\n')}${migrated.length ? '\r\n' : ''}`, 'utf8');
        }
      }
    } catch (error: any) { if (error.code === 'ENOENT') needsHeader = true; else throw error; }
    const values = [userId, wallet.trim(), date.toISOString(), device];
    await fs.appendFile(customerLoginsCsv, `${needsHeader ? `${headers.join(',')}\r\n` : ''}${values.map(toCsvCell).join(',')}\r\n`, 'utf8');
    publishServerEvent('state-change', { kind: 'customer-login', userId });
    res.json({ success: true, alert });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/alert-feedback', async (_req: Request, res: Response) => {
  try {
    const csv = await fs.readFile(alertFeedbackCsv, 'utf8').catch((error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') return '';
      throw error;
    });
    const lines = csv.split(/\r?\n/).filter(Boolean);
    const headers = lines.length ? parseCsvLine(lines.shift()!) : [];
    const feedback = lines.map(parseCsvLine).map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] || ''])));
    res.json({ success: true, feedback });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/alert-feedback', async (req: Request, res: Response) => {
  const { caseId, transactionId, analyst, outcome, riskScore, notes = '' } = req.body || {};
  const allowedOutcomes = ['CONFIRMED_FRAUD', 'FALSE_POSITIVE', 'NEEDS_REVIEW'];
  if (typeof caseId !== 'string' || !caseId.trim() || caseId.length > 128 ||
      typeof transactionId !== 'string' || !transactionId.trim() || transactionId.length > 128 ||
      typeof analyst !== 'string' || analyst.length > 128 || !allowedOutcomes.includes(outcome) ||
      !Number.isFinite(Number(riskScore)) || Number(riskScore) < 0 || Number(riskScore) > 100 ||
      typeof notes !== 'string' || notes.length > 1000) {
    return res.status(400).json({ error: 'Invalid alert feedback' });
  }
  try {
    await fs.mkdir(path.dirname(alertFeedbackCsv), { recursive: true });
    let needsHeader = false;
    try { needsHeader = (await fs.stat(alertFeedbackCsv)).size === 0; }
    catch (error: any) { if (error.code === 'ENOENT') needsHeader = true; else throw error; }
    const headers = ['timestamp', 'case_id', 'transaction_id', 'analyst', 'outcome', 'risk_score', 'notes'];
    const values = [new Date().toISOString(), caseId.trim(), transactionId.trim(), analyst.trim(), outcome, Number(riskScore), notes];
    await fs.appendFile(alertFeedbackCsv, `${needsHeader ? `${headers.join(',')}\r\n` : ''}${values.map(toCsvCell).join(',')}\r\n`, 'utf8');
    publishServerEvent('state-change', { kind: 'alert-feedback', caseId: caseId.trim() });
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
      // Match by user ID or wallet to support both new records and legacy CSV rows.
      if (row.user_id !== wallet && row.wallet !== wallet) return null;
      return {
        amount: Number(row.amount), recipient: row.recipient, timestamp: row.timestamp,
        reference: row.reference, status: row.status, riskScore: Number(row.risk_score) || 0,
        serviceType: row.service_type || 'SEND_MONEY', direction: row.direction || 'OUT', fee: Number(row.fee) || 0,
      };
    }).filter(Boolean);
    res.json({ success: true, history: rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/recipient-risk/:recipient', async (req: Request, res: Response) => {
  const recipient = String(req.params.recipient || '').replace(/\D/g, '');
  if (!recipient || recipient.length > 32) return res.status(400).json({ error: 'Invalid recipient' });
  try {
    const csv = await fs.readFile(customerTransactionsCsv, 'utf8').catch((error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') return '';
      throw error;
    });
    const lines = csv.split(/\r?\n/).filter(Boolean);
    const headers = lines.length ? parseCsvLine(lines.shift()!) : customerTransactionHeaders;
    const history = lines.map(parseCsvLine).map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] || ''])))
      .filter((row) => ['COMPLETED', 'PROCEEDED'].includes(row.status) && (!row.service_type || row.service_type === 'SEND_MONEY') && (row.direction || 'OUT') === 'OUT' && Number.isFinite(Date.parse(row.timestamp)) && Date.now() - Date.parse(row.timestamp) <= 24 * 60 * 60 * 1000);
    const inbound = history.filter((row) => String(row.recipient || '').replace(/\D/g, '') === recipient);
    const outbound = history.filter((row) => String(row.wallet || '').replace(/\D/g, '') === recipient);
    const senderCount = new Set(inbound.map((row) => row.wallet)).size;
    const inboundAmount = inbound.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const rapidPassThrough = inbound.some((received) => outbound.some((sent) => {
      const delay = Date.parse(sent.timestamp) - Date.parse(received.timestamp);
      return delay >= 0 && delay <= 60 * 60 * 1000;
    }));
    const reasons: string[] = [];
    let score = 0;
    if (senderCount >= 3) {
      score += senderCount >= 5 ? 30 : 20;
      reasons.push(`Recipient received funds from ${senderCount} distinct senders in the last 24 hours.`);
    }
    if (rapidPassThrough && inboundAmount > 0) {
      score += 25;
      reasons.push('Recent incoming funds were followed by outgoing transfers within one hour.');
    }
    if (inbound.length >= 5) {
      score += 15;
      reasons.push(`${inbound.length} inbound transfers were recorded to this recipient in the last 24 hours.`);
    }
    res.json({ success: true, score: Math.min(score, 60), reasons, senderCount, inboundAmount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/customer-history/:wallet', async (req: Request, res: Response) => {
  const wallet = String(req.params.wallet || '').trim();
  const {
    wallet: customerWallet, amount, recipient, timestamp, reference = '', status = 'COMPLETED', riskScore = 0,
    serviceType = 'SEND_MONEY', direction = 'OUT', fee = 0,
  } = req.body || {};
  const date = new Date(timestamp);
  const allowedServiceTypes = ['SEND_MONEY', 'CASH_IN', 'CASH_OUT', 'MAKE_PAYMENT', 'ADD_MONEY', 'PAY_BILL', 'MOBILE_RECHARGE', 'REMITTANCE', 'SAVINGS', 'EDUCATION', 'INSURANCE', 'BUSINESS_PAYMENT'];
  if (!wallet || wallet.length > 64 || typeof customerWallet !== 'string' || !customerWallet.trim() || customerWallet.length > 64 || !Number.isFinite(Number(amount)) || Number(amount) <= 0 ||
      typeof recipient !== 'string' || !recipient.trim() || recipient.length > 128 || !Number.isFinite(date.getTime()) ||
      typeof reference !== 'string' || reference.length > 256 || !['COMPLETED', 'PROCEEDED'].includes(status) ||
      !Number.isFinite(Number(riskScore)) || !allowedServiceTypes.includes(serviceType) || !['IN', 'OUT'].includes(direction) ||
      !Number.isFinite(Number(fee)) || Number(fee) < 0) {
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
        if (customerTransactionThreatHeaders.some((header) => !oldHeaders.includes(header))) {
          const migrated = oldLines.map((line) => {
            const oldCells = parseCsvLine(line);
            const oldRow = Object.fromEntries(oldHeaders.map((header, index) => [header, oldCells[index] || '']));
            return [
              oldRow.user_id || oldRow.wallet, oldRow.wallet, oldRow.amount, oldRow.recipient, oldRow.timestamp,
              oldRow.reference, oldRow.status, oldRow.risk_score, oldRow.service_type || 'SEND_MONEY',
              oldRow.direction || 'OUT', oldRow.fee || 0, oldRow.is_threat || '', oldRow.suspicious_reason || '', oldRow.device || '',
            ]
              .map(toCsvCell).join(',');
          });
          await fs.writeFile(customerTransactionsCsv, `${customerTransactionThreatHeaders.join(',')}\r\n${migrated.join('\r\n')}${migrated.length ? '\r\n' : ''}`, 'utf8');
        }
      }
    } catch (error: any) { if (error.code === 'ENOENT') needsHeader = true; else throw error; }
    const values = [
      wallet, customerWallet.trim(), Number(amount), recipient.trim(), date.toISOString(), reference, status,
      Math.max(0, Math.min(100, Number(riskScore))), serviceType, direction, Number(fee), '', '', '',
    ];
    const content = `${needsHeader ? `${customerTransactionThreatHeaders.join(',')}\r\n` : ''}${values.map(toCsvCell).join(',')}\r\n`;
    await fs.appendFile(customerTransactionsCsv, content, 'utf8');
    publishServerEvent('state-change', { kind: 'customer-transaction', timestamp: date.toISOString() });
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

// One-way event channel for browsers. EventSource reconnects automatically and
// Last-Event-ID lets a briefly disconnected client catch up from the replay buffer.
app.get('/api/events', (req: Request, res: Response) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders();
  res.write(`event: ready\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`);

  const lastEventId = Number(req.header('Last-Event-ID')) || 0;
  for (const event of recentEvents) {
    if (event.id > lastEventId) {
      res.write(`id: ${event.id}\nevent: ${event.name}\ndata: ${JSON.stringify(event.data)}\n\n`);
    }
  }
  eventClients.add(res);
  const heartbeat = setInterval(() => res.write(': keep-alive\n\n'), 20000);
  req.on('close', () => {
    clearInterval(heartbeat);
    eventClients.delete(res);
  });
});

app.get('/api/suspicious-transactions', async (_req: Request, res: Response) => {
  try {
    const csv = await fs.readFile(customerTransactionsCsv, 'utf8').catch((error: NodeJS.ErrnoException) => error.code === 'ENOENT' ? '' : Promise.reject(error));
    const lines = csv.split(/\r?\n/).filter(Boolean);
    const headers = lines.length ? parseCsvLine(lines.shift()!) : customerTransactionThreatHeaders;
    const transactions = lines.map(parseCsvLine).map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] || ''])))
      .filter((row) => row.is_threat === 'true');
    res.json({ success: true, transactions });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

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
    publishServerEvent('state-change', {
      kind: 'audit-action', entryId: newEntry.id, entityType: newEntry.entityType,
      entityId: newEntry.entityId, actionTaken: newEntry.actionTaken,
    });
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

// API endpoint to download or inspect TakaSafe AI-1 / ML-1 Jupyter Notebook (.ipynb)
app.get(['/api/notebook/ai1', '/api/notebook/ml1'], async (_req: Request, res: Response) => {
  try {
    const candidatePaths = [
      path.resolve(process.cwd(), 'notebooks', 'TakaSafe_ML1_LightGBM_Conformal_DoubtCheck.ipynb'),
      path.resolve(process.cwd(), 'notebooks', 'TakaSafe_AI1_LightGBM_Conformal_DoubtCheck.ipynb'),
    ];
    let content = '';
    for (const p of candidatePaths) {
      try {
        content = await fs.readFile(p, 'utf8');
        if (content) break;
      } catch {
        // try next candidate
      }
    }
    if (!content) throw new Error('Notebook file not found');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="TakaSafe_ML1_LightGBM_Conformal_DoubtCheck.ipynb"');
    res.send(content);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to download or inspect TakaSafe XGBoost Fraud Detection Notebook (.ipynb)
app.get('/api/notebook/xgboost', async (_req: Request, res: Response) => {
  try {
    const notebookPath = path.resolve(process.cwd(), 'notebook', 'xgboost_fraud_detection.ipynb');
    const content = await fs.readFile(notebookPath, 'utf8');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="xgboost_fraud_detection.ipynb"');
    res.send(content);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// SCAMSHIELD REAL-TIME ML INFERENCE ENGINE
// ==========================================
interface XGBoostTree {
  split_indices: number[];
  split_conditions: number[];
  left_children: number[];
  right_children: number[];
  base_weights: number[];
}

interface ScamShieldModel {
  isLoaded: boolean;
  modelPath: string;
  featureOrder: string[];
  trees: XGBoostTree[];
  error?: string;
  loadedAt?: string;
}

const scamShieldState: ScamShieldModel = {
  isLoaded: false,
  modelPath: process.env.MODEL_PATH || path.resolve(process.cwd(), 'ml', 'model', 'scamshield_xgb.json'),
  featureOrder: [
    'amount',
    'amount_deviation_ratio',
    'is_new_recipient',
    'transaction_hour',
    'is_nocturnal',
    'transaction_frequency',
    'behavior_deviation_score',
    'recipient_incoming_surge',
    'is_mule_cluster_linked',
    'device_change_flag',
    'location_mismatch_flag',
  ],
  trees: [],
};

const knownMuleWallets = new Set([
  '01988-510294', '01988510294', 'W302', '01899-771122', '01899771122',
  '01711-239481', '01711239481', 'AGT-881', 'AGT-882'
]);

async function initScamShieldModel() {
  const candidatePaths = [
    scamShieldState.modelPath,
    path.resolve(process.cwd(), 'ml', 'model', 'scamshield_xgb.json'),
    path.resolve(process.cwd(), 'backend', 'ml', 'model', 'scamshield_xgb.json'),
  ];

  let resolvedPath = '';
  for (const p of candidatePaths) {
    try {
      await fs.access(p);
      resolvedPath = p;
      break;
    } catch {
      // not found, try next
    }
  }

  if (!resolvedPath) {
    scamShieldState.isLoaded = false;
    scamShieldState.error = `ML model artifact not found at ${scamShieldState.modelPath}`;
    console.warn(`[ScamShield] ⚠️ ${scamShieldState.error}. App will report 'ML model not connected'.`);
    return;
  }

  try {
    const raw = await fs.readFile(resolvedPath, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed.learner && parsed.learner.gradient_booster && parsed.learner.gradient_booster.model) {
      const gbModel = parsed.learner.gradient_booster.model;
      scamShieldState.trees = gbModel.trees || [];
      if (parsed.learner.feature_names && parsed.learner.feature_names.length) {
        scamShieldState.featureOrder = parsed.learner.feature_names;
      }
      scamShieldState.isLoaded = true;
      scamShieldState.modelPath = resolvedPath;
      scamShieldState.loadedAt = new Date().toISOString();
      scamShieldState.error = undefined;
      console.log(`[ScamShield] ✅ Loaded XGBoost model from ${resolvedPath} with ${scamShieldState.trees.length} decision trees.`);
    } else {
      scamShieldState.isLoaded = false;
      scamShieldState.error = 'Invalid XGBoost JSON structure';
    }
  } catch (err: any) {
    scamShieldState.isLoaded = false;
    scamShieldState.error = err.message;
    console.error('[ScamShield] Model load error:', err.message);
  }
}

initScamShieldModel();

// 1. Health check endpoint
app.get('/api/scamshield/health', (_req: Request, res: Response) => {
  res.json({
    status: scamShieldState.isLoaded ? 'HEALTHY' : 'MODEL_DISCONNECTED',
    service: 'TakaSafe ScamShield Real-Time ML Engine',
    model_loaded: scamShieldState.isLoaded,
    model_path: scamShieldState.modelPath,
    model_type: 'XGBoost_JSON_Memory',
    feature_count: scamShieldState.featureOrder.length,
    tree_count: scamShieldState.trees.length,
    message: scamShieldState.isLoaded
      ? 'XGBoost model is loaded in memory and ready for instant prediction'
      : 'ML model not connected. Please provide the trained XGBoost model artifact (e.g. scamshield_xgb.json) in ./ml/model/ or configure MODEL_PATH.',
  });
});

// 2. Real-time pre-payment inference endpoint
app.post('/api/scamshield/analyze', async (req: Request, res: Response) => {
  const startTime = Date.now();

  if (!scamShieldState.isLoaded) {
    return res.status(503).json({
      model_connected: false,
      status: 'MODEL_NOT_CONNECTED',
      message: 'ML model not connected. Please place your trained XGBoost model artifact (scamshield_xgb.json) in ./ml/model/ or set MODEL_PATH.',
    });
  }

  const {
    amount = 1000,
    receiver_id = '',
    timestamp,
    device_id = '',
    location = 'Dhaka',
    transaction_frequency = 1,
    customer_avg_amount = 1500,
    is_new_recipient = true,
  } = req.body || {};

  const numAmount = Number(amount) || 1000;
  const numAvg = Math.max(1, Number(customer_avg_amount) || 1500);
  const amountRatio = numAmount / numAvg;

  let txHour = 14;
  if (timestamp) {
    try {
      const dt = new Date(timestamp);
      txHour = (dt.getUTCHours() + 6) % 24; // BST
    } catch {
      txHour = 14;
    }
  } else {
    txHour = (new Date().getUTCHours() + 6) % 24;
  }

  const isNocturnal = txHour < 6 ? 1.0 : 0.0;
  const cleanReceiver = String(receiver_id).replace(/[-\s]/g, '');
  const isMule = knownMuleWallets.has(cleanReceiver) || knownMuleWallets.has(String(receiver_id)) ? 1.0 : 0.0;
  const isNew = is_new_recipient ? 1.0 : 0.0;
  const isSuspiciousDevice = String(device_id).toLowerCase().includes('unknown') || String(device_id).toLowerCase().includes('dev-8819') ? 1.0 : 0.0;
  const isCoastalMismatch = String(location).toLowerCase().includes('coastal') || String(location).toLowerCase().includes('patuakhali') ? 1.0 : 0.0;
  const behaviorScore = Math.min(1.0, Math.max(0.01, (amountRatio - 1.0) / 10.0 + (isNocturnal ? 0.3 : 0.0) + (isNew ? 0.2 : 0.0)));

  const featureDict: Record<string, number> = {
    amount: numAmount,
    amount_deviation_ratio: Number(amountRatio.toFixed(3)),
    is_new_recipient: isNew,
    transaction_hour: txHour,
    is_nocturnal: isNocturnal,
    transaction_frequency: Number(transaction_frequency) || 1,
    behavior_deviation_score: Number(behaviorScore.toFixed(3)),
    recipient_incoming_surge: isMule || cleanReceiver.startsWith('01988') ? 1.0 : 0.0,
    is_mule_cluster_linked: isMule,
    device_change_flag: isSuspiciousDevice,
    location_mismatch_flag: isCoastalMismatch,
  };

  const featureVector: number[] = scamShieldState.featureOrder.map((f) => featureDict[f] ?? 0.0);

  // In-memory XGBoost Tree Evaluation
  let margin = 0.0;
  for (const tree of scamShieldState.trees) {
    if (!tree.split_indices || !tree.split_indices.length) continue;
    let nodeIdx = 0;
    while (true) {
      const leftChild = tree.left_children[nodeIdx];
      if (leftChild === -1 || leftChild === undefined || leftChild >= tree.split_indices.length) {
        margin += tree.base_weights[nodeIdx] ?? 0.0;
        break;
      }
      const featIdx = tree.split_indices[nodeIdx];
      const splitVal = tree.split_conditions[nodeIdx];
      const val = featureVector[featIdx] ?? 0.0;
      if (val < splitVal) {
        nodeIdx = leftChild;
      } else {
        nodeIdx = tree.right_children[nodeIdx];
      }
    }
  }

  // Logistic sigmoid
  const rawProb = 1.0 / (1.0 + Math.exp(-Math.max(-25.0, Math.min(25.0, margin))));
  let riskScore = Math.round(rawProb * 100);
  riskScore = Math.max(0, Math.min(100, riskScore));

  // Determine Risk Level (Prototype Bands)
  let riskLevel = 'LOW';
  let prediction = 'SAFE';
  let recommendedAction = 'CONTINUE';

  if (riskScore >= 81) {
    riskLevel = 'CRITICAL';
    prediction = 'CRITICAL';
    recommendedAction = 'VERIFY';
  } else if (riskScore >= 61) {
    riskLevel = 'HIGH';
    prediction = 'RISKY';
    recommendedAction = 'VERIFY';
  } else if (riskScore >= 31) {
    riskLevel = 'MEDIUM';
    prediction = 'REVIEW';
    recommendedAction = 'VERIFY';
  } else {
    riskLevel = 'LOW';
    prediction = 'SAFE';
    recommendedAction = 'CONTINUE';
  }

  // Generate explainability evidence
  const reasons: Array<{ label: string; impact: number }> = [];

  if (isNew) {
    reasons.push({ label: 'New recipient', impact: 32 });
  }

  if (amountRatio >= 2.0) {
    const impact = amountRatio >= 10.0 ? 35 : amountRatio >= 4.0 ? 27 : 18;
    reasons.push({
      label: `Unusually high amount (${amountRatio.toFixed(1)}x typical avg)`,
      impact,
    });
  }

  if (isNocturnal) {
    reasons.push({
      label: `Unusual transaction time (${String(txHour).padStart(2, '0')}:00 BST nocturnal)`,
      impact: 19,
    });
  }

  if (isMule || cleanReceiver.startsWith('01988')) {
    reasons.push({
      label: 'Suspicious recipient connection (Syndicate Net #17 Link)',
      impact: isMule ? 24 : 16,
    });
  }

  if (isSuspiciousDevice) {
    reasons.push({
      label: 'Unrecognized device fingerprint',
      impact: 14,
    });
  }

  if (reasons.length === 0 && riskScore <= 30) {
    reasons.push({ label: 'Known frequent counterparty', impact: 8 });
    reasons.push({ label: 'Amount consistent with historical pattern', impact: 5 });
  }

  reasons.sort((a, b) => b.impact - a.impact);

  const latencyMs = Date.now() - startTime;

  res.json({
    risk_score: riskScore,
    risk_level: riskLevel,
    prediction,
    confidence: Number(rawProb.toFixed(3)),
    reasons,
    recommended_action: recommendedAction,
    can_continue: true,
    model_status: 'LOADED',
    model_path: scamShieldState.modelPath,
    inference_latency_ms: latencyMs,
  });
});

// 3. Recipient verification endpoint
app.post('/api/scamshield/verify-recipient', (req: Request, res: Response) => {
  const { receiver_id = '' } = req.body || {};
  const cleanId = String(receiver_id).replace(/[-\s]/g, '');
  const isMule = knownMuleWallets.has(cleanId) || knownMuleWallets.has(String(receiver_id));

  if (isMule) {
    return res.json({
      receiver_id,
      receiver_name: 'Md. Al-Amin (Node W302)',
      status: 'NEEDS_VERIFICATION',
      reputation_score: 14,
      is_mule_connected: true,
      mule_network_id: 'Suspicious Network #17',
      signals: [
        'New recipient not in your contact ledger',
        'Multiple unusual incoming transfers within 10 minutes',
        'Suspicious network connection: Flagged in Network #17 Terminus',
        'High-velocity physical cash-out routing pattern',
      ],
      previous_interactions_count: 0,
      total_volume_received_today: 155000,
    });
  }

  if (String(receiver_id).startsWith('01710') || String(receiver_id).startsWith('01825')) {
    return res.json({
      receiver_id,
      receiver_name: 'Rehana Parvin (Mother / Family)',
      status: 'SAFE',
      reputation_score: 96,
      is_mule_connected: false,
      mule_network_id: null,
      signals: [
        'Recipient verified with biometric NID on file',
        'Frequent historical contact (12+ successful transfers)',
        'No suspicious dispute or velocity reports on record',
      ],
      previous_interactions_count: 14,
      total_volume_received_today: 3200,
    });
  }

  return res.json({
    receiver_id,
    receiver_name: `MFS Wallet Holder (${receiver_id})`,
    status: 'NEEDS_VERIFICATION',
    reputation_score: 45,
    is_mule_connected: false,
    mule_network_id: null,
    signals: [
      'New recipient for this customer account',
      'Wallet active tenure < 30 days',
      'Standard retail MFS account without enterprise merchant verification',
    ],
    previous_interactions_count: 0,
    total_volume_received_today: 0,
  });
});

// 4. Decision recording endpoint
app.post('/api/scamshield/decision', async (req: Request, res: Response) => {
  const { receiver_id = '', amount = 0, risk_score = 0, decision = 'CONTINUE', confirmed_override = false, notes = '' } = req.body || {};
  const decisionId = `DEC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const timestamp = new Date().toISOString();

  // Log to alert feedback CSV
  try {
    const feedbackRow = `${decisionId},${timestamp},SCAMSHIELD_CUSTOMER,${receiver_id},${decision},${risk_score},${toCsvCell(notes || `User chose ${decision}`)},${confirmed_override}\r\n`;
    await fs.appendFile(alertFeedbackCsv, feedbackRow, 'utf8').catch(() => {});
  } catch {
    // ignore
  }

  publishServerEvent('scamshield-decision', { decisionId, receiver_id, amount, decision, risk_score, timestamp });

  res.json({
    success: true,
    decision_id: decisionId,
    logged_at: timestamp,
    action_recorded: decision,
  });
});

// bKash Tokenized Checkout create-payment adapter. Credentials are kept server-side;
// without them the route returns a deterministic sandbox-format mock response.
app.post('/api/bkash/payment/create', async (req: Request, res: Response) => {
  const { amount = '100.00', payerReference = 'TAKASAFE-DEMO', merchantInvoiceNumber } = req.body || {};
  const amountText = String(amount);
  const numericAmount = Number(amountText);
  const reference = String(payerReference).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(amountText) || !Number.isFinite(numericAmount) || numericAmount <= 0 || numericAmount > 100000 || !reference || reference.length > 64) {
    return res.status(400).json({ error: 'amount must be a positive amount up to 100000 BDT and payerReference must be 1-64 characters' });
  }

  const createPaymentUrl = process.env.BKASH_CREATE_PAYMENT_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/create';
  const authToken = process.env.BKASH_AUTH_TOKEN;
  const appKey = process.env.BKASH_APP_KEY;
  const callbackURL = process.env.BKASH_CALLBACK_URL || 'https://merchantdemo.sandbox.bka.sh/callback';
  const requestBody = {
    mode: '0011',
    payerReference: reference,
    callbackURL,
    amount: numericAmount.toFixed(2),
    currency: 'BDT',
    intent: 'sale',
    merchantInvoiceNumber: String(merchantInvoiceNumber || `TAKASAFE-${Date.now()}`).slice(0, 50),
  };

  if (authToken && appKey) {
    try {
      const upstream = await fetch(createPaymentUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: authToken,
          'X-APP-Key': appKey,
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(12000),
      });
      const responseBody = await upstream.json().catch(() => ({ error: 'bKash returned a non-JSON response' }));
      return res.status(upstream.ok ? 200 : upstream.status).json({ provider: 'bKash', mode: 'SANDBOX', request: requestBody, response: responseBody });
    } catch (error) {
      return res.status(502).json({ provider: 'bKash', mode: 'SANDBOX', error: error instanceof Error ? error.message : 'bKash sandbox request failed' });
    }
  }

  return res.json({
    provider: 'bKash',
    mode: 'MOCK_SANDBOX',
    request: requestBody,
    response: {
      paymentID: `TS-${Date.now()}`,
      bkashURL: `${callbackURL}?demoPayment=${encodeURIComponent(requestBody.merchantInvoiceNumber)}`,
      callbackURL,
      successCallbackURL: callbackURL,
      failureCallbackURL: callbackURL,
      cancellationCallbackURL: callbackURL,
      amount: requestBody.amount,
      currency: requestBody.currency,
      intent: requestBody.intent,
      merchantInvoiceNumber: requestBody.merchantInvoiceNumber,
      transactionStatus: 'Initiated',
      statusCode: '0000',
      statusMessage: 'Sandbox payment created (mock; no funds moved)',
    },
  });
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
      // Only serve the SPA shell for browser routes. Returning index.html for a
      // missing asset makes tools such as curl save HTML under a .js/.css name.
      if (path.extname(req.path)) {
        res.sendStatus(404);
        return;
      }
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const server = createServer(app);
  liveWebSocketServer = new WebSocketServer({ server, path: '/api/stream' });
  liveWebSocketServer.on('connection', (socket: any) => {
    socket.send(JSON.stringify({ type: 'stream-status', status: 'connected', intervalMs: 2000 }));
  });

  let transactionSequence = 0;
  const streamSenders = ['Rafiq Uddin', 'Nusrat Jahan', 'Karim Mia', 'Tania Akter', 'Hasan Mahmud'];
  const streamRecipients = ['Local Merchant', 'Family Wallet', 'Agent Counter', 'Savings Wallet', 'Utility Provider'];
  const streamLocations = ['Dhaka', 'Chattogram', 'Sylhet', 'Barishal', 'Rajshahi'];
  setInterval(() => {
    transactionSequence += 1;
    const risk = Math.floor(8 + Math.random() * 89);
    const riskBand = risk >= 81 ? 'CRITICAL' : risk >= 61 ? 'HIGH' : risk >= 31 ? 'MEDIUM' : 'LOW';
    const senderIndex = Math.floor(Math.random() * streamSenders.length);
    const timestamp = new Date().toISOString();
    publishLiveTransaction({
      id: `LIVE-${Date.now()}-${transactionSequence}`,
      timestamp,
      senderWallet: `01${String(700000000 + Math.floor(Math.random() * 99999999)).slice(0, 9)}`,
      senderName: streamSenders[senderIndex],
      senderLocation: streamLocations[senderIndex],
      senderDevice: 'Sandbox stream simulator',
      receiverWallet: `01${String(800000000 + Math.floor(Math.random() * 99999999)).slice(0, 9)}`,
      receiverName: streamRecipients[Math.floor(Math.random() * streamRecipients.length)],
      receiverLocation: streamLocations[Math.floor(Math.random() * streamLocations.length)],
      amount: Math.floor(150 + Math.random() * 49850),
      fee: 0,
      channel: 'TakaSafe App',
      status: riskBand === 'CRITICAL' ? 'HELD' : 'COMPLETED',
      fusedRiskScore: risk,
      riskBand,
      fraudProb: Number((risk / 100).toFixed(2)),
      anomalyProb: Number((Math.random() * risk / 100).toFixed(2)),
      networkRisk: Number((Math.random() * risk / 100).toFixed(2)),
      velocityRisk: Number((Math.random() * risk / 100).toFixed(2)),
      deviceRisk: Number((Math.random() * risk / 100).toFixed(2)),
      isMuleConnected: riskBand === 'CRITICAL' && Math.random() > 0.5,
      shapFeatures: [],
      source: 'synthetic-live-stream',
    });
  }, 2000);

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`TakaSafe Server running on http://0.0.0.0:${PORT}`);
    console.log('Live transaction WebSocket available at /api/stream (synthetic event every 2 seconds)');
    console.log(process.env.REDIS_STREAM_REST_URL ? 'Redis Streams sink enabled' : 'Redis Streams sink disabled (set REDIS_STREAM_REST_URL and REDIS_STREAM_REST_TOKEN)');
  });
}

startServer();
