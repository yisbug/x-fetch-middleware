xfetch

一个简单的 fetch 模块，支持 nodejs & browser，支持自定义中间件，类似 koa2 的中间件用法。

### Useage

```js
// get /api/products
await xfetch('/api/products');
// get /api/products?page=1&pageSize=10
await xfetch.get('/api/products', { params: { page: 1, pageSize: 10 } });
// post /api/products?from=app  body: { name: 'test', price: 10 }
await xfetch.post('/api/products', { params: { from: 'app' }, body: { name: 'test', price: 10 } });
// 其他
xfetch.put(url, options);
xfetch.delete(url, options);
xfetch.patch(url, options);

// 中间件
// 添加一个from字段和时间戳到queryString
xfetch.use(async (ctx, next) => {
  ctx.req.params.from = 'app';
  ctx.req.params.t = Date.now();
  await next();
});

// 添加一个缓存中间件，请自行添加过期时间
xfetch.use(async (ctx, next) => {
  const { req } = ctx;
  if (!req.cache) return next();

  const key = ctx.req.url + JSON.stringify(req.params) + JSON.stringify(req.body);
  const cached = sessionStorage.getItem(key);
  if (cached) {
    const response = new Response(new Blob([cached]));
    return response.json();
  } else {
    await next();
    const cache = await ctx.res.clone().text();
    sessionStorage.setItem(key, cache);
  }
});

// 添加多个中间件
xfetch.use([cache, checkStatus]);
```
