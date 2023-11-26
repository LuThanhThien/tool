const utils = require('./utils')
const config = require('./config')

// methods
async function logIn(page, account) {
   let startTime = utils.elapsedTime(0)
   // click login button
   const innerHTMLBtn = await page.evaluate(() => {
      const loginBtnHTML = '#pcLogin'
      const loginBtn = document.querySelector(loginBtnHTML)
      loginBtn.click()
      return loginBtn ? loginBtn.textContent.trim() : 'Button not found'
   })
   await page.waitForNavigation()
   startTime = utils.elapsedTime(startTime, account, `Navigate to login page finished`)
   
   // login
   const usernameInputHTML = "input[name='userId']"
   const passwordInputHTML = "input[name='userPasswd']"
   await page.focus(usernameInputHTML)
   await page.keyboard.type(account.username)
   await page.focus(passwordInputHTML)
   await page.keyboard.type(account.password)
   await page.keyboard.press('Enter')
   await page.waitForNavigation()
   // console.log(page.url())
   startTime = utils.elapsedTime(startTime, account, "Login finished")
}


async function filterDisplay(page, account, keyword=config.filterKeyword, displayNumber=config.displayNumber) {
   const filterInputHTML = "templateName"
   const displaySelectBoxHTML = "top_ken_selectbox"
   const displayOptionHTML = `offerList_movePage?dispPage=${displayNumber}`

   let startTime = utils.elapsedTime(0)
   await page.evaluate( (displaySelectBoxHTML, displayOptionHTML, filterInputHTML, keyword) => {
      // filter to 50 forms
      const selectedElement = document.getElementById(displaySelectBoxHTML)
      for (const option of selectedElement.options) {
         if (option.value === displayOptionHTML) {
           option.selected = true;
           break;
         }
      document.getElementsByName(filterInputHTML)[0].value = keyword
      }
   }, displaySelectBoxHTML, displayOptionHTML, filterInputHTML, keyword)
   statTime = utils.elapsedTime(startTime, account, "Filter finished")
}


async function findAll(page, account, keyword=config.filterKeyword, ignoreNullLink=false) {
   // derive array of all forms
   let startTime = utils.elapsedTime(0)
   const array = await page.evaluate(async () => {
      const listItemsHTML = '.c-box--cardList__item'
      const titleHTML = '.c-box--cardList__item_h4'
      const statusHTML = '.c-box--cardList__item__status'
      const startDateHTML = '.span-display-flex'
      const endDateHTML = '.span-display-flex'
      const templateSeqHTML = 'input[type="hidden"]'
      const linkHTML = 'a'

      return Array.from(document.querySelectorAll(listItemsHTML), li => {
         const titleElement = li.querySelector(titleHTML)
         const statusElement = li.querySelector(statusHTML)
         const startDateElement = li.querySelectorAll(startDateHTML)[0]
         const endDateElement = li.querySelectorAll(endDateHTML)[1]
         const templateSeqElement = li.querySelector(templateSeqHTML)
         const linkElement = li.querySelector(linkHTML)
         return {
            title: titleElement ? titleElement.textContent.trim() : null,
            status: statusElement ? statusElement.textContent.trim() : null,
            startDate: startDateElement ? startDateElement.textContent.replace(/\s+/g, ' ').trim() : null,
            endDate: endDateElement ? endDateElement.textContent.replace(/\s+/g, ' ').trim() : null,
            templateSeq: templateSeqElement ? templateSeqElement.value : null,
            link: linkElement ? linkElement.href : null,
         }
      })
   })

   // console.log(array)
   let availableItem = array // take all forms                       
   if (keyword != null && keyword != '') {
      // console.log('Deep filter with keyword: ' + keyword)
      availableItem = availableItem.filter(item => item.title.includes(keyword))    // deep-filter with exact keyword
   }
   if (!ignoreNullLink) {
      // console.log('Not ignore null link')
      availableItem = availableItem.filter(item => item.link !== null)              // take only clickable form
   }

   // console.log(availableItem)
   startTime = utils.elapsedTime(startTime, account, "Total links found: " + availableItem.length)
   startTime = utils.elapsedTime(startTime, account, "Find all available finished")

   return availableItem
}


async function initiate(page, keyword=config.filterKeyword, displayNumber=config.displayNumber, ignoreNullLink=false) {
   // get available forms at first before passing to account Promise
   let startTime = utils.elapsedTime(0)
   await filterDisplay(page, null, keyword, displayNumber)                    // filter display   
   let listForms = await findAll(page, null, keyword, ignoreNullLink)         // find all available Forms
   startTime = utils.elapsedTime(startTime, null, "Initiate process finished")
   return listForms
}

async function renitiate(page, num, keyword=config.filterKeyword, ignoreNullLink=false) {
   // get available forms at first before passing to account Promise
   let startTime = utils.elapsedTime(0)
   await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });    // reload page
   let listForms = await findAll(page, null, keyword, ignoreNullLink)         // find all available Forms
   startTime = utils.elapsedTime(startTime, null, `Renitiate process <${num}> finished`)
   return listForms
}

async function formAutoFiller(newPage, account, i, capture=false, test=false) {   
   const logPath = `${config.logFolderName}/${account.username}` // path to save log

   // 1. click agree, go to form link
   if (capture) {await newPage.screenshot({path: `${logPath}/form-[${i+1}]-begin.png`, fullPage: true})}
   try {
      await newPage.evaluate(() => {
         const okBtnHTML = 'ok'
         const okBtn = document.getElementById(okBtnHTML)
         okBtn.click()
      })
      await newPage.waitForNavigation()
      await utils.captureHTML(newPage, `${logPath}/form-[${i+1}]-form.html`)
   }
   catch (err) {
      console.log(err)
   }
   // await utils.getAllNames(newPage)

   // 2. fill form and click agree, go to confirm page
   try {
      await newPage.evaluate((config, test) => {
         if (test) {
            const lastNameHTML = "item[0].textData"
            const firstNameHTML = "item[0].textData2"
            const dateBirthHTML = "item[2].textData"
            const phoneNumberHTML = "item[4].textData"
            const schoolNameHTML = "item[5].textData"
            const dateGradHTML = "item[7].textData"
            const examinNumberHTML = "item[8].textData"
            const checkBoxHTML = "item[10].choiceList[0].checkFlag"

            document.getElementsByName(firstNameHTML)[0].value = config.infoFake.firstName[Math.random() * config.infoFake.firstName.length | 0]
            document.getElementsByName(lastNameHTML)[0].value = config.infoFake.lastName[Math.random() * config.infoFake.lastName.length | 0]
            document.getElementsByName(dateBirthHTML)[0].value = config.infoFake.dateBirth[Math.random() * config.infoFake.dateBirth.length | 0]
            document.getElementsByName(phoneNumberHTML)[0].value = config.infoFake.phoneNumber[Math.random() * config.infoFake.phoneNumber.length | 0]
            document.getElementsByName(schoolNameHTML)[0].value = config.infoFake.schoolName[Math.random() * config.infoFake.schoolName.length | 0]
            document.getElementsByName(dateGradHTML)[0].value = config.infoFake.dateGrad[Math.random() * config.infoFake.dateGrad.length | 0]
            document.getElementsByName(examinNumberHTML)[0].value = config.infoFake.examinNumber[Math.random() * config.infoFake.examinNumber.length | 0]
            // document.getElementsByName(checkBoxHTML)[0].checked = true
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach((checkbox) => {
                  checkbox.checked = true;
            });
         }
         else {
            const lastNameHTML = "item[0].textData"
            const firstNameHTML = "item[0].textData2"
            const dateBirthHTML = "item[1].textData"
            const nationHTML = "item[2].selectData"
            const countryHTML = "item[3].selectData"
            const phoneNumberHTML = "item[5].textData"
            // const checkBoxHTML = "item[10].choiceList[0].checkFlag"

            document.getElementsByName(firstNameHTML)[0].value = config.infoFake.firstName[Math.random() * config.infoFake.firstName.length | 0]
            document.getElementsByName(lastNameHTML)[0].value = config.infoFake.lastName[Math.random() * config.infoFake.lastName.length | 0]
            document.getElementsByName(dateBirthHTML)[0].value = config.infoFake.dateBirth[Math.random() * config.infoFake.dateBirth.length | 0]
            document.getElementsByName(phoneNumberHTML)[0].value = config.infoFake.phoneNumberHash[Math.random() * config.infoFake.phoneNumberHash.length | 0]
            document.getElementsByName(nationHTML)[0].value = config.infoFake.nation[Math.random() * config.infoFake.nation.length | 0]
            document.getElementsByName(countryHTML)[0].value = config.infoFake.country[Math.random() * config.infoFake.country.length | 0]
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach((checkbox) => {
               checkbox.checked = true;
            });
         }
      }, config, test, i)

      const focusSubmitHTML = `input[name='item[0].textData']`
      if (capture) {await newPage.screenshot({path: `${logPath}/form-[${i+1}]-draft.png`, fullPage: true})}
      await newPage.focus(focusSubmitHTML)
      await newPage.keyboard.press('Enter')
      await newPage.waitForNavigation()
   }
   catch (err) {
      startTime = utils.elapsedTime(startTime, account, `ERROR FORM [${i+1}]: Form not found or data not valid - ${err}`)
   }

   // 3. click confirm, go to finish page
   try {
      await newPage.evaluate(() => {
         const confirmBtnHTML = 'c-btn_2'
         document.getElementsByClassName(confirmBtnHTML)[0].click()
      })
      // handle the popup
      newPage.on('dialog', async dialog => {
         await dialog.accept();
      });
      await newPage.waitForNavigation()
      if (capture) {await newPage.screenshot({path: `${logPath}/form-[${i+1}]-end.png`, fullPage: true})}
   }
   catch (err) {
      startTime = utils.elapsedTime(startTime, account, `ERROR FORM [${i+1}]: Confirm button not found - ${err}`)
   }

   // 4. check if success or fail
   const isFail = await newPage.evaluate(() => {
         return !!document.querySelector('.errorMessage') // !! converts anything to boolean
       })
   return isFail
}



async function dropAll(page, account, capture=false) {
   let startTime = utils.elapsedTime(0)
   
   await logIn(page, account)                                                    // login
   startTime = utils.elapsedTime(startTime, account, "Login finished - BEGIN")

   await page.goto(config.inqueryUrl)
   
   startTime = utils.elapsedTime(startTime, account, "Navigate to inquery page finished")
   if (capture) { await page.screenshot({path: `${config.logFolderName}/${account.username}/inquery.png`, fullPage: true}) }

   // find all inquery forms
   let listItems = await page.evaluate(config => {
      let tableRows = document.querySelectorAll('table tbody tr'); // Select all table rows
      let items = []; // Array to store the items

      tableRows.forEach((row, index) => {
         if(index !== 0) { // Skip the header row
            let item = {};
            let cells = row.querySelectorAll('td'); // Select all cells in the row

            item.id = cells[0].textContent.trim();
            item.name = cells[1].textContent.trim();
            item.contact = cells[2].textContent.trim();
            item.date = cells[3].textContent.trim();
            item.status = cells[4].textContent.trim();

            // Get the onclick attribute of the button
            let button = cells[5].querySelector('input[type="submit"]'); // Select the 'input' element in the last cell
            if(button) {
               item.buttonId = button.getAttribute('id');
            }

            items.push(item); // Add the item to the array
         }
      })
      return items
   }, config)
   
   // filter items if status is '"処理待ち"'
   const inqueryStatus = "処理待ち"
   listItems = listItems.filter(item => item.status.includes(inqueryStatus))    // deep-filter with exact keyword
   // console.log(listItems)

   if (listItems.length == 0) {
      startTime = utils.elapsedTime(startTime, account, "No inquery form found - END")
      return
   }
   else {
      startTime = utils.elapsedTime(startTime, account, `Found ${listItems.length} inquery forms`)
   }

   for (let i = 0; i < listItems.length; i++) {
      const item = listItems[i]
      // click detail
      await page.evaluate(buttonId => {
         const button = document.querySelector(`input[id='${buttonId}']`);
         button.click();
       }, item.buttonId);
      await page.waitForNavigation()
      if (capture) { await page.screenshot({path: `${config.logFolderName}/${account.username}/inquery-page-${i+1}.png`, fullPage: true}) }
      
      // delete form
      await page.evaluate(() => {
         document.querySelector(`input[id='delete']`).click();
      })
      startTime = utils.elapsedTime(startTime, account, `Inquery form [${i+1}] deleting`)
      await page.waitForNavigation()

      // confirm delete
      await page.evaluate(() => {
         document.querySelector(`input[class='c-btn_2 button-outline']`).click();
      })
      await page.waitForNavigation()

      await page.evaluate(() => {
         document.querySelector(`input[id='confirm']`).click();
      })
      await page.waitForNavigation()

      if (capture) { await page.screenshot({path: `${config.logFolderName}/${account.username}/inquery-done-${i+1}.png`, fullPage: true}) }
      startTime = utils.elapsedTime(startTime, account, `Inquery form [${i+1}] finished`)

      // back to inquery page
      await page.goto(config.inqueryUrl)
   }
   
   startTime = utils.elapsedTime(startTime, null, "Deletion process finished - END")
}

module.exports = {
   initiate,
   renitiate,
   logIn,
   filterDisplay,
   findAll,
   formAutoFiller,
   dropAll,
}