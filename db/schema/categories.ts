import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestamps } from "./column_helpers";

type Icon =
  // can either be app provided icons or emojis
  | {
      name: string;
      type: "icon";
    }
  | {
      emoji: string;
      type: "emoji";
    };

export const categoriesTable = sqliteTable(
  "categories",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    color: text().notNull(),
    icon: text({ mode: "json" }).$type<Icon>().notNull(),
    type: text({ enum: ["expense", "income"] }),
    ...timestamps,
  },
  (table) => ({ nameIndex: index("c_name_index").on(table.name) })
);

export type SchemaCategory = typeof categoriesTable.$inferSelect;
