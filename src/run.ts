import Setup from './setup';

export class Run {
  duration: number;

  constructor(
    readonly id: number,
    readonly started: Date,
    readonly updated: Date,
    readonly status: string,
    readonly commit: string
  ) {
    this.duration = (new Date(this.updated).getTime() - new Date(this.started).getTime()) / 1000;
  }

  completed = () => this.status == 'completed';

  data = () => ({
    id: this.id,
    started: this.started,
    updated: this.updated,
    status: this.status,
    commit: this.commit,
  });

  static make = (o: any) =>
    new Run(
      o.id,
      o.started || o.run_started_at || o.run.created_at,
      o.updated || o.updated_at,
      o.status,
      o.commit || o.head_commit?.id.slice(0, 10)
    );
}

export class Runs {
  storageKey: string;
  runs: Run[];
  perPage = 30;

  constructor(readonly setup: Setup) {
    this.storageKey = `${this.setup.userRepo}/runs`;
    this.runs = JSON.parse(localStorage.getItem(this.storageKey) || '[]').map(Run.make);
  }

  addPage = (page: number, data: any): number | false => {
    let overlap = false;
    data.workflow_runs.map(Run.make).forEach((run: Run) => {
      if (!this.runs.find(r => r.id == run.id)) this.runs.push(run);
      else overlap = true;
    });
    localStorage.setItem(this.storageKey, JSON.stringify(this.runs.map(run => run.data())));
    if (this.runs.length >= data.total_count) return false;
    if (overlap) return Math.ceil((this.runs.length + 1) / this.perPage);
    return page + 1;
  };
}
