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
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<
    "overview" | "expenses" | "sales" | "workers" | "adjustments"
  >("overview");

  useEffect(() => {
    loadReport();
    const interval = setInterval(loadReport, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadReport = async () => {
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

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
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
          <p className="text-gray-600 mb-4">No hay datos disponibles</p>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Salir
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Panel de Gerente
            </h1>
            <p className="text-gray-600 mt-1">
              Reporte de {new Date(report.date).toLocaleDateString("es-CL")}
            </p>
          </div>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
          >
            Salir
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded">
            {message}
          </div>
        )}

        {/* Summary Cards - VISIBLE TO MANAGER */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">
              TOTAL GASTOS (TODOS LOS WORKERS)
            </p>
            <p className="text-3xl font-bold text-red-600">
              ${report.summary.totalExpenses.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">
              TOTAL VENTAS (TODOS LOS WORKERS)
            </p>
            <p className="text-3xl font-bold text-green-600">
              ${report.summary.totalSales.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">
              GANANCIA NETA (TODOS)
            </p>
            <p
              className={`text-3xl font-bold ${report.summary.netProfit >= 0 ? "text-blue-600" : "text-red-600"}`}
            >
              ${report.summary.netProfit.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-300 bg-white rounded-t-lg px-6">
          {(
            [
              "overview",
              "expenses",
              "sales",
              "workers",
              "adjustments",
            ] as const
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold transition ${
                activeTab === tab
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab === "overview"
                ? "Resumen"
                : tab === "expenses"
                  ? "Gastos"
                  : tab === "sales"
                    ? "Ventas"
                    : tab === "workers"
                      ? "Por Worker"
                      : "Ajustes"}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">Resumen de Hoy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">
                  Transacciones por Tipo
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    Total Gastos: <span className="font-bold">{report.expenses.length}</span>
                  </p>
                  <p className="text-gray-700">
                    Total Ventas: <span className="font-bold">{report.sales.length}</span>
                  </p>
                  <p className="text-gray-700">
                    Workers Activos: <span className="font-bold">{report.workerSummary.length}</span>
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">
                  Información Importante
                </h3>
                <p className="text-sm text-gray-600">
                  ✓ Todos los gastos y ventas quedan registrados en la base de datos
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  ✓ No se puede eliminar información (auditoría completa)
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  ✓ Usa la sección "Ajustes" para crear reversas o correcciones
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Workers Summary Tab */}
        {activeTab === "workers" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Resumen por Worker</h2>
            {report.workerSummary.length === 0 ? (
              <p className="text-gray-500">Sin trabajadores activos hoy</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-900">
                  <thead className="border-b border-gray-300 bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4">Nombre</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-right py-3 px-4">Gastos</th>
                      <th className="text-right py-3 px-4">Ventas</th>
                      <th className="text-right py-3 px-4">Ganancia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.workerSummary.map((worker, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 font-semibold">{worker.name}</td>
                        <td className="py-3 px-4 text-gray-600">{worker.email}</td>
                        <td className="py-3 px-4 text-right text-red-600">
                          ${worker.expenses.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right text-green-600">
                          ${worker.sales.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">
                          ${worker.profit.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === "expenses" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Todos los Gastos de Hoy</h2>
            {report.expenses.length === 0 ? (
              <p className="text-gray-500">Sin gastos registrados</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-900">
                  <thead className="border-b border-gray-300 bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4">Worker</th>
                      <th className="text-left py-3 px-4">Descripción</th>
                      <th className="text-left py-3 px-4">Categoría</th>
                      <th className="text-right py-3 px-4">Monto</th>
                      <th className="text-left py-3 px-4">Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.expenses.map((exp) => (
                      <tr
                        key={exp.id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 font-semibold">{exp.user.name}</td>
                        <td className="py-3 px-4">{exp.description}</td>
                        <td className="py-3 px-4">
                          <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-red-600 font-semibold">
                          ${exp.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          {new Date(exp.date).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Sales Tab */}
        {activeTab === "sales" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Todas las Ventas de Hoy</h2>
            {report.sales.length === 0 ? (
              <p className="text-gray-500">Sin ventas registradas</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-900">
                  <thead className="border-b border-gray-300 bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4">Worker</th>
                      <th className="text-left py-3 px-4">Producto/Descripción</th>
                      <th className="text-right py-3 px-4">Monto</th>
                      <th className="text-left py-3 px-4">Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.sales.map((sale) => (
                      <tr
                        key={sale.id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 font-semibold">{sale.user.name}</td>
                        <td className="py-3 px-4">{sale.description}</td>
                        <td className="py-3 px-4 text-right text-green-600 font-semibold">
                          ${sale.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          {new Date(sale.date).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Adjustments Tab */}
        {activeTab === "adjustments" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Sistema de Ajustes</h2>
            <p className="text-gray-600 mb-4">
              Usa esta sección para crear reversas o correcciones de gastos y ventas.
              Se mantiene un registro completo de auditoría.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mt-4">
              <p className="text-sm text-blue-900">
                <strong>Próximamente:</strong> Interfaz para crear ajustes directamente desde el dashboard.
                Por ahora usa los endpoints API directamente.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
