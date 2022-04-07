import { h } from 'snabbdom';
import { Ctrl } from './ctrl';
import ApexCharts from 'apexcharts';

export default function view(ctrl: Ctrl) {
  return h('body', [navBar(), h('div.container', [form(ctrl), chart(ctrl)])]);
}

let apex: ApexCharts;

const chart = (ctrl: Ctrl) =>
  h(
    'div.chart',
    {
      hook: {
        insert: vnode => {
          const config = {
            ...chartConf('Duration'),
            series: ctrl.series(),
          };
          apex = new ApexCharts(vnode.elm as HTMLDivElement, config);
          apex.render();
        },
        update: () => {
          apex.updateSeries(ctrl.series());
        },
      },
    },
    'chart'
  );

const chartConf = (title: string) => ({
  title: {
    text: title,
  },
  theme: {
    mode: 'light',
  },
  chart: {
    type: 'line',
    zoom: {
      enabled: false,
    },
    animations: {
      enabled: false,
    },
    background: 'transparent',
  },
  xaxis: {
    type: 'datetime',
  },
  yaxis: {
    opposite: true,
    min: 0,
  },
  legend: {
    position: 'top',
  },
  stroke: {
    width: 1,
  },
  grid: {
    borderColor: '#dddddd',
  },
});

const form = (ctrl: Ctrl) =>
  h(
    'form.mt-3.mb-3.row.row-cols-lg-auto.g-3.align-items-center',
    {
      on: {
        submit(ev) {
          const repo = (document.getElementById('repo-url') as HTMLInputElement).value;
          const bearer = (document.getElementById('bearer') as HTMLInputElement).value;
          ctrl.submit(repo, bearer);
          ev.preventDefault();
          return false;
        },
      },
    },
    [
      h('div.col-12', [
        h('input#repo-url.form-control', {
          attrs: {
            value: 'https://github.com/lichess-org/lila',
            autofocus: true,
          },
        }),
      ]),
      h('div.col-12', [
        h('input#bearer.form-control', {
          attrs: {
            value: ctrl.bearer,
            autofocus: true,
          },
        }),
      ]),
      h('div.col-12', [
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

const navBar = () =>
  h('header.navbar.navbar-expand-md.navbar-dark.bg-dark', [
    h('div.container', [h('h1.navbar-brand', 'Github Actions Graph')]),
  ]);

export const spinner = () =>
  h('div.spinner-border.text-primary', { attrs: { role: 'status' } }, h('span.visually-hidden', 'Loading...'));
