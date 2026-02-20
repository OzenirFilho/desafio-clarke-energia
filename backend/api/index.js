import { ApolloServer } from '@apollo/server';
import { startServerAndCreateLambdaHandler, handlers } from '@as-integrations/aws-lambda';
import { calculateSolutions } from './logic.js';

/**
 * Schema GraphQL
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
    health: String
  }
`;

const resolvers = {
  Query: {
    getSolutions: (_, { consumption, state }) => {
      if (consumption <= 0) throw new Error('Consumo deve ser maior que zero.');
      return calculateSolutions(consumption, state);
    },
    health: () => "OK"
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});

// Resposta padrão para evitar falhas de CORS e Preflight
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

/**
 * Handler Principal para Vercel Serverless
 */
export default startServerAndCreateLambdaHandler(
  server,
  handlers.createAPIGatewayProxyEventV2RequestHandler(),
  {
    middleware: [
      async (event) => {
        // Lidar com Preflight do Navegador
        if (event.requestContext?.http?.method === 'OPTIONS') {
          return {
            statusCode: 204,
            headers: corsHeaders,
            body: '',
          };
        }

        return (result) => {
          result.headers = {
            ...result.headers,
            ...corsHeaders
          };
          return result;
        };
      },
    ],
  }
);
