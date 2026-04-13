import { PrismaClient } from '../generated/prisma/index.js'

const prisma = new PrismaClient()

async function main() {
  console.log("Começando o tal do populamento 🔥🔥🔥")

  await prisma.itemEstoque.deleteMany()
  await prisma.compra.deleteMany()
  await prisma.venda.deleteMany()
  await prisma.extracao.deleteMany()
  await prisma.produto.deleteMany()
  await prisma.minerio.deleteMany()
  await prisma.estoque.deleteMany()

  console.log("Limpou tudo aí")

  const estoque = await prisma.estoque.create({ data: {} })
  console.log("Populou estoque aiai:", estoque.id)

  const produtos = await Promise.all([
    prisma.produto.create({ data: { nome: "Picareta" } }),
    prisma.produto.create({ data: { nome: "Broca" } }),
    prisma.produto.create({ data: { nome: "Explosivo" } }),
    prisma.produto.create({ data: { nome: "Capacete" } }),
  ])

  console.log("Populou produtos aiai:", produtos.length)

  const minerios = await Promise.all([
    prisma.minerio.create({ data: { nome: "Ouro" } }),
    prisma.minerio.create({ data: { nome: "Ferro" } }),
    prisma.minerio.create({ data: { nome: "Cobre" } }),
    prisma.minerio.create({ data: { nome: "Carvão" } }),
  ])

  console.log("Populou minérios aiai:", minerios.length)

  for (const p of produtos) {
    await prisma.itemEstoque.create({
      data: {
        produtoId: p.id,
        quantidade: 20,
        estoqueId: estoque.id
      }
    })
  }

  console.log("Populou estoque de produtos aiai")

  for (const m of minerios) {
    await prisma.itemEstoque.create({
      data: {
        minerioId: m.id,
        quantidade: 100,
        estoqueId: estoque.id
      }
    })
  }

  console.log("Populou estoque de minérios aiai")

  await prisma.compra.create({
    data: {
      produtoId: produtos[0].id,
      quantidade: 10
    }
  })

  console.log("Populou compra aiai")

  await prisma.extracao.create({
    data: {
      minerioId: minerios[0].id,
      quantidade: 50
    }
  })

  console.log("Populou extração aiai")

  await prisma.venda.create({
    data: {
      minerioId: minerios[1].id,
      quantidade: 30
    }
  })

  console.log("Populou venda aiai")

  console.log("Tá populado papai 🔥🔥🔥")
}

main()
  .catch((e) => {
    console.error("DEU ERRO NESSA BOMBA. ERRO:", e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })