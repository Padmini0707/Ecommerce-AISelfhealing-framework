const locators = require('../locators/locators.json');
const { getLocator } = require('../utils/locator-helper');
const { CommonPage } = require('./CommonPage');

class CartPage extends CommonPage{
    constructor(page){
        super(page);
        this.continuebtn=getLocator(page,
            locators.cart.continuebtn
        );

        this.checkoutbtn=getLocator(page,
            locators.cart.checkoutbtn
        );
        this.fnmaedetail=getLocator(page,
            locators.cart.fnmaedetail
        );
        this.lnmaedetail=getLocator(page,
            locators.cart.lnmaedetail
        );
        this.zipcode=getLocator(page,
            locators.cart.zipcode
        );
        this.continuebutton=getLocator(page,
            locators.cart.continuebutton
        );
        this.totalprice=getLocator(page,
            locators.cart.totalprice
        );
        this.finishbtn=getLocator(page,
            locators.cart.finishbtn
        );

    }

    async removeItemFromCart(name,button){
        const products=await this.handleTable(name);
        await this.clickonAddToCartButton(products,button);
    }

    async continueShopping(){
        await this.continuebtn.click();
    }

    async checkout(){
        await this.checkoutbtn.click();
    }

    async fillInformation(fname,lname,zipcode){
        await this.fnmaedetail.fill(fname);
        await this.lnmaedetail.fill(lname);
        await this.zipcode.fill(zipcode);

        await this.continuebutton.click();

    }

    async getProductPrice() {
        return await this.getAllProductPrices()

    }

    async getTotalPrice(){
        const totaltext=await this.totalprice.textContent()
        return Number(
        Number(totaltext.replace(/[^0-9.]/g, '')).toFixed(2)
    );
        //return total;
    }

    async clickOnFinish(){
        await this.finishbtn.scrollIntoViewIfNeeded()
        await this.finishbtn.click()
    }
//Thank you for your order!

}
module.exports={CartPage};