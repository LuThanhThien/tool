require('events').EventEmitter.defaultMaxListeners = 20
const puppeteer = require('puppeteer')
const { program } = require('commander');
const utils = require('./js/utils')
const config = require('./js/config')
const { renitiate, initiate, logIn, formAutoFiller, dropAll } = require('./js/main')


// tool
async function tool(keyword='Hirabari', capture=false) {
   // params
   let failStore = [] // store failed forms
   const maxRenit = 1000
   const test = (keyword === 'Hirabari' && keyword === 'Tosan') ? false : true
   let startTimeAll = utils.elapsedTime(0, null, `ALL BEGIN: keyword = '${keyword}', capture = ${capture}, test = ${test}`)

   // Login all accounts in advance
   const loggedPages = await Promise.all(config.accounts.map(async (account, i) => {
      let startTimeInner = utils.elapsedTime(startTimeAll, account, "Log in account - BEGIN")
      const promiseBrowser = await puppeteer.launch({ headless: 'new' })
      const promisePage = await promiseBrowser.newPage();
      await promisePage.goto(config.mainUrl);
      await utils.aborting(promisePage);
      await logIn(promisePage, account);
      if (capture) {
         await promisePage.screenshot({ path: `${config.logFolderName}/login-end.png`, fullPage: true });
      }
      startTimeInner = utils.elapsedTime(startTimeAll, account, "Logged in account finished")
      return { account, browser: promiseBrowser, page: promisePage, isAvailable: true };
   }))
   
   // init browser
   const browser = await puppeteer.launch({ headless: 'new' })
   const page = await browser.newPage()
   await page.goto(config.mainUrl)
   await utils.aborting(page)
   if (capture) { await page.screenshot({path: `${config.logFolderName}/0-main.png`, fullPage: true}) }
 
   // find valid forms
   let listForms = await initiate(page, keyword, config.displayNumber, false) 
   let numRenit = 1
   while (listForms.length === 0) {
      listForms = await renitiate(page, numRenit, keyword, false) 
      numRenit++
      if (numRenit > maxRenit) {
         startTimeAll = utils.elapsedTime(startTimeAll, null, `Exceed max renit ${maxRenit}, no form found - END`)
         await browser.close()
         return
      }
   }
   startTimeAll = utils.elapsedTime(startTimeAll, null, `Found ${listForms.length} avaliable forms`)
   

   // auto fill form
   await Promise.all(loggedPages.map(async (loggedPage, pageIndex) => {
      // params 
      const thisAccount = loggedPage.account
      const thisBrowser = loggedPage.browser
      const logPath = `${config.logFolderName}/${thisAccount.username}` // path to save log

      // shuffle the listForms array and select the first 3 forms
      for (let i = listForms.length - 1; i > 0; i--) {
         const j = Math.floor(Math.random() * (i + 1));
         [listForms[i], listForms[j]] = [listForms[j], listForms[i]];
      }
      
      // auto fill form 
      let maxForms = 3;
      for (let i = 0; i < listForms.length; i++) {
         startTimeInner = utils.elapsedTime(startTimeAll, thisAccount, `Auto fill form [${i+1}] begin: ${listForms[i].title}`)
         const newPage = await thisBrowser.newPage()
         await newPage.goto(listForms[i].link)
         await utils.aborting(newPage)
         const isFail = await formAutoFiller(newPage, thisAccount, i, capture, test)                            
         await newPage.close()
         startTimeInner = utils.elapsedTime(startTimeInner, thisAccount, `Auto fill form [${i+1}] finished - ${isFail ? 'FAILED' : 'SUCCESS'}`)        
         if (isFail) {
            const fail = {account: thisAccount.username, number: i+1, title: listForms[i].title}
            failStore.push(fail)
         }          
         else {
            maxForms--
            if (maxForms === 0) {
               break
            }
         }
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
      await confirm('Delete All');
      let startTimeAll = utils.elapsedTime(0, null, `Deletion - BEGIN`)
      await Promise.all(config.accounts.map(async (account) => {
         const browser = await puppeteer.launch({ headless: 'new' })
         const page = await browser.newPage()
         await page.goto(config.mainUrl)
         await dropAll(page, account, capture);
         await browser.close()
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
   .option('--capture')
program.parse();
const options = program.opts();
// run
utils.initLog()
if (options.tool === true) {
   tool(options.keyword, options.capture)
}
if (options.drop === true) {
   drop()
}


// node app --tool --keyword='' --capture
// node app --drop
// node app --tool --keyword='Hirabari' --capture
// node app --tool --keyword='Tosan' --capture