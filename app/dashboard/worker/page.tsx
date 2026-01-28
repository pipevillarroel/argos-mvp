"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  price: number;
  active: boolean;
}

interface Shift {
  id: number;
  startTime: string;
  endTime: string | null;
  closed: boolean;
}

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
  product?: Product | null;
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

  // Shift and Product states
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  // Form states
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Otros");
  const [saleDesc, setSaleDesc] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");

  const [activeTab, setActiveTab] = useState<
    "overview" | "expenses" | "sales" | "shifts"
  >("overview");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Cargar datos iniciales
  useEffect(() => {
    fetchUserData();
    fetchCurrentShift();
    fetchProducts();
    fetchExpenses();
    fetchSales();

    const interval = setInterval(() => {
      fetchExpenses();
      fetchSales();
      fetchCurrentShift();
    }, 5000); // Actualizar cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  // Fetch user
  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  // Fetch current shift
  const fetchCurrentShift = async () => {
    try {
      const res = await fetch("/api/shifts");
      if (res.ok) {
        const data = await res.json();
        setCurrentShift(data.shift);
      }
    } catch (error) {
      console.error("Error fetching shift:", error);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Fetch expenses
  const fetchExpenses = async () => {
    try {
      const res = await fetch("/api/expenses");
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.expenses);
        updateSummary(data.expenses, sales);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  // Fetch sales
  const fetchSales = async () => {
    try {
      const res = await fetch("/api/sales");
      if (res.ok) {
        const data = await res.json();
        setSales(data.sales);
        updateSummary(expenses, data.sales);
      }
    } catch (error) {
      console.error("Error fetching sales:", error);
    }
  };

  // Update summary
  const updateSummary = (expensesData: Expense[], salesData: Sale[]) => {
    const totalExpenses = expensesData.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );
    const totalSales = salesData.reduce((sum, sale) => sum + sale.amount, 0);
    setSummary({
      totalExpenses,
      totalSales,
      netProfit: totalSales - totalExpenses,
    });
  };

  // Start shift
  const startShift = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/shifts", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setCurrentShift(data.shift);
        setMessage("Turno iniciado ✓");
        setTimeout(() => setMessage(""), 3000);
      } else {
        const error = await res.json();
        setMessage(error.error || "Error iniciando turno");
      }
    } catch (error) {
      console.error("Error starting shift:", error);
      setMessage("Error iniciando turno");
    } finally {
      setLoading(false);
    }
  };

  // End shift
  const endShift = async () => {
    if (!currentShift) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/shifts/${currentShift.id}/close`, {
        method: "PATCH",
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentShift(null);
        setMessage(
          `Turno finalizado. Ventas: $${data.summary.totalSales}, Gastos: $${data.summary.totalExpenses}, Ganancia: $${data.summary.profit}`
        );
        setTimeout(() => setMessage(""), 5000);
      } else {
        const error = await res.json();
        setMessage(error.error || "Error finalizando turno");
      }
    } catch (error) {
      console.error("Error ending shift:", error);
      setMessage("Error finalizando turno");
    } finally {
      setLoading(false);
    }
  };

  // Add expense
  const addExpense = async () => {
    if (!expenseDesc || !expenseAmount) {
      setMessage("Completa todos los campos");
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
          ...(currentShift && { shiftId: currentShift.id }),
        }),
      });

      if (res.ok) {
        setExpenseDesc("");
        setExpenseAmount("");
        setMessage("Gasto registrado ✓");
        setTimeout(() => setMessage(""), 2000);
        fetchExpenses();
      } else {
        setMessage("Error registrando gasto");
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      setMessage("Error registrando gasto");
    } finally {
      setLoading(false);
    }
  };

  // Add sale (with or without product)
  const addSale = async () => {
    if (!saleDesc && !selectedProduct) {
      setMessage("Selecciona un producto o ingresa monto");
      return;
    }

    setLoading(true);
    try {
      let amount = 0;
      let description = saleDesc;

      if (selectedProduct) {
        const product = products.find(
          (p) => p.id === parseInt(selectedProduct)
        );
        if (product) {
          amount = product.price;
          description = product.name;
        }
      } else {
        // No product selected, need manual amount
        if (!saleDesc) {
          setMessage("Ingresa monto si no usas catálogo");
          setLoading(false);
          return;
        }
        amount = parseFloat(saleDesc);
      }

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          amount,
          ...(selectedProduct && { productId: parseInt(selectedProduct) }),
          ...(currentShift && { shiftId: currentShift.id }),
        }),
      });

      if (res.ok) {
        setSaleDesc("");
        setSelectedProduct("");
        setMessage("Venta registrada ✓");
        setTimeout(() => setMessage(""), 2000);
        fetchSales();
      } else {
        setMessage("Error registrando venta");
      }
    } catch (error) {
      console.error("Error adding sale:", error);
      setMessage("Error registrando venta");
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bienvenido, {user?.name}
            </h1>
            <p className="text-gray-600 mt-1">Dashboard de Trabajador</p>
          </div>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
          >
            Salir
          </button>
        </div>

        {/* Shift Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600 text-sm mb-2">Estado del Turno</p>
              {currentShift ? (
                <p className="text-lg font-semibold text-green-600">
                  ✓ Turno Activo desde{" "}
                  {new Date(currentShift.startTime).toLocaleTimeString()}
                </p>
              ) : (
                <p className="text-lg font-semibold text-gray-500">
                  No hay turno activo
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {!currentShift ? (
                <button
                  onClick={startShift}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
                >
                  Iniciar Turno
                </button>
              ) : (
                <button
                  onClick={endShift}
                  disabled={loading}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
                >
                  Finalizar Turno
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded">
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-300">
          {(["overview", "expenses", "sales", "shifts"] as const).map((tab) => (
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
                    : "Turnos"}
            </button>
          ))}
        </div>

        {/* Overview Tab - ONLY PERSONAL DATA */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm font-semibold mb-2">
                MIS GASTOS HOY
              </p>
              <p className="text-3xl font-bold text-red-600">
                ${summary.totalExpenses.toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm font-semibold mb-2">
                MIS VENTAS HOY
              </p>
              <p className="text-3xl font-bold text-green-600">
                ${summary.totalSales.toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm font-semibold mb-2">
                MI GANANCIA HOY
              </p>
              <p
                className={`text-3xl font-bold ${summary.netProfit >= 0 ? "text-blue-600" : "text-red-600"}`}
              >
                ${summary.netProfit.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === "expenses" && (
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Registrar Gasto</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Descripción"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full text-gray-900 placeholder:text-gray-400"
                />
                <input
                  type="number"
                  placeholder="Monto"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full text-gray-900 placeholder:text-gray-400"
                />
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full text-gray-900"
                >
                  <option value="Otros">Otros</option>
                  <option value="Combustible">Combustible</option>
                  <option value="Comida">Comida</option>
                  <option value="Transporte">Transporte</option>
                </select>
              </div>
              <button
                onClick={addExpense}
                disabled={loading}
                className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition disabled:opacity-50 font-semibold"
              >
                Registrar Gasto
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Mis Gastos de Hoy</h2>
              {expenses.length === 0 ? (
                <p className="text-gray-500">Sin gastos registrados</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-gray-900">
                    <thead className="border-b border-gray-300">
                      <tr>
                        <th className="text-left py-2">Descripción</th>
                        <th className="text-left py-2">Categoría</th>
                        <th className="text-right py-2">Monto</th>
                        <th className="text-left py-2">Hora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((exp) => (
                        <tr
                          key={exp.id}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <td className="py-3">{exp.description}</td>
                          <td className="py-3">{exp.category}</td>
                          <td className="py-3 text-right text-red-600 font-semibold">
                            ${exp.amount.toFixed(2)}
                          </td>
                          <td className="py-3">
                            {new Date(exp.date).toLocaleTimeString()}
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
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Registrar Venta</h2>

              {/* Use product from catalog */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Selecciona un Producto del Catálogo:
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full text-gray-900"
                >
                  <option value="">-- Selecciona producto --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - ${p.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              {!selectedProduct && (
                <>
                  <div className="mb-4 border-t border-gray-300 pt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      O ingresa venta manual (sin catálogo):
                    </label>
                    <input
                      type="number"
                      placeholder="Monto de venta"
                      value={saleDesc}
                      onChange={(e) => setSaleDesc(e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2 w-full text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </>
              )}

              <button
                onClick={addSale}
                disabled={loading}
                className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition disabled:opacity-50 font-semibold"
              >
                Registrar Venta
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Mis Ventas de Hoy</h2>
              {sales.length === 0 ? (
                <p className="text-gray-500">Sin ventas registradas</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-gray-900">
                    <thead className="border-b border-gray-300">
                      <tr>
                        <th className="text-left py-2">Producto/Descripción</th>
                        <th className="text-right py-2">Monto</th>
                        <th className="text-left py-2">Hora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((sale) => (
                        <tr
                          key={sale.id}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <td className="py-3">
                            {sale.product?.name || sale.description}
                          </td>
                          <td className="py-3 text-right text-green-600 font-semibold">
                            ${sale.amount.toFixed(2)}
                          </td>
                          <td className="py-3">
                            {new Date(sale.date).toLocaleTimeString()}
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

        {/* Shifts Tab */}
        {activeTab === "shifts" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Historial de Turnos</h2>
            <p className="text-gray-600 text-sm mb-4">
              Una vez finalizado un turno, la información queda en solo lectura.
              Los turnos no pueden editarse ni eliminarse.
            </p>
            <p className="text-gray-500">
              Funcionalidad de historial próximamente...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
