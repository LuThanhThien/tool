require('events').EventEmitter.defaultMaxListeners = 20
const puppeteer = require('puppeteer')
const { program } = require('commander');
const utils = require('./js/utils')
const config = require('./js/config')
const { renitiate, initiate, logIn, formAutoFiller, dropAll } = require('./js/main');
const { start } = require('repl');


// tool
async function tool(keyword='Hirabari', capture=false, maxRenit=10000) {
   // params
   let failStore = [] // store failed forms
   let totalSuccess = 0 // total successful forms
   const accounts = config.accounts
   
   const test = (keyword === 'Hirabari' || keyword === 'Tosan') ? false : true
   let startTimeAll = utils.elapsedTime(0, null, `ALL BEGIN: keyword = '${keyword}', maxRenit = ${maxRenit}, capture = ${capture}, test = ${test}`)

   // Login all accounts in advance
   const loggedPages = await Promise.all(accounts.map(async (account, i) => {
      let startTimeInner = utils.elapsedTime(startTimeAll, account, "Log in account - BEGIN")
      const promiseBrowser = await puppeteer.launch({ headless: 'new' })
      const promisePage = await promiseBrowser.newPage();
      await utils.aborting(promisePage);
      await logIn(promisePage, account);
      if (capture) {
         await promisePage.screenshot({ path: `${config.logFolderName}/${account.username}/login-end.png`, fullPage: true });
      }
      startTimeInner = utils.elapsedTime(startTimeInner, account, "Logged in finished")
      return { account, browser: promiseBrowser, page: promisePage, isAvailable: true };
   }))
   startTimeAll = utils.elapsedTime(startTimeAll, null, `Logged in all accounts`)

   // init browser
   const browser = await puppeteer.launch({ headless: 'new' })
   const page = await browser.newPage()
   await page.goto(config.mainUrl)
   await utils.aborting(page)
   if (capture) { await page.screenshot({path: `${config.logFolderName}/1-main.png`, fullPage: true}) }
   
   let disPages = []
   const numAccounts = accounts.length
   let maxForms = 3;
   // distribute info to accounts
   for (i=0; i<numAccounts*maxForms; i++) {
      if (i >= config.customerData.length) {
         info = null
      }
      else {
         info = config.customerData[i]
      }
      let j = i % numAccounts
      if (i < numAccounts) {
         disPages.push({account: loggedPages[j].account, browser: loggedPages[j].browser, page: loggedPages[j].page, isAvailable: loggedPages[j].isAvailable, info: [info]})
      }
      else {
         disPages[j].info.push(info)
      }
   }

   // for (info of disPages) {
   //    console.log(info.info)
   // }
   // console.log(disPages.length)
   // return

   // find valid forms
   let listForms = await initiate(page, keyword, config.displayNumber, false) 
   if (capture) { await page.screenshot({path: `${config.logFolderName}/2-display.png`, fullPage: true}) }
   let numRenit = 1
   // max number of renitiate, 0 = no limit
   while (listForms.length === 0) {
      listForms = await renitiate(page, numRenit, keyword, false) 
      numRenit++
      if (numRenit > maxRenit && maxRenit != 0) {
         startTimeAll = utils.elapsedTime(startTimeAll, null, `Exceed max renit ${maxRenit}, no form found - END`)
         await browser.close()
         return false
      }
   }
   startTimeAll = utils.elapsedTime(startTimeAll, null, `Found ${listForms.length} avaliable forms`)
   // console.log(listForms)
   
   // auto fill form
   await Promise.all(disPages.map(async (loggedPage, pageIndex) => {
      // params 
      let startTimeInner = utils.elapsedTime(0)
      const thisAccount = loggedPage.account
      const thisBrowser = loggedPage.browser
      const thisInfo = loggedPage.info
      const logPath = `${config.logFolderName}/${thisAccount.username}` // path to save log

      // shuffle the listForms array and select the first 3 forms
      for (let i = listForms.length - 1; i > 0; i--) {
         const j = Math.floor(Math.random() * (i + 1));
         [listForms[i], listForms[j]] = [listForms[j], listForms[i]];
      }
      // let distributedForms = listForms.slice(0, 3)

      // auto fill form 
      let totalForms = 3
      let n = 0
      while (totalForms > 0 && n < listForms.length) {
         const thisForm = listForms[n]
         startTimeInner = utils.elapsedTime(startTimeInner, thisAccount, `Auto fill form [${n+1}] begin: ${thisForm.title}`)
         const newPage = await thisBrowser.newPage()
         await newPage.goto(thisForm.link)
         await utils.aborting(newPage)
         const isFail = await formAutoFiller(newPage, thisAccount, thisForm, n, capture, test, thisInfo[totalForms-1])                            
         await newPage.close()
         startTimeInner = utils.elapsedTime(startTimeInner, thisAccount, `Auto fill form [${n+1}] finished - ${isFail ? 'FAILED' : 'SUCCESS'}`)        
         if (isFail) {
            const fail = {account: thisAccount.username, number: n+1, title: thisForm.title}
            failStore.push(fail)
         }          
         else {
            totalForms--
            totalSuccess++
         }
         n++
      }
      thisBrowser.close()  
      startTimeInner = utils.elapsedTime(startTimeInner, thisAccount, "Account finished - END")
   }))

   await browser.close()

   // log failed forms
   if (failStore.length > 0) {
      console.log(`FAILED FORMS: ${failStore.length}`)
      failStore.forEach((fail, i) => {
         console.log(`<${i+1}>. [${fail.account}] form [${fail.number}] - ${fail.title}`)
      })
   }
   else {
      console.log(`ALL SUCCESSFUL`)
   }
   console.log(`TOTAL SUCCESSFUL FORMS: ${totalSuccess}`)
   browser.close()
   utils.elapsedTime(startTimeAll, null, "ALL FINISHED")
}


async function drop(capture=false) {
   async function confirm(password) {
      return new Promise((resolve, reject) => {
         const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
         });
         readline.question('Enter password to confirm deletion: ', (input) => {
            readline.close();
            if (input === password) {
               resolve();
            } else {
               reject(new Error('Incorrect password'));
            }
         });
      });
   }
   try {
      const accounts = config.accounts
      await confirm('Delete All');
      let startTimeAll = utils.elapsedTime(0, null, `Deletion - BEGIN`)
      await Promise.all(accounts.map(async (account) => {
         let startTimeInner = utils.elapsedTime(0)
         if (config.testAccounts.includes(account.username)) {
            const browser = await puppeteer.launch({ headless: 'new' })
            const page = await browser.newPage()
            await page.goto(config.mainUrl)
            await dropAll(page, account, capture);
            await browser.close()
         }
         else {
            startTimeInner = utils.elapsedTime(startTimeInner, null, `ERROR: ${account.username} is not in test accounts - SKIP`)
         }
      }))
      startTimeAll = utils.elapsedTime(startTimeAll, null, `Deletion - END`);
      
   } catch (error) {
      console.error(error.message);
   }
}


program
   .option('--drop')
   .option('--tool')
   .option('--keyword <string>')
   .option('--max-renit <number>')
   .option('--capture')
program.parse();
const options = program.opts();
// run
utils.initLog()
if (options.tool === true) {
   tool(options.keyword, options.capture, options.maxRenit)
}
if (options.drop === true) {
   // console.log('Cannot perform this action in this version')
   drop(options.capture)
}

// node app --drop
// node app --tool --capture --keyword='GY' 
// node app --tool --capture --keyword='Hirabari'
// node app --tool --capture --keyword='Tosan'

