const { ApolloServer, gql } = require('apollo-server');
const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();

// Acceder a las variables de entorno
const cosmosDbEndpoint = process.env.COSMODB_STRING;
const cosmosDbMasterKey = process.env.COSMODB_KEY;
const cosmosDbDatabaseId = process.env.COSMODB_DB;
const cosmosDbContainerId = process.env.COSMODB_TABLE;
const cosmosFullDbEndpoint = process.env.COSMODB_FULL

const cosmosClient = new CosmosClient(cosmosFullDbEndpoint);

//const cosmosClient = new CosmosClient({ cosmosDbEndpoint, cosmosDbMasterKey });

//const cosmosClient = new CosmosClient({
//  endpoint: cosmosDbEndpoint,
//  auth: {
//    ApplicationName: "abcjobs",
//    key: cosmosDbMasterKey,
//  },
//});

const typeDefs = gql`
  type Transaction {
    tipoTransaccion: String
    monto: Float
    comprobanteTransaccion: String
    numeroCuenta: String
    banco: String
    codigoError: String
    detalleError: String
}

  type Payment {
    Id: String
    numeroPago: String
    fecha: String
    paisOrigen: String
    paisDestino: String
    monedaDestino: String
    monedaOrigen: String
    monto: Float
    comprobantePago: String
    estado: String
    transacciones: [Transaction]
  }

  type Query {
    getPayment(Id: String!): Payment
  }
`;

const resolvers = {
  Query: {
    getPayment: async (_, { Id }) => {
      try {
        const { database } = await cosmosClient.databases.createIfNotExists({ id: cosmosDbDatabaseId });
        const { container } = await database.containers.createIfNotExists({ id: cosmosDbContainerId });

        const { resource } = await container.item(Id).read();
        return resource;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Servidor de Apollo GraphQL en funcionamiento en ${url}`);
});