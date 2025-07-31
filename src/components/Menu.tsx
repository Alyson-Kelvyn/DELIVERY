import React, { useState, useEffect } from "react";
import { Product } from "../types";
import ProductCard from "./ProductCard";
import { supabase } from "../lib/supabase";

type Category =
  | "todos"
  | "marmitas"
  | "bebidas"
  | "sobremesas"
  | "acompanhamentos";

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
            stock: 15,
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
            stock: 8,
            category: "marmitas",
            created_at: new Date().toISOString(),
          },
          {
            id: "3",
            name: "Marmita de Fraldinha",
            description:
              "Fraldinha temperada na medida certa com todos os acompanhamentos",
            price: 15.9,
            image_url:
              "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=500",
            available: true,
            stock: 3,
            category: "marmitas",
            created_at: new Date().toISOString(),
          },
          {
            id: "4",
            name: "Marmita de Costela",
            description: "Costela bovina assada lentamente, derretendo na boca",
            price: 19.9,
            image_url:
              "https://images.pexels.com/photos/1251198/pexels-photo-1251198.jpeg?auto=compress&cs=tinysrgb&w=500",
            available: true,
            stock: 0,
            category: "marmitas",
            created_at: new Date().toISOString(),
          },
          {
            id: "5",
            name: "Marmita de Linguiça",
            description: "Linguiça artesanal grelhada com temperos especiais",
            price: 13.9,
            image_url:
              "https://images.pexels.com/photos/248444/pexels-photo-248444.jpeg?auto=compress&cs=tinysrgb&w=500",
            available: true,
            stock: null,
            category: "marmitas",
            created_at: new Date().toISOString(),
          },
          {
            id: "6",
            name: "Marmita de Alcatra",
            description:
              "Alcatra macia e suculenta com o sabor inconfundível do churrasco",
            price: 17.9,
            image_url:
              "https://images.pexels.com/photos/1409050/pexels-photo-1409050.jpeg?auto=compress&cs=tinysrgb&w=500",
            available: true,
            stock: 12,
            category: "marmitas",
            created_at: new Date().toISOString(),
          },
          {
            id: "7",
            name: "Refrigerante Coca-Cola 350ml",
            description: "Refrigerante Coca-Cola gelado",
            price: 4.5,
            image_url:
              "https://images.pexels.com/photos/1627763/pexels-photo-1627763.jpeg?auto=compress&cs=tinysrgb&w=500",
            available: true,
            stock: 25,
            category: "bebidas",
            created_at: new Date().toISOString(),
          },
          {
            id: "8",
            name: "Pudim de Leite",
            description: "Pudim de leite caseiro com calda de caramelo",
            price: 8.0,
            image_url:
              "https://images.pexels.com/photos/162553/pexels-photo-162553.jpeg?auto=compress&cs=tinysrgb&w=500",
            available: true,
            stock: 0,
            category: "sobremesas",
            created_at: new Date().toISOString(),
          },
        ]);
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
      ? products
      : products.filter((product) => product.category === selectedCategory);

  const categories: { value: Category; label: string; icon: string }[] = [
    { value: "todos", label: "Todos", icon: "🍽️" },
    { value: "marmitas", label: "Marmitas", icon: "🥘" },
    { value: "bebidas", label: "Bebidas", icon: "🥤" },
    { value: "sobremesas", label: "Sobremesas", icon: "🍰" },
    { value: "acompanhamentos", label: "Acompanhamentos", icon: "🥗" },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl animate-pulse">
              <div className="h-64 bg-gray-300 rounded-t-xl bg-gray-50"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-full"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                  <div className="h-10 bg-gray-300 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Nosso Cardápio
        </h2>
        <p className="text-gray-600">
          Deliciosas opções preparadas com carinho
        </p>
      </div>

      {/* Filtros de Categoria */}
      <div className="mb-8">
        {/* Container com scroll horizontal para mobile */}
        <div className="relative">
          <div className="flex overflow-x-auto scrollbar-hide pb-2 md:flex-wrap md:justify-center md:gap-2 gap-3 md:gap-2 px-4 md:px-0">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === category.value
                    ? "bg-orange-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>

          {/* Indicadores visuais de scroll no mobile */}
          <div className="md:hidden absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
          <div className="md:hidden absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">
            Nenhum produto disponível nesta categoria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Menu;
