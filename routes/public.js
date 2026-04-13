import express from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = express.Router()

router.post('/registrarProduto', async (req, res) => {
    const produto = req.body

    try {
        if (!produto.nome) {
            return res.status(500).json({ message: "Nome inválido" })
        }

        await prisma.produto.create({
            data: {
                nome: produto.nome
            }
        })

        return res.status(201).json({ message: "Produto registrado" })

    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: "Erro no servidor" })
    }
})

router.get('/listarProduto', async (req, res) => {
    const produtos = await prisma.produto.findMany()
    res.json(produtos)
})

router.post('/registrarMinerio', async (req, res) => {
    const minerio = req.body

    try {
        if (!minerio.nome) {
            return res.status(500).json({ message: "Nome inválido" })
        }

        await prisma.minerio.create({
            data: {
                nome: minerio.nome
            }
        })

        return res.status(201).json({ message: "Minério registrado" })

    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: "Erro no servidor" })
    }
})

router.get('/listarMinerio', async (req, res) => {
    const minerios = await prisma.minerio.findMany()
    res.json(minerios)
})

router.post('/registrarCompra', async (req, res) => {
    const compra = req.body

    try {
        if (!compra.produtoId || !compra.quantidade) {
            return res.status(500).json({ message: "Dados inválidos" })
        }

        await prisma.compra.create({
            data: {
                produtoId: Number(compra.produtoId),
                quantidade: Number(compra.quantidade)
            }
        })

        let estoque = await prisma.estoque.findFirst()
        if (!estoque) {
            estoque = await prisma.estoque.create({ data: {} })
        }

        const item = await prisma.itemEstoque.findFirst({
            where: {
                produtoId: Number(compra.produtoId),
                estoqueId: estoque.id
            }
        })

        if (item) {
            await prisma.itemEstoque.update({
                where: { id: item.id },
                data: {
                    quantidade: item.quantidade + Number(compra.quantidade)
                }
            })
        } else {
            await prisma.itemEstoque.create({
                data: {
                    produtoId: Number(compra.produtoId),
                    quantidade: Number(compra.quantidade),
                    estoqueId: estoque.id
                }
            })
        }

        return res.status(201).json({ message: "Compra registrada" })

    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: "Erro na compra" })
    }
})

router.post('/registrarExtracao', async (req, res) => {
    const extracao = req.body

    try {
        if (!extracao.minerioId || !extracao.quantidade) {
            return res.status(500).json({ message: "Dados inválidos" })
        }

        await prisma.extracao.create({
            data: {
                minerioId: Number(extracao.minerioId),
                quantidade: Number(extracao.quantidade)
            }
        })

        let estoque = await prisma.estoque.findFirst()
        if (!estoque) {
            estoque = await prisma.estoque.create({ data: {} })
        }

        const item = await prisma.itemEstoque.findFirst({
            where: {
                minerioId: Number(extracao.minerioId),
                estoqueId: estoque.id
            }
        })

        if (item) {
            await prisma.itemEstoque.update({
                where: { id: item.id },
                data: {
                    quantidade: item.quantidade + Number(extracao.quantidade)
                }
            })
        } else {
            await prisma.itemEstoque.create({
                data: {
                    minerioId: Number(extracao.minerioId),
                    quantidade: Number(extracao.quantidade),
                    estoqueId: estoque.id
                }
            })
        }

        return res.status(201).json({ message: "Extração registrada" })

    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: "Erro na extração" })
    }
})

router.post('/registrarVenda', async (req, res) => {
    const venda = req.body

    try {
        if (!venda.minerioId || !venda.quantidade) {
            return res.status(500).json({ message: "Dados inválidos" })
        }

        let estoque = await prisma.estoque.findFirst()
        if (!estoque) {
            return res.status(500).json({ message: "Estoque inexistente" })
        }

        const item = await prisma.itemEstoque.findFirst({
            where: {
                minerioId: Number(venda.minerioId),
                estoqueId: estoque.id
            }
        })

        if (!item || item.quantidade < venda.quantidade) {
            return res.status(400).json({ message: "Estoque insuficiente" })
        }

        await prisma.venda.create({
            data: {
                minerioId: Number(venda.minerioId),
                quantidade: Number(venda.quantidade)
            }
        })

        await prisma.itemEstoque.update({
            where: { id: item.id },
            data: {
                quantidade: item.quantidade - Number(venda.quantidade)
            }
        })

        return res.status(201).json({ message: "Venda realizada" })

    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: "Erro na venda" })
    }
})

router.get('/listarEstoque', async (req, res) => {
    const estoque = await prisma.itemEstoque.findMany({
        include: {
            produto: true,
            minerio: true
        }
    })

    res.json(estoque)
})

export default router