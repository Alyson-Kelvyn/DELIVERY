# Sistema de Delivery para Churrascaria - Banco de Dados

Este repositório contém todo o código SQL e políticas de segurança para o sistema de delivery da churrascaria.

## 📁 Estrutura dos Arquivos

- **`database_complete.sql`** - Esquema completo do banco de dados
- **`database_policies.sql`** - Políticas de segurança detalhadas
- **`database_queries.sql`** - Queries úteis e consultas comuns

## 🗄️ Esquema do Banco de Dados

### Tabelas Principais

#### 1. `products` - Produtos do Cardápio

```sql
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  image_url text NOT NULL,
  available boolean DEFAULT true,
  stock integer, -- NULL = sem controle de estoque
  category text DEFAULT 'marmitas' CHECK (category IN ('marmitas', 'bebidas', 'sobremesas', 'acompanhamentos')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### 2. `orders` - Pedidos dos Clientes

```sql
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_data jsonb NOT NULL, -- Dados do cliente
  items jsonb NOT NULL, -- Itens do pedido
  total decimal(10,2) NOT NULL CHECK (total >= 0),
  delivery_fee decimal(10,2) DEFAULT 0 CHECK (delivery_fee >= 0),
  status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'entregue', 'cancelado')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### 3. `admin_users` - Usuários Administrativos

```sql
CREATE TABLE admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text DEFAULT 'admin' CHECK (role IN ('admin', 'manager')),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

## 🔐 Políticas de Segurança (RLS)

### Produtos

- **Público**: Pode visualizar produtos disponíveis
- **Autenticados**: Podem gerenciar produtos (CRUD)
- **Admins**: Podem excluir produtos

### Pedidos

- **Público**: Pode criar pedidos
- **Autenticados**: Podem visualizar e gerenciar pedidos
- **Admins**: Podem excluir pedidos

### Usuários Administrativos

- **Autenticados**: Podem visualizar outros admins
- **Super Admins**: Podem gerenciar outros usuários

## 📊 Views Úteis

### 1. `available_products`

Produtos disponíveis ordenados por categoria e nome.

### 2. `orders_summary`

Resumo de pedidos por status do dia atual.

### 3. `top_products`

Produtos mais vendidos nos últimos 30 dias.

## 🔧 Funções de Utilidade

### 1. `get_products_by_category(category_name)`

Retorna produtos de uma categoria específica.

### 2. `get_sales_stats(start_date, end_date)`

Calcula estatísticas de vendas por período.

### 3. `get_low_stock_products(threshold)`

Identifica produtos com estoque baixo.

## 📈 Queries Comuns

### Produtos

```sql
-- Produtos disponíveis
SELECT * FROM products WHERE available = true ORDER BY category, name;

-- Produtos por categoria
SELECT * FROM products WHERE available = true AND category = 'marmitas';

-- Produtos com estoque baixo
SELECT * FROM products WHERE stock <= 10 AND available = true;
```

### Pedidos

```sql
-- Pedidos do dia
SELECT * FROM orders WHERE DATE(created_at) = CURRENT_DATE;

-- Pedidos por status
SELECT * FROM orders WHERE status = 'pendente';

-- Total de vendas do dia
SELECT COUNT(*), SUM(total) FROM orders
WHERE DATE(created_at) = CURRENT_DATE AND status != 'cancelado';
```

### Relatórios

```sql
-- Vendas por período
SELECT DATE(created_at), COUNT(*), SUM(total)
FROM orders
WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31'
GROUP BY DATE(created_at);

-- Produtos mais vendidos
SELECT p.name, COUNT(*) as vendas
FROM products p
JOIN orders o ON true
CROSS JOIN LATERAL jsonb_array_elements(o.items) as item
WHERE item->>'product'->>'id' = p.id::text
GROUP BY p.id, p.name
ORDER BY vendas DESC;
```

## 🚀 Como Usar

### 1. Configuração Inicial

```sql
-- Execute o arquivo completo
\i database_complete.sql

-- Execute as políticas detalhadas
\i database_policies.sql
```

### 2. Inserir Dados de Exemplo

Os dados de exemplo já estão incluídos no arquivo `database_complete.sql`.

### 3. Configurar Usuário Admin

```sql
-- Após criar o usuário no Supabase Auth
INSERT INTO admin_users (id, email, name, role)
VALUES ('uuid-do-usuario', 'admin@churrascaria.com', 'Administrador', 'admin');
```

## 📋 Funcionalidades Principais

### Gestão de Produtos

- ✅ Cadastro de produtos com categorias
- ✅ Controle de estoque opcional
- ✅ Upload de imagens
- ✅ Ativação/desativação de produtos

### Gestão de Pedidos

- ✅ Criação de pedidos pelo cliente
- ✅ Atualização de status pelo admin
- ✅ Dados do cliente em JSON
- ✅ Itens do pedido em JSON
- ✅ Cálculo automático de totais

### Sistema de Usuários

- ✅ Autenticação via Supabase Auth
- ✅ Diferentes níveis de acesso (admin/manager)
- ✅ Controle de usuários ativos/inativos

### Relatórios e Estatísticas

- ✅ Vendas por período
- ✅ Produtos mais vendidos
- ✅ Clientes mais frequentes
- ✅ Análise de métodos de pagamento

## 🔍 Monitoramento e Manutenção

### Verificar Performance

```sql
-- Verificar uso dos índices
SELECT * FROM pg_stat_user_indexes WHERE schemaname = 'public';

-- Verificar tabelas mais acessadas
SELECT * FROM pg_stat_user_tables WHERE schemaname = 'public';
```

### Backup de Dados

```sql
-- Backup de pedidos
SELECT * FROM orders WHERE created_at >= '2024-01-01';

-- Backup de produtos
SELECT * FROM products;
```

### Limpeza de Dados

```sql
-- Pedidos antigos (mais de 1 ano)
DELETE FROM orders WHERE created_at < CURRENT_DATE - INTERVAL '1 year';

-- Produtos inativos há muito tempo
UPDATE products SET available = false
WHERE updated_at < CURRENT_DATE - INTERVAL '6 months' AND available = true;
```

## 🛠️ Manutenção

### Índices

O sistema inclui índices otimizados para:

- Busca por produtos disponíveis
- Filtros por categoria
- Consultas por data de criação
- Busca textual em nomes de produtos
- Consultas em dados JSON

### Triggers

- **Atualização automática de `updated_at`**
- **Validação de dados de pedidos**

### Constraints

- **Preços não negativos**
- **Totais não negativos**
- **Categorias válidas**
- **Status válidos**

## 🔒 Segurança

### Row Level Security (RLS)

- Habilitado em todas as tabelas
- Políticas específicas por operação
- Validação de dados de entrada

### Validações

- Dados obrigatórios em pedidos
- Preços e totais positivos
- Categorias e status válidos

## 📞 Suporte

Para dúvidas sobre o banco de dados:

1. Verifique a documentação das queries
2. Consulte os comentários no código SQL
3. Teste as funções de validação

## 🔄 Atualizações

### Versão 1.0

- ✅ Esquema inicial completo
- ✅ Políticas de segurança básicas
- ✅ Dados de exemplo

### Próximas Versões

- 🔄 Sistema de cupons de desconto
- 🔄 Histórico de alterações de preços
- 🔄 Sistema de avaliações
- 🔄 Integração com sistemas de pagamento

---

**Desenvolvido para o Sistema de Delivery da Churrascaria** 🍖
