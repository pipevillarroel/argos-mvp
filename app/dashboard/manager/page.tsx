"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface Sale {
  id: number;
  description: string;
  amount: number;
  date: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface WorkerSummary {
  name: string;
  email: string;
  expenses: number;
  sales: number;
  profit: number;
}

interface Report {
  date: string;
  summary: {
    totalExpenses: number;
    totalSales: number;
    netProfit: number;
  };
  expenses: Expense[];
  sales: Sale[];
  workerSummary: WorkerSummary[];
}

export default function ManagerDashboard() {
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "expenses" | "sales" | "workers">(
    "overview"
  );

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports");
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      } else if (res.status === 403) {
        router.push("/dashboard/worker");
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error loading report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie =
      "argos_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error al cargar reportes</p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver al login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">ARGOS</h1>
            <p className="text-xs text-gray-500">Manager Dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Date Info */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Fecha: {new Date(report.date).toLocaleDateString("es-CL")}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm mb-2">Total Ventas</p>
            <p className="text-3xl font-bold text-green-600">
              ${report.summary.totalSales.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {report.sales.length} transacciones
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <p className="text-gray-600 text-sm mb-2">Total Gastos</p>
            <p className="text-3xl font-bold text-red-600">
              ${report.summary.totalExpenses.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {report.expenses.length} transacciones
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm mb-2">Ganancia Neta</p>
            <p
              className={`text-3xl font-bold ${
                report.summary.netProfit >= 0 ? "text-blue-600" : "text-red-600"
              }`}
            >
              ${report.summary.netProfit.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === "overview"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            📊 Resumen
          </button>
          <button
            onClick={() => setActiveTab("workers")}
            className={`px-6 py-3 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === "workers"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            👥 Trabajadores
          </button>
          <button
            onClick={() => setActiveTab("expenses")}
            className={`px-6 py-3 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === "expenses"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            💸 Gastos
          </button>
          <button
            onClick={() => setActiveTab("sales")}
            className={`px-6 py-3 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === "sales"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            💰 Ventas
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen del Día</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-2">Ingresos (Ventas)</p>
                <p className="text-2xl font-bold text-green-600">
                  ${report.summary.totalSales.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-gray-600 mb-2">Egresos (Gastos)</p>
                <p className="text-2xl font-bold text-red-600">
                  ${report.summary.totalExpenses.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-2">Resultado Neto</p>
                <p
                  className={`text-2xl font-bold ${
                    report.summary.netProfit >= 0 ? "text-blue-600" : "text-red-600"
                  }`}
                >
                  ${report.summary.netProfit.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Workers Tab */}
        {activeTab === "workers" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Resumen por Trabajador
              </h2>
              {report.workerSummary.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay trabajadores</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Trabajador
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Email
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                          Gastos
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                          Ventas
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                          Ganancia
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.workerSummary.map((worker, idx) => (
                        <tr key={idx} className="border-t border-gray-200">
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {worker.name}
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-sm">
                            {worker.email}
                          </td>
                          <td className="px-6 py-4 text-right text-red-600 font-semibold">
                            -${worker.expenses.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right text-green-600 font-semibold">
                            +${worker.sales.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right font-semibold">
                            <span
                              className={
                                worker.profit >= 0
                                  ? "text-blue-600"
                                  : "text-red-600"
                              }
                            >
                              ${worker.profit.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === "expenses" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Todos los Gastos</h2>
              {report.expenses.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay gastos registrados hoy
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Trabajador
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Descripción
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Categoría
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                          Monto
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Hora
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.expenses.map((expense) => (
                        <tr key={expense.id} className="border-t border-gray-200">
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {expense.user.name}
                          </td>
                          <td className="px-6 py-4 text-gray-900">
                            {expense.description}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                              {expense.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-red-600 font-semibold">
                            -${expense.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-gray-500 text-sm">
                            {new Date(expense.date).toLocaleTimeString("es-CL")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sales Tab */}
        {activeTab === "sales" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Todas las Ventas</h2>
              {report.sales.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay ventas registradas hoy
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Trabajador
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Descripción
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                          Monto
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Hora
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.sales.map((sale) => (
                        <tr key={sale.id} className="border-t border-gray-200">
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {sale.user.name}
                          </td>
                          <td className="px-6 py-4 text-gray-900">
                            {sale.description}
                          </td>
                          <td className="px-6 py-4 text-right text-green-600 font-semibold">
                            +${sale.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-gray-500 text-sm">
                            {new Date(sale.date).toLocaleTimeString("es-CL")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
