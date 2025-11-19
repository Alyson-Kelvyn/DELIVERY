import React, { useState, useEffect } from "react";
import { Product } from "../types";
import ProductCard from "./ProductCard";
import { supabase } from "../lib/supabase";

type Category =
  | "todos"
  | "marmitas"
  | "bebidas"
  | "sobremesas";

const Menu: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category>("todos");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("available", true)
        .order("name");

      if (error) {
        console.error("Error fetching products:", error);
        // Fallback data for demo
      } else {
        // Filtrar produtos que estão disponíveis E (não têm controle de estoque OU têm estoque > 0)
        const filteredData = (data || []).filter(
          (product) =>
            product.available &&
            (product.stock === null ||
              product.stock === undefined ||
              product.stock > 0)
        );
        setProducts(filteredData);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts =
    selectedCategory === "todos"
      ? products.filter((p) => p.category !== "acompanhamentos")
      : products.filter((product) => product.category === selectedCategory);

  const categories: { value: Category; label: string }[] = [
    { value: "todos", label: "Todos" },
    { value: "marmitas", label: "Marmitas" },
    { value: "bebidas", label: "Bebidas" },
    { value: "sobremesas", label: "Sobremesas" },
  ];

  if (loading) {
    return (
      <section className="bg-gray-50 min-h-screen">
        {/* Loading categories */}
        <div className="bg-white sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-0">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 w-24 bg-gray-200 shimmer border-b-2 border-gray-200"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Loading products */}
        <div className="container mx-auto px-4 py-6 space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex">
                <div className="w-32 h-32 bg-gray-200 shimmer"></div>
                <div className="flex-1 p-4 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4 shimmer"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full shimmer"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 shimmer"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-200 rounded w-1/4 shimmer"></div>
                    <div className="h-8 bg-gray-200 rounded w-16 shimmer"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 min-h-screen">
      {/* Filtros de Categoria - Estilo abas horizontais */}
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-0">
          <div className="flex overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`flex-shrink-0 px-6 py-4 text-sm font-medium transition-all duration-300 whitespace-nowrap border-b-2 ${
                  selectedCategory === category.value
                    ? "text-red-600 border-red-600 bg-red-50"
                    : "text-gray-600 border-transparent hover:text-red-600 hover:bg-red-50"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className="container mx-auto px-4 py-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white max-w-md mx-auto p-8 rounded-2xl shadow-sm">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-gray-600">
                Não há produtos disponíveis nesta categoria no momento
              </p>
            </div>
          </div>
        ) : selectedCategory === "todos" ? (
          // Agrupado por categoria quando "Todos" está selecionado
          <div className="space-y-10">
            {categories
              .filter((c) => c.value !== "todos")
              .map((cat) => {
                const items = products.filter(
                  (p) => p.category === cat.value
                );
                if (items.length === 0) return null;
                return (
                  <div key={cat.value} id={`sec-${cat.value}`} className="scroll-mt-20">
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-4">
                      {cat.label}
                    </h2>
                    <div className="space-y-4">
                      {items.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          // Lista simples quando uma categoria específica está selecionada
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Menu;
