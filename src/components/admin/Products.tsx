import React, { useState, useEffect } from "react";
import { Plus, Edit2, Eye, EyeOff, Trash2 } from "lucide-react";
import { Product } from "../../types";
import { supabase } from "../../lib/supabase";

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    image_url: "",
    available: true,
    category: "marmitas" as
      | "marmitas"
      | "bebidas"
      | "sobremesas"
      | "acompanhamentos",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching products:", error);
        // Demo data
        setProducts([
          {
            id: "1",
            name: "Marmita de Picanha",
            description:
              "Deliciosa picanha grelhada com arroz, feijão, farofa e vinagrete",
            price: 18.9,
            image_url:
              "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=500",
            available: true,
            category: "marmitas",
            created_at: new Date().toISOString(),
          },
          {
            id: "2",
            name: "Marmita de Maminha",
            description:
              "Suculenta maminha na brasa com acompanhamentos tradicionais",
            price: 16.9,
            image_url:
              "https://images.pexels.com/photos/2491273/pexels-photo-2491273.jpeg?auto=compress&cs=tinysrgb&w=500",
            available: true,
            category: "marmitas",
            created_at: new Date().toISOString(),
          },
        ]);
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingProduct) {
        // Update product
        const { error } = await supabase
          .from("products")
          .update(formData)
          .eq("id", editingProduct.id);

        if (error) {
          console.error("Error updating product:", error);
        } else {
          setProducts(
            products.map((p) =>
              p.id === editingProduct.id ? { ...p, ...formData } : p
            )
          );
        }
      } else {
        // Create new product
        const newProduct = {
          id: crypto.randomUUID(),
          ...formData,
          created_at: new Date().toISOString(),
        };

        const { error } = await supabase.from("products").insert([newProduct]);

        if (error) {
          console.error("Error creating product:", error);
        } else {
          setProducts([...products, newProduct]);
        }
      }

      resetForm();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const toggleAvailability = async (product: Product) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ available: !product.available })
        .eq("id", product.id);

      if (error) {
        console.error("Error updating availability:", error);
      } else {
        setProducts(
          products.map((p) =>
            p.id === product.id ? { ...p, available: !p.available } : p
          )
        );
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) {
        console.error("Error deleting product:", error);
      } else {
        setProducts(products.filter((p) => p.id !== productId));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      image_url: "",
      available: true,
      category: "marmitas",
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const startEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image_url,
      available: product.available,
      category: product.category,
    });
    setEditingProduct(product);
    setShowForm(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "marmitas":
        return "🥘";
      case "bebidas":
        return "🥤";
      case "sobremesas":
        return "🍰";
      case "acompanhamentos":
        return "🥗";
      default:
        return "🍽️";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "marmitas":
        return "Marmita";
      case "bebidas":
        return "Bebida";
      case "sobremesas":
        return "Sobremesa";
      case "acompanhamentos":
        return "Acompanhamento";
      default:
        return "Produto";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-center space-x-3 mb-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Produtos</h1>
          <p className="text-gray-600">Gerencie seu cardápio</p>
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Produto</span>
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingProduct ? "Editar Produto" : "Novo Produto"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as any,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="marmitas">🥘 Marmitas</option>
                  <option value="bebidas">🥤 Bebidas</option>
                  <option value="sobremesas">🍰 Sobremesas</option>
                  <option value="acompanhamentos">🥗 Acompanhamentos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value),
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem do Produto
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Para demo, vamos usar uma URL temporária
                      // Em produção, você faria upload para um serviço como Supabase Storage
                      const imageUrl = URL.createObjectURL(file);
                      setFormData({ ...formData, image_url: imageUrl });
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Selecione uma imagem do seu computador
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) =>
                    setFormData({ ...formData, available: e.target.checked })
                  }
                  className="mr-2"
                />
                <label
                  htmlFor="available"
                  className="text-sm font-medium text-gray-700"
                >
                  Produto disponível
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  {editingProduct ? "Atualizar" : "Criar"} Produto
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
          >
            {/* Imagem do produto */}
            <div className="relative h-48 bg-gray-100">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23d1d5db'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3E%3C/svg%3E";
                }}
              />
              {/* Status de disponibilidade */}
              <div className="absolute top-3 right-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    product.available
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}
                >
                  {product.available ? "✓ Disponível" : "✗ Indisponível"}
                </span>
              </div>
            </div>

            {/* Conteúdo do card */}
            <div className="p-6">
              {/* Categoria */}
              <div className="flex items-center mb-3">
                <span className="text-sm bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                  <span>{getCategoryIcon(product.category)}</span>
                  {getCategoryLabel(product.category)}
                </span>
              </div>

              {/* Nome do produto */}
              <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
                {product.name}
              </h3>

              {/* Descrição */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {product.description}
              </p>

              {/* Preço */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-red-600">
                  R$ {product.price.toFixed(2)}
                </span>
              </div>

              {/* Botões de ação */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAvailability(product)}
                    className={`p-2 rounded-lg transition-colors ${
                      product.available
                        ? "bg-gray-100 hover:bg-gray-200 text-gray-600"
                        : "bg-green-100 hover:bg-green-200 text-green-600"
                    }`}
                    title={
                      product.available
                        ? "Tornar indisponível"
                        : "Tornar disponível"
                    }
                  >
                    {product.available ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => startEdit(product)}
                    className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                    title="Editar produto"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                    title="Excluir produto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-16">
          <Plus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Nenhum produto cadastrado</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Criar Primeiro Produto
          </button>
        </div>
      )}
    </div>
  );
};

export default Products;
