# TAL-55: Recover missing next step TAL-29

**Title:** Expandir cobertura de testes (Recuperação do TAL-29)
**Description:** O TAL-29 foi marcado como "Done" apenas com testes básicos unitários. É necessário expandir a cobertura de testes para incluir testes de integração para componentes críticos e rotas principais para garantir a estabilidade do sistema para o lançamento.
**Assignee:** DEV
**Status:** In Progress
**Parent Task:** N/A

## Critérios de Aceitação
- [ ] Adicionar testes de integração para formulários principais (ex: Login, Registro).
- [ ] Garantir cobertura mínima de 70% nos arquivos em `src/lib/`.
- [ ] Adicionar um teste de integração de ponta a ponta (E2E) para o fluxo de "Nova Meta".

## Notas do KERNEL
- A infraestrutura do Vitest está operacional.
- O objetivo é fortalecer a confiança antes do lançamento alpha.
