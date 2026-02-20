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

let appInstance = null;

async function getApp() {
  if (appInstance) return appInstance;
  await server.start();
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/', expressMiddleware(server));
  appInstance = app;
  return app;
}

export default async (req, res) => {
  const app = await getApp();
  return app(req, res);
};
