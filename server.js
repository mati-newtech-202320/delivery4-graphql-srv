const { ApolloServer, gql } = require('apollo-server');
const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();

// Acceder a las variables de entorno
const cosmosDbEndpoint = process.env.COSMODB_STRING;
const cosmosDbMasterKey = process.env.COSMODB_KEY;
const cosmosDbDatabaseId = process.env.COSMODB_DB;
const cosmosDbContainerId = process.env.COSMODB_TABLE;

const cosmosClient = new CosmosClient({
  endpoint: cosmosDbEndpoint,
  auth: {
    masterKey: cosmosDbMasterKey,
  },
});

const typeDefs = gql`
  type Transaction {
    tipoTransaccion: String
    monto: Float
    comprobanteTransaccion: String
  }

  type Payment {
    NumeroPago: String
    fecha: String
    paisOrigen: String
    paisDestino: String
    monedaDestino: String
    monedaOrigen: String
    monto: Float
    comprobantePago: String
    transacciones: [Transaction]
  }

  type Query {
    getPayment(NumeroPago: String!): Payment
  }
`;

const resolvers = {
  Query: {
    getPayment: async (_, { NumeroPago }) => {
      try {
        const { database } = await cosmosClient.databases.createIfNotExists({ id: cosmosDbEndpoint });
        const { container } = await database.containers.createIfNotExists({ id: cosmosDbContainerId });

        const { resource } = await container.item(NumeroPago).read();
        return resource;
      } catch (error) {
        throw error;
      }
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Servidor de Apollo GraphQL en funcionamiento en ${url}`);
});