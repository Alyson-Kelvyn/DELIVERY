import React, { useState, useEffect } from "react";
import Login from "../components/admin/Login";
import Sidebar from "../components/admin/Sidebar";
import Dashboard from "../components/admin/Dashboard";
import Orders from "../components/admin/Orders";
import Products from "../components/admin/Products";
import Complements from "../components/admin/Complements";
import CategoryComplements from "../components/admin/CategoryComplements";
import { signOut, getCurrentUser } from "../lib/supabase";
import { Menu, X } from "lucide-react";

const AdminApp: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState("orders");
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  // Fecha o Sidebar automaticamente ao mudar para desktop
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setShowSidebar(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser();
      setIsAuthenticated(!!user);
    } catch (error) {
      console.error("Error checking auth:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await signOut();
    setIsAuthenticated(false);
    setActiveSection("orders");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "orders":
        return <Orders onNavigateSection={setActiveSection} />;
      case "orders-pendente":
        return (
          <Orders
            defaultFilter="pendente"
            section="pendente"
            onNavigateSection={setActiveSection}
          />
        );
      case "orders-confirmado":
        return (
          <Orders
            defaultFilter="confirmado"
            section="confirmado"
            onNavigateSection={setActiveSection}
          />
        );
      case "orders-entregue":
        return (
          <Orders
            defaultFilter="entregue"
            section="entregue"
            onNavigateSection={setActiveSection}
          />
        );
      case "products":
        return <Products />;
      case "complements":
        return <Complements />;
      case "category-complements":
        return <CategoryComplements />;
      default:
        return <Orders onNavigateSection={setActiveSection} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Botão sanduíche para mobile */}
      <button
        className={`md:hidden fixed top-4 left-4 z-30 bg-white p-2 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-opacity duration-300 ${
          showSidebar ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        onClick={() => setShowSidebar(true)}
        aria-label="Abrir menu"
        tabIndex={0}
      >
        <Menu className="h-6 w-6 text-gray-900" />
      </button>
      {/* Sidebar responsivo */}
      <div
        className={`fixed inset-0 z-20 transition-transform duration-300 md:static md:translate-x-0 ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:block`}
        style={{ maxWidth: "16rem", width: "100%" }}
        aria-modal={showSidebar ? "true" : undefined}
        role="dialog"
      >
        {/* Botão de fechar no mobile */}
        <button
          className="md:hidden absolute top-4 right-4 z-30 bg-white p-2 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-500"
          onClick={() => setShowSidebar(false)}
          aria-label="Fechar menu"
        >
          <X className="h-6 w-6 text-gray-900" />
        </button>
        <Sidebar
          activeSection={activeSection}
          onSectionChange={(section) => {
            setActiveSection(section);
            setShowSidebar(false); // Fecha o menu ao selecionar no mobile
          }}
        />
      </div>
      {/* Overlay para fechar o menu no mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-10 md:hidden transition-opacity duration-300 ${
          showSidebar ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setShowSidebar(false)}
        aria-hidden="true"
      />
      <div className="flex-1 overflow-x-hidden pt-4 md:pt-0">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminApp;
