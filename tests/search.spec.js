const { test, expect } = require('../fixtures/base');
const { readYaml } = require('../utils/yaml-reader');

const productData = readYaml('test-data/products.yaml');
const loginData = readYaml('test-data/login.yaml');

test('add the correct product to cart', async ({ page ,loginpage,serachpage}) => {
    const expected = productData.products.onesie;

    await loginpage.open();
    await loginpage.login(
        loginData.validLogin.username,
        loginData.validLogin.password
    );


    await serachpage.serachandAddProduct(expected.name,expected.price,expected.button);


    
    const actprice=await serachpage.getProductPrice(expected.name);
    await expect(actprice).toBe(expected.price);

    await serachpage.clickOnCartIcon();
    await page.waitForTimeout(5000);
});

test('Search the mutliple product',async({page ,loginpage,serachpage,cartpage})=>{
    const expected = productData.products.jacket;
    const expectedsearch = productData.products.backpack;

    await page.goto('/inventory.html');
    console.log('Current URL:', page.url());
    console.log('Page title:', await page.title());

    await serachpage.serachandAddProduct(expected.name,expected.price,expected.button);
    const actprice=await serachpage.getProductPrice(expected.name);
    await expect(actprice).toBe(expected.price);

    await serachpage.clickOnCartIcon();
    await cartpage.continueShopping();

    await serachpage.serachandAddProduct(expectedsearch.name,expectedsearch.price,expectedsearch.button);
    const actprice1=await serachpage.getProductPrice(expectedsearch.name);
    await expect(actprice1).toBe(expectedsearch.price);

    await serachpage.clickOnCartIcon();


});