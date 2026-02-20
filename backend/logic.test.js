const { calculateSolutions, tariffMap } = require('./logic');

describe('Suite de Testes Unitários - Cálculo de Soluções de Energia', () => {

    describe('Cenários Básicos e Felizes', () => {
        test('[TC01] Deve calcular economia corretamente para SP com consumo de 500 kWh (Min Consumption check)', () => {
            // SP tarifa base = 0.95. Custo Original = 500 * 0.95 = 475.
            // Fornecedores:
            // 1. EcoEnergy (0.80) -> Requer 1000 minKwh. NÃO ELEGÍVEL.
            // 2. GreenPower (0.75) -> Requer 3000 minKwh. NÃO ELEGÍVEL.
            // 7. EnergiSP (0.82) -> Requer 100 minKwh. ELEGÍVEL.
            //    Novo Custo = 500 * 0.82 = 410.
            //    Economia Esperada = 475 - 410 = 65.

            const results = calculateSolutions(500, 'SP');

            expect(results).toHaveLength(1);
            expect(results[0].supplier.name).toBe('EnergiSP');
            expect(results[0].savings).toBe(65);
            expect(results[0].percent).toBeCloseTo(65 / 475, 4);
        });

        test('[TC02] Deve retornar múltiplos fornecedores ordenados pela maior economia (Sorting Logic)', () => {
            // SP tarifa base = 0.95. Consumo 5000 kWh.
            // Custo Original = 5000 * 0.95 = 4750.

            // Fornecedores Elegíveis:
            // 1. EcoEnergy (0.80) -> Custo 4000. Economia 750.
            // 2. GreenPower (0.75) -> Custo 3750. Economia 1000.
            // 7. EnergiSP (0.82) -> Custo 4100. Economia 650.

            const results = calculateSolutions(5000, 'SP');

            expect(results).toHaveLength(3);

            // Validação de Ordenação (Maior Economia Primeiro)
            expect(results[0].supplier.name).toBe('GreenPower');
            expect(results[0].savings).toBe(1000);

            expect(results[1].supplier.name).toBe('EcoEnergy');
            expect(results[1].savings).toBe(750);

            expect(results[2].supplier.name).toBe('EnergiSP');
            expect(results[2].savings).toBe(650);
        });
    });

    describe('Cenários de Borda e Validação', () => {
        test('[TC03] Deve retornar lista vazia se o estado não possuir fornecedores cadastrados (Empty State)', () => {
            const results = calculateSolutions(1000, 'AC'); // AC não está no mock
            expect(results).toHaveLength(0);
        });

        test('[TC04] Deve retornar lista vazia se consumo for menor que o mínimo de todos os fornecedores (Low Consumption)', () => {
            // SP tarifa base = 0.95. Consumo 50 kWh.
            // EnergiSP requer 100 kWh. Ninguém deve atender.
            const results = calculateSolutions(50, 'SP');
            expect(results).toHaveLength(0);
        });

        test('[TC05] Deve lidar corretamente com estado inexistente usando tarifa padrão (Default Tariff)', () => {
            // Estado "XX" não existe no mapa. Deve usar 0.90 (default do código).
            // Consumo 5000. Custo Original = 5000 * 0.90 = 4500.
            // Não deve encontrar fornecedores mockados pois filtramos por `s.state === state`.
            // Se a lógica for estrita por filtro de estado, deve retornar vazio.

            const results = calculateSolutions(5000, 'XX');
            expect(results).toHaveLength(0);
        });
    });

    describe('Integridade de Dados', () => {
        test('[TC06] Todos os objetos de solução devem ter a estrutura correta', () => {
            const results = calculateSolutions(5000, 'SP');

            results.forEach(solution => {
                expect(solution).toHaveProperty('supplier');
                expect(solution).toHaveProperty('originalCost');
                expect(solution).toHaveProperty('newCost');
                expect(solution).toHaveProperty('savings');
                expect(solution).toHaveProperty('percent');

                expect(solution.supplier).toHaveProperty('id');
                expect(solution.supplier).toHaveProperty('name');
                expect(solution.supplier).toHaveProperty('logo');
                expect(solution.supplier).toHaveProperty('costPerKwh');
                expect(solution.supplier).toHaveProperty('solutionType');
            });
        });
    });
});
