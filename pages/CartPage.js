const locators = require('../locators/locators.json');
const { getSelfHealingLocator } = require('../utils/locator-helper');
const { CommonPage } = require('./CommonPage');

class CartPage extends CommonPage{
    constructor(page){
        super(page);
        this.continuebtn=getSelfHealingLocator(page,
            locators.cart.continuebtn
        );

        this.checkoutbtn=getSelfHealingLocator(page,
            locators.cart.checkoutbtn
        );
        this.fnmaedetail=getSelfHealingLocator(page,
            locators.cart.fnmaedetail
        );
        this.lnmaedetail=getSelfHealingLocator(page,
            locators.cart.lnmaedetail
        );
        this.zipcode=getSelfHealingLocator(page,
            locators.cart.zipcode
        );
        this.continuebutton=getSelfHealingLocator(page,
            locators.cart.continuebutton
        );
        this.totalprice=getSelfHealingLocator(page,
            locators.cart.totalprice
        );
        this.finishbtn=getSelfHealingLocator(page,
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