/** @jsx hJSX */

import Rx from 'rx'
import { hJSX } from '@cycle/dom'

export default function owers ({ Fetch, Route }) {
  const page = 'owers'
  const fetch$ = Fetch.byKey(page).switch()
  const route$ = Route.filter(route => route.name === page)

  const fetchRequest$ = route$
    .map(route => {
      return {
        key: route.name,
        url: '/owers.json'
      }
    })

  const loading$ = route$
    .startWith({})
    .map(route => (
      <section>
        <h1>IOU</h1>
        <p>Loading...</p>
      </section>
    ))

  const data$ = fetch$
    .flatMap(res => res.ok ? res.json() : Promise.resolve({ rows: [] }))
    .map(data => data.rows
      .sort((a, b) => a.value - b.value)
      .map(row => {
        return {
          name: row.key[0],
          amount: row.value
        }
      })
    )

  const vtree$ = data$
    .map(owers => {
      const owerRows = owers
        .map(ower => (
          <a key={ower.name} href={`/owers/${ower.name}`}>
            <dt>{ower.name}</dt>
            <dd>{ower.amount.toFixed(2)}</dd>
          </a>
        )
      )
      return (
        <section>
          <h1>IOU</h1>
          <dl>{owerRows}</dl>
        </section>
      )
    })

  return {
    DOM: Rx.Observable.merge(loading$, vtree$),
    Fetch: fetchRequest$
  }
}
