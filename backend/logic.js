// Mapa de tarifas base de energia por estado (UF)
// Os valores representam o Custo por kWh em BRL (R$).
// Usado como base para calcular a economia.
const tariffMap = {
    'SP': 0.95, // São Paulo
    'RJ': 1.05, // Rio de Janeiro (Mais alta)
    'MG': 0.85, // Minas Gerais
    'RS': 0.90, // Rio Grande do Sul
    'PR': 0.92  // Paraná
};

// Banco de dados simulado de fornecedores de energia.
// Em uma aplicação real, isso viria de um banco de dados PostgreSQL/MongoDB.
// Cada fornecedor está vinculado a um estado específico e possui um requisito de Consumo Mínimo.
const suppliers = [
    {
        id: '1',
        name: 'EcoEnergy',
        logo: 'https://logo.clearbit.com/cpfl.com.br',
        state: 'SP',
        costPerKwh: 0.80, // Menor que a tarifa base para proporcionar economia
        minKwh: 1000,
        totalClients: 5000,
        rating: 4.8,
        solutionType: 'GD' // Geração Distribuída
    },
    {
        id: '2',
        name: 'GreenPower',
        logo: 'https://logo.clearbit.com/neoenergia.com',
        state: 'SP',
        costPerKwh: 0.75, // Melhores taxas, mas maior consumo mínimo
        minKwh: 3000,
        totalClients: 2000,
        rating: 4.5,
        solutionType: 'Mercado Livre'
    },
    {
        id: '3',
        name: 'SolarMinas',
        logo: 'https://logo.clearbit.com/cemig.com.br',
        state: 'MG',
        costPerKwh: 0.70,
        minKwh: 500,
        totalClients: 1200,
        rating: 4.2,
        solutionType: 'GD'
    },
    {
        id: '4',
        name: 'RioSol',
        logo: 'https://logo.clearbit.com/light.com.br',
        state: 'RJ',
        costPerKwh: 0.90,
        minKwh: 2000,
        totalClients: 8000,
        rating: 4.7,
        solutionType: 'GD'
    },
    {
        id: '5',
        name: 'SulLivre',
        logo: 'https://logo.clearbit.com/engie.com.br',
        state: 'RS',
        costPerKwh: 0.78,
        minKwh: 10000, // Limite muito alto para ML no RS
        totalClients: 1500,
        rating: 4.9,
        solutionType: 'Mercado Livre'
    },
    {
        id: '6',
        name: 'ParanaVerde',
        logo: 'https://logo.clearbit.com/copel.com',
        state: 'PR',
        costPerKwh: 0.82,
        minKwh: 1500,
        totalClients: 3000,
        rating: 4.6,
        solutionType: 'GD'
    },
    {
        id: '7',
        name: 'EnergiSP',
        logo: 'https://logo.clearbit.com/enel.com.br',
        state: 'SP',
        costPerKwh: 0.82,
        minKwh: 100, // Limite muito baixo, acessível a quase todos
        totalClients: 400,
        rating: 4.1,
        solutionType: 'GD'
    }
];

/**
 * Lógica de negócio principal para encontrar as melhores soluções de energia.
 * 
 * @param {number} consumption - Consumo mensal de energia em kWh
 * @param {string} state - O estado do usuário (UF) ex: 'SP', 'RJ'
 * @returns {Array} Lista de soluções elegíveis ordenadas por economia (decrescente)
 */
function calculateSolutions(consumption, state) {
    // Determina a tarifa base para o estado do usuário.
    // Padrão para 0.90 se o estado não for encontrado em nosso mapa (estratégia de fallback).
    const startTariff = tariffMap[state] || 0.90;

    // Calcula o custo estimado atual do usuário sem nenhum plano.
    const originalCost = consumption * startTariff;

    // Lógica de Filtragem:
    // 1. O fornecedor deve operar no estado do usuário.
    // 2. O consumo do usuário deve atender ao limite mínimo do fornecedor.
    const validSuppliers = suppliers.filter(s =>
        s.state === state && consumption >= s.minKwh
    );

    // Lógica de Transformação:
    // Calcula novos custos e economia para cada fornecedor elegível.
    return validSuppliers.map(supplier => {
        const newCost = consumption * supplier.costPerKwh;
        const savings = originalCost - newCost;

        return {
            supplier,
            originalCost,
            newCost,
            // Garante que a economia seja positiva (embora a lógica garanta costPerKwh < tarifa geralmente)
            savings: savings > 0 ? parseFloat(savings.toFixed(2)) : 0,
            percent: savings > 0 ? parseFloat((savings / originalCost).toFixed(4)) : 0
        };
    })
        // Lógica de Ordenação:
        // Mostra a MELHOR economia primeiro (maior valor no topo)
        .sort((a, b) => b.savings - a.savings);
}

module.exports = { calculateSolutions, tariffMap, suppliers };
