import { prisma, TTransaction } from "@repo/db"
import { TRANSACTION_OMIT_FIELDS } from "../../../shared/omit-fields"

export default async function getTransactions(userId: string): Promise<TTransaction[]> {
    const transactions = await prisma.transaction.findMany({
        where: {
            userId,
            deletedAt: null,
            fromAccount: {
                deletedAt: null,
                userId,
            },
            toAccount: {
                deletedAt: null,
                userId,
            },
        },
        include: {
            fromAccount: {
                select: {
                    id: true,
                    name: true,
                },
            },
            toAccount: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        omit: {
            ...TRANSACTION_OMIT_FIELDS,
            fromAccountId: true,
            toAccountId: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    })

    return transactions
}