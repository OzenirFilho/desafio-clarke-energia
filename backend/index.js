const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { calculateSolutions } = require('./logic');

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
            // Validate inputs
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
});

startStandaloneServer(server, {
    listen: { port: 4000 },
}).then(({ url }) => {
    console.log(`🚀  Server ready at: ${url}`);
});
