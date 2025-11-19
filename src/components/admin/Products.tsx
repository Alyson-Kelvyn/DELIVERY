import React, { useState, useEffect } from "react";
import { Plus, Edit2, Eye, EyeOff, Trash2, X } from "lucide-react";
import { Product } from "../../types";
import { supabase } from "../../lib/supabase";
import Notification from "./Notification";

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    image_url: "",
    available: true,
    stock: undefined as number | undefined,
    useStock: false, // Controla se o produto usa controle de estoque
    category: "marmitas" as
      | "marmitas"
      | "bebidas"
      | "sobremesas"
      | "acompanhamentos",
  });
  const [showStockModal, setShowStockModal] = useState(false);
  const [editingStockProduct, setEditingStockProduct] =
    useState<Product | null>(null);
  const [newStockValue, setNewStockValue] = useState("");
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
    isVisible: boolean;
  }>({
    message: "",
    type: "info",
    isVisible: false,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showStockModal) {
        closeStockModal();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showStockModal]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
        showNotification(
          "Erro ao carregar produtos: " + error.message,
          "error"
        );
      } else {
        // Filtra acompanhamentos para não aparecer na lista de produtos
        const filtered = (data || []).filter((p) => p.category !== "acompanhamentos");
        setProducts(filtered);
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification("Erro inesperado ao carregar produtos", "error");
    } finally {
      setLoading(false);
    }
  };

  // Função para fazer upload da imagem para o Supabase Storage
  const uploadImage = async (file: File): Promise<string> => {
    try {
      setUploadingImage(true);

      // Gerar nome único para o arquivo
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      // Upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from("products")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Obter URL pública da imagem
      const {
        data: { publicUrl },
      } = supabase.storage.from("products").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Erro no upload da imagem:", error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Verificar se o usuário está autenticado
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        showNotification(
          "Você precisa estar logado para criar produtos.",
          "error"
        );
        return;
      }

      // Preparar dados do produto (removendo useStock que é apenas para UI)
      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        image_url: formData.image_url,
        available: formData.available,
        category: formData.category,
        stock: formData.useStock ? formData.stock : null, // Se não usar estoque, define como null
      };

      if (editingProduct) {
        // Update product
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) {
          console.error("Error updating product:", error);
          showNotification(
            "Erro ao atualizar produto: " + error.message,
            "error"
          );
        } else {
          setProducts(
            products.map((p) =>
              p.id === editingProduct.id ? { ...p, ...productData } : p
            )
          );
          showNotification("Produto atualizado com sucesso!", "success");
        }
      } else {
        // Create new product
        const newProduct = {
          id: crypto.randomUUID(),
          ...productData,
          created_at: new Date().toISOString(),
        };

        const { error } = await supabase.from("products").insert([newProduct]);

        if (error) {
          console.error("Error creating product:", error);
          showNotification("Erro ao criar produto: " + error.message, "error");
        } else {
          setProducts([...products, newProduct]);
          showNotification("Produto criado com sucesso!", "success");
        }
      }

      resetForm();
    } catch (error) {
      console.error("Error:", error);
      showNotification("Erro inesperado: " + (error as Error).message, "error");
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

  const updateStock = async (product: Product, newStock: number) => {
    try {
      const updateData: any = { stock: newStock };

      // Se o estoque chegou a zero e o produto tem controle de estoque, torná-lo indisponível
      if (newStock <= 0 && product.stock !== null) {
        updateData.available = false;
      }

      // Se o estoque foi reposto e o produto estava indisponível por falta de estoque, reativá-lo
      if (
        newStock > 0 &&
        product.stock !== null &&
        !product.available &&
        product.stock <= 0
      ) {
        updateData.available = true;
      }

      const { error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", product.id);

      if (error) {
        console.error("Error updating stock:", error);
        showNotification(
          "Erro ao atualizar estoque: " + error.message,
          "error"
        );
      } else {
        setProducts(
          products.map((p) =>
            p.id === product.id
              ? {
                  ...p,
                  stock: newStock,
                  available:
                    updateData.available !== undefined
                      ? updateData.available
                      : p.available,
                }
              : p
          )
        );

        if (newStock <= 0 && product.stock !== null) {
          showNotification(
            `Produto "${product.name}" ficou indisponível por falta de estoque.`,
            "warning"
          );
        } else if (
          newStock > 0 &&
          product.stock !== null &&
          !product.available &&
          product.stock <= 0
        ) {
          showNotification(
            `Produto "${product.name}" foi reativado! Estoque reposto.`,
            "success"
          );
        }
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification(
        "Erro inesperado ao atualizar estoque: " + (error as Error).message,
        "error"
      );
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      image_url: "",
      available: true,
      stock: undefined,
      useStock: false,
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
      stock: product.stock,
      useStock: product.stock !== null && product.stock !== undefined, // Ativa se o produto tem estoque
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

  const openStockModal = (product: Product) => {
    setEditingStockProduct(product);
    setNewStockValue(product.stock?.toString() || "0");
    setShowStockModal(true);
  };

  const closeStockModal = () => {
    setShowStockModal(false);
    setEditingStockProduct(null);
    setNewStockValue("");
  };

  const handleStockSubmit = async () => {
    if (!editingStockProduct) return;

    const stockValue = parseInt(newStockValue);
    if (isNaN(stockValue) || stockValue < 0) {
      showNotification(
        "Por favor, insira um número válido (0 ou maior).",
        "error"
      );
      return;
    }

    await updateStock(editingStockProduct, stockValue);
    closeStockModal();
  };

  const handleStockInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permitir apenas números e string vazia
    if (value === "" || /^\d+$/.test(value)) {
      setNewStockValue(value);
    }
  };

  const handleStockInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (
        newStockValue !== "" &&
        !isNaN(parseInt(newStockValue)) &&
        parseInt(newStockValue) >= 0
      ) {
        handleStockSubmit();
      }
    }
  };

  const showNotification = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "info"
  ) => {
    setNotification({
      message,
      type,
      isVisible: true,
    });
  };

  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
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
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        showNotification("Fazendo upload da imagem...", "info");
                        const imageUrl = await uploadImage(file);
                        setFormData({ ...formData, image_url: imageUrl });
                        showNotification(
                          "Imagem enviada com sucesso!",
                          "success"
                        );
                      } catch (error) {
                        console.error("Erro no upload:", error);
                        showNotification(
                          "Erro ao enviar imagem: " + (error as Error).message,
                          "error"
                        );
                      }
                    }
                  }}
                  disabled={uploadingImage}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {uploadingImage
                    ? "Enviando imagem..."
                    : "Selecione uma imagem do seu computador"}
                </p>
                {formData.image_url && (
                  <div className="mt-2">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-24 h-24 object-contain rounded-lg border"
                    />
                  </div>
                )}
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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="useStock"
                  checked={formData.useStock}
                  onChange={(e) =>
                    setFormData({ ...formData, useStock: e.target.checked })
                  }
                  className="mr-2"
                />
                <label
                  htmlFor="useStock"
                  className="text-sm font-medium text-gray-700"
                >
                  Controle de Estoque
                </label>
              </div>
              <p className="text-xs text-gray-500 -mt-2 mb-2">
                {formData.useStock
                  ? "O produto será removido automaticamente quando o estoque chegar a zero"
                  : "O produto ficará disponível até ser marcado como indisponível manualmente"}
              </p>

              {formData.useStock && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade em Estoque
                  </label>
                  <input
                    type="number"
                    min="0"
                    required={formData.useStock}
                    value={formData.stock || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock: parseInt(e.target.value) || undefined,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Ex: 50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Quantidade disponível em estoque
                  </p>
                </div>
              )}

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
            <div className="relative h-64">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-contain"
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
                      : product.stock !== null && product.stock <= 0
                      ? "bg-red-100 text-red-800 border border-red-200"
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}
                >
                  {product.available
                    ? "✓ Disponível"
                    : product.stock !== null && product.stock <= 0
                    ? "✗ Sem Estoque"
                    : "✗ Indisponível"}
                </span>
              </div>
            </div>

            {/* Conteúdo do card */}
            <div className="p-6">
              {/* Categoria */}
              <div className="flex items-center mb-3">
                <span className="text-sm bg-primary-100 text-primary-800 px-3 py-1 rounded-full font-medium flex items-center gap-1">
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
                {/* Exibir estoque se o produto tiver controle de estoque */}
                {product.stock !== null && product.stock !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">📦</span>
                    <span
                      className={`text-sm font-medium ${
                        product.stock > 0
                          ? product.stock <= 5
                            ? "text-primary-600"
                            : "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {product.stock} un
                    </span>
                    <button
                      onClick={() => openStockModal(product)}
                      className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-600 px-2 py-1 rounded transition-colors"
                      title="Editar estoque"
                    >
                      ✏️
                    </button>
                  </div>
                )}
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

      {/* Modal de Edição de Estoque */}
      {showStockModal && editingStockProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Editar Estoque
              </h3>
              <button
                onClick={closeStockModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                Produto:{" "}
                <span className="font-semibold">
                  {editingStockProduct.name}
                </span>
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Estoque atual:{" "}
                <span className="font-medium">
                  {editingStockProduct.stock || 0} unidades
                </span>
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nova quantidade de estoque:
              </label>
              <input
                type="number"
                min="0"
                value={newStockValue}
                onChange={handleStockInputChange}
                onKeyDown={handleStockInputKeyDown}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  newStockValue === "" || parseInt(newStockValue) >= 0
                    ? "border-gray-300"
                    : "border-red-300 bg-red-50"
                }`}
                placeholder="Digite a nova quantidade"
                autoFocus
              />
              {newStockValue !== "" &&
                (isNaN(parseInt(newStockValue)) ||
                  parseInt(newStockValue) < 0) && (
                  <p className="text-red-500 text-sm mt-1">
                    Por favor, insira um número válido (0 ou maior).
                  </p>
                )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeStockModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleStockSubmit}
                disabled={
                  newStockValue === "" ||
                  isNaN(parseInt(newStockValue)) ||
                  parseInt(newStockValue) < 0
                }
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  newStockValue === "" ||
                  isNaN(parseInt(newStockValue)) ||
                  parseInt(newStockValue) < 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                Atualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Componente de Notificação */}
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
        duration={4000}
      />
    </div>
  );
};

export default Products;
