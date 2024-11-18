import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Text } from "@/components/ui/text";
import { filterTransactions } from "@/lib/app-utils";
import { formatMoney } from "@/lib/money";
import { useAppStore } from "@/lib/store";
import { Account, Transaction, TransactionCategory, TransactionType } from "@/lib/types";
import { assertUnreachable } from "@/lib/utils";
import dayjs from "dayjs";
import { memoize } from "proxy-memoize";
import { useState } from "react";
import { Dimensions, FlatList } from "react-native";
import EmptyState from "./empty-state";
import TransactionCard from "./transaction-card";
import { Input } from "./ui/input";

export interface Filters {
  categories: Array<TransactionCategory["id"]>;
  types: Array<TransactionType>;
  accounts: Array<Account["id"]>;
}

interface TransactionPickerProps {
  value?: string;
  onChange: (newValue: string) => void;
  filters?: Filters;
}

const TransactionPicker = ({
  value,
  onChange,
  filters = { categories: [], accounts: [], types: [] },
}: TransactionPickerProps) => {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const transactionsMap = useAppStore((state) => state.transactions);
  const transaction = value ? transactionsMap[value] : undefined;
  const filteredTransactions = filterTransactions(
    Object.values(transactionsMap) as Array<Transaction>,
    {
      search,
      filters,
      period: {
        period: "all time",
        date: dayjs(0), // date does not matter
      },
    }
  );

  const handleTransactionClick = (id: string) => {
    onChange(id);
    setIsOpen(false);
  };

  let sign: string;
  switch (transaction?.type) {
    case "expense":
    case "lent":
    case "paid_loan":
      sign = "-";
      break;
    case "borrowed":
    case "collected_debt":
    case "income":
      sign = "+";
      break;
    default:
      sign = "";
  }

  const label = transaction
    ? `${renderTransactionText(transaction)} ${sign}${formatMoney(transaction.amount)}`
    : "Select transaction";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"} className="rounded-xl items-start justify-start text-sm">
          <Text>{label}</Text>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="rounded-2xl"
        style={{
          width: Dimensions.get("screen").width - 24 * 2,
          height: Dimensions.get("screen").height * 0.6,
        }}
      >
        <DialogHeader className="gap-2">
          <DialogTitle className="text-xl font-medium">Select Transaction</DialogTitle>

          <Input
            className="border border-border px-3 py-2 flex-1 rounded-xl"
            placeholder="Search transactions"
            onChangeText={setSearch}
            value={search}
          />
        </DialogHeader>

        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionCard transaction={item} onPress={() => handleTransactionClick(item.id)} />
          )}
          className="flex-1 py-2"
          ListEmptyComponent={<EmptyState title="No transactions to show" />}
        />

        <DialogClose asChild>
          <Button className="mt-4">
            <Text>Done</Text>
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

const renderTransactionText = memoize((transaction: Transaction) => {
  const { accounts, transactions, categories } = useAppStore.getState();
  const { type } = transaction;

  switch (type) {
    case "transfer":
      const fromAccount = accounts[transaction.from];
      const toAccount = accounts[transaction.from];
      return transaction.title || `${fromAccount?.name || "Unknown account"}→${toAccount?.name}`;
    case "expense":
    case "income":
      const category = categories[transaction.categoryID];
      return transaction.title || category?.name || "Unknown category";
    case "lent":
    case "borrowed":
      return `${transaction.title} (${type})`;
    case "collected_debt":
      const loanTransaction = transactions[transaction.loanID];
      return (
        transaction.title ||
        `Collected "${
          loanTransaction?.type === "lent" ? loanTransaction.title : "Deleted"
        } loan payment"`
      );
    case "paid_loan": {
      const loanTransaction = transactions[transaction.loanID];
      return (
        transaction.title ||
        `Paid "${
          loanTransaction?.type === "borrowed" ? loanTransaction.title : "Deleted"
        } loan payment"`
      );
    }
    default:
      assertUnreachable(type);
  }
});
export default TransactionPicker;
