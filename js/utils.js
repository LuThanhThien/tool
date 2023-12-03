const config = require('./config');
const fs = require('fs');

// redirect to main page
async function redirectMain(page) {
   await page.goto(config.mainPageUrl);
   await page.waitForNavigation();
}


// for logging info
function elapsedTime(startTime, account=null, text=null) {
   const endTime = performance.now();
   if (startTime === 0 && text === null && account === null) {
      return endTime;
   }
   const elapsedTime = (endTime - startTime) / 1000;
   const roundedElapsedTime = elapsedTime.toFixed(3); // Round up to 4 decimal places
   let currentDateTime = new Date();
   let year = currentDateTime.getFullYear();
   let month = (currentDateTime.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based in JavaScript
   let date = currentDateTime.getDate().toString().padStart(2, '0');
   let hours = currentDateTime.getHours().toString().padStart(2, '0');
   let minutes = currentDateTime.getMinutes().toString().padStart(2, '0');
   let seconds = currentDateTime.getSeconds().toString().padStart(2, '0');
   const dateString = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;

   if (text !== null) {
      if (account === null) {
         console.log(`[${dateString}] [${roundedElapsedTime}s] [MAIN] ${text}`);
      }
      else {
         console.log(`[${dateString}] [${roundedElapsedTime}s] [${account.username}] ${text}`);
      }
   } 
   else {
      console.log(`[${dateString}] [${roundedElapsedTime}s] [MAIN]`);
   }
   return endTime;
}


// element string getter
async function getAllIds(page) {
   try {
      // Get all elements with an ID attribute
      const allElementsWithIds = await page.$$('[id]');
      // Extract and print the IDs
      const allIds = await Promise.all(
         allElementsWithIds.map(elementHandle => page.evaluate(el => el.id, elementHandle))
      );
      console.log('All IDs on the page:', allIds);
   }
   catch (err) {
      console.log('[getAllIds] No ID on the page');
   }
   
}

async function getAllNames(page) {
   try {
      // Get all elements with an ID attribute
      const allElementsWithNames = await page.$$('[name]');
      // Extract and print the IDs
      const allNames = await Promise.all(
         allElementsWithNames.map(elementHandle => page.evaluate(el => el.name, elementHandle))
      );
      console.log('All names on the page:', allNames);
   }
   catch (err) {
      console.log('[getAllNames] No name on the page');
   }
}


// create log folder for logging
function makeDir(path) {
   fs.mkdirSync(path, (err) => {
      if (err) {
         console.error(err)
      } else {
         console.log(`Folder '${path}' created successfully.`)
      }
   })
}

function initLog() {
   // Check if log folder already exists
   if (!fs.existsSync(config.logFolderName)) {
      // Create log folder
      makeDir(config.logFolderName)
   }
   config.accounts.forEach(account => {
      const accountFolder = `${config.logFolderName}/${account.username}`
      if (!fs.existsSync(accountFolder)) {
         makeDir(accountFolder)
      }
   })
}

async function aborting(page) {
   // Remove existing listeners
   page.removeAllListeners('request');

   await page.setRequestInterception(true);
   page.on('request', (req) => {
      if (req.resourceType() === 'stylesheet' || req.resourceType() === 'font' || req.resourceType() === 'image'){
         req.abort();
      }
      else {
         req.continue();
      }
   });
}


async function captureHTML(page, name='page.mhtml') {  
   try {  
     const data = await page.content();
     fs.writeFileSync(name, data)
   } 
   catch (err) { console.error(err) } 
 }


 function isTodayOrPast(stringDate) {
   const matchDate = stringDate.match(/(\d{4})年(\d{1,2})月(\d{1,2})日 (\d{2})時(\d{2})分/);
   const year = parseInt(matchDate[1], 10);
   const month = parseInt(matchDate[2], 10) - 1; // JavaScript months are 0-indexed
   const day = parseInt(matchDate[3], 10);
   const hour = parseInt(matchDate[4], 10);
   const minute = parseInt(matchDate[5], 10);

   // Create a date object from the target date
   const targetDate = new Date(year, month, day, 0, 0);

   // Get the current date and time
   const currentDate = new Date();

   // Compare the target date with the current date and time
   return targetDate.getTime() <= currentDate.getTime();
}


// Create an object to hold all exported functions
module.exports = {
   redirectMain,
   elapsedTime,
   getAllIds,
   initLog,
   aborting,
   getAllNames,
   captureHTML,
   isTodayOrPast,
 }
 

 
 // Example usage:
//  const targetDate = '2023年10月28日 07時30分'; // Replace with your specific date
//  const result = isToday(targetDate);
 
//  console.log(result); 
