CREATE TABLE `accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`balance_value_in_minor_units` integer NOT NULL,
	`color` text NOT NULL,
	`currency_code` text NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `budgets_accounts` (
	`account_id` integer NOT NULL,
	`budget_id` integer NOT NULL,
	PRIMARY KEY(`account_id`, `budget_id`),
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`budget_id`) REFERENCES `budgets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `budgets_categories` (
	`category_id` integer NOT NULL,
	`budget_id` integer NOT NULL,
	PRIMARY KEY(`category_id`, `budget_id`),
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`budget_id`) REFERENCES `budgets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `budgets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`amount_value_in_minor_units` integer NOT NULL,
	`currency_code` text NOT NULL,
	`period` text,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`icon` text NOT NULL,
	`type` text,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`amount_value_in_minor_units` integer NOT NULL,
	`amount_currency_code` text NOT NULL,
	`type` text NOT NULL,
	`datetime` text DEFAULT (current_timestamp) NOT NULL,
	`title` text,
	`note` text,
	`account_id` integer,
	`category_id` integer,
	`app_category_id` text,
	`from_account_id` integer,
	`to_account_id` integer,
	`exchange_rate` integer,
	`due_date` text,
	`loan_id` integer,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`from_account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`to_account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`loan_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "type_specific_fields_check" CHECK(((("transactions"."type" = 'expense' or "transactions"."type" = 'income') and ("transactions"."category_id" is not null or "transactions"."app_category_id" is not null or "transactions"."account_id" is not null)) or ("transactions"."type" = 'transfer' and "transactions"."from_account_id" is not null and "transactions"."to_account_id" is not null and "transactions"."exchange_rate" is not null) or (("transactions"."type" = 'lent' or "transactions"."type" = 'borrowed') and "transactions"."title" is not null and "transactions"."account_id" is not null) or (("transactions"."type" = 'paid_loan' or "transactions"."type" = 'collected_debt') and "transactions"."loan_id" is not null and "transactions"."account_id" is not null)))
);
--> statement-breakpoint
CREATE INDEX `title_index` ON `transactions` (`title`);--> statement-breakpoint
CREATE INDEX `datetime_index` ON `transactions` (`datetime`);--> statement-breakpoint
CREATE INDEX `type_index` ON `transactions` (`type`);--> statement-breakpoint
CREATE INDEX `account_index` ON `transactions` (`to_account_id`);--> statement-breakpoint
CREATE INDEX `category_index` ON `transactions` (`category_id`);--> statement-breakpoint
CREATE INDEX `loan_index` ON `transactions` (`loan_id`);