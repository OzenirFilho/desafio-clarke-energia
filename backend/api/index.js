const { ApolloServer } = require('@apollo/server');
const { startServerAndCreateLambdaHandler, handlers } = require('@as-integrations/aws-lambda');
const { calculateSolutions } = require('./logic');

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
  introspection: true, // Necessário para o sandbox do Apollo funcionar em produção (Vercel)
});

/**
 * Exporta o handler configurado para ambiente Serverless (Vercel/AWS Lambda).
 * Usamos startServerAndCreateLambdaHandler para adaptar o servidor Apollo.
 */
export const handler = startServerAndCreateLambdaHandler(
  server,
  handlers.createAPIGatewayProxyEventV2RequestHandler(),
  {
    middleware: [
      // Middleware para lidar com CORS em ambiente serverless
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
