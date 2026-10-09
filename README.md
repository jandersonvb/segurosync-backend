# SeguroSync - Backend NestJS (Corretor OS)

Backend em **NestJS 11 + TypeScript + Prisma ORM + PostgreSQL** da plataforma **SeguroSync**, projetado para alta concorrência em cotações de seguros (multicálculo paralelo), conciliação matemática de extratos bancários de comissões e emissão direta de apólices com código CI homologado SUSEP.

---

## 🚀 Arquitetura & Tecnologias
* **Framework:** NestJS 11 (Modular Architecture)
* **ORM:** Prisma 5 (PostgreSQL)
* **Filas & Cache:** BullMQ + Redis (para cotações assíncronas paralelas)
* **Validação:** `class-validator` + `class-transformer`
* **Documentação:** Swagger OpenAPI (`/api/docs`)

---

## 📦 Como Rodar Localmente

### 1. Clonar e Instalar Dependências
```bash
git clone https://github.com/SEU_USUARIO/segurosync-backend.git
cd segurosync-backend
npm install
```

### 2. Subir Banco de Dados e Redis via Docker
```bash
docker-compose up -d
```

### 3. Configurar Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

### 4. Rodar Migrações do Banco de Dados
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Iniciar o Servidor NestJS
```bash
# Modo desenvolvimento com Hot Reload
npm run start:dev
```
O servidor estará rodando em `http://localhost:4000`.
Acesse a documentação Swagger em: `http://localhost:4000/api/docs`.

---

## 🐙 Como Enviar para o seu GitHub

Para criar este repositório no seu GitHub:

```bash
# Se você tiver a CLI do GitHub (gh):
gh repo create segurosync-backend --public --source=. --remote=origin --push

# Ou manualmente criando o repositório em github.com:
git init
git add .
git commit -m "feat: initial commit - SeguroSync NestJS backend"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/segurosync-backend.git
git push -u origin main
```
