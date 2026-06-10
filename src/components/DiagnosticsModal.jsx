import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  Copy,
  RefreshCw,
} from "lucide-react";
import {
  runDiagnostics,
  formatDiagnosticsReport,
  generateRecommendations,
} from "../utils/diagnostics";
import { useToast } from "./Toast";

export default function DiagnosticsModal({ isOpen, onClose }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const runTests = async () => {
    setLoading(true);
    try {
      const diagnosticsResults = await runDiagnostics();
      setResults(diagnosticsResults);
    } catch (err) {
      console.error(err);
      toast.error("Error al ejecutar diagnósticos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !results) {
      runTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const report = results ? formatDiagnosticsReport(results) : "";
  const recommendations = results ? generateRecommendations(results) : [];

  const handleCopyReport = () => {
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Reporte copiado al portapapeles");
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between text-white">
          <div>
            <h2 className="text-xl font-bold">🔍 Diagnóstico del Sistema</h2>
            <p className="text-blue-100 text-sm mt-1">
              Verifica la conexión con Google Sheets
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-4" />
              <p className="text-slate-600 dark:text-slate-400 font-semibold">
                Ejecutando pruebas...
              </p>
            </div>
          ) : results ? (
            <>
              {/* Recomendaciones */}
              {recommendations.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    ⚠️ Recomendaciones
                  </h3>
                  {recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border ${
                        rec.type === "error"
                          ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                          : rec.type === "warning"
                            ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                            : "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                      }`}
                    >
                      <p
                        className={`font-bold ${
                          rec.type === "error"
                            ? "text-red-700 dark:text-red-300"
                            : rec.type === "warning"
                              ? "text-amber-700 dark:text-amber-300"
                              : "text-blue-700 dark:text-blue-300"
                        }`}
                      >
                        {rec.title}
                      </p>
                      <p
                        className={`text-sm mt-1 ${
                          rec.type === "error"
                            ? "text-red-600 dark:text-red-400"
                            : rec.type === "warning"
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        {rec.message}
                      </p>
                      <p
                        className={`text-xs font-semibold mt-2 ${
                          rec.type === "error"
                            ? "text-red-700 dark:text-red-300"
                            : rec.type === "warning"
                              ? "text-amber-700 dark:text-amber-300"
                              : "text-blue-700 dark:text-blue-300"
                        }`}
                      >
                        ➜ {rec.action}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Resultados de pruebas */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white">
                  📊 Resultados de Pruebas
                </h3>
                {Object.entries(results.tests).map(([key, test]) => {
                  const statusIcon =
                    test.status === "PASS" ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : test.status === "FAIL" ? (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    ) : test.status === "WARNING" ? (
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    ) : (
                      <Info className="w-5 h-5 text-blue-600" />
                    );

                  const bgColor =
                    test.status === "PASS"
                      ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                      : test.status === "FAIL"
                        ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                        : test.status === "WARNING"
                          ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                          : "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800";

                  return (
                    <div
                      key={key}
                      className={`p-4 rounded-lg border ${bgColor}`}
                    >
                      <div className="flex items-start gap-3">
                        {statusIcon}
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {test.name}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            Estado:{" "}
                            <span className="font-bold">{test.status}</span>
                          </p>
                          {test.statusCode && (
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              Código HTTP:{" "}
                              <span className="font-mono">
                                {test.statusCode}
                              </span>
                            </p>
                          )}
                          {test.details && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                              {test.details}
                            </p>
                          )}
                          {test.itemsCount !== undefined && (
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              Items recuperados:{" "}
                              <span className="font-bold">
                                {test.itemsCount}
                              </span>
                            </p>
                          )}
                          {test.mode && (
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {test.mode}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reporte de texto */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white">
                  📋 Reporte Completo
                </h3>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs overflow-x-auto whitespace-pre-wrap break-words">
                  {report}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-4 flex gap-3 bg-slate-50 dark:bg-slate-800/50">
          {results && (
            <button
              onClick={handleCopyReport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold text-sm"
            >
              <Copy className="w-4 h-4" />
              {copied ? "Copiado!" : "Copiar Reporte"}
            </button>
          )}
          <button
            onClick={runTests}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors font-semibold text-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Ejecutando..." : "Ejecutar de nuevo"}
          </button>
          <button
            onClick={onClose}
            className="ml-auto px-4 py-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors font-semibold text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
