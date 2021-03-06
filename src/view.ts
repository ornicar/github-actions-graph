import { h } from 'snabbdom';
import { Ctrl } from './ctrl';
import ApexCharts from 'apexcharts';

export default function view(ctrl: Ctrl) {
  return h('body', [navBar(), h('div.container-xxl', [form(ctrl), chart(ctrl)])]);
}

let apex: ApexCharts;

const chart = (ctrl: Ctrl) =>
  ctrl.runs &&
  h('div.chart.mt-5', {
    hook: {
      insert: vnode => {
        const config = {
          ...chartConf(ctrl),
          series: ctrl.series(),
        };
        apex = new ApexCharts(vnode.elm as HTMLDivElement, config);
        apex.render();
      },
      update: () => {
        apex.updateOptions({
          yaxis: {
            min: 0,
            max: ctrl.yAxisMax,
          },
        });
        apex.updateSeries(ctrl.series());
      },
    },
  });

const chartConf = (ctrl: Ctrl) => ({
  title: {
    text: 'Duration in seconds',
  },
  theme: {
    mode: 'light',
  },
  chart: {
    type: 'line',
    zoom: {
      // enabled: false,
    },
    animations: {
      enabled: true,
    },
    background: 'transparent',
  },
  xaxis: {
    type: 'datetime',
  },
  yaxis: {
    opposite: true,
    min: 0,
    max: ctrl.yAxisMax,
  },
  legend: {
    // position: 'top',
  },
  stroke: {
    width: 1,
  },
  grid: {
    borderColor: '#dddddd',
  },
  // tooltip: {
  //   custom(d: any) {
  //     console.log(d);
  //     return '<div class="arrow_box">' + '<span>' + d.series[d.seriesIndex][d.dataPointIndex] + '</span>' + '</div>';
  //   },
  // },
});

const form = (ctrl: Ctrl) =>
  h(
    'form.mt-3.mb-3.row.g-3.align-items-center',
    {
      on: {
        submit(ev) {
          const repo = (document.getElementById('repo-url') as HTMLInputElement).value;
          const workflow = (document.getElementById('workflow') as HTMLInputElement).value;
          const bearer = (document.getElementById('bearer') as HTMLInputElement).value;
          ctrl.submit(repo, workflow, bearer);
          ev.preventDefault();
          return false;
        },
      },
    },
    [
      input('repo-url', 'Repository full URL', ctrl.setup?.repoUrl || ''),
      input('workflow', 'Workflow name', ctrl.setup?.workflow || ''),
      input('bearer', 'API token', ctrl.setup?.bearer || ''),
      h('div.col', [
        h(
          'button.btn.btn-primary',
          {
            attrs: { type: 'submit' },
          },
          ctrl.fetching ? 'Fetching data...' : 'Go'
        ),
      ]),
    ]
  );

const input = (name: string, placeholder: string, value: string) =>
  h('div.col', [
    h(`input#${name}.form-control`, {
      attrs: { name, placeholder, value },
    }),
  ]);

const navBar = () =>
  h('header.navbar.navbar-expand-md.navbar-dark.bg-dark', [
    h('div.container-xxl', [h('h1.navbar-brand', 'Github Actions Graph')]),
  ]);

export const spinner = () =>
  h('div.spinner-border.text-primary', { attrs: { role: 'status' } }, h('span.visually-hidden', 'Loading...'));
