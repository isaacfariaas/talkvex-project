# Follow-Up Issues for TAL-28

These issues should be created to complete the Talkvex project as a production-ready example.

## TAL-29: Implementar infraestrutura de testes (HIGH PRIORITY)

**Title:** Implementar infraestrutura de testes

**Description:**
Adicionar framework de testes e testes iniciais para garantir qualidade do código.

### Objetivo
Estabelecer infraestrutura completa de testes para o projeto Talkvex.

### Escopo

#### 1. Configuração do Framework
- Instalar Vitest como test runner
- Instalar @testing-library/react para testes de componentes
- Instalar @testing-library/user-event para simulação de interações
- Configurar vitest.config.ts
- Adicionar scripts de teste no package.json

#### 2. Testes de API Routes (Prioridade Alta)
- Testes para `/api/auth/[...nextauth]/route.ts`
- Testes para `/api/register/route.ts`
- Testes para `/api/goals/route.ts` (GET e POST)
- Testes para `/api/goals/[id]/route.ts` (GET, PATCH, DELETE)
- Testes para `/api/daily/habits/[id]/route.ts`
- Testes para `/api/daily/tasks/[id]/route.ts`

#### 3. Testes de Componentes React
- Testes para componentes de autenticação (login, register)
- Testes para HabitsList component
- Testes para CalendarHeatmap component
- Testes para AddHabitButton component

#### 4. Configuração de Coverage
- Configurar threshold mínimo de 70%
- Adicionar relatórios de coverage
- Configurar exclusões (.next, node_modules, etc.)

### Critérios de Aceitação
- [ ] Vitest configurado e funcionando
- [ ] Pelo menos 10 testes de API routes implementados
- [ ] Pelo menos 5 testes de componentes React
- [ ] Coverage de 70% ou mais nas áreas testadas
- [ ] Scripts `npm test` e `npm run test:coverage` funcionando
- [ ] Documentação de como rodar os testes no README

**Assignee:** DEV  
**Priority:** High  
**Status:** Todo

---

## TAL-30: Configurar pipeline CI/CD (HIGH PRIORITY)

**Title:** Configurar pipeline CI/CD com GitHub Actions

**Description:**
Criar pipeline automatizado para validar qualidade do código em cada PR e deploy.

### Objetivo
Automatizar verificações de qualidade e deployment do projeto.

### Escopo

#### 1. GitHub Actions Workflow
- Criar `.github/workflows/ci.yml`
- Jobs: lint, typecheck, test, build
- Executar em PRs e push para main
- Caching de node_modules para velocidade

#### 2. PR Checks
- ESLint validation
- TypeScript type checking
- Testes unitários e integração
- Build verification
- Comentar coverage no PR

#### 3. Branch Protection
- Requerer aprovação de checks
- Requerer reviews (se aplicável)
- Prevenir merge sem build passing

#### 4. Security Scanning
- npm audit no CI
- Dependabot para atualizações
- Scan de secrets (opcional)

#### 5. Deployment Automation
- Deploy automático para staging em merge para main
- Deploy manual para produção via workflow dispatch
- Documentar processo de deploy

### Critérios de Aceitação
- [ ] CI executando em todos os PRs
- [ ] Todos os checks passando no projeto atual
- [ ] Branch protection configurada
- [ ] Documentação do pipeline no README
- [ ] Deploy automático para staging funcionando

**Assignee:** DEV  
**Priority:** High  
**Status:** Todo  
**Blocked by:** TAL-29 (testes precisam existir antes de serem executados no CI)

---

## TAL-31: Implementar melhorias de produção (MEDIUM PRIORITY)

**Title:** Adicionar hardening de produção

**Description:**
Implementar melhorias de segurança e observabilidade para ambiente de produção.

### Objetivo
Tornar a aplicação resiliente e observável em produção.

### Escopo

#### 1. Rate Limiting
- Instalar @upstash/ratelimit ou similar
- Aplicar rate limiting em rotas de API públicas
- Configurar limites por IP/usuário
- Headers informativos (X-RateLimit-*)

#### 2. Error Handling
- Error boundaries em React (app/error.tsx, app/global-error.tsx)
- Tratamento consistente de erros em API routes
- Logging estruturado de erros
- Páginas de erro customizadas (404, 500)

#### 3. Monitoring & Observability
- Integrar Sentry ou similar para error tracking
- Health check endpoint (`/api/health`)
- Logging estruturado (pino ou winston)
- Métricas básicas (opcional)

#### 4. Security Headers
- Configurar security headers no Next.js
- CSP (Content Security Policy)
- HSTS, X-Frame-Options, etc.
- CORS configurado para produção

#### 5. Database Optimization
- Configurar connection pooling explicitamente
- Adicionar índices necessários no Prisma
- Query optimization review
- Graceful shutdown handling

### Critérios de Aceitação
- [ ] Rate limiting funcionando em rotas públicas
- [ ] Error boundaries capturando erros de React
- [ ] Health check endpoint retornando status
- [ ] Security headers configurados
- [ ] Error tracking integrado (Sentry ou similar)
- [ ] Documentação de configuração de produção

**Assignee:** DEV  
**Priority:** Medium  
**Status:** Todo

---

## TAL-32: Documentar API com OpenAPI (MEDIUM PRIORITY)

**Title:** Criar documentação OpenAPI para a API

**Description:**
Gerar especificação OpenAPI e interface interativa para documentação da API.

### Objetivo
Fornecer documentação completa e testável da API REST.

### Escopo

#### 1. OpenAPI Spec
- Gerar OpenAPI 3.1 spec a partir dos schemas Zod
- Documentar todos os endpoints de API
- Incluir schemas de request/response
- Documentar autenticação e códigos de erro

#### 2. API Explorer UI
- Configurar Swagger UI ou Scalar
- Endpoint `/api/docs` para documentação
- Permitir testar endpoints diretamente
- Sincronizar automaticamente com mudanças

#### 3. Documentação Adicional
- Guia de deployment
- Documentação de variáveis de ambiente
- Exemplos de integração
- Troubleshooting guide

#### 4. README Improvements
- Atualizar README com link para docs
- Adicionar badges (build status, coverage)
- Melhorar seção de desenvolvimento local
- Adicionar screenshots (opcional)

### Critérios de Aceitação
- [ ] OpenAPI spec completa e válida
- [ ] UI de documentação acessível em `/api/docs`
- [ ] Todos os endpoints documentados
- [ ] Exemplos de request/response
- [ ] Guia de deployment documentado
- [ ] README atualizado com informações completas

**Assignee:** DEV  
**Priority:** Medium  
**Status:** Todo

---

## TAL-33: Melhorar Developer Experience (LOW PRIORITY)

**Title:** Adicionar ferramentas de DX

**Description:**
Melhorar experiência de desenvolvimento com ferramentas e automações.

### Objetivo
Facilitar onboarding e produtividade dos desenvolvedores.

### Escopo

#### 1. Pre-commit Hooks
- Instalar husky
- Configurar lint-staged
- Executar lint e format em arquivos staged
- Validar mensagens de commit (conventional commits)

#### 2. Database Seeding
- Criar script de seed no Prisma
- Popular banco com dados de exemplo
- Incluir usuários, metas, hábitos de teste
- Documentar uso do seed

#### 3. VSCode Configuration
- Adicionar `.vscode/settings.json` compartilhado
- Configurar formatação automática
- Sugerir extensões recomendadas
- Debug configurations

#### 4. Development Scripts
- Script para reset completo do ambiente
- Script para backup do banco local
- Scripts utilitários no package.json
- Documentar todos os comandos disponíveis

#### 5. Contributing Guide
- Criar CONTRIBUTING.md
- Documentar processo de desenvolvimento
- Code review guidelines
- Convenções de código e commits

### Critérios de Aceitação
- [ ] Pre-commit hooks funcionando
- [ ] Seed script populando banco corretamente
- [ ] VSCode settings compartilhado
- [ ] Scripts utilitários documentados
- [ ] CONTRIBUTING.md criado

**Assignee:** DEV  
**Priority:** Low  
**Status:** Todo

---

## TAL-34: Push inicial para repositório GitHub

**Title:** Fazer push do código para o repositório remoto

**Description:**
Enviar todo o código atual para o repositório configurado no GitHub.

### Objetivo
Disponibilizar o código no repositório remoto para colaboração e backup.

### Escopo

#### 1. Verificação Pré-Push
- Confirmar que .env está no .gitignore
- Verificar que não há segredos no código
- Revisar commits recentes
- Confirmar que build está passando

#### 2. Push Inicial
- `git push -u origin master`
- Ou renomear para main: `git branch -m master main && git push -u origin main`
- Verificar que todos os arquivos foram enviados
- Confirmar no GitHub web

#### 3. Configuração do Repositório
- Adicionar descrição no GitHub
- Configurar topics/tags
- Adicionar README preview
- Configurar branch protection (se aplicável)

#### 4. Documentação
- Atualizar README com link do repositório
- Adicionar badge do GitHub
- Documentar processo de contribuição

### Critérios de Aceitação
- [ ] Código enviado para git@github.com:isaacfariaas/talkvex-project.git
- [ ] Todos os arquivos importantes presentes
- [ ] Nenhum segredo commitado
- [ ] README atualizado com informações do repo
- [ ] Repositório configurado no GitHub

**Assignee:** DEV  
**Priority:** High  
**Status:** Todo  
**Note:** Git remote já está configurado, apenas precisa fazer o push

---

## Ordem de Execução Recomendada

1. **TAL-34** (Push inicial) - para ter backup e colaboração
2. **TAL-29** (Testes) - fundação de qualidade
3. **TAL-30** (CI/CD) - automatizar validações
4. **TAL-31** (Produção) - segurança e observabilidade
5. **TAL-32** (Documentação) - facilitar uso externo
6. **TAL-33** (DX) - polish final

## Notas de Implementação

- Todas as issues devem ser criadas como filhas de TAL-28
- DEV deve ser o assignee de todas
- TAL-30 está bloqueada por TAL-29 (precisa de testes para executar no CI)
- TAL-34 pode ser executada imediatamente
- Issues de prioridade baixa podem ser deixadas para depois do MVP de produção
