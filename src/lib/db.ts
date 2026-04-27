import { createClient } from "@libsql/client";
import { randomUUID } from "node:crypto";

const databaseUrl = process.env.TURSO_DATABASE_URL;

if (!databaseUrl) {
	throw new Error("TURSO_DATABASE_URL is required");
}

export const db = createClient({
	url: databaseUrl,
	authToken: process.env.TURSO_AUTH_TOKEN,
});

export type MarketplaceUser = {
	id_user: string;
	username: string;
	email: string;
	avatar_url: string | null;
	bio: string | null;
	aipoints: number;
	airank: number;
	created_at: string;
	updated_at: string;
};

const toMarketplaceUser = (row: Record<string, unknown>): MarketplaceUser => ({
	id_user: String(row.id_user),
	username: String(row.username),
	email: String(row.email),
	avatar_url: row.avatar_url ? String(row.avatar_url) : null,
	bio: row.bio ? String(row.bio) : null,
	aipoints: Number(row.aipoints ?? 0),
	airank: Number(row.airank ?? 0),
	created_at: String(row.created_at),
	updated_at: String(row.updated_at),
});

export async function findMarketplaceUserById(idUser: string) {
	const result = await db.execute({
		sql: `
			SELECT
				id_user,
				username,
				email,
				avatar_url,
				bio,
				aipoints,
				airank,
				created_at,
				updated_at
			FROM User
			WHERE id_user = ?
			LIMIT 1
		`,
		args: [idUser],
	});

	const row = result.rows[0] as Record<string, unknown> | undefined;
	return row ? toMarketplaceUser(row) : null;
}

export async function findMarketplaceUserByUsername(username: string) {
	const result = await db.execute({
		sql: `
			SELECT
				id_user,
				username,
				email,
				avatar_url,
				bio,
				aipoints,
				airank,
				created_at,
				updated_at
			FROM User
			WHERE username = ?
			LIMIT 1
		`,
		args: [username],
	});

	const row = result.rows[0] as Record<string, unknown> | undefined;
	return row ? toMarketplaceUser(row) : null;
}

export async function findAuthProviderByUserId(userId: string) {
	const result = await db.execute({
		sql: `
			SELECT providerId, accountId
			FROM auth_account
			WHERE userId = ?
			ORDER BY createdAt DESC
			LIMIT 1
		`,
		args: [userId],
	});

	const providerMap: Record<string,string> = {
		password: "local",
		credential: "local",
		google: "google",
		github: "github",
	};

	const row = result.rows[0] as Record<string, unknown> | undefined;
	if (!row) {
		return { provider: "local", providerId: null as string | null };
	}

	const providerIdRaw = String(row.providerId ?? "local");
	const provider = providerMap[providerIdRaw] ?? "local";
	const providerId = row.accountId ? String(row.accountId) : null;

	return { provider, providerId };
}

export async function createMarketplaceUserProfile(input: {
	idUser: string;
	username: string;
	email: string;
	avatarUrl?: string | null;
	provider: string;
	providerId?: string | null;
}) {
	await db.execute({
		sql: `
			INSERT INTO User (
				id_user,
				username,
				email,
				provider,
				provider_id,
				avatar_url,
				aipoints,
				airank
			) VALUES (?, ?, ?, ?, ?, ?, 100, 0)
		`,
		args: [
			input.idUser,
			input.username,
			input.email,
			input.provider,
			input.providerId ?? null,
			input.avatarUrl ?? null,
		],
	});

	return findMarketplaceUserById(input.idUser);
}

export async function updateMarketplaceUserProfile(input: {
	idUser: string;
	username?: string;
	bio?: string | null;
}) {
	const updates: string[] = [];
	const args: Array<string | null> = [];

	if (typeof input.username === "string") {
		updates.push("username = ?");
		args.push(input.username);
	}

	if (input.bio !== undefined) {
		updates.push("bio = ?");
		args.push(input.bio);
	}

	if (updates.length === 0) {
		return findMarketplaceUserById(input.idUser);
	}

	updates.push("updated_at = datetime('now')");

	await db.execute({
		sql: `
			UPDATE User
			SET ${updates.join(", ")}
			WHERE id_user = ?
		`,
		args: [...args, input.idUser],
	});

	return findMarketplaceUserById(input.idUser);
}

export type PromptSort = "recent" | "popular" | "top_rated";

export type PromptRow = {
	id_prompt: string;
	user_id: string;
	title: string;
	content: string;
	description: string | null;
	model: string;
	aipoints_price: number;
	uses_count: number;
	is_published: number;
	created_at: string;
	updated_at: string;
	username: string;
	avatar_url: string | null;
	airank: number;
	upvotes: number;
	downvotes: number;
	tags: string[];
	response_preview: {
		content: string | null;
		tokens_prompt: number | null;
		tokens_response: number | null;
	};
};

type CreatePromptInput = {
	userId: string;
	title: string;
	content: string;
	description?: string | null;
	model: string;
	aipointsPrice?: number;
	isPublished?: boolean;
	tags?: string[];
};

type UpdatePromptInput = {
	promptId: string;
	title?: string;
	content?: string;
	description?: string | null;
	model?: string;
	aipointsPrice?: number;
	isPublished?: boolean;
	tags?: string[];
};

export type PromptResponseRow = {
	id_response: string;
	prompt_id: string;
	content: string;
	tokens_prompt: number | null;
	tokens_response: number | null;
	generated_at: string;
};

const toPromptListRow = (row: Record<string, unknown>): PromptRow => ({
	id_prompt: String(row.id_prompt),
	user_id: String(row.user_id),
	title: String(row.title),
	content: String(row.content ?? ""),
	description: row.description ? String(row.description) : null,
	model: String(row.model),
	aipoints_price: Number(row.aipoints_price ?? 0),
	uses_count: Number(row.uses_count ?? 0),
	is_published: Number(row.is_published ?? 0),
	created_at: String(row.created_at),
	updated_at: String(row.updated_at),
	username: String(row.username),
	avatar_url: row.avatar_url ? String(row.avatar_url) : null,
	airank: Number(row.airank ?? 0),
	upvotes: Number(row.upvotes ?? 0),
	downvotes: Number(row.downvotes ?? 0),
	tags: row.tags_csv
		? String(row.tags_csv)
				.split(",")
				.map((value) => value.trim())
				.filter(Boolean)
		: [],
	response_preview: {
		content: row.response_content ? String(row.response_content) : null,
		tokens_prompt:
			row.response_tokens_prompt !== null && row.response_tokens_prompt !== undefined
				? Number(row.response_tokens_prompt)
				: null,
		tokens_response:
			row.response_tokens_response !== null && row.response_tokens_response !== undefined
				? Number(row.response_tokens_response)
				: null,
	},
});

const toPromptResponseRow = (row: Record<string, unknown>): PromptResponseRow => ({
	id_response: String(row.id_response),
	prompt_id: String(row.prompt_id),
	content: String(row.content),
	tokens_prompt:
		row.tokens_prompt !== null && row.tokens_prompt !== undefined
			? Number(row.tokens_prompt)
			: null,
	tokens_response:
		row.tokens_response !== null && row.tokens_response !== undefined
			? Number(row.tokens_response)
			: null,
	generated_at: String(row.generated_at),
});

const normalizeTag = (input: string) =>
	input
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");

async function ensureTagByName(rawTag: string) {
	const normalized = normalizeTag(rawTag);
	if (!normalized) {
		return null;
	}

	const existing = await db.execute({
		sql: `
			SELECT id_tag
			FROM Tag
			WHERE slug = ?
			LIMIT 1
		`,
		args: [normalized],
	});

	const found = existing.rows[0] as Record<string, unknown> | undefined;
	if (found?.id_tag) {
		return String(found.id_tag);
	}

	const idTag = randomUUID();
	const title = rawTag.trim();

	await db.execute({
		sql: `
			INSERT INTO Tag (id_tag, name, slug)
			VALUES (?, ?, ?)
		`,
		args: [idTag, title || normalized, normalized],
	});

	return idTag;
}

async function replacePromptTags(promptId: string, tags: string[] | undefined) {
	if (!tags) {
		return;
	}

	await db.execute({
		sql: `DELETE FROM PromptTag WHERE prompt_id = ?`,
		args: [promptId],
	});

	for (const tag of tags) {
		const tagId = await ensureTagByName(tag);
		if (!tagId) {
			continue;
		}

		await db.execute({
			sql: `
				INSERT OR IGNORE INTO PromptTag (prompt_id, tag_id)
				VALUES (?, ?)
			`,
			args: [promptId, tagId],
		});
	}
}

export async function createPrompt(input: CreatePromptInput) {
	const idPrompt = randomUUID();

	await db.execute({
		sql: `
			INSERT INTO Prompt (
				id_prompt,
				user_id,
				title,
				content,
				description,
				model,
				aipoints_price,
				is_published
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		`,
		args: [
			idPrompt,
			input.userId,
			input.title,
			input.content,
			input.description ?? null,
			input.model,
			Math.max(0, input.aipointsPrice ?? 0),
			input.isPublished ? 1 : 0,
		],
	});

	await replacePromptTags(idPrompt, input.tags);

	return findPromptById(idPrompt);
}

export async function updatePrompt(input: UpdatePromptInput) {
	const updates: string[] = [];
	const args: Array<string | number | null> = [];

	if (input.title !== undefined) {
		updates.push("title = ?");
		args.push(input.title);
	}

	if (input.content !== undefined) {
		updates.push("content = ?");
		args.push(input.content);
	}

	if (input.description !== undefined) {
		updates.push("description = ?");
		args.push(input.description);
	}

	if (input.model !== undefined) {
		updates.push("model = ?");
		args.push(input.model);
	}

	if (input.aipointsPrice !== undefined) {
		updates.push("aipoints_price = ?");
		args.push(Math.max(0, input.aipointsPrice));
	}

	if (input.isPublished !== undefined) {
		updates.push("is_published = ?");
		args.push(input.isPublished ? 1 : 0);
	}

	if (updates.length > 0) {
		updates.push("updated_at = datetime('now')");

		await db.execute({
			sql: `
				UPDATE Prompt
				SET ${updates.join(", ")}
				WHERE id_prompt = ?
			`,
			args: [...args, input.promptId],
		});
	}

	await replacePromptTags(input.promptId, input.tags);

	return findPromptById(input.promptId);
}

export async function deletePrompt(promptId: string) {
	await db.execute({
		sql: `DELETE FROM Prompt WHERE id_prompt = ?`,
		args: [promptId],
	});
}

export async function findPromptOwner(promptId: string) {
	const result = await db.execute({
		sql: `
			SELECT user_id, is_published
			FROM Prompt
			WHERE id_prompt = ?
			LIMIT 1
		`,
		args: [promptId],
	});

	const row = result.rows[0] as Record<string, unknown> | undefined;
	if (!row) {
		return null;
	}

	return {
		user_id: String(row.user_id),
		is_published: Number(row.is_published ?? 0),
	};
}

export async function findPromptById(promptId: string) {
	const result = await db.execute({
		sql: `
			SELECT
				p.id_prompt,
				p.user_id,
				p.title,
				p.content,
				p.description,
				p.model,
				p.aipoints_price,
				p.uses_count,
				p.is_published,
				p.created_at,
				p.updated_at,
				u.username,
				u.avatar_url,
				u.airank,
				(SELECT COUNT(*) FROM Vote v1 WHERE v1.prompt_id = p.id_prompt AND v1.vote_type = 1) AS upvotes,
				(SELECT COUNT(*) FROM Vote v2 WHERE v2.prompt_id = p.id_prompt AND v2.vote_type = -1) AS downvotes,
				(
					SELECT GROUP_CONCAT(t.slug)
					FROM PromptTag pt
					JOIN Tag t ON t.id_tag = pt.tag_id
					WHERE pt.prompt_id = p.id_prompt
				) AS tags_csv,
				(
					SELECT pr.content
					FROM PromptResponse pr
					WHERE pr.prompt_id = p.id_prompt
					ORDER BY pr.generated_at DESC
					LIMIT 1
				) AS response_content,
				(
					SELECT pr.tokens_prompt
					FROM PromptResponse pr
					WHERE pr.prompt_id = p.id_prompt
					ORDER BY pr.generated_at DESC
					LIMIT 1
				) AS response_tokens_prompt,
				(
					SELECT pr.tokens_response
					FROM PromptResponse pr
					WHERE pr.prompt_id = p.id_prompt
					ORDER BY pr.generated_at DESC
					LIMIT 1
				) AS response_tokens_response
			FROM Prompt p
			JOIN User u ON u.id_user = p.user_id
			WHERE p.id_prompt = ?
			LIMIT 1
		`,
		args: [promptId],
	});

	const row = result.rows[0] as Record<string, unknown> | undefined;
	return row ? toPromptListRow(row) : null;
}

export async function hasUserPurchasedPrompt(userId: string, promptId: string) {
	const result = await db.execute({
		sql: `
			SELECT id_purchase
			FROM Purchase
			WHERE buyer_user_id = ? AND prompt_id = ?
			LIMIT 1
		`,
		args: [userId, promptId],
	});

	return Boolean(result.rows[0]);
}

export async function findUserVote(userId: string, promptId: string) {
	const result = await db.execute({
		sql: `
			SELECT vote_type
			FROM Vote
			WHERE user_id = ? AND prompt_id = ?
			LIMIT 1
		`,
		args: [userId, promptId],
	});

	const row = result.rows[0] as Record<string, unknown> | undefined;
	if (!row) {
		return null;
	}

	const vote = Number(row.vote_type);
	if (vote === 1) {
		return "up";
	}
	if (vote === -1) {
		return "down";
	}
	return null;
}

export async function listPublishedPrompts(input: {
	page: number;
	limit: number;
	sort: PromptSort;
	tag?: string;
}) {
	const safePage = Math.max(1, input.page);
	const safeLimit = Math.min(50, Math.max(1, input.limit));
	const offset = (safePage - 1) * safeLimit;

	const orderByMap: Record<PromptSort, string> = {
		recent: "p.created_at DESC",
		popular: "p.uses_count DESC, p.created_at DESC",
		top_rated:
			"((SELECT COUNT(*) FROM Vote v1 WHERE v1.prompt_id = p.id_prompt AND v1.vote_type = 1) - (SELECT COUNT(*) FROM Vote v2 WHERE v2.prompt_id = p.id_prompt AND v2.vote_type = -1)) DESC, p.created_at DESC",
	};

	const whereTag = input.tag?.trim();

	const totalResult = await db.execute({
		sql: `
			SELECT COUNT(*) AS total
			FROM Prompt p
			WHERE p.is_published = 1
			${whereTag ? "AND EXISTS (SELECT 1 FROM PromptTag pt JOIN Tag t ON t.id_tag = pt.tag_id WHERE pt.prompt_id = p.id_prompt AND t.slug = ?)" : ""}
		`,
		args: whereTag ? [whereTag] : [],
	});

	const rowsResult = await db.execute({
		sql: `
			SELECT
				p.id_prompt,
				p.user_id,
				p.title,
				p.content,
				p.description,
				p.model,
				p.aipoints_price,
				p.uses_count,
				p.is_published,
				p.created_at,
				p.updated_at,
				u.username,
				u.avatar_url,
				u.airank,
				(SELECT COUNT(*) FROM Vote v1 WHERE v1.prompt_id = p.id_prompt AND v1.vote_type = 1) AS upvotes,
				(SELECT COUNT(*) FROM Vote v2 WHERE v2.prompt_id = p.id_prompt AND v2.vote_type = -1) AS downvotes,
				(
					SELECT GROUP_CONCAT(t.slug)
					FROM PromptTag pt
					JOIN Tag t ON t.id_tag = pt.tag_id
					WHERE pt.prompt_id = p.id_prompt
				) AS tags_csv,
				(
					SELECT pr.content
					FROM PromptResponse pr
					WHERE pr.prompt_id = p.id_prompt
					ORDER BY pr.generated_at DESC
					LIMIT 1
				) AS response_content,
				(
					SELECT pr.tokens_prompt
					FROM PromptResponse pr
					WHERE pr.prompt_id = p.id_prompt
					ORDER BY pr.generated_at DESC
					LIMIT 1
				) AS response_tokens_prompt,
				(
					SELECT pr.tokens_response
					FROM PromptResponse pr
					WHERE pr.prompt_id = p.id_prompt
					ORDER BY pr.generated_at DESC
					LIMIT 1
				) AS response_tokens_response
			FROM Prompt p
			JOIN User u ON u.id_user = p.user_id
			WHERE p.is_published = 1
			${whereTag ? "AND EXISTS (SELECT 1 FROM PromptTag pt JOIN Tag t ON t.id_tag = pt.tag_id WHERE pt.prompt_id = p.id_prompt AND t.slug = ?)" : ""}
			ORDER BY ${orderByMap[input.sort]}
			LIMIT ? OFFSET ?
		`,
		args: whereTag ? [whereTag, safeLimit, offset] : [safeLimit, offset],
	});

	const totalRow = totalResult.rows[0] as Record<string, unknown> | undefined;
	const total = Number(totalRow?.total ?? 0);
	const data = rowsResult.rows.map((row) => toPromptListRow(row as Record<string, unknown>));

	return {
		data,
		pagination: {
			page: safePage,
			limit: safeLimit,
			total,
		},
	};
}

export async function createPromptResponse(input: {
	promptId: string;
	content: string;
	tokensPrompt?: number | null;
	tokensResponse?: number | null;
}) {
	const idResponse = randomUUID();

	await db.execute({
		sql: `
			INSERT INTO PromptResponse (
				id_response,
				prompt_id,
				content,
				tokens_prompt,
				tokens_response
			) VALUES (?, ?, ?, ?, ?)
		`,
		args: [
			idResponse,
			input.promptId,
			input.content,
			input.tokensPrompt ?? null,
			input.tokensResponse ?? null,
		],
	});

	const result = await db.execute({
		sql: `
			SELECT id_response, prompt_id, content, tokens_prompt, tokens_response, generated_at
			FROM PromptResponse
			WHERE id_response = ?
			LIMIT 1
		`,
		args: [idResponse],
	});

	const row = result.rows[0] as Record<string, unknown> | undefined;
	return row ? toPromptResponseRow(row) : null;
}

export async function listTags() {
	const result = await db.execute({
		sql: `
			SELECT id_tag, name, slug, description
			FROM Tag
			ORDER BY name ASC
		`,
	});

	return {
		data: result.rows.map((row) => ({
			id_tag: String(row.id_tag),
			name: String(row.name),
			slug: String(row.slug),
			description: row.description ? String(row.description) : null,
		})),
	};
}

export async function findTagBySlug(slug: string) {
	const result = await db.execute({
		sql: `
			SELECT id_tag, name, slug, description
			FROM Tag
			WHERE slug = ?
			LIMIT 1
		`,
		args: [slug],
	});

	const row = result.rows[0] as Record<string, unknown> | undefined;
	if (!row) {
		return null;
	}

	return {
		id_tag: String(row.id_tag),
		name: String(row.name),
		slug: String(row.slug),
		description: row.description ? String(row.description) : null,
	};
}

export async function isUserFollowingTag(userId: string, tagId: string) {
	const result = await db.execute({
		sql: `
			SELECT 1
			FROM UserTagFollow
			WHERE user_id = ? AND tag_id = ?
			LIMIT 1
		`,
		args: [userId, tagId],
	});

	return Boolean(result.rows[0]);
}

export async function followTagBySlug(userId: string, slug: string) {
	const tag = await findTagBySlug(slug);
	if (!tag) {
		return null;
	}

	await db.execute({
		sql: `
			INSERT OR IGNORE INTO UserTagFollow (user_id, tag_id)
			VALUES (?, ?)
		`,
		args: [userId, tag.id_tag],
	});

	return { following: true, tag_slug: tag.slug };
}

export async function unfollowTagBySlug(userId: string, slug: string) {
	const tag = await findTagBySlug(slug);
	if (!tag) {
		return null;
	}

	await db.execute({
		sql: `
			DELETE FROM UserTagFollow
			WHERE user_id = ? AND tag_id = ?
		`,
		args: [userId, tag.id_tag],
	});

	return { following: false, tag_slug: tag.slug };
}

async function getPromptVoteCounts(promptId: string) {
	const result = await db.execute({
		sql: `
			SELECT
				(SELECT COUNT(*) FROM Vote WHERE prompt_id = ? AND vote_type = 1) AS upvotes,
				(SELECT COUNT(*) FROM Vote WHERE prompt_id = ? AND vote_type = -1) AS downvotes
		`,
		args: [promptId, promptId],
	});

	const row = result.rows[0] as Record<string, unknown> | undefined;
	return {
		upvotes: Number(row?.upvotes ?? 0),
		downvotes: Number(row?.downvotes ?? 0),
	};
}

export async function applyPromptVote(input: {
	userId: string;
	promptId: string;
	voteType: "up" | "down";
}) {
	const nextVoteValue = input.voteType === "up" ? 1 : -1;

	const existingResult = await db.execute({
		sql: `
			SELECT id_vote, vote_type
			FROM Vote
			WHERE user_id = ? AND prompt_id = ?
			LIMIT 1
		`,
		args: [input.userId, input.promptId],
	});

	const existing = existingResult.rows[0] as Record<string, unknown> | undefined;

	let persistedVote: "up" | "down" | null = input.voteType;

	if (existing) {
		const currentVoteValue = Number(existing.vote_type ?? 0);

		if (currentVoteValue === nextVoteValue) {
			await db.execute({
				sql: `DELETE FROM Vote WHERE id_vote = ?`,
				args: [String(existing.id_vote)],
			});
			persistedVote = null;
		} else {
			await db.execute({
				sql: `UPDATE Vote SET vote_type = ?, created_at = datetime('now') WHERE id_vote = ?`,
				args: [nextVoteValue, String(existing.id_vote)],
			});
		}
	} else {
		await db.execute({
			sql: `
				INSERT INTO Vote (id_vote, user_id, prompt_id, vote_type)
				VALUES (?, ?, ?, ?)
			`,
			args: [randomUUID(), input.userId, input.promptId, nextVoteValue],
		});
	}

	const counts = await getPromptVoteCounts(input.promptId);

	return {
		prompt_id: input.promptId,
		vote_type: persistedVote,
		upvotes: counts.upvotes,
		downvotes: counts.downvotes,
	};
}

export async function listPromptComments(input: {
	promptId: string;
	page: number;
	limit: number;
}) {
	const safePage = Math.max(1, input.page);
	const safeLimit = Math.min(50, Math.max(1, input.limit));
	const offset = (safePage - 1) * safeLimit;

	const totalResult = await db.execute({
		sql: `
			SELECT COUNT(*) AS total
			FROM Comment
			WHERE prompt_id = ?
		`,
		args: [input.promptId],
	});

	const rowsResult = await db.execute({
		sql: `
			SELECT
				c.id_comment,
				c.prompt_id,
				c.content,
				c.created_at,
				c.updated_at,
				u.id_user,
				u.username,
				u.avatar_url
			FROM Comment c
			JOIN User u ON u.id_user = c.user_id
			WHERE c.prompt_id = ?
			ORDER BY c.created_at DESC
			LIMIT ? OFFSET ?
		`,
		args: [input.promptId, safeLimit, offset],
	});

	const totalRow = totalResult.rows[0] as Record<string, unknown> | undefined;
	const total = Number(totalRow?.total ?? 0);

	return {
		data: rowsResult.rows.map((row) => ({
			id_comment: String(row.id_comment),
			user: {
				id_user: String(row.id_user),
				username: String(row.username),
				avatar_url: row.avatar_url ? String(row.avatar_url) : null,
			},
			content: String(row.content),
			created_at: String(row.created_at),
			updated_at: String(row.updated_at),
		})),
		pagination: {
			page: safePage,
			limit: safeLimit,
			total,
		},
	};
}

export async function createPromptComment(input: {
	userId: string;
	promptId: string;
	content: string;
}) {
	const idComment = randomUUID();

	await db.execute({
		sql: `
			INSERT INTO Comment (id_comment, user_id, prompt_id, content)
			VALUES (?, ?, ?, ?)
		`,
		args: [idComment, input.userId, input.promptId, input.content],
	});

	const result = await db.execute({
		sql: `
			SELECT
				c.id_comment,
				c.prompt_id,
				c.content,
				c.created_at,
				u.id_user,
				u.username,
				u.avatar_url
			FROM Comment c
			JOIN User u ON u.id_user = c.user_id
			WHERE c.id_comment = ?
			LIMIT 1
		`,
		args: [idComment],
	});

	const row = result.rows[0] as Record<string, unknown> | undefined;
	if (!row) {
		return null;
	}

	return {
		id_comment: String(row.id_comment),
		prompt_id: String(row.prompt_id),
		user: {
			id_user: String(row.id_user),
			username: String(row.username),
			avatar_url: row.avatar_url ? String(row.avatar_url) : null,
		},
		content: String(row.content),
		created_at: String(row.created_at),
	};
}

export async function findCommentOwner(commentId: string) {
	const result = await db.execute({
		sql: `
			SELECT id_comment, user_id, prompt_id
			FROM Comment
			WHERE id_comment = ?
			LIMIT 1
		`,
		args: [commentId],
	});

	const row = result.rows[0] as Record<string, unknown> | undefined;
	if (!row) {
		return null;
	}

	return {
		id_comment: String(row.id_comment),
		user_id: String(row.user_id),
		prompt_id: String(row.prompt_id),
	};
}

export async function updatePromptComment(input: {
	commentId: string;
	content: string;
}) {
	await db.execute({
		sql: `
			UPDATE Comment
			SET content = ?, updated_at = datetime('now')
			WHERE id_comment = ?
		`,
		args: [input.content, input.commentId],
	});

	const result = await db.execute({
		sql: `
			SELECT
				c.id_comment,
				c.prompt_id,
				c.content,
				c.created_at,
				c.updated_at,
				u.id_user,
				u.username,
				u.avatar_url
			FROM Comment c
			JOIN User u ON u.id_user = c.user_id
			WHERE c.id_comment = ?
			LIMIT 1
		`,
		args: [input.commentId],
	});

	const row = result.rows[0] as Record<string, unknown> | undefined;
	if (!row) {
		return null;
	}

	return {
		id_comment: String(row.id_comment),
		prompt_id: String(row.prompt_id),
		user: {
			id_user: String(row.id_user),
			username: String(row.username),
			avatar_url: row.avatar_url ? String(row.avatar_url) : null,
		},
		content: String(row.content),
		created_at: String(row.created_at),
		updated_at: String(row.updated_at),
	};
}

export async function deletePromptComment(commentId: string) {
	await db.execute({
		sql: `DELETE FROM Comment WHERE id_comment = ?`,
		args: [commentId],
	});
}

export async function searchPrompts(input: {
	q: string;
	type: "all" | "tag";
	page: number;
	limit: number;
}) {
	const searchTerm = input.q.trim().toLowerCase();
	const likeTerm = `%${searchTerm}%`;
	const safePage = Math.max(1, input.page);
	const safeLimit = Math.min(50, Math.max(1, input.limit));
	const offset = (safePage - 1) * safeLimit;

	const whereClause =
		input.type === "tag"
			? `
				p.is_published = 1
				AND EXISTS (
					SELECT 1
					FROM PromptTag pt
					JOIN Tag t ON t.id_tag = pt.tag_id
					WHERE pt.prompt_id = p.id_prompt
					AND (LOWER(t.slug) LIKE ? OR LOWER(t.name) LIKE ?)
				)
			`
			: `
				p.is_published = 1
				AND (
					LOWER(p.title) LIKE ?
					OR LOWER(COALESCE(p.description, '')) LIKE ?
					OR EXISTS (
						SELECT 1
						FROM PromptTag pt
						JOIN Tag t ON t.id_tag = pt.tag_id
						WHERE pt.prompt_id = p.id_prompt
						AND (LOWER(t.slug) LIKE ? OR LOWER(t.name) LIKE ?)
					)
				)
			`;

	const whereArgs =
		input.type === "tag"
			? [likeTerm, likeTerm]
			: [likeTerm, likeTerm, likeTerm, likeTerm];

	const totalResult = await db.execute({
		sql: `
			SELECT COUNT(*) AS total
			FROM Prompt p
			WHERE ${whereClause}
		`,
		args: whereArgs,
	});

	const rowsResult = await db.execute({
		sql: `
			SELECT
				p.id_prompt,
				p.user_id,
				p.title,
				p.content,
				p.description,
				p.model,
				p.aipoints_price,
				p.uses_count,
				p.is_published,
				p.created_at,
				p.updated_at,
				u.username,
				u.avatar_url,
				u.airank,
				(SELECT COUNT(*) FROM Vote v1 WHERE v1.prompt_id = p.id_prompt AND v1.vote_type = 1) AS upvotes,
				(SELECT COUNT(*) FROM Vote v2 WHERE v2.prompt_id = p.id_prompt AND v2.vote_type = -1) AS downvotes,
				(
					SELECT GROUP_CONCAT(t.slug)
					FROM PromptTag pt
					JOIN Tag t ON t.id_tag = pt.tag_id
					WHERE pt.prompt_id = p.id_prompt
				) AS tags_csv,
				(
					SELECT pr.content
					FROM PromptResponse pr
					WHERE pr.prompt_id = p.id_prompt
					ORDER BY pr.generated_at DESC
					LIMIT 1
				) AS response_content,
				(
					SELECT pr.tokens_prompt
					FROM PromptResponse pr
					WHERE pr.prompt_id = p.id_prompt
					ORDER BY pr.generated_at DESC
					LIMIT 1
				) AS response_tokens_prompt,
				(
					SELECT pr.tokens_response
					FROM PromptResponse pr
					WHERE pr.prompt_id = p.id_prompt
					ORDER BY pr.generated_at DESC
					LIMIT 1
				) AS response_tokens_response
			FROM Prompt p
			JOIN User u ON u.id_user = p.user_id
			WHERE ${whereClause}
			ORDER BY p.created_at DESC
			LIMIT ? OFFSET ?
		`,
		args: [...whereArgs, safeLimit, offset],
	});

	const totalRow = totalResult.rows[0] as Record<string, unknown> | undefined;
	const total = Number(totalRow?.total ?? 0);
	const data = rowsResult.rows.map((row) => toPromptListRow(row as Record<string, unknown>));

	return {
		query: input.q,
		data,
		pagination: {
			page: safePage,
			limit: safeLimit,
			total,
		},
	};
}

export async function listPromptsByTag(input: {
	slug: string;
	userId?: string | null;
	page: number;
	limit: number;
	sort: PromptSort;
}) {
	const tag = await findTagBySlug(input.slug);
	if (!tag) {
		return null;
	}

	const safePage = Math.max(1, input.page);
	const safeLimit = Math.min(50, Math.max(1, input.limit));
	const offset = (safePage - 1) * safeLimit;

	const totalResult = await db.execute({
		sql: `
			SELECT COUNT(*) AS total
			FROM Prompt p
			WHERE p.is_published = 1
			AND EXISTS (
				SELECT 1
				FROM PromptTag pt
				JOIN Tag t ON t.id_tag = pt.tag_id
				WHERE pt.prompt_id = p.id_prompt AND t.slug = ?
			)
		`,
		args: [input.slug],
	});

	const orderByMap: Record<PromptSort, string> = {
		recent: "p.created_at DESC",
		popular: "p.uses_count DESC, p.created_at DESC",
		top_rated:
			"((SELECT COUNT(*) FROM Vote v1 WHERE v1.prompt_id = p.id_prompt AND v1.vote_type = 1) - (SELECT COUNT(*) FROM Vote v2 WHERE v2.prompt_id = p.id_prompt AND v2.vote_type = -1)) DESC, p.created_at DESC",
	};

	const rowsResult = await db.execute({
		sql: `
			SELECT
				p.id_prompt,
				p.user_id,
				p.title,
				p.content,
				p.description,
				p.model,
				p.aipoints_price,
				p.uses_count,
				p.is_published,
				p.created_at,
				p.updated_at,
				u.username,
				u.avatar_url,
				u.airank,
				(SELECT COUNT(*) FROM Vote v1 WHERE v1.prompt_id = p.id_prompt AND v1.vote_type = 1) AS upvotes,
				(SELECT COUNT(*) FROM Vote v2 WHERE v2.prompt_id = p.id_prompt AND v2.vote_type = -1) AS downvotes,
				(
					SELECT GROUP_CONCAT(t.slug)
					FROM PromptTag pt
					JOIN Tag t ON t.id_tag = pt.tag_id
					WHERE pt.prompt_id = p.id_prompt
				) AS tags_csv,
				(
					SELECT pr.content
					FROM PromptResponse pr
					WHERE pr.prompt_id = p.id_prompt
					ORDER BY pr.generated_at DESC
					LIMIT 1
				) AS response_content,
				(
					SELECT pr.tokens_prompt
					FROM PromptResponse pr
					WHERE pr.prompt_id = p.id_prompt
					ORDER BY pr.generated_at DESC
					LIMIT 1
				) AS response_tokens_prompt,
				(
					SELECT pr.tokens_response
					FROM PromptResponse pr
					WHERE pr.prompt_id = p.id_prompt
					ORDER BY pr.generated_at DESC
					LIMIT 1
				) AS response_tokens_response
			FROM Prompt p
			JOIN User u ON u.id_user = p.user_id
			WHERE p.is_published = 1
			AND EXISTS (
				SELECT 1
				FROM PromptTag pt
				JOIN Tag t ON t.id_tag = pt.tag_id
				WHERE pt.prompt_id = p.id_prompt AND t.slug = ?
			)
			ORDER BY ${orderByMap[input.sort]}
			LIMIT ? OFFSET ?
		`,
		args: [input.slug, safeLimit, offset],
	});

	const followersResult = await db.execute({
		sql: `
			SELECT COUNT(*) AS followers_count
			FROM UserTagFollow
			WHERE tag_id = ?
		`,
		args: [tag.id_tag],
	});

	const totalRow = totalResult.rows[0] as Record<string, unknown> | undefined;
	const followersRow = followersResult.rows[0] as Record<string, unknown> | undefined;
	const data = rowsResult.rows.map((row) => toPromptListRow(row as Record<string, unknown>));
	const isFollowing = input.userId
		? await isUserFollowingTag(input.userId, tag.id_tag)
		: false;

	return {
		tag: {
			id_tag: tag.id_tag,
			name: tag.name,
			slug: tag.slug,
			description: tag.description,
			followers_count: Number(followersRow?.followers_count ?? 0),
		},
		is_following: isFollowing,
		prompts: {
			data,
			pagination: {
				page: safePage,
				limit: safeLimit,
				total: Number(totalRow?.total ?? 0),
			},
		},
	};
}
