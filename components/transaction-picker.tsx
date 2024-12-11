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
import { getTransactions, QueryTransaction } from "@/db/queries/transactions";
import { convertTransactionAmountToMoney, formatMoney } from "@/lib/money";
import { Filters } from "@/lib/types";
import { arrayToMap, assertUnreachable } from "@/lib/utils";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { memoize } from "proxy-memoize";
import { useMemo, useState } from "react";
import { Dimensions, FlatList } from "react-native";
import EmptyState from "./empty-state";
import TransactionCard from "./transaction-card";
import { Input } from "./ui/input";

interface TransactionPickerProps {
  value?: number;
  onChange: (newValue: number) => void;
  filters?: Filters;
}

const TransactionPicker = ({
  value,
  onChange,
  filters = { categories: [], accounts: [], types: [] },
}: TransactionPickerProps) => {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { data: transactions } = useLiveQuery(getTransactions({ search, ...filters }), [
    search,
    filters,
  ]);
  const transactionsMap = useMemo(() => arrayToMap(transactions, ({ id }) => id), [transactions]);
  const transaction = value ? transactionsMap[value] : undefined;

  const handleTransactionClick = (id: number) => {
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
    ? `${renderTransactionText(transaction)} ${sign}${formatMoney(
        convertTransactionAmountToMoney(transaction)
      )}`
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
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
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

const renderTransactionText = memoize((transaction: QueryTransaction) => {
  switch (transaction.type) {
    case "transfer": {
      const { fromAccount, toAccount } = transaction;
      return transaction.title || `${fromAccount?.name || "Unknown account"}→${toAccount?.name}`;
    }
    case "expense":
    case "income": {
      const { category } = transaction;
      return transaction.title || category?.name || "Unknown category";
    }
    case "lent":
    case "borrowed":
      return `${transaction.title} (${transaction.type})`;
    case "collected_debt": {
      const { loanTransaction } = transaction;
      return (
        transaction.title ||
        `Collected "${
          loanTransaction?.type === "lent" ? loanTransaction.title : "Deleted"
        } loan payment"`
      );
    }
    case "paid_loan": {
      const { loanTransaction } = transaction;
      return (
        transaction.title ||
        `Paid "${
          loanTransaction?.type === "borrowed" ? loanTransaction.title : "Deleted"
        } loan payment"`
      );
    }
    default:
      assertUnreachable(transaction.type);
  }
});
export default TransactionPicker;
