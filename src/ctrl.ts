import { Runs } from './run';
import Setup from './setup';

export class Ctrl {
  setup?: Setup;
  runs?: Runs;
  fetching = false;

  constructor(readonly redraw: () => void) {
    this.setup = Setup.restore();
    setTimeout(this.start, 200);
  }

  submit = async (url: string, workflow: string, bearer: string) => {
    this.setup = Setup.make(url, workflow, bearer);
    this.start();
  };

  start = async () => {
    if (!this.setup) return;
    this.runs = new Runs(this.setup);
    this.redraw();
    await this.fetchNextPage(1);
  };

  fetchNextPage = async (page: number) => {
    if (!this.runs) return;
    this.fetching = true;
    this.redraw();
    const action = await this.fetchPage(page);
    const nextPage = this.runs.addPage(page, action);
    this.redraw();
    if (nextPage) {
      await sleep(2000);
      this.fetchNextPage(nextPage);
    } else {
      this.fetching = false;
      this.redraw();
    }
  };

  fetchPage = async (page: number) => {
    if (!this.setup) return;
    const res = await fetch(
      `https://api.github.com/repos/${this.setup.userRepo}/actions/workflows/${this.setup.workflow}.yml/runs?page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${this.setup.bearer}`,
        },
      }
    );
    return await res.json();
  };

  series = () =>
    this.runs
      ? [
          {
            name: 'Duration',
            data: this.runs.runs.map(run => ({
              x: run.started,
              y: run.duration(),
            })),
          },
        ]
      : [];
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
