import { Account, Transaction } from "../../generated/prisma";

export type TAccount = Omit<Account, "userId" | "type" | "target" | "dueDate" | "createdAt" | "updatedAt" | "deletedAt">
export type TEquity = Omit<Account, "userId" | "type" | "target" | "dueDate" | "createdAt" | "updatedAt" | "deletedAt">
export type TExpense = Omit<Account, "userId" | "type" | "target" | "dueDate" | "createdAt" | "updatedAt" | "deletedAt">
export type TIncome = Omit<Account, "userId" | "type" | "target" | "dueDate" | "createdAt" | "updatedAt" | "deletedAt">
export type TGoal = Omit<Account, "userId" | "type" | "createdAt" | "updatedAt" | "deletedAt">

export type TTransaction = Omit<Transaction, "userId" | "createdAt" | "updatedAt" | "deletedAt" | "fromAccountId" | "toAccountId"> & {
    fromAccount: TAccount
    toAccount: TAccount
}