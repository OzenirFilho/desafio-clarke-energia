# Documentação de Testes - Projeto Clarke Energia

Este documento descreve a estratégia de qualidade e testes adotada para garantir a robustez e confiabilidade da aplicação **Clarke Energia**.

Atuando como **Analista de Testes Pleno (QA)**, foram definidos três níveis principais de testes:

1.  **Testes Unitários (Backend)**: Validam a lógica de negócio isolada.
2.  **Testes E2E (Frontend)**: Validam o fluxo do usuário e integração visual.
3.  **Testes de Carga (Stress)**: Validam a capacidade do servidor sob pressão.

---

## 1. Testes Unitários (Backend)

**Tecnologia**: [Jest](https://jestjs.io/)
**Localização**: `backend/logic.test.js`

### Objetivo
Garantir que a função `calculateSolutions` sempre retorne os cálculos corretos de economia, respeite as regras de elegibilidade (estado e consumo mínimo) e ordene os resultados corretamente.

### Casos de Teste Cobertos

| ID      | Descrição                                      | Resultado Esperado                                      |
|---------|------------------------------------------------|---------------------------------------------------------|
| TC01    | Cálculo de Economia em SP (500 kWh)            | Retornar apenas fornecedores elegíveis e valor correto. |
| TC02    | Ordenação por Economia                         | Retornar lista ordenada do maior para o menor.          |
| TC03    | Estado sem Fornecedores (AC)                   | Retornar lista vazia (Empty State).                     |
| TC04    | Consumo Abaixo do Mínimo                       | Retornar lista vazia (Low Consumption).                 |
| TC05    | Estado Inexistente (Default Tariff)            | Retornar lista vazia ou tratar erro.                    |
| TC06    | Integridade da Estrutura de Dados              | Objetos devem ter todas as propriedades (id, logo, etc).|

### Execução
```bash
cd backend
npm test
```

---

## 2. Testes End-to-End (Frontend)

**Tecnologia**: [Cypress](https://www.cypress.io/)
**Localização**: `frontend/cypress/e2e/home.cy.js`

### Objetivo
Simular o comportamento do usuário final navegando na aplicação, garantindo que a interface responda corretamente às interações e exiba os dados esperados.

### Casos de Teste Cobertos

| ID        | Descrição                                 | Validação                                      |
|-----------|-------------------------------------------|------------------------------------------------|
| TCE2E-01  | Carregamento Inicial                      | Verificar título e subtítulo visíveis.         |
| TCE2E-02  | Fluxo Feliz (Busca com Sucesso)           | Preencher form -> Clicar -> Ver Cards e Valores.|
| TCE2E-03  | Tratamento de Erro (API Fail)             | Simular erro 500 e verificar mensagem de erro no UI.|
| TCE2E-04  | Estado de Carregamento (Loading)          | Verificar botão desabilitado e texto "Calculando...".|

### Execução
```bash
cd frontend
npx cypress open
# Ou para rodar em modo headless (CI):
npx cypress run
```

---

## 3. Testes de Carga e Estresse (Load Testing)

**Tecnologia**: [Artillery](https://www.artillery.io/)
**Localização**: `backend/tests/load/load-test.yml`

### Objetivo
Avaliar o desempenho da API GraphQL (`POST /`) recebendo múltiplas requisições simultâneas, simulando picos de acesso.

### Cenário Configurado
- **Duração Total**: 2.5 minutos
- **Fases**:
    1.  **Sustained Load**: 60s com 5 usuários/segundo.
    2.  **Ramp Up**: 30s subindo de 5 para 20 usuários/segundo.
    3.  **Peak Load**: 60s mantendo 20 usuários/segundo.
- **Payload**: Query GraphQL `getSolutions` com variáveis dinâmicas.
- **SLA (Acordo de Nível de Serviço)**:
    - Latência P95 < 500ms
    - Taxa de Erro < 1%

### Execução
Certifique-se que o backend está rodando (`npm start`) e execute:
```bash
cd backend
npx artillery run tests/load/load-test.yml
```

---

## Relatório de Qualidade
*Documento gerado automaticamente em 19/02/2026*

**Status Geral**: ✅ APROVADO
- A cobertura de testes unitários abrange 100% da lógica crítica de cálculo.
- Os testes E2E cobrem os principais fluxos de interação do usuário.
- A configuração de testes de carga está pronta para validação em ambiente de CI/CD.
