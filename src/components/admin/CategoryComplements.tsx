import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { ListPlus, Save } from "lucide-react";
import Notification from "./Notification";
import { Product } from "../../types";

type Category = "marmitas" | "bebidas" | "sobremesas";

const CategoryComplements: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>("marmitas");
  const [allComplements, setAllComplements] = useState<Product[]>([]);
  const [selectedComplements, setSelectedComplements] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
    isVisible: boolean;
  }>({ message: "", type: "info", isVisible: false });

  const categories: { value: Category; label: string; icon: string }[] = [
    { value: "marmitas", label: "Marmitas", icon: "🥘" },
    { value: "bebidas", label: "Bebidas", icon: "🥤" },
    { value: "sobremesas", label: "Sobremesas", icon: "🍰" },
  ];

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Carrega todos complementos disponíveis
      const { data: complements, error: compError } = await supabase
        .from("products")
        .select("*")
        .eq("category", "acompanhamentos")
        .eq("available", true)
        .order("name");

      if (compError) throw compError;
      setAllComplements(complements || []);

      // Carrega vínculos da categoria selecionada
      const { data: links, error: linkError } = await supabase
        .from("category_complements")
        .select("complement_id")
        .eq("category", selectedCategory);

      if (linkError) throw linkError;

      const map: Record<string, boolean> = {};
      (links || []).forEach((row: { complement_id: string }) => {
        map[row.complement_id] = true;
      });
      setSelectedComplements(map);
    } catch {
      showNotification("Erro ao carregar dados", "error");
    } finally {
      setLoading(false);
    }
  };

  const saveComplements = async () => {
    setLoading(true);
    try {
      // Busca existentes
      const { data: existing } = await supabase
        .from("category_complements")
        .select("complement_id")
        .eq("category", selectedCategory);

      const existingSet = new Set((existing || []).map((r: { complement_id: string }) => r.complement_id));
      const selectedIds = Object.keys(selectedComplements).filter((id) => selectedComplements[id]);
      const selectedSet = new Set(selectedIds);

      // Inserts: selecionados - existentes
      const toInsert = selectedIds
        .filter((id) => !existingSet.has(id))
        .map((id) => ({ category: selectedCategory, complement_id: id }));

      // Deletes: existentes - selecionados
      const toDelete = [...existingSet].filter((id) => !selectedSet.has(id));

      if (toInsert.length > 0) {
        await supabase.from("category_complements").insert(toInsert);
      }
      if (toDelete.length > 0) {
        for (const complementId of toDelete) {
          await supabase
            .from("category_complements")
            .delete()
            .match({ category: selectedCategory, complement_id: complementId });
        }
      }

      showNotification("Complementos atualizados para " + categories.find((c) => c.value === selectedCategory)?.label + "!", "success");
    } catch {
      showNotification("Erro ao salvar complementos", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "info"
  ) => setNotification({ message, type, isVisible: true });

  const hideNotification = () => setNotification((p) => ({ ...p, isVisible: false }));

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Complementos por Categoria</h1>
        <p className="text-gray-600">Configure quais complementos aparecem para cada categoria de produto</p>
      </div>

      {/* Seletor de categoria */}
      <div className="flex justify-center gap-3 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-3 rounded-lg font-semibold transition-all ${
              selectedCategory === cat.value
                ? "bg-red-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span className="mr-2">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Complementos para {categories.find((c) => c.value === selectedCategory)?.label}
              </h3>
              <button
                onClick={saveComplements}
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" /> Salvar Alterações
              </button>
            </div>

            {allComplements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ListPlus className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Nenhum complemento cadastrado.</p>
                <p className="text-sm">Crie complementos em Admin → Complementos primeiro.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {allComplements.map((c) => (
                  <label
                    key={c.id}
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedComplements[c.id]
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-red-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!selectedComplements[c.id]}
                      onChange={(e) =>
                        setSelectedComplements((prev) => ({ ...prev, [c.id]: e.target.checked }))
                      }
                      className="h-5 w-5 text-red-600 focus:ring-red-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{c.name}</div>
                      <div className="text-sm text-gray-600">R$ {c.price.toFixed(2)}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <strong>ℹ️ Importante:</strong> Os complementos selecionados aqui aparecerão automaticamente para{" "}
            <strong>todos os produtos</strong> da categoria{" "}
            <strong>{categories.find((c) => c.value === selectedCategory)?.label}</strong>.
          </div>
        </>
      )}

      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
        duration={3000}
      />
    </div>
  );
};

export default CategoryComplements;
