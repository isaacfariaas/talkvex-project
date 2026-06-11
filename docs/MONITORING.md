# Alpha Launch Monitoring Guide

Este documento descreve como monitorar a estabilidade do sistema TalkVex durante o lançamento Alpha (Dia D).

## Visão Geral

O sistema de monitoramento rastreia:
- **Disponibilidade**: O sistema está acessível?
- **Latência**: Qual é o tempo de resposta?
- **Saúde do banco de dados**: A conexão com o DB está OK?
- **Taxa de erros**: Quantos erros estão ocorrendo?

## Scripts de Monitoramento

### 1. Monitor Principal (Tempo Real)

**Script**: `scripts/monitor-alpha-launch.sh`

Monitora continuamente a saúde do sistema e registra todas as métricas.

```bash
# Uso básico (verifica a cada 30s por padrão)
./scripts/monitor-alpha-launch.sh

# Personalizar intervalo de verificação
MONITOR_INTERVAL=10 ./scripts/monitor-alpha-launch.sh

# Monitorar ambiente de produção
BASE_URL=https://talkvex.com ./scripts/monitor-alpha-launch.sh

# Ajustar threshold de alerta para 1 segundo
ALERT_THRESHOLD_MS=1000 ./scripts/monitor-alpha-launch.sh
```

**Saída em tempo real**:
```
✓ OK    Health: ok | DB: ok | Response: 145ms | HTTP: 200
✓ OK    Health: ok | DB: ok | Response: 132ms | HTTP: 200
⚠ SLOW  Health: ok | DB: ok | Response: 2150ms | HTTP: 200
✗ FAIL  Health: error | DB: error | Response: 356ms | HTTP: 503
```

**Parando o monitor**:
- Pressione `Ctrl+C` para parar graciosamente
- Um resumo será exibido automaticamente

### 2. Analisador de Logs

**Script**: `scripts/analyze-monitoring-logs.sh`

Gera relatórios detalhados a partir dos logs de monitoramento.

```bash
./scripts/analyze-monitoring-logs.sh
```

**Saída do relatório**:
- Resumo de eventos (sucessos, falhas, erros)
- Percentual de uptime
- Estatísticas de tempo de resposta (min, max, avg, P50, P95, P99)
- Distribuição de códigos HTTP
- Últimos erros e alertas

## Arquivos de Log

Todos os logs são salvos em `logs/monitoring/`:

- `alpha-launch-YYYYMMDD.log` - Log principal com timestamp de todos os eventos
- `metrics-YYYYMMDD.json` - Métricas em formato JSON Lines para análise
- `monitoring-report-YYYYMMDD-HHMMSS.txt` - Relatórios gerados

## Endpoints Monitorados

### Health Check
- **URL**: `/api/health`
- **Método**: GET
- **Sem autenticação**

**Resposta de sucesso (200)**:
```json
{
  "status": "ok",
  "db": "ok",
  "version": "0.1.0",
  "timestamp": "2026-06-10T20:00:00.000Z"
}
```

**Resposta de erro (503)**:
```json
{
  "status": "error",
  "db": "error",
  "error": "Database connection failed"
}
```

### Métricas Semanais (Requer Auth)
- **URL**: `/api/metrics/weekly`
- **Método**: GET
- **Autenticação**: Necessária

## Alertas e Thresholds

### Configuração de Alertas

- **Resposta Lenta**: > 2000ms (padrão)
- **Alertas Críticos**: 3 erros consecutivos
- **Intervalo de Verificação**: 30s (padrão)

### Níveis de Severidade

1. **✓ OK** - Sistema operando normalmente
2. **⚠ SLOW** - Resposta lenta, mas funcional
3. **✗ FAIL** - Falha na verificação de saúde
4. **🚨 ALERT** - Múltiplas falhas consecutivas

## Checklist do Dia D

### Antes do Lançamento
- [ ] Verificar se o servidor está rodando
- [ ] Testar endpoint de health manualmente
- [ ] Iniciar o script de monitoramento
- [ ] Configurar alertas no canal de comunicação da equipe

### Durante o Lançamento
- [ ] Monitorar o terminal em tempo real
- [ ] Verificar logs a cada 15-30 minutos
- [ ] Gerar relatórios a cada hora
- [ ] Responder a alertas críticos imediatamente

### Após o Lançamento
- [ ] Gerar relatório final
- [ ] Analisar métricas de performance
- [ ] Documentar incidentes
- [ ] Arquivar logs para referência futura

## Monitoramento Manual

Se precisar verificar manualmente:

```bash
# Health check
curl http://localhost:3000/api/health

# Com medição de tempo
time curl http://localhost:3000/api/health

# Ver apenas código HTTP
curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3000/api/health
```

## Solução de Problemas

### O monitor não inicia
```bash
# Verificar se o script tem permissão de execução
chmod +x scripts/monitor-alpha-launch.sh

# Verificar se o servidor está rodando
curl http://localhost:3000/api/health
```

### Erros de conexão
- Verificar se BASE_URL está correto
- Confirmar que o servidor Next.js está rodando
- Verificar firewall/permissões de rede

### Falta de métricas JSON
- Verificar se jq está instalado: `which jq`
- Instalar se necessário: `npm install -g jq` ou `apt-get install jq`

## Métricas Chave para Avaliar

### Durante o Alpha Launch

1. **Uptime Target**: > 99%
2. **Latência P95**: < 1000ms
3. **Latência P99**: < 2000ms
4. **Taxa de Erro**: < 1%
5. **Resposta média**: < 500ms

### Sinais de Alerta

- ⚠️ Uptime < 95%
- ⚠️ Múltiplos erros 500/503
- ⚠️ Aumento gradual no tempo de resposta
- ⚠️ Falhas na conexão do banco de dados
- 🚨 Sistema completamente inacessível

## Próximos Passos

Após o Alpha Launch, considere adicionar:

1. **Monitoramento APM** (Application Performance Monitoring)
   - Sentry para error tracking
   - New Relic ou DataDog para métricas
   
2. **Logging estruturado**
   - Winston ou Pino para logs
   - Agregação de logs (ELK Stack)

3. **Dashboards**
   - Grafana para visualizações
   - Prometheus para coleta de métricas

4. **Alertas automatizados**
   - Integração com Slack/Discord
   - PagerDuty para on-call

## Contato e Escalação

Durante o Dia D, se houver problemas críticos:

1. Verificar os logs de erro
2. Gerar um relatório imediato
3. Escalar para o time de backend/devops
4. Documentar o incidente para post-mortem
