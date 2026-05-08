import crypto from 'crypto';
import axios from 'axios';
import { env } from '../config/env';
import { GithubPRFile } from '../types/github.types';
import { logger } from '../utils/logger';

// Files to skip when analyzing a PR
const IGNORED_FILE_PATTERNS = [
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  /^dist\//,
  /^build\//,
  /^node_modules\//,
  /\.min\.(js|css)$/,
];

const MAX_FILES = 15;
const MAX_DIFF_SIZE = 20_000;
const MAX_FILE_LINES = 500;

const githubAxios = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  },
});

/**
 * Verifies the GitHub webhook signature using HMAC-SHA256.
 */
export function verifyWebhookSignature(
  signature: string,
  payload: string
): boolean {
  const hmac = crypto.createHmac('sha256', env.GITHUB_WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

/**
 * Fetches all changed files for a given Pull Request.
 * Filters out unsupported/ignored files and respects size limits.
 */
export async function getPullRequestFiles(
  owner: string,
  repo: string,
  pullNumber: number
): Promise<GithubPRFile[]> {
  logger.info({ owner, repo, pullNumber }, 'Fetching PR files');

  const { data } = await githubAxios.get<GithubPRFile[]>(
    `/repos/${owner}/${repo}/pulls/${pullNumber}/files`
  );

  const filtered = data
    .filter((file) => {
      const isIgnored = IGNORED_FILE_PATTERNS.some((pattern) =>
        typeof pattern === 'string'
          ? file.filename === pattern
          : pattern.test(file.filename)
      );
      return !isIgnored && file.patch;
    })
    .slice(0, MAX_FILES)
    .map((file) => {
      // Truncate extremely large patches
      const lines = (file.patch ?? '').split('\n');
      if (lines.length > MAX_FILE_LINES) {
        return {
          ...file,
          patch: lines.slice(0, MAX_FILE_LINES).join('\n') + '\n... [truncated]',
        };
      }
      return file;
    });

  logger.info({ count: filtered.length }, 'PR files fetched and filtered');

  return filtered;
}

/**
 * Posts a review comment to the GitHub Pull Request.
 */
export async function createPullRequestComment(
  owner: string,
  repo: string,
  pullNumber: number,
  body: string
): Promise<void> {
  logger.info({ owner, repo, pullNumber }, 'Posting GitHub PR comment');

  await githubAxios.post(
    `/repos/${owner}/${repo}/issues/${pullNumber}/comments`,
    { body }
  );

  logger.info({ owner, repo, pullNumber }, 'GitHub PR comment posted');
}

/**
 * Combines all PR file patches into a single diff string, respecting the total size limit.
 */
export function buildDiffString(files: GithubPRFile[]): string {
  let combined = '';

  for (const file of files) {
    const fileSection = `\n\n### File: ${file.filename}\n${file.patch ?? ''}`;
    if ((combined + fileSection).length > MAX_DIFF_SIZE) break;
    combined += fileSection;
  }

  return combined.trim();
}
