export default class Setup {
  userRepo: string;
  repoUrl: string;
  constructor(readonly user: string, readonly repo: string, readonly workflow: string, readonly bearer: string) {
    this.userRepo = `${user}/${repo}`;
    this.repoUrl = `https://github.com/${this.userRepo}`;
  }

  static make = (url: string, workflow: string, bearer: string) => {
    const parts = url.match(/^(?:https:\/\/)?(?:www\.)?(?:github\.com\/)?([^\/]+)\/([^\/]+)/)!;
    const user = parts[1];
    const repo = parts[2];
    const setup = new Setup(user, repo, workflow, bearer);
    localStorage.setItem('setup', JSON.stringify({ user, repo, workflow, bearer }));
    return setup;
  };

  static restore = () => {
    const o = JSON.parse(localStorage.getItem('setup') || '0');
    return o && new Setup(o.user, o.repo, o.workflow, o.bearer);
  };
}
