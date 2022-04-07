import { init, attributesModule, eventListenersModule, classModule } from 'snabbdom';
import { Ctrl } from './ctrl';
import view from './view';
import '../scss/_bootstrap.scss';
import '../scss/style.scss';

export default async function (element: HTMLElement) {
  const patch = init([attributesModule, eventListenersModule, classModule]);

  const ctrl = new Ctrl(redraw);

  let vnode = patch(element, view(ctrl));

  function redraw() {
    vnode = patch(vnode, view(ctrl));
  }
}
