import { ApolloServer } from '@apollo/server';
import { startServerAndCreateLambdaHandler, handlers } from '@as-integrations/aws-lambda';
import { startStandaloneServer } from '@apollo/server/standalone';
import { calculateSolutions } from './logic.js';

/**
 * Definições do Schema GraphQL (Tipos de dados).
 */
const typeDefs = `#graphql
  type Supplier {
    id: ID!
    name: String!
    logo: String!
    state: String!
    costPerKwh: Float!
    minKwh: Float!
    totalClients: Int!
    rating: Float!
    solutionType: String!
  }

  type Solution {
    supplier: Supplier!
    originalCost: Float!
    newCost: Float!
    savings: Float!
    percent: Float!
  }

  type Query {
    getSolutions(consumption: Float!, state: String!): [Solution!]!
  }
`;

/**
 * Resolvers: Lógica de execução das consultas.
 */
const resolvers = {
  Query: {
    getSolutions: (_, { consumption, state }) => {
      // Validação simples de entrada
      if (consumption <= 0) {
        throw new Error('Consumo deve ser maior que zero.');
      }
      // Chama a lógica de negócio modularizada em logic.js
      return calculateSolutions(consumption, state);
    },
  },
};

/**
 * Inicialização do Apollo Server.
 */
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});

/**
 * Lógica para rodar Localmente (Standalone) ou no Vercel (Lambda).
 */
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  // Se não estiver no Vercel, sobe como servidor tradicional para testes locais
  startStandaloneServer(server, {
    listen: { port: 4000 },
  }).then(({ url }) => {
    console.log(`🚀 Servidor Local pronto em: ${url}`);
  });
}

// Exporta o handler para o Vercel
export const handler = startServerAndCreateLambdaHandler(
  server,
  handlers.createAPIGatewayProxyEventV2RequestHandler(),
  {
    middleware: [
      async (event) => {
        return (result) => {
          result.headers = {
            ...result.headers,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          };
          return result;
        };
      },
    ],
  }
);
