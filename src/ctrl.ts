interface Run {
  started: string;
  updated: string;
}

export class Ctrl {
  bearer: string;
  user: string = 'lichess-org';
  repo: string = 'lila';
  runs: Run[] = [];
  fetching = false;

  constructor(readonly redraw: () => void) {
    this.bearer = localStorage.getItem('bearer') || '';
  }

  submit = async (url: string, bearer: string) => {
    this.bearer = bearer;
    localStorage.setItem('bearer', bearer);
    const parts = url.match(/^(?:https:\/\/)?(?:www\.)?(?:github\.com\/)?([^\/]+)\/([^\/]+)/)!;
    this.user = parts[1];
    this.repo = parts[2];
    this.runs = JSON.parse(localStorage.getItem('runs') || '[]');
    this.fetchNextPage(Math.floor(this.runs.length / 30) + 1);
  };

  fetchNextPage = async (page: number) => {
    this.fetching = true;
    this.redraw();
    const res = await fetch(
      `https://api.github.com/repos/${this.user}/${this.repo}/actions/workflows/server.yml/runs?page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${this.bearer}`,
        },
      }
    );
    const action = await res.json();
    const runs = action.workflow_runs.filter((run: any) => run.status == 'completed').map(toRun);
    this.runs = [...this.runs, ...runs];
    localStorage.setItem('runs', JSON.stringify(this.runs));
    this.fetching = false;
    this.redraw();
    await sleep(2000);
    this.fetchNextPage(page + 1);
  };

  series = () => [
    {
      name: 'Duration',
      data: this.runs.map(run => ({
        x: run.started,
        y: duration(run),
      })),
    },
  ];
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const toRun = (run: any) => ({
  started: run.run_started_at,
  updated: run.updated_at,
});

const duration = (run: Run) => (new Date(run.updated).getTime() - new Date(run.started).getTime()) / 1000;
