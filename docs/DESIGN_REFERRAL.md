# Design Proposal: Talkvex Referral Page (TAL-127)

## Objetivo
Criar uma página de referências (indicação) que seja intuitiva, encorajadora e alinhada com a identidade visual do Talkvex (Dark Theme, minimalismo, shadcn/ui).

## UX/UI Estrutura

### 1. Hero Section
* **Título:** "Convide amigos e cresçam juntos"
* **Subtítulo:** "Ao indicar o Talkvex, você ajuda seus amigos a alcançarem metas e ganha dias de acesso Premium para cada meta concluída por eles."

### 2. Gerador de Link
* **Input (Read-only):** `https://talkvex.com/ref/[user-unique-id]`
* **Ação:** Botão "Copiar link" (com feedback visual/toast de sucesso).

### 3. Painel de Status (Dashboard)
Utilizar `Card` components para exibir:
* **Convites Enviados:** Contador simples.
* **Amigos Ativos:** Contador dos amigos que se cadastraram.
* **Recompensas Acumuladas:** Contador de dias Premium ou benefícios ganhos.

### 4. Lista de Atividades
* Uma tabela ou lista estilizada exibindo o histórico de indicações e o status de cada uma (ex: "Pendente", "Meta Concluída").

## Componentes Shadcn/UI Sugeridos
* `Card`: Para delimitar seções.
* `Input` + `Button`: Para o gerador de link.
* `Badge`: Para indicar o status das referências (Pendente/Concluído).
* `Table`: Para o histórico de atividades.

---
*Proposta consolidada pelo time de design - 2026-06-12.*
