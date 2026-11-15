const locators = require('../locators/locators.json');
const { getSelfHealingLocator } = require('../utils/locator-helper');
const { LocatorNarrowing } =
  require('../utils/locator-narrowing');

class CommonPage{
    constructor(page){
        this.page = page;
        this.productCard=getSelfHealingLocator(page,
            locators.products.productCard
        );
        this.productName=getSelfHealingLocator(page,
            locators.products.productName
        );
        this.productPrice=getSelfHealingLocator(page,
            locators.products.productPrice
        );
    }

    async handleTable(name){
        const products=this.productCard;

        const productName = this.productName.getByText(
        name,{ exact: true });

        const product = LocatorNarrowing.byCondition(
        products,
        collection => LocatorNarrowing.byChild(
            collection,
            productName
        )
        );

        await LocatorNarrowing.expectUnique(product,'product lookup');


        // const product=products.filter({
        // has:this.productName
        // .getByText(name,{exact:true})});

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

    async checkPresenceofPrice(products, expectedPrice){

        const priceLocator = this.productPrice.getByText(
        expectedPrice,
        { exact: true }
        );

        const matchingProducts = LocatorNarrowing.byChild(
        products,
        priceLocator
        );

        await LocatorNarrowing.expectUnique(matchingProducts,'price loopkup');

        return matchingProducts;
        // const price=await locators.filter({
        //     has:this.productPrice
        //     .getByText(exprice,{exact:true})
        // });

        // return price;
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