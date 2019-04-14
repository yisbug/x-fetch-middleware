const xfetch = require('../index');
module.exports = async (it, assert) => {
  it('fetch test/html, baidu.com, use params.');
  xfetch.unuse();

  let res = null;
  res = await xfetch('http://www.baidu.com/s', { params: { wd: 'test' } });
  const title = res.match(/<title>([\S\s]*?)<\/title>/)[1];
  assert.equal(title, 'test_百度搜索');

  const zhihuUrl = 'https://www.zhihu.com/api/v4/alter_banners/new_home_up';
  it(`fetch json ${zhihuUrl}`);
  res = await xfetch(zhihuUrl);
  assert(typeof res === 'object', '返回 json 对象');

  it(`fetch json, return response object`);
  res = await xfetch(zhihuUrl, { response: true });
  assert(typeof res.body === 'object', '返回 json 对象');

  it(`use middleware, must return hi.`);
  xfetch.use(async (ctx, next) => {
    await next();
    ctx.res.body = 'hi';
  });
  res = await xfetch(zhihuUrl);
  assert.equal(res, 'hi');
};
