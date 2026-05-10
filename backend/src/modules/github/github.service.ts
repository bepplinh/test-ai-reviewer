import crypto from 'crypto';
import axios from 'axios';
import { env } from '../../config/env';
import { GithubPRFile } from './github.types';
import { logger } from '../../shared/utils/logger';

// Files to skip when analyzing a PR (V2 Production Ready)
const IGNORED_FILE_PATTERNS = [
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  'package.json',
  /\.lock$/,
  /^dist\//,
  /^build\//,
  /^node_modules\//,
  /^coverage\//,
  /\.min\.(js|css)$/,
  /\.map$/,
  /\.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|otf)$/, // Binaries/Images
  /__snapshots__\//,
];

const MAX_FILES = 50; // Increased for V2
const MAX_DIFF_SIZE = 40_000;
const MAX_FILE_LINES = 1000;

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
 * Fetches changed files for a given Pull Request with pagination.
 */
export async function getPullRequestFiles(
  owner: string,
  repo: string,
  pullNumber: number
): Promise<GithubPRFile[]> {
  logger.info({ owner, repo, pullNumber }, 'Fetching PR files with pagination');

  let allFiles: GithubPRFile[] = [];
  let page = 1;
  const perPage = 100;

  while (allFiles.length < MAX_FILES) {
    const { data } = await githubAxios.get<GithubPRFile[]>(
      `/repos/${owner}/${repo}/pulls/${pullNumber}/files`,
      { params: { page, per_page: perPage } }
    );

    if (data.length === 0) break;

    const filtered = data.filter((file) => {
      const isIgnored = IGNORED_FILE_PATTERNS.some((pattern) =>
        typeof pattern === 'string'
          ? file.filename === pattern
          : pattern.test(file.filename)
      );
      return !isIgnored && file.patch;
    });

    allFiles = [...allFiles, ...filtered];
    if (data.length < perPage) break;
    page++;
  }

  const finalFiles = allFiles.slice(0, MAX_FILES).map((file) => {
    // Truncate large patches
    const lines = (file.patch ?? '').split('\n');
    if (lines.length > MAX_FILE_LINES) {
      return {
        ...file,
        patch: lines.slice(0, MAX_FILE_LINES).join('\n') + '\n... [truncated]',
      };
    }
    return file;
  });

  logger.info({ count: finalFiles.length }, 'PR files fetched, filtered and paginated');

  return finalFiles;
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
  await githubAxios.post(
    `/repos/${owner}/${repo}/issues/${pullNumber}/comments`,
    { body }
  );
}

/**
 * Combines all PR file patches into a single diff string.
 */
export function buildDiffString(files: GithubPRFile[]): string {
  let combined = '';

  for (const file of files) {
    const fileSection = `\n\n### File: ${file.filename}\n${file.patch ?? ''}`;
    if ((combined + fileSection).length > MAX_DIFF_SIZE) {
      combined += `\n\n### [Diff truncated due to size limits]`;
      break;
    }
    combined += fileSection;
  }

  return combined.trim();
}
