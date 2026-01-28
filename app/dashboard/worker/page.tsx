"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
}

interface Sale {
  id: number;
  description: string;
  amount: number;
  date: string;
}

interface Summary {
  totalExpenses: number;
  totalSales: number;
  netProfit: number;
}

export default function WorkerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalExpenses: 0,
    totalSales: 0,
    netProfit: 0,
  });

  // Form states
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Otros");
  const [saleDesc, setSaleDesc] = useState("");
  const [saleAmount, setSaleAmount] = useState("");

  const [activeTab, setActiveTab] = useState<"overview" | "expenses" | "sales">(
    "overview"
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Verificar sesión
    const checkSession = async () => {
      try {
        // Si no hay sesión, se puede detectar por error del servidor
        // Por ahora asumimos que si llega aquí está autenticado
        loadData();
      } catch (error) {
        router.push("/login");
      }
    };

    checkSession();
  }, []);

  const loadData = async () => {
    try {
      const [expRes, salesRes] = await Promise.all([
        fetch("/api/expenses"),
        fetch("/api/sales"),
      ]);

      if (expRes.ok) {
        const data = await expRes.json();
        setExpenses(data.expenses || []);
        setSummary((prev) => ({
          ...prev,
          totalExpenses: data.total || 0,
        }));
      }

      if (salesRes.ok) {
        const data = await salesRes.json();
        setSales(data.sales || []);
        setSummary((prev) => ({
          ...prev,
          totalSales: data.total || 0,
        }));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  useEffect(() => {
    setSummary((prev) => ({
      ...prev,
      netProfit: prev.totalSales - prev.totalExpenses,
    }));
  }, [summary.totalExpenses, summary.totalSales]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDesc || !expenseAmount) {
      setMessage("Completa los campos");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: expenseDesc,
          amount: parseFloat(expenseAmount),
          category: expenseCategory,
        }),
      });

      if (res.ok) {
        setMessage("✓ Gasto agregado");
        setExpenseDesc("");
        setExpenseAmount("");
        setTimeout(() => {
          loadData();
          setMessage("");
        }, 500);
      } else {
        setMessage("Error al agregar gasto");
      }
    } catch (error) {
      setMessage("Error: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleDesc || !saleAmount) {
      setMessage("Completa los campos");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: saleDesc,
          amount: parseFloat(saleAmount),
        }),
      });

      if (res.ok) {
        setMessage("✓ Venta agregada");
        setSaleDesc("");
        setSaleAmount("");
        setTimeout(() => {
          loadData();
          setMessage("");
        }, 500);
      } else {
        setMessage("Error al agregar venta");
      }
    } catch (error) {
      setMessage("Error: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie =
      "argos_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">ARGOS</h1>
            <p className="text-xs text-gray-500">Worker Dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Message */}
      {message && (
        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mx-4 mt-4 rounded">
          {message}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Resumen Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm mb-2">Total Ventas</p>
            <p className="text-3xl font-bold text-green-600">
              ${summary.totalSales.toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <p className="text-gray-600 text-sm mb-2">Total Gastos</p>
            <p className="text-3xl font-bold text-red-600">
              ${summary.totalExpenses.toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm mb-2">Ganancia Neta</p>
            <p
              className={`text-3xl font-bold ${
                summary.netProfit >= 0 ? "text-blue-600" : "text-red-600"
              }`}
            >
              ${summary.netProfit.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 font-medium border-b-2 transition ${
              activeTab === "overview"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            📊 Resumen
          </button>
          <button
            onClick={() => setActiveTab("expenses")}
            className={`px-6 py-3 font-medium border-b-2 transition ${
              activeTab === "expenses"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            💸 Gastos
          </button>
          <button
            onClick={() => setActiveTab("sales")}
            className={`px-6 py-3 font-medium border-b-2 transition ${
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add Expense Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                ➕ Agregar Gasto
              </h2>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={expenseDesc}
                    onChange={(e) => setExpenseDesc(e.target.value)}
                    placeholder="Ej: Combustible"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                  >
                    <option>Combustible</option>
                    <option>Comida</option>
                    <option>Transporte</option>
                    <option>Otros</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50 font-medium"
                >
                  {loading ? "Guardando..." : "Agregar Gasto"}
                </button>
              </form>
            </div>

            {/* Add Sale Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                ➕ Agregar Venta
              </h2>
              <form onSubmit={handleAddSale} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={saleDesc}
                    onChange={(e) => setSaleDesc(e.target.value)}
                    placeholder="Ej: Venta de productos"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={saleAmount}
                    onChange={(e) => setSaleAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <div className="h-12"></div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-medium"
                >
                  {loading ? "Guardando..." : "Agregar Venta"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === "expenses" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Gastos del Día</h2>
              {expenses.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay gastos registrados hoy
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Descripción
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Categoría
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Monto
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Hora
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((expense) => (
                        <tr key={expense.id} className="border-t border-gray-200">
                          <td className="px-6 py-4 text-gray-900">
                            {expense.description}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                              {expense.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-red-600 font-semibold">
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
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ventas del Día</h2>
              {sales.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay ventas registradas hoy
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Descripción
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Monto
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Hora
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((sale) => (
                        <tr key={sale.id} className="border-t border-gray-200">
                          <td className="px-6 py-4 text-gray-900">
                            {sale.description}
                          </td>
                          <td className="px-6 py-4 text-green-600 font-semibold">
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
