const { test, expect } = require('../fixtures/base');
const { readYaml } = require('../utils/yaml-reader');

const loginData = readYaml('test-data/login.yaml');



test.describe('Login Datadriven Testing',()=>{
    for(const [scenarios,data] of Object.entries(loginData)){
        test(scenarios,async({page,loginpage})=>{
            await loginpage.open();
            await loginpage.login(
                data.username,
                data.password
            );

            if(data.expectedResult==='success'){
                await expect(page).toHaveURL(/inventory\.html/);

            }
            else{
                await expect(await loginpage.getErrorMessage()).toBe(data.expectedResult);
            }

        })
    }

});
//  test('should login successfully with valid credentials', async ({ page,loginpage  }) => {

//     await loginpage.open();
//     await loginpage.login(
//         loginData.validLogin.username,
//         loginData.validLogin.password
//     );

//     await expect(page).toHaveURL(/inventory\.html/);
//     await expect(page.getByText('Products',{exact:true})).toBeVisible();

//  });
 