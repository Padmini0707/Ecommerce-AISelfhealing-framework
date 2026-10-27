const locators = require('../locators/locators.json');
const { getLocator } = require('../utils/locator-helper');
const { CommonPage } = require('./CommonPage');

class SearchPage extends CommonPage{
    constructor(page){
        //this.page = page;
        super(page);
        // this.productCard=getLocator(page,
        //     locators.products.productCard
        // );
        // this.productName=getLocator(page,
        //     locators.products.productName
        // );
        // this.productPrice=getLocator(page,
        //     locators.products.productPrice
        // );
        this.carticon=getLocator(page,
            locators.products.carticon
        );
    }

    async serachandAddProduct(name,exprice,button){
        const products=await this.handleTable(name);

        const price=await this.checkPresenceofPrice(products,exprice);

        await this.clickonAddToCartButton(products,button);

    }

    async  getProductPrice(name){
        const products=this.productCard;

        const product=products.filter({
        has:this.productName
        .getByText(name,{exact:true})});

        await product.waitFor({
            state:'visible',
            timeout:5000
        });


        await product.scrollIntoViewIfNeeded();

        const price=await getLocator(product,
            locators.products.productPrice
        ).textContent();

        return price?.trim()??'';

    }

    async clickOnCartIcon(){

        await this.carticon.click()

    }
}

module.exports={SearchPage};