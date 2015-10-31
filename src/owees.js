/** @jsx hJSX */

import Rx from 'rx'
import { hJSX } from '@cycle/dom'

export default function owees ({ Fetch, Route }) {
  const page = 'owees'
  const fetch$ = Fetch.byKey(page).switch()
  const route$ = Route.filter(route => route.name === page)

  const fetchRequest$ = route$
    .map(route => {
      return {
        key: route.name,
        url: `/${route.params.ower}.json`
      }
    })

  const loading$ = route$
    .map(route => (
      <section>
        <h1>IOU: {route.params.ower}</h1>
        <p>Loading...</p>
      </section>
    ))
    .startWith(
      <section>
        <h1>IOU</h1>
        <p>Loading...</p>
      </section>
    )

  const data$ = fetch$
    .flatMap(res => res.ok ? res.json() : Promise.resolve({ rows: [] }))
    .map(data => data.rows
      .sort((a, b) => a.value - b.value)
      .map(row => {
        return {
          ower: row.key[0],
          name: row.key[1],
          amount: row.value
        }
      })
    )

  const vtree$ = data$
    .withLatestFrom(route$, (owees, route) => {
      const ower = route.params.ower
      const oweeRows = owees.map(owee => (
        <a key={`${owee.ower}/${owee.name}`} href={`/transactions/${owee.ower}/${owee.name}`}>
          <dt>{owee.name}</dt>
          <dd>{owee.amount.toFixed(2)}</dd>
        </a>
      ))
      return (
        <section>
          <h1>IOU: {ower}</h1>
          <dl>{oweeRows}</dl>
        </section>
      )
    })

  return {
    DOM: Rx.Observable.merge(loading$, vtree$),
    Fetch: fetchRequest$
  }
}
