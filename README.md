# 👕 ONSTAGE - E-commerce de Camisetas Masculinas

Um e-commerce completo e moderno para venda de camisetas masculinas, construído do zero com as tecnologias mais atuais do mercado. O projeto conta com loja virtual, painel administrativo completo e integração real de pagamentos e frete.

🔗 **Acesse o projeto no ar:** [https://site-camisetas.vercel.app](https://site-camisetas.vercel.app)

## 🚀 Funcionalidades

### 🛍️ Para o Cliente (Loja)
- Catálogo de produtos interativo com filtros por categoria.
- Página de produto com zoom interativo na imagem e seleção de tamanhos/cor.
- **Validação de estoque em tempo real** (tamanhos esgotados ficam indisponíveis).
- Carrinho de compras persistente.
- Checkout completo com busca automática de endereço via CEP (ViaCEP).
- Cálculo de frete automático por região.
- Aplicação de cupons de desconto.
- **Pagamento integrado** com Mercado Pago (Checkout Pro).
- Área do cliente (Minha Conta) para acompanhar pedidos e excluir conta.
- Player de música ambiente interativo.

### 🔐 Painel Administrativo
- Autenticação segura de administrador via Supabase Auth.
- Gestão de pedidos (alteração de status, visualização de observações, código de rastreio).
- **Gestão de estoque individual por tamanho** (P, M, G, GG, etc).
- Relatório de vendas com filtro por período, faturamento, ticket médio, vendas por cidade e top 5 produtos.
- Gestão de cupons de desconto.

### ⚙️ Automações (Backend)
- **Webhook do Mercado Pago** para receber atualizações de pagamento em tempo real.
- Baixa automática no estoque assim que um pagamento é aprovado.
- **Envio de e-mails transacionais** automáticos via Brevo.

## 🛠️ Tecnologias Utilizadas
- **Frontend & Backend:** Next.js (App Router), React, TypeScript, Tailwind CSS.
- **Banco de Dados & Auth:** Supabase (PostgreSQL).
- **Pagamentos:** Mercado Pago API.
- **Comunicação:** Brevo API.
- **Deploy:** Vercel.

## 💻 Como rodar o projeto localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/20161518/site-camisetas.git
