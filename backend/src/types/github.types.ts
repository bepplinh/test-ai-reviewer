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
    number: number;
    title: string;
    body: string;
    user: {
      login: string;
    };
  };
}

export interface GithubPRFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  patch?: string;
}
