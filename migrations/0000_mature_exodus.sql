CREATE TABLE `anime` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`english_name` text,
	`chinese_name` text
);
--> statement-breakpoint
CREATE TABLE `episode` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`group_id` integer NOT NULL,
	`episode` integer NOT NULL,
	`season` integer NOT NULL,
	`link` text NOT NULL,
	`pub_date` text NOT NULL,
	`status` text NOT NULL,
	`score` integer NOT NULL,
	`resolution` text,
	`source` text,
	`original_title` text NOT NULL,
	`hash` text NOT NULL,
	`subtitle_id` integer,
	`tmdb_id` integer NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `group`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subtitle_id`) REFERENCES `subtitle`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tmdb_id`) REFERENCES `anime`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `group` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`group` text NOT NULL,
	`score` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `subtitle` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lang` text,
	`score` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `anime_name_unique` ON `anime` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `episode_link_unique` ON `episode` (`link`);--> statement-breakpoint
CREATE UNIQUE INDEX `episode_hash_unique` ON `episode` (`hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `group_group_unique` ON `group` (`group`);--> statement-breakpoint
CREATE UNIQUE INDEX `subtitle_lang_unique` ON `subtitle` (`lang`);