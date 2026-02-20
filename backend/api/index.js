import { ApolloServer } from '@apollo/server';
import { startServerAndCreateLambdaHandler, handlers } from '@as-integrations/aws-lambda';
import { calculateSolutions } from './logic.js';

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

const resolvers = {
  Query: {
    getSolutions: (_, { consumption, state }) => {
      if (consumption <= 0) {
        throw new Error('Consumo deve ser maior que zero.');
      }
      return calculateSolutions(consumption, state);
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});

/**
 * Voltamos para o AWS Lambda Handler, mas agora com uma configuração
 * mais simplificada e exportação padrão para o Vercel.
 */
export default startServerAndCreateLambdaHandler(
  server,
  handlers.createAPIGatewayProxyEventV2RequestHandler(),
  {
    middleware: [
      async (event) => {
        // Resposta imediata para preflight CORS
        if (event.requestContext?.http?.method === 'OPTIONS') {
          return {
            statusCode: 204,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
