import React from "react";
import { BarChart3, Package, ShoppingBag, LogOut, ChefHat } from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSectionChange,
  onLogout,
}) => {
  const menuItems = [
    { id: "orders", icon: ShoppingBag, label: "Pedidos do Dia" },
    { id: "dashboard", icon: BarChart3, label: "Dashboard" },
    { id: "products", icon: Package, label: "Produtos" },
  ];

  return (
    <div
      className="bg-gray-900 text-white w-64 min-h-screen h-full p-4 pt-20 md:pt-4 relative focus:outline-none"
      tabIndex={-1}
    >
      <div className="flex items-center space-x-3 mb-8">
        <ChefHat className="h-8 w-8 text-red-400" />
        <div>
          <h1 className="font-bold text-lg">Admin Panel</h1>
          <p className="text-gray-400 text-sm">ChurrascoDelivery</p>
        </div>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === item.id
                  ? "bg-red-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
