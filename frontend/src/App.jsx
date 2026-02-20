// Importa Hooks do React para gerenciar o estado do componente
import { useState } from 'react';
// Importa ícones Lucide React para representação visual dos fornecedores
// Ícones baseados em SVG e escaláveis, proporcionando um visual premium.
import { Leaf, Sun, SunMedium, SunDim, Wind, Sprout, Zap, Building2 } from 'lucide-react'; import './App.css';

function App() {
  // --- GERENCIAMENTO DE ESTADO ---
  // consumption: Armazena a entrada do usuário para consumo mensal de energia (kWh)
  const [consumption, setConsumption] = useState('');
  // uf: Armazena o estado selecionado (Unidade Federativa)
  const [uf, setUf] = useState('');
  // results: Armazena o array de soluções retornado pelo backend; null inicialmente
  const [results, setResults] = useState(null);
  // loading: Flag booleana para controlar o spinner de carregamento e estado do botão
  const [loading, setLoading] = useState(false);
  // error: String para armazenar e exibir feedback se a chamada da API falhar
  const [error, setError] = useState(null);

  // Constantes: Lista de todos os estados brasileiros para o menu dropdown
  const states = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  /**
   * handleSearch
   * Função assíncrona acionada pelo envio do formulário.
   * Responsabilidades:
   * 1. Valida entradas.
   * 2. Reseta estados da UI (carregamento, erros, resultados anteriores).
   * 3. Constrói a query GraphQL.
   * 4. Busca dados da API backend.
   * 5. Atualiza resultados ou estado de erro baseado na resposta.
   */
  const handleSearch = async (e) => {
    e.preventDefault(); // Previne recarregamento padrão do formulário
    if (!consumption || !uf) return; // Validação básica no cliente

    setLoading(true);
    setError(null);
    setResults(null);

    // Definição da Query GraphQL
    // Solicitamos detalhes completos do fornecedor + métricas calculadas de economia
    const query = `
      query GetSolutions($consumption: Float!, $state: String!) {
        getSolutions(consumption: $consumption, state: $state) {
          supplier {
            id
            name
            logo
            rating
            costPerKwh
            minKwh
            totalClients
            solutionType
          }
          originalCost
          newCost
          savings
          percent
        }
      }
    `;

    try {
      // URL do Backend: Usa variável de ambiente do Vite ou fallback para /api (quando no mesmo domínio no Vercel)
      const API_URL = import.meta.env.VITE_API_URL || '/api';

      // Executa requisição POST para o Apollo Server
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: {
            consumption: parseFloat(consumption), // Garante tipo Float para GraphQL
            state: uf,
          },
        }),
      });

      const data = await response.json();

      // Trata erros GraphQL (distintos de erros HTTP)
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      setResults(data.data.getSolutions);
    } catch (err) {
      console.error(err);
      setError('Falha ao buscar fornecedores. Tente novamente.');
    } finally {
      // Garante que o estado de carregamento seja resetado independente de sucesso ou falha
      setLoading(false);
    }
  };

  /**
   * Função auxiliar para formatar valores monetários para Real Brasileiro (BRL).
   */
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  /**
   * getSupplierIcon
   * Mapeia um nome de fornecedor para um ícone específico Lucide React.
   * Isso melhora a distinção visual entre fornecedores.
   * retorna: Elemento JSX (Ícone)
   */
  const getSupplierIcon = (name) => {
    const iconProps = { size: 32, color: '#0ea5e9' }; // Cor Padrão (Azul Primário)
    switch (name) {
      case 'EcoEnergy': return <Leaf {...iconProps} color="#10b981" />; // Verde para Eco
      case 'GreenPower': return <Sun {...iconProps} color="#eab308" />; // Amarelo para Solar
      case 'SolarMinas': return <SunMedium {...iconProps} color="#f59e0b" />;
      case 'RioSol': return <SunDim {...iconProps} color="#f97316" />;
      case 'SulLivre': return <Wind {...iconProps} color="#06b6d4" />; // Ciano para Vento
      case 'ParanaVerde': return <Sprout {...iconProps} color="#22c55e" />;
      case 'EnergiSP': return <Zap {...iconProps} color="#eab308" />; // Raio Elétrico
      default: return <Building2 {...iconProps} />; // Ícone de fallback
    }
  };



  const bestGD = results?.find(r => r.supplier.solutionType === 'GD');
  const bestML = results?.find(r => r.supplier.solutionType === 'Mercado Livre');

  return (
    <div className="app-container">
      <header>
        <h1>Clarke Energia</h1>
        <p className="subtitle">Encontre a melhor solução de energia para sua empresa</p>
      </header>

      <section className="search-section">
        <div className="glass-card">
          <form onSubmit={handleSearch}>
            <div className="form-group">
              <label htmlFor="state">Estado (UF)</label>
              <select
                id="state"
                className="input-control"
                value={uf}
                onChange={(e) => setUf(e.target.value)}
                required
              >
                <option value="" disabled>Selecione seu estado</option>
                {states.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="consumption">Consumo Mensal (kWh)</label>
              <input
                type="number"
                id="consumption"
                className="input-control"
                placeholder="Ex: 30000"
                value={consumption}
                onChange={(e) => setConsumption(e.target.value)}
                min="1"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Calculando...' : 'Ver Economia'}
            </button>
          </form>
          {error && <p style={{ color: '#ef4444', marginTop: '1rem', textAlign: 'center' }}>{error}</p>}
        </div>
      </section>

      {loading && <div className="loading-spinner"></div>}

      {results && results.length > 0 && (
        <>
          <section className="summary-section" style={{
            display: 'flex',
            gap: '2rem',
            justifyContent: 'center',
            marginBottom: '3rem',
            width: '100%',
            flexWrap: 'wrap'
          }}>
            {bestGD && (
              <div className="glass-card summary-card" style={{ borderColor: '#34d399', width: '100%', maxWidth: '400px' }}>
                <h3 style={{ color: '#34d399', marginBottom: '0.5rem' }}>Melhor em Geração Distribuída</h3>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Fornecido por <strong>{bestGD.supplier.name}</strong></p>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#fff', margin: '1rem 0' }}>
                  {formatCurrency(bestGD.savings)} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>/ mês</span>
                </div>
                <p>Economia de {(bestGD.percent * 100).toFixed(1)}%</p>
              </div>
            )}

            {bestML && (
              <div className="glass-card summary-card" style={{ borderColor: '#a78bfa', width: '100%', maxWidth: '400px' }}>
                <h3 style={{ color: '#a78bfa', marginBottom: '0.5rem' }}>Melhor em Mercado Livre</h3>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Fornecido por <strong>{bestML.supplier.name}</strong></p>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#fff', margin: '1rem 0' }}>
                  {formatCurrency(bestML.savings)} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>/ mês</span>
                </div>
                <p>Economia de {(bestML.percent * 100).toFixed(1)}%</p>
              </div>
            )}
          </section>

          <section className="results-grid">
            {results.map((solution, index) => (
              <div key={`${solution.supplier.id}-${index}`} className="glass-card result-card" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="card-header">
                  <div className="supplier-logo">
                    {getSupplierIcon(solution.supplier.name)}
                  </div>
                  <span className={`solution-badge ${solution.supplier.solutionType === 'GD' ? 'badge-gd' : 'badge-ml'}`}>
                    {solution.supplier.solutionType}
                  </span>
                </div>

                <h3>{solution.supplier.name}</h3>

                <div className="savings-highlight">
                  <span className="savings-label">Economia Estimada</span>
                  <span className="savings-value">{formatCurrency(solution.savings)}</span>
                  <span style={{ color: '#10b981', fontSize: '0.9rem' }}>
                    {solution.percent > 0 ? `+${(solution.percent * 100).toFixed(1)}%` : ''}
                  </span>
                </div>

                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-value">{solution.supplier.rating} ⭐</span>
                    <span className="detail-label">Avaliação</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-value">{solution.supplier.totalClients}</span>
                    <span className="detail-label">Clientes</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-value">{formatCurrency(solution.supplier.costPerKwh)}</span>
                    <span className="detail-label">Custo kWh</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-value">{solution.supplier.minKwh} kWh</span>
                    <span className="detail-label">Mínimo</span>
                  </div>
                </div>
              </div>
            ))}
          </section>
        </>
      )}

      {results && results.length === 0 && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>Nenhum fornecedor encontrado</h3>
          <p>Tente ajustar o consumo mínimo ou verifique se há disponibilidade no seu estado.</p>
        </div>
      )}
    </div>
  );
}

export default App;
