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
            data: this.runs.runs
              .filter(r => r.started && r.completed())
              .map(run => ({
                x: run.started,
                y: run.duration,
                commit: run.commit,
              })),
          },
        ]
      : [];

  yAxisMax = () => (this.runs ? median(this.runs.runs.map(r => r.duration)) * 3 : 0);
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const median = (arr: number[]) => {
  const mid = Math.floor(arr.length / 2),
    nums = [...arr].sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};
