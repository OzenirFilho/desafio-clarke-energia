describe('Suite E2E - Desafio Clarke [TCE2E]', () => {

    beforeEach(() => {
        // [TCE2E-00] Pré-condição: Visitar a página inicial
        cy.visit('/');
        // Mock da API para isolar o frontend (Teste de Integração de UI)
        cy.intercept('POST', 'http://localhost:4000/', {
            statusCode: 200,
            body: {
                data: {
                    getSolutions: [
                        {
                            supplier: {
                                id: '1',
                                name: 'Fornecedor Teste GD',
                                logo: 'https://via.placeholder.com/150',
                                state: 'SP',
                                costPerKwh: 0.80,
                                rating: 4.8,
                                totalClients: 1000,
                                minKwh: 500,
                                solutionType: 'GD'
                            },
                            savings: 500.50,
                            percent: 0.15,
                            originalCost: 3000,
                            newCost: 2499.50
                        },
                        {
                            supplier: {
                                id: '2',
                                name: 'Fornecedor Teste ML',
                                logo: 'https://via.placeholder.com/150',
                                state: 'SP',
                                costPerKwh: 0.70,
                                rating: 4.5,
                                totalClients: 2000,
                                minKwh: 2000,
                                solutionType: 'Mercado Livre'
                            },
                            savings: 800.00,
                            percent: 0.20,
                            originalCost: 3000,
                            newCost: 2200.00
                        }
                    ]
                }
            }
        }).as('getSolutionsMock');
    });

    it('[TCE2E-01] Deve carregar a página inicial corretamente e exibir título', () => {
        cy.get('h1').should('contain', 'Clarke Energia');
        cy.get('p.subtitle').should('contain', 'Encontre a melhor solução');
    });

    it('[TCE2E-02] Deve realizar uma consulta válida e exibir resultados mockados', () => {
        // Ação: Preencher formulário
        cy.get('select#state').select('SP');
        cy.get('#consumption').type('2500');

        // Ação: Clicar no botão
        cy.get('.btn-primary').click();

        // Validação: Esperar interceptação
        cy.wait('@getSolutionsMock');

        // Validação: Verificar cards de destaque (Summary)
        cy.contains('Melhor em Geração Distribuída').should('be.visible');
        cy.contains('Melhor em Mercado Livre').should('be.visible');

        // Validação: Verificar fornecedores na grade
        cy.contains('Fornecedor Teste GD').should('be.visible');
        cy.contains('Fornecedor Teste ML').should('be.visible');

        // Validação: Verificar valores formatados
        cy.contains('R$ 500,50').should('be.visible');
    });

    it('[TCE2E-03] Deve exibir mensagem de erro se a API falhar', () => {
        // [TCE2E-03] Cenário de Falha
        cy.intercept('POST', 'http://localhost:4000/', {
            statusCode: 500,
            body: { errors: [{ message: 'Internal Server Error' }] }
        }).as('getSolutionsError');

        cy.get('select#state').select('SP');
        cy.get('#consumption').type('2500');
        cy.get('.btn-primary').click();

        cy.wait('@getSolutionsError');

        cy.contains('Falha ao buscar fornecedores').should('be.visible');
    });

    it('[TCE2E-04] Botão deve ficar desabilitado durante o carregamento', () => {
        // Atrasar resposta da API para verificar loading
        cy.intercept('POST', 'http://localhost:4000/', {
            delay: 1000, // 1 segundo
            body: { data: { getSolutions: [] } }
        }).as('getSolutionsCustomDelay');

        cy.get('select#state').select('SP');
        cy.get('#consumption').type('2500');
        cy.get('.btn-primary').click();

        // Deve conter texto de carregamento e estar desabilitado
        cy.get('.btn-primary').should('be.disabled').and('contain', 'Calculando...');

        cy.wait('@getSolutionsCustomDelay');

        // Deve voltar ao normal
        cy.get('.btn-primary').should('not.be.disabled').and('contain', 'Ver Economia');
    });
});
