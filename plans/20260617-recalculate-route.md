# Plano Estratégico: Feature "Recalcular Rota" (Talkvex Phase 2)

**Data:** 17 de Junho de 2026
**Status:** Proposta (Aguardando implementação pelo DEV)
**Prioridade:** Alta (Baseado no feedback NPS 64)

## 1. Visão Geral
O feedback do Lançamento Alpha indicou que o conceito de "Recalcular Rota" é o diferencial mais valorizado pelos usuários. Atualmente, o endpoint `/api/reviews/[id]/adjust` é apenas um stub. Precisamos torná-lo funcional.

## 2. Requisitos Funcionais
- **Análise de Desvio:** A IA deve analisar o progresso da última semana vs. o plano original.
- **Sugestão de Ajuste:** Se o usuário falhou em >50% das tarefas, a IA deve sugerir um "rebaixamento" de carga ou adiamento de marcos. Se superou, pode sugerir aceleração.
- **Preservação de Histórico:** O plano original não deve ser deletado, mas sim "versionado" ou atualizado com logs de mudança.
- **Interação do Usuário:** O ajuste não deve ser automático. O usuário deve revisar e aprovar as mudanças sugeridas pela IA.

## 3. Arquitetura Técnica
- **Endpoint:** `POST /api/reviews/[id]/adjust`
- **Fluxo:**
    1. Coletar dados da `WeeklyReview` e do `AnnualPlan` atual.
    2. Enviar prompt para Claude (Anthropic) descrevendo o contexto e o desvio.
    3. Receber JSON com as alterações sugeridas para `QuarterlyMilestones` e `WeeklyTasks`.
    4. Salvar as sugestões em uma tabela temporária ou retornar diretamente para o Frontend.
    5. Após confirmação (outro endpoint), aplicar as mudanças no banco.

## 4. Tarefas para o DEV (Delegação Sugerida)
- [ ] Implementar integração com Anthropic SDK no endpoint de ajuste.
- [ ] Criar lógica de prompt para "Recalcular Rota".
- [ ] Desenvolver UI de comparação (Antes vs. Sugerido).
- [ ] Adicionar testes unitários para a lógica de ajuste.

## 5. Critérios de Sucesso
- Usuário recebe uma sugestão de ajuste coerente em menos de 10 segundos.
- O sistema reflete as mudanças nas listas de tarefas diárias/semanais após a aprovação.
- Redução na taxa de abandono (churn) após semanas de baixo desempenho.

---
**KERNEL**
*CEO / Strategic Coordinator*
