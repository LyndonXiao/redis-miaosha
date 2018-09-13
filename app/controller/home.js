'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx, app } = this;
    await app.redis.ltrim('item_user_list', 1, 0);
    await app.redis.ltrim('item_stock', 1, 0);
    for (let i = 0; i < 10; i++) {
      await app.redis.lpush('item_stock', i);
    }

    console.log(await app.redis.lrange('item_stock', 0, -1))
    await ctx.render('order.html')
  }

  async order() {
    const { ctx, app } = this;
    const user = ctx.request.body.user;
    let item = await app.redis.rpop('item_stock');
    if (item === null) {
      ctx.body = { status: 400, msg: 'fail' }
    } else {
      let len = await app.redis.rpush('item_user_list', JSON.stringify({ user: user, item: item, status: 1 }));//status 0 cancel, 1 take, 2 finish
      let index = len - 1;
      console.log(await app.redis.lrange('item_stock', 0, -1));
      ctx.body = { status: 200, msg: 'success', data: { index: index, time: new Date().getTime() } }
    }
  }

  async cancel() {
    const { ctx, app } = this;
    const user = ctx.request.body.user;
    const index = ctx.request.body.index;
    let user_item = await app.redis.lindex('item_user_list', Number(index)) ;
    if (user_item) {
      user_item = JSON.parse(user_item);
      user_item.status = 0;
      await app.redis.lset('item_user_list', index, JSON.stringify(user_item));//status 0 cancel, 1 take, 2 finish
      await app.redis.lpush('item_stock', user_item.item);
      console.log(await app.redis.lrange('item_stock', 0 , -1));
      ctx.body = { status: 200, msg: '取消成功', data: { index: index, item: user_item.item, time: new Date().getTime() } }
    } else {
      ctx.body = { status: 400, msg: '无效操作' }
    }
  }

  async result() {
    const { ctx, app } = this;
    let item_user_list = await app.redis.lrange('item_user_list', 0, -1);
    let item_stock = await app.redis.lrange('item_stock', 0, -1);
    ctx.body = {
      item_user_list: item_user_list,
      item_stock: item_stock,
    }
  }
}

module.exports = HomeController;
