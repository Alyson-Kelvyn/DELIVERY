import React, { useEffect, useMemo, useState } from "react";
import { Product } from "../types";
import { supabase } from "../lib/supabase";
import { Minus, Plus } from "lucide-react";

interface ComplementModalProps {
  open: boolean;
  product: Product;
  onClose: () => void;
  onConfirm: (data: { selectedComplements: Product[]; observation?: string }) => void;
}

const ComplementModal: React.FC<ComplementModalProps> = ({ open, product, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complements, setComplements] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [observation, setObservation] = useState("");

  useEffect(() => {
    if (!open) return;
    const fetchComplements = async () => {
      try {
        setLoading(true);
        setError(null);
        // 1) Consulta vínculos pela categoria do produto
        const { data: links, error: linkError } = await supabase
          .from("category_complements")
          .select("complement_id")
          .eq("category", product.category);
        if (linkError) throw linkError;
        const ids = (links || []).map((l: { complement_id: string }) => l.complement_id);
        if (ids.length === 0) {
          setComplements([]);
          return;
        }
        // 2) Busca dados dos complementos (products)
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .in("id", ids)
          .eq("available", true)
          .order("name");
        if (error) throw error;
        const filtered = (data || []).filter(
          (p) => p.available && (p.stock === null || p.stock === undefined || p.stock > 0)
        );
        setComplements(filtered as Product[]);
      } catch {
        setError("Não foi possível carregar os complementos.");
      } finally {
        setLoading(false);
      }
    };
    fetchComplements();
  }, [open, product.category]);

  useEffect(() => {
    if (open) {
      setQuantities({});
      setObservation("");
    }
  }, [open]);

  const selectedComplements = useMemo(() => {
    const result: Product[] = [];
    complements.forEach((c) => {
      const q = quantities[c.id] || 0;
      for (let i = 0; i < q; i++) result.push(c);
    });
    return result;
  }, [complements, quantities]);

  const totalComplements = useMemo(() => {
    return complements.reduce((sum, c) => sum + (quantities[c.id] || 0) * c.price, 0);
  }, [complements, quantities]);

  const inc = (id: string) => {
    setQuantities((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };
  const dec = (id: string) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl sm:shadow-lg sm:mx-4 rounded-t-2xl overflow-hidden">
        {/* Cabeçalho do produto */}
        <div className="px-5 py-4 border-b">
          <div className="flex items-start gap-3">
            <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 truncate">{product.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
            </div>
          </div>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
          {/* Botão avançar como no exemplo */}
          <div className="flex justify-center">
            <button
              onClick={() => onConfirm({ selectedComplements, observation })}
              className="px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow"
            >
              Avançar →
            </button>
          </div>

          {loading && (
            <div className="text-sm text-gray-600">Carregando complementos...</div>
          )}
          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}

          {!loading && !error && (
            <>
              {complements.length === 0 ? (
                <div className="text-sm text-gray-600">Sem complementos disponíveis no momento.</div>
              ) : (
                <div className="space-y-3">
                  <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-semibold">
                    Complementos <span className="text-gray-500 font-normal">(Opcional)</span>
                  </div>
                  {complements.map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-3 p-3 border rounded-xl">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{c.name}</div>
                        <div className="text-xs text-gray-500">R$ {c.price.toFixed(2)}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => dec(c.id)} className="h-9 w-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200">
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-[1.5rem] text-center font-semibold">{quantities[c.id] || 0}</span>
                        <button onClick={() => inc(c.id)} className="h-9 w-9 flex items-center justify-center rounded-lg bg-gray-900 text-white hover:bg-gray-800">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Observação</label>
                <textarea
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  rows={3}
                  placeholder="Ex.: sem cebola, ponto da carne, etc."
                />
              </div>
            </>
          )}
        </div>
        <div className="px-5 py-4 border-t bg-white">
          <div className="flex items-center justify-between">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100">Voltar</button>
            <button
              onClick={() => onConfirm({ selectedComplements, observation })}
              className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow"
            >
              Avançar → {totalComplements > 0 && <span className="ml-2 text-emerald-100">+ R$ {totalComplements.toFixed(2)}</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplementModal;
