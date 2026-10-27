const{test:base,expect}=require('@playwright/test')

const{LoginPage}=require('../pages/LoginPage');
const { SearchPage } = require('../pages/SearchPage');
const { CartPage } = require('../pages/CartPage');

const test=base.extend({
    loginpage:async({page},use)=>{
        const loginpage=new LoginPage(page)
        await use(loginpage);

    },
    serachpage:async({page},use)=>{
        const serachpage=new SearchPage(page)
        await use(serachpage);
    },
    cartpage:async({page},use)=>{
        const cartpage=new CartPage(page)
        await use(cartpage);
    }
});

module.exports = { test, expect };