
// Source: https://gist.github.com/tokland/71c483c89903da417d7062af009da571
function promiseMap(xs, f) {
  const reducer = (ysAcc$, x) =>
    ysAcc$.then(ysAcc => f(x).then(y => ysAcc.push(y) && ysAcc));
  return xs.reduce(reducer, Promise.resolve([]));
}

module.exports = promiseMap
