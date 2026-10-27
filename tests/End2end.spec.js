const { test, expect } = require('../fixtures/base');
const { readYaml } = require('../utils/yaml-reader');

const loginData = readYaml('test-data/login.yaml');
const searchData=readYaml('test-data/products.yaml');
const personalData=readYaml('test-data/PersonalData.yaml');


test('should perform End-End E-commerece testing', async ({ page,loginpage,serachpage,cartpage  }) => {

    await loginpage.open();
    await loginpage.login(
        loginData.validLogin.username,
        loginData.validLogin.password
    );

    //search the product
    const expectedproduct1 = searchData.products.onesie;
    const expectedproduct2 =searchData.products.jacket;

    await serachpage.serachandAddProduct(expectedproduct1.name,expectedproduct1.price,expectedproduct1.button);
    await serachpage.serachandAddProduct(expectedproduct2.name,expectedproduct2.price,expectedproduct2.button);

    await serachpage.clickOnCartIcon();
    

    await cartpage.checkout();
    const testData = personalData.personaldata.find(
        data => data.scenario === "Valid checkout"
    );

    await cartpage.fillInformation(testData.firstname,testData.lastname,testData.zipcode);

    const allproductprice=await cartpage.getProductPrice();
    const totalPrice=await cartpage.getTotalPrice();

    console.log(allproductprice);
    console.log(totalPrice);

    await cartpage.clickOnFinish();

    await page.waitForTimeout(5000);




});

test('Perform Ecommerce Checkout Without PersonalData', async ({ page,loginpage,serachpage,cartpage  }) => {
    // await loginpage.open();
    // await loginpage.login(
    //     loginData.validLogin.username,
    //     loginData.validLogin.password
    // );
    await page.goto('/inventory.html');

    //search the product
    const expectedproduct1 = searchData.products.onesie;

    await serachpage.serachandAddProduct(expectedproduct1.name,expectedproduct1.price,expectedproduct1.button);

    await serachpage.clickOnCartIcon();
    await cartpage.checkout();

    const testdata=personalData.personaldata.find(
        data=> data.scenario==="Missing first name"
    )

    await cartpage.fillInformation(testdata.firstname,testdata.lastname,testdata.zipcode);
    await page.waitForTimeout(5000);
    const actualError=await loginpage.getErrorMessage()

    expect(actualError).toBe(testdata.expectedError);


});

test('Perform Ecommerce Checkout by removing somedata from cart',async ({ page,loginpage,serachpage,cartpage  }) => {
    const expectedproduct1 = searchData.products.onesie;
    const expectedproduct2 =searchData.products.backpack;
    const expectedproduct3 =searchData.products.backpackremove;
    await page.goto('/inventory.html');

    await serachpage.serachandAddProduct(expectedproduct2.name,expectedproduct2.price,expectedproduct2.button);
    
    
    await serachpage.clickOnCartIcon();


    await cartpage.removeItemFromCart(expectedproduct3.name,expectedproduct3.button)
    await cartpage.continueShopping();

    await serachpage.serachandAddProduct(expectedproduct1.name,expectedproduct1.price,expectedproduct1.button);
    await serachpage.clickOnCartIcon();
    await cartpage.checkout();

    const testData = personalData.personaldata.find(
        data => data.scenario === "Valid checkout"
    );

    await cartpage.fillInformation(testData.firstname,testData.lastname,testData.zipcode);

    const allproductprice=await cartpage.getProductPrice();
    const totalPrice=await cartpage.getTotalPrice();

    console.log(allproductprice);
    console.log(totalPrice);

    await cartpage.clickOnFinish();

    


});
