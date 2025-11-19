import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Plus, Trash2, Eye, EyeOff, Edit2 } from "lucide-react";
import Notification from "./Notification";
import { Product } from "../../types";

// Nesta tela, tratamos complementos como products da categoria 'acompanhamentos'

const Complements: React.FC = () => {
  const [complements, setComplements] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{ 
    name: string; 
    price: string; 
    available: boolean;
    categories: string[];
  }>({
    name: "", 
    price: "0,00", 
    available: true,
    categories: []
  });
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
    isVisible: boolean;
  }>({ message: "", type: "info", isVisible: false });
  const [editing, setEditing] = useState<Product | null>(null);

  useEffect(() => {
    fetchComplements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchComplements = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", "acompanhamentos")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setComplements(data || []);
    } catch {
      showNotification("Erro ao carregar complementos", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "info"
  ) => setNotification({ message, type, isVisible: true });
  const hideNotification = () => setNotification((p) => ({ ...p, isVisible: false }));

  const formatPriceInput = (value: string) => {
    // Remove tudo exceto números
    const numbers = value.replace(/\D/g, "");
    
    // Se vazio, retorna 0,00
    if (!numbers) return "0,00";
    
    // Converte para número e divide por 100 para ter centavos
    const numberValue = parseInt(numbers, 10) / 100;
    
    // Formata com vírgula como separador decimal
    return numberValue.toFixed(2).replace(".", ",");
  };

  const parseFormattedPrice = (formattedPrice: string): number => {
    // Remove tudo exceto números e vírgula
    const cleaned = formattedPrice.replace(/[^\d,]/g, "");
    // Substitui vírgula por ponto para conversão
    return parseFloat(cleaned.replace(",", "."));
  };

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ name: "", price: "0,00", available: true, categories: [] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const priceValue = parseFormattedPrice(form.price);
      
      if (editing) {
        const { error } = await supabase
          .from("products")
          .update({ name: form.name, price: priceValue, available: form.available })
          .eq("id", editing.id);
        if (error) throw error;
        
        // Atualiza as categorias associadas
        await supabase.from("category_complements").delete().eq("complement_id", editing.id);
        
        if (form.categories.length > 0) {
          const categoryLinks = form.categories.map(cat => ({
            category: cat,
            complement_id: editing.id
          }));
          await supabase.from("category_complements").insert(categoryLinks);
        }
        
        showNotification("Complemento atualizado!", "success");
      } else {
        const newComplement: Product = {
          id: crypto.randomUUID(),
          name: form.name,
          description: "",
          price: priceValue,
          image_url: "",
          available: form.available,
          stock: undefined,
          category: "acompanhamentos",
          created_at: new Date().toISOString(),
        };
        const { error } = await supabase.from("products").insert([newComplement]);
        if (error) throw error;
        
        // Salva as categorias associadas
        if (form.categories.length > 0) {
          const categoryLinks = form.categories.map(cat => ({
            category: cat,
            complement_id: newComplement.id
          }));
          await supabase.from("category_complements").insert(categoryLinks);
        }
        
        showNotification("Complemento criado!", "success");
      }
      resetForm();
      fetchComplements();
    } catch {
      showNotification("Erro ao salvar complemento", "error");
    }
  };

  const toggleAvailability = async (c: Product) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ available: !c.available })
        .eq("id", c.id);
      if (error) throw error;
      setComplements((prev) => prev.map((p) => (p.id === c.id ? { ...p, available: !p.available } : p)));
    } catch {
      showNotification("Erro ao alterar disponibilidade", "error");
    }
  };

  const deleteComplement = async (id: string) => {
    if (!confirm("Excluir este complemento?")) return;
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      setComplements((prev) => prev.filter((p) => p.id !== id));
      showNotification("Complemento excluído", "success");
    } catch {
      showNotification("Erro ao excluir complemento", "error");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Complementos</h1>
        <p className="text-gray-600">Crie e gerencie complementos (nome e valor)</p>
      </div>

      <div className="flex justify-center mb-6">
        <button
          onClick={() => { setShowForm(true); setEditing(null); setForm({ name: "", price: "0,00", available: true, categories: [] }); }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Complemento</span>
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">{editing ? 'Editar Complemento' : 'Novo Complemento'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor (R$)</label>
                <input
                  type="text"
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: formatPriceInput(e.target.value) })}
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categorias</label>
                <div className="space-y-2">
                  {['marmitas', 'bebidas', 'sobremesas'].map((cat) => (
                    <label key={cat} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.categories.includes(cat)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setForm({ ...form, categories: [...form.categories, cat] });
                          } else {
                            setForm({ ...form, categories: form.categories.filter(c => c !== cat) });
                          }
                        }}
                      />
                      <span className="text-sm capitalize">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) => setForm({ ...form, available: e.target.checked })}
                />
                <span className="text-sm">Disponível</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold">
                  {editing ? 'Salvar' : 'Criar'}
                </button>
                <button type="button" onClick={resetForm} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {complements.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800 truncate">{c.name}</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleAvailability(c)} className={`p-2 rounded-lg ${c.available ? 'bg-gray-100' : 'bg-green-100'}`}>
                  {c.available ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                </button>
                <button 
                  onClick={async () => { 
                    setEditing(c);
                    // Busca categorias associadas
                    const { data } = await supabase
                      .from("category_complements")
                      .select("category")
                      .eq("complement_id", c.id);
                    const cats = data?.map(d => d.category) || [];
                    setForm({ 
                      name: c.name, 
                      price: c.price.toFixed(2).replace(".", ","), 
                      available: c.available,
                      categories: cats
                    });
                    setShowForm(true);
                  }} 
                  className="p-2 bg-blue-100 text-blue-600 rounded-lg"
                >
                  <Edit2 className="h-4 w-4"/>
                </button>
                <button onClick={() => deleteComplement(c.id)} className="p-2 bg-red-100 text-red-600 rounded-lg">
                  <Trash2 className="h-4 w-4"/>
                </button>
              </div>
            </div>
            <div className="text-lg font-bold text-red-600">R$ {c.price.toFixed(2)}</div>
            <div className="text-xs text-gray-500 mt-1">{c.available ? 'Disponível' : 'Indisponível'}</div>
          </div>
        ))}
      </div>

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

export default Complements;
