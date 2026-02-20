import { ApolloServer } from '@apollo/server';
import { startServerAndCreateLambdaHandler, handlers } from '@as-integrations/aws-lambda';
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
 * Exporta o handler padrão para o Vercel Serverless.
 * Configurado com suporte a CORS para resolver bloqueios no navegador.
 */
export default startServerAndCreateLambdaHandler(
  server,
  handlers.createAPIGatewayProxyEventV2RequestHandler(),
  {
    middleware: [
      async (event) => {
        // Tratamento explícito para requisições OPTIONS (CORS Preflight)
        if (event.requestContext?.http?.method === 'OPTIONS') {
          return {
            statusCode: 204,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
              'Access-Control-Max-Age': '86400',
            },
            body: '',
          };
        }

        return (result) => {
          result.headers = {
            ...result.headers,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          };
          return result;
        };
      },
    ],
  }
);
