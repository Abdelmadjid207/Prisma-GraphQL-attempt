import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const prisma = new PrismaClient()

// ESM dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(express.static(path.join(__dirname, 'public')))

// GraphQL schema and resolvers
const typeDefs = fs.readFileSync(path.join(__dirname, 'schema.graphql'), 'utf-8')

const resolvers = {
  Query: {
    users: async () => prisma.user.findMany(),
  },
  Mutation: {
    createUser: async (_, args) => prisma.user.create({ data: args }),
    updateUser: async (_, args) => {
      const { id, ...data } = args
      return prisma.user.update({ where: { id: Number(id) }, data })
    },
    deleteUser: async (_, { id }) => prisma.user.delete({ where: { id: Number(id) } }),
  },
}

const server = new ApolloServer({ typeDefs, resolvers })
await server.start()
server.applyMiddleware({ app, path: '/graphql' })

app.listen(4000, () =>
  console.log('Server running at http://localhost:4000')
)
