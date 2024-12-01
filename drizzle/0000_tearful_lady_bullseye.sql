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
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`budget_id`) REFERENCES `budgets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `budgets_categories` (
	`category_id` integer NOT NULL,
	`budget_id` integer NOT NULL,
	PRIMARY KEY(`category_id`, `budget_id`),
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`budget_id`) REFERENCES `budgets`(`id`) ON UPDATE no action ON DELETE no action
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
	`icon` text,
	`type` text,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `base_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`amount_value_in_minor_units` integer NOT NULL,
	`amount_currency_code` text NOT NULL,
	`datetime` text DEFAULT (current_timestamp) NOT NULL,
	`title` text,
	`note` text,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `title_index` ON `base_transactions` (`title`);--> statement-breakpoint
CREATE INDEX `datetime_index` ON `base_transactions` (`datetime`);--> statement-breakpoint
CREATE TABLE `expense_income_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`category_id` integer,
	`account_id` integer NOT NULL,
	`app_category_id` integer,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "category_id_check" CHECK("expense_income_transactions"."app_category_id" IS NOT NULL OR "expense_income_transactions"."category_id" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE `loan_payment_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`account_id` integer NOT NULL,
	`loan_id` integer NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`loan_id`) REFERENCES `loan_transactions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `loan_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`account_id` integer NOT NULL,
	`due_date` text,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `transfer_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text DEFAULT 'transfer',
	`from_account_id` integer NOT NULL,
	`to_account_id` integer NOT NULL,
	`exchange_rate` integer NOT NULL,
	FOREIGN KEY (`from_account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`to_account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "diff_accounts_check" CHECK("transfer_transactions"."from_account_id" <> "transfer_transactions"."to_account_id")
);
