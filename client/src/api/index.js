import {
  fetchStart,
  fetchSuccess,
  fetchFailure,
} from 'actions'
import queryString from 'querystring'
import generateUrl from './generator'

export default (opts, dispatch, name, metaOpts = {}) => {
  const method = opts.method || 'GET'
  const resourceId = opts.resourceId
  let url = generateUrl(opts.resourceName, resourceId)

  const config = {
    method,
    headers: {},
    type: 'cors',
  }

  if (opts.body) {
    config.body = JSON.stringify(opts.body)
    config.headers['Content-Type'] = 'application/json'
  }

  if (opts.query) {
    url = `${url}?${queryString.stringify(opts.query)}`
  }

  return new Promise((resolve, reject) => {
    const meta = { ...metaOpts, timestamp: Date.now() }
    dispatch(fetchStart(name, method, resourceId, meta))
    return window.fetch(url, config)
      .then(async (response) => {
        let json = {}

        try {
          json = await response.json()
        } catch (e) {
          throw new Error(e)
        }

        const dispatchOps = {
          response,
          json,
          resourceId,
          meta,
        }

        if (response.ok) {
          dispatch(fetchSuccess(name, method, dispatchOps))
          return resolve(dispatchOps)
        }

        dispatch(fetchFailure(name, method, dispatchOps))

        return reject(dispatchOps)
      })
  })
}
