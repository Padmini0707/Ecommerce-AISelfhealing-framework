const locators = require('../locators/locators.json');
const { getLocator } = require('../utils/locator-helper');

class CommonPage{
    constructor(page){
        this.page = page;
        this.productCard=getLocator(page,
            locators.products.productCard
        );
        this.productName=getLocator(page,
            locators.products.productName
        );
        this.productPrice=getLocator(page,
            locators.products.productPrice
        );
    }

    async handleTable(name){
        const products=this.productCard;

        const product=products.filter({
        has:this.productName
        .getByText(name,{exact:true})});

        await product.waitFor({
            state:'visible',
            timeout:5000
        });


        await product.scrollIntoViewIfNeeded();

        return product;

    }

    async clickonAddToCartButton(locators,button){
        const addtocart=locators.getByRole('button',
        {  name:button,
            exact:true
        });

        await addtocart.scrollIntoViewIfNeeded();

        await addtocart.click();
    }

    async checkPresenceofPrice(locators,exprice){
        const price=await locators.filter({
            has:this.productPrice
            .getByText(exprice,{exact:true})
        });

        return price;
    }

    async getAllProductPrices() {
        const prices = await this.productPrice.allTextContents();
        const totalCents = prices.reduce((sum, price) => {
        const cents = Math.round(
            Number(price.trim().replace('$', '')) * 100
        );
        return sum + cents;
    }, 0);

    return totalCents / 100;
    }
}

module.exports={CommonPage};