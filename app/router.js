'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.post('/order', controller.home.order);
  router.post('/cancel', controller.home.cancel);
  router.get('/result', controller.home.result);
};
