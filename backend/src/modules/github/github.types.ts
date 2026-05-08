export interface GithubWebhookDto {
  action: string;
  repository: {
    full_name: string;
    name: string;
    owner: {
      login: string;
    };
  };
  pull_request: {
    id: number;
    number: number;
    title: string;
    body: string;
    html_url: string;
    user: {
      login: string;
    };
    base: {
      ref: string;
    };
    head: {
      ref: string;
      sha: string;
    };
  };
}

export interface GithubPRFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  patch?: string;
  blob_url: string;
}
