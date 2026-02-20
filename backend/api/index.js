import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import cors from 'cors';
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

// Inicialização assíncrona do Apollo
await server.start();

const app = express();

/**
 * Configuração de CORS robusta diretamente no Express.
 * Isso garante que tanto preflight (OPTIONS) quanto requisições reais funcionem.
 */
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Rota para o Apollo Server
app.use('/api', expressMiddleware(server));
app.use('/', expressMiddleware(server));

// Exporta o app para o Vercel atuar como uma função
export default app;
