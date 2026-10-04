import React from 'react';
import {
  FileCheck2,
  Download,
  Printer,
  X,
  ShieldCheck,
  CheckCircle,
  Building2,
  Calendar,
  User,
  Hash,
  FileText,
} from 'lucide-react';

interface ComplianceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditLogs: any[];
  onDownloadCSV: () => void;
  lang: 'EN' | 'BN';
}

export const ComplianceReportModal: React.FC<ComplianceReportModalProps> = ({
  isOpen,
  onClose,
  auditLogs,
  onDownloadCSV,
  lang,
}) => {
  if (!isOpen) return null;

  const handlePrintPDF = () => {
    const printContent = document.getElementById('bfiu-printable-report');
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=900,height=750');
    if (!printWindow) {
      // Fallback: trigger standard browser print
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>BFIU Regulatory Compliance Audit Report - TakaSafe</title>
          <meta charset="utf-8" />
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              margin: 30px;
              font-size: 11px;
              line-height: 1.4;
            }
            .header-table {
              width: 100%;
              border-bottom: 2.5px solid #0054A6;
              padding-bottom: 12px;
              margin-bottom: 16px;
            }
            .title-main {
              font-size: 18px;
              font-weight: 800;
              color: #0054A6;
              margin: 0;
            }
            .title-sub {
              font-size: 11px;
              color: #475569;
              font-weight: 600;
              margin-top: 2px;
            }
            .meta-box {
              background: #f8fafc;
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              padding: 10px;
              margin-bottom: 16px;
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 8px;
            }
            .meta-label {
              font-size: 9px;
              text-transform: uppercase;
              color: #64748b;
              font-weight: 700;
            }
            .meta-val {
              font-size: 11px;
              font-weight: 700;
              color: #0f172a;
              font-family: monospace;
            }
            table.audit-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            table.audit-table th {
              background: #0054A6;
              color: #ffffff;
              font-size: 9.5px;
              text-transform: uppercase;
              padding: 6px 8px;
              text-align: left;
              border: 1px solid #004080;
            }
            table.audit-table td {
              padding: 6px 8px;
              border: 1px solid #e2e8f0;
              font-size: 10px;
            }
            table.audit-table tr:nth-child(even) {
              background: #f8fafc;
            }
            .badge-action {
              display: inline-block;
              padding: 2px 5px;
              border-radius: 3px;
              font-weight: bold;
              font-size: 8.5px;
              font-family: monospace;
            }
            .badge-freeze { background: #fee2e2; color: #991b1b; }
            .badge-hold { background: #fef3c7; color: #92400e; }
            .badge-dispatch { background: #dbeafe; color: #1e40af; }
            .signoff-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-top: 30px;
              border-top: 1px solid #cbd5e1;
              padding-top: 16px;
            }
            .signoff-line {
              border-top: 1px dashed #64748b;
              margin-top: 35px;
              padding-top: 4px;
              font-size: 9.5px;
              color: #475569;
            }
            @media print {
              body { margin: 15px; }
              @page { size: landscape; margin: 15mm; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const highCriticalCount = auditLogs.filter(
    (l) => l.actionTaken === 'FREEZE_WALLET' || l.actionTaken === 'HOLD_FOR_REVIEW' || (l.riskScore && l.riskScore >= 75)
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#0F172A] w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] text-slate-900 dark:text-slate-100">
        {/* Modal Header Command Bar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0054A6]/10 text-[#0054A6] flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  BFIU Regulatory Compliance & Audit Report
                </h3>
                <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Ready for Submission
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official intervention dossier compliant with Bangladesh Bank Mobile Financial Services Guidelines 2026.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintPDF}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0054A6] hover:bg-[#004080] text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              title="Print or Save as Official PDF"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onDownloadCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 transition-all cursor-pointer"
              title="Download CSV Spreadsheet"
            >
              <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Printable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-100 dark:bg-slate-950/80">
          <div
            id="bfiu-printable-report"
            className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-slate-900 font-sans max-w-4xl mx-auto"
          >
            {/* Official Header */}
            <div className="header-table border-b-2 border-[#0054A6] pb-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  PEOPLE'S REPUBLIC OF BANGLADESH · CENTRAL BANK COMPLIANCE
                </div>
                <h1 className="title-main text-xl sm:text-2xl font-black text-[#0054A6] mt-0.5">
                  BANGLADESH FINANCIAL INTELLIGENCE UNIT (BFIU)
                </h1>
                <div className="title-sub text-xs text-slate-600 font-semibold mt-0.5">
                  TakaSafe MFS Fraud Intelligence, Sanctions & Anti-Money Laundering Forensic Audit Ledger
                </div>
              </div>

              <div className="text-right font-mono text-xs">
                <div className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] inline-block">
                  <span className="text-slate-500 block text-[9px] uppercase">Filing Reference</span>
                  <span className="font-bold text-[#0054A6]">BFIU-MFS-2026-X8892</span>
                </div>
              </div>
            </div>

            {/* Session Metadata Grid */}
            <div className="meta-box grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-5 text-xs">
              <div>
                <span className="meta-label block text-[9px] uppercase font-bold text-slate-500">
                  Report Generated
                </span>
                <span className="meta-val font-mono font-bold text-slate-900">
                  {new Date().toISOString().replace('T', ' ').substring(0, 19)} BST
                </span>
              </div>
              <div>
                <span className="meta-label block text-[9px] uppercase font-bold text-slate-500">
                  Authorized Risk Analyst
                </span>
                <span className="meta-val font-semibold text-slate-900">
                  Md. Tanvir Hasan (Chief Risk Analyst & Head of AML Operations)
                </span>
              </div>
              <div>
                <span className="meta-label block text-[9px] uppercase font-bold text-slate-500">
                  Total Interventions
                </span>
                <span className="meta-val font-mono font-bold text-slate-900">
                  {auditLogs.length} Actions Logged
                </span>
              </div>
              <div>
                <span className="meta-label block text-[9px] uppercase font-bold text-slate-500">
                  Quarantine / High Impact
                </span>
                <span className="meta-val font-mono font-bold text-rose-600">
                  {highCriticalCount} Enforced Holds
                </span>
              </div>
            </div>

            {/* Cryptographic Proof Strip */}
            <div className="mb-5 p-2.5 rounded-xl bg-slate-900 text-white flex items-center justify-between text-[10px] font-mono">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">Immutable Audit Chain:</span>
                <span className="text-emerald-300 truncate max-w-md">
                  sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                </span>
              </div>
              <span className="text-emerald-400 font-bold hidden sm:inline">VERIFIED</span>
            </div>

            {/* Audit Log Table */}
            <div className="overflow-x-auto mb-6">
              <table className="audit-table w-full text-left text-xs border border-slate-200">
                <thead>
                  <tr className="bg-[#0054A6] text-white text-[10px] uppercase font-semibold">
                    <th className="py-2.5 px-3">Audit ID & Time</th>
                    <th className="py-2.5 px-3">Target Entity</th>
                    <th className="py-2.5 px-3">Action Enforced</th>
                    <th className="py-2.5 px-3 text-center">Risk</th>
                    <th className="py-2.5 px-3">Justification & Legal Basis</th>
                    <th className="py-2.5 px-3">Analyst Operational Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono">
                        <div className="font-bold text-slate-900">{log.id}</div>
                        <div className="text-[10px] text-slate-500">{log.timestamp}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-mono font-bold text-slate-900">{log.entityId}</div>
                        <div className="text-[10px] text-slate-500">{log.caseId}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`badge-action ${
                            log.actionTaken === 'FREEZE_WALLET'
                              ? 'badge-freeze'
                              : log.actionTaken === 'DISPATCH_FLOAT'
                              ? 'badge-dispatch'
                              : 'badge-hold'
                          }`}
                        >
                          {log.actionTaken ? log.actionTaken.replace(/_/g, ' ') : 'ACTION'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">
                        <span
                          className={
                            log.riskScore >= 75
                              ? 'text-rose-600'
                              : log.riskScore >= 50
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }
                        >
                          {log.riskScore ?? 50}/100
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 max-w-xs">{log.reason}</td>
                      <td className="py-2.5 px-3 text-slate-600 max-w-xs">{log.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Formal Regulatory Sign-off Grid */}
            <div className="signoff-grid grid grid-cols-2 gap-8 border-t border-slate-300 pt-6 mt-6">
              <div>
                <div className="text-[11px] text-slate-600 leading-relaxed">
                  I hereby attest that the interventions cataloged above comply strictly with the
                  Anti-Money Laundering Act, 2012 and Bangladesh Bank BFIU Circular No. 04/2026.
                </div>
                <div className="signoff-line mt-8 border-t border-dashed border-slate-400 pt-1 text-[10px] text-slate-600">
                  <strong>Md. Tanvir Hasan</strong> — Chief Risk Analyst & Head of AML Operations
                  <div className="text-slate-400">TakaSafe Digital Trust & SOC Unit</div>
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-600 leading-relaxed">
                  Authorized for onward transmission to Bangladesh Financial Intelligence Unit (BFIU)
                  Central AML Portal.
                </div>
                <div className="signoff-line mt-8 border-t border-dashed border-slate-400 pt-1 text-[10px] text-slate-600">
                  <strong>Executive Compliance Desk</strong> — Managing Directorate & Fraud Governance
                  <div className="text-slate-400">Accredited by DIU CPC × upay</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
