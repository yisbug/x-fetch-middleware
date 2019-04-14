const fetch = require('isomorphic-fetch');
const qs = require('qs');

let middlewares = [];

const xfetch = async (fetchUrl, options = {}) => {
  const [url, queryString] = fetchUrl.split('?');
  const params = qs.parse(queryString) || {};
  const req = {
    url,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      Accept: 'application/json'
    },
    credentials: 'include', // 默认请求是否带上cookie
    response: false, // 是否返回response对象
    ...options,
    params: { ...options.params, ...params }
  };
  req.method = String(req.method).toUpperCase();

  const ctx = { req };

  let next = async () => {
    if (req.body) req.body = JSON.stringify(req.body);
    const keys = Object.keys(req.params);
    if (keys.length) req.url += `?${qs.stringify(req.params)}`;
    ctx.res = await fetch(req.url, req);
    const contentType = ctx.res.headers.get('content-type');
    if (contentType.indexOf('application/json') === -1) {
      ctx.res.body = await ctx.res.text();
    } else {
      ctx.res.body = await ctx.res.json();
    }
  };

  const wrap = (fn, n) => () => fn(ctx, n);
  middlewares.forEach(fn => {
    next = wrap(fn, next);
  });

  await next();
  if (req.response) {
    return { body: ctx.res.body, response: ctx.res, ctx };
  }
  return ctx.res.body;
};

xfetch.use = fn => {
  if (Array.isArray(fn)) {
    middlewares = middlewares.concat(fn);
  } else {
    middlewares.push(fn);
  }
};

xfetch.unuse = () => {
  middlewares = [];
};

['get', 'post', 'put', 'delete', 'patch'].forEach(key => {
  xfetch[key] = (url, options) => xfetch(url, { ...options, method: key });
});

module.exports = xfetch;
