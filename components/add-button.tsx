import { PlusIcon } from "@/lib/icons/Plus";
import { Link } from "expo-router";

const AddButton = () => {
  return (
    <Link
      href="/transactions/create"
      className="absolute bottom-6 right-6 bg-primary active:bg-primary/80 p-4 rounded-2xl shadow"
    >
      <PlusIcon className="text-primary-foreground" />
    </Link>
  );
};

export default AddButton;
