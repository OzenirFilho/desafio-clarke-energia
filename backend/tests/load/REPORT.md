# Relatório de Teste de Carga - Clarke Energia API
**Data de Execução**: 19/02/2026
**Ferramenta**: Artillery.io
**Ambiente**: Local (Development)

## 1. Resumo Executivo
O teste de carga realizado na API GraphQL (`POST /`) demonstrou que o backend é capaz de suportar a carga de pico definida sem degradação de performance ou erros.

| Métrica Chave | Resultado | Status | Meta (SLA) |
| :--- | :--- | :--- | :--- |
| **Requisições Totais** | 1.875 | ✅ Aprovado | N/A |
| **Taxa de Erro** | 0% | ✅ Aprovado | < 1% |
| **Latência Média** | 2.1ms | ✅ Aprovado | N/A |
| **Latência P95** | 3ms | ✅ Aprovado | < 500ms |
| **Latência P99** | 21.1ms | ✅ Aprovado | N/A |

---

## 2. Configuração do Cenário
O teste simulou um cenário realista de uso crescente, culminando em um pico de tráfego.

- **Endpoint Alvo**: `http://localhost:4000/` (GraphQL)
- **Duração Total**: 2 minutos e 30 segundos
- **Fases de Carga**:
    1.  **Carga Sustentada**: 60s com 5 usuários/segundo.
    2.  **Rampa de Aceleração**: 30s subindo de 5 para 20 usuários/segundo.
    3.  **Pico de Carga**: 60s mantendo 20 usuários/segundo.

---

## 3. Detalhamento dos Resultados

### 3.1. Throughput (Vazão) e Capacidade
- A aplicação processou com sucesso **1.875 requisições** em **152 segundos**.
- A taxa média de requisições durante o pico se manteve estável em **20 req/s**.
- **0 falhas** (vusers.failed: 0) foram registradas, indicando 100% de disponibilidade.

### 3.2. Latência e Tempo de Resposta
Os tempos de resposta foram excepcionalmente baixos, indicando que a lógica de cálculo (`calculateSolutions`) é altamente eficiente.

- **Mínimo**: 0ms
- **Médio**: 2.1ms
- **Mediana**: 1ms
- **P95 (95% dos usuários)**: 3ms (Muito abaixo do limite de 500ms)
- **P99 (Pico)**: 21.1ms

### 3.3. Códigos de Status HTTP
- **200 OK**: 1.875 (100%)
- **500/4xx**: 0 (0%)

---

## 4. Conclusão e Recomendações

### Conclusão
O backend da Clarke Energia passou com louvor nos testes de carga para o cenário proposto (até 20 RPS). A arquitetura atual (Node.js + Apollo Server) demonstrou ser extremamente leve para esse tipo de carga de trabalho (CPU-bound leve).

### Recomendações Futuras
1.  **Testes em Cloud**: Executar este mesmo teste em um ambiente de Staging (ex: Render/AWS) para validar a latência de rede real.
2.  **Aumento de Carga**: Dado o desempenho excelente (P95 de 3ms), recomenda-se realizar um novo teste de **Stress** aumentando a carga para 100 ou 200 RPS para encontrar o verdadeiro ponto de ruptura da aplicação.
