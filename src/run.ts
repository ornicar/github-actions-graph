import Setup from './setup';

export class Run {
  constructor(readonly id: number, readonly started: Date, readonly updated: Date, readonly status: string) {}

  duration = () => (new Date(this.updated).getTime() - new Date(this.started).getTime()) / 1000;

  static make = (o: any) => new Run(o.id, o.started || o.run_started_at, o.updated || o.updated_at, o.status);

  data = () => ({ id: this.id, started: this.started, updated: this.updated, status: this.status });
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
