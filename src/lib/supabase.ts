import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar se as variáveis de ambiente estão definidas
console.log("🔧 Configuração do Supabase:");
console.log("URL:", supabaseUrl ? "✅ Definida" : "❌ Não definida");
console.log("Key:", supabaseAnonKey ? "✅ Definida" : "❌ Não definida");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Variáveis de ambiente do Supabase não encontradas!");
  console.error("Crie um arquivo .env na raiz do projeto com:");
  console.error("VITE_SUPABASE_URL=sua_url_aqui");
  console.error("VITE_SUPABASE_ANON_KEY=sua_chave_aqui");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: "public",
  },
  global: {
    headers: {
      "X-Client-Info": "delivery-app",
    },
  },
});

// Teste de conexão
export const testConnection = async () => {
  try {
    console.log("🧪 Testando conexão com Supabase...");
    const { data, error } = await supabase
      .from("products")
      .select("count")
      .limit(1);

    if (error) {
      console.error("❌ Erro na conexão:", error);
      return { success: false, error };
    } else {
      console.log("✅ Conexão com Supabase funcionando!");
      return { success: true, data };
    }
  } catch (error) {
    console.error("❌ Erro inesperado:", error);
    return { success: false, error };
  }
};

// Auth helpers com melhor tratamento de erros
export const signIn = async (email: string, password: string) => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Configuração do Supabase não encontrada");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  } catch (error) {
    console.error("❌ Erro no login:", error);
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error("❌ Erro no logout:", error);
    return { error };
  }
};

export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error("❌ Erro ao obter usuário:", error);
    return null;
  }
};
