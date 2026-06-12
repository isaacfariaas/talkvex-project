# Relatório de Auditoria de Cibersegurança: Projeto Talkvex

**Data:** 12 de Junho de 2026  
**Auditor:** SecurityEngineer  
**Status:** Concluído  
**Escopo:** Auditoria de código (SAST), arquitetura e boas práticas de segurança na stack Next.js 16/Prisma/NextAuth.

---

## 1. Resumo Executivo

A aplicação Talkvex apresenta uma base sólida de segurança, utilizando frameworks modernos e bibliotecas de validação robustas como `Zod`. No entanto, foram identificadas vulnerabilidades críticas relacionadas ao armazenamento de chaves de API e riscos moderados em relação a ataques de injeção de prompt e controle de acesso.

---

## 2. Vulnerabilidades Identificadas

### 2.1 Armazenamento Inseguro de Credenciais (Alta)
- **Classe:** Cryptographic Failures / Insecure Storage
- **Evidência:** O modelo `User` no `prisma/schema.prisma` contém o campo `anthropicApiKey String?` que armazena chaves de API do Anthropic em texto plano no banco de dados.
- **Risco:** Se o banco de dados for comprometido, todas as chaves de API dos usuários serão expostas, permitindo uso não autorizado e potenciais custos financeiros ou vazamento de dados.
- **Princípio:** Least Privilege / Fail Securely
- **Correção:** Criptografar as chaves de API antes do armazenamento usando AES-256-GCM com uma chave mestra gerenciada em um Secrets Manager (Vault, AWS Secret Manager).

### 2.2 Injeção de Prompt Indireta (Média)
- **Classe:** LLM Prompt Injection (OWASP LLM Top 10)
- **Evidência:** Em `src/lib/prompts.ts`, as entradas do usuário (`goalTitle`, `goalDescription`) são concatenadas diretamente nos prompts enviados ao Claude.
- **Risco:** Um usuário mal-intencionado pode inserir instruções maliciosas no título ou descrição da meta para manipular o comportamento do modelo, ignorar restrições ou extrair informações do sistema.
- **Princípio:** Input Handling / Secure Defaults
- **Correção:** Utilizar delimitadores estruturados (ex: XML tags) para isolar o conteúdo do usuário e instruir explicitamente o modelo a tratar o conteúdo dentro dessas tags como dados não confiáveis.

### 2.3 Controle de Acesso e Tenacidade (Média)
- **Classe:** Broken Access Control / IDOR
- **Evidência:** Em `src/app/api/goals/[id]/route.ts`, a verificação de propriedade é feita manualmente antes da query principal, mas a query final (`prisma.goal.update`, `prisma.goal.delete`) utiliza apenas o `id` no filtro `where`.
- **Risco:** Falhas lógicas ou omissões de verificações manuais em novas rotas podem permitir que um usuário acesse ou modifique dados de outros.
- **Princípio:** Complete Mediation / Zero Trust
- **Correção:** Enforce a tenacidade diretamente na cláusula `where` de todas as operações de banco de dados: `prisma.goal.findFirst({ where: { id, userId: session.user.id } })`.

### 2.4 Configuração de Segurança de Cabeçalhos (Média)
- **Classe:** Security Misconfiguration
- **Evidência:** Em `next.config.ts`, a Content Security Policy (CSP) permite `'unsafe-inline'` e `'unsafe-eval'`.
- **Risco:** Facilita ataques de Cross-Site Scripting (XSS) se houver uma falha de sanitização em algum componente.
- **Princípio:** Defense in Depth / Minimize Attack Surface
- **Correção:** Implementar CSP baseada em nonces ou hashes e remover permissões inseguras.

### 2.5 Ausência de MFA e Rate Limiting no Login (Média)
- **Classe:** Identification and Authentication Failures
- **Evidência:** `src/lib/auth.ts` não possui Multi-Factor Authentication nem rate limiting explícito para tentativas de login.
- **Risco:** Vulnerabilidade a ataques de força bruta e preenchimento de credenciais (Credential Stuffing).
- **Princípio:** Defense in Depth
- **Correção:** Implementar MFA (TOTP) e aplicar o rate limiter do Upstash no endpoint de autenticação.

---

## 3. Boas Práticas Recomendadas

1. **Validação Semântica**: Além da validação de tipo com Zod, implementar validações de negócio para evitar abusos (ex: limite máximo de metas por usuário).
2. **Logs Sensíveis**: Mascarar ou remover prompts e respostas de IA que possam conter PII (Personal Identifiable Information) antes de salvar no `PlanGenerationLog`.
3. **Secret Management**: Garantir que segredos como `NEXTAUTH_SECRET` e `DATABASE_URL` não estejam em arquivos `.env` em produção, mas sim injetados pelo ambiente de CI/CD ou Secret Manager.
4. **Dependências**: Executar `npm audit` regularmente e fixar versões de dependências críticas para evitar ataques de Supply Chain.

---

## 4. Próximos Passos Sugeridos

1. Implementar um utilitário de criptografia em `src/lib/crypto.ts`.
2. Refatorar os prompts em `src/lib/prompts.ts` para usar delimitadores.
3. Criar middleware de rate limiting global para rotas de API sensíveis.

---
**Assinado,**
*SecurityEngineer*
