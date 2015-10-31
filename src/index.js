require('es6-promise').polyfill();
import 'whatwg-fetch';
import Rx from 'rx';
import { run } from '@cycle/core';
import { makeDOMDriver } from '@cycle/dom';
import { makeFetchDriver } from '@cycle/fetch';
import { makePushStateDriver } from 'cycle-pushstate-driver';
import vtreeSwitcher from 'cycle-vtree-switcher';

import routes from './routes';

function main (responses) {
  const { DOM } = responses;

  const localLinkClick$ = DOM.select('a').events('click')
    .filter(e => e.currentTarget.host === global.location.host);

  const navigate$ = localLinkClick$
    .map(e => e.currentTarget.pathname);

  const [vtree$, requestMap] = vtreeSwitcher(routes, responses);
  const requestss = Object.keys(requestMap).map(name => requestMap[name]);
  const fetchRequest$s = requestss
    .map(requests => requests.Fetch)
    .filter(request$ => request$);

  const fetchRequest$ = Rx.Observable.merge(...fetchRequest$s);

  return {
    DOM: vtree$,
    Fetch: fetchRequest$,
    Path: navigate$,
    PreventDefault: localLinkClick$
  };
}

run(main, {
  DOM: makeDOMDriver('main'),
  Fetch: makeFetchDriver(),
  Path: makePushStateDriver(),
  PreventDefault: prevented$ => prevented$.subscribe(e => e.preventDefault())
});
