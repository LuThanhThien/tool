const mainUrl = "https://www.shinsei.e-aichi.jp/pref-aichi-police-u/offer/offerList_initDisplay"
const logInUrl = "https://www.shinsei.e-aichi.jp/pref-aichi-police-u/profile/userLogin"
const inqueryUrl = "https://www.shinsei.e-aichi.jp/pref-aichi-police-u/inquiry/inquiryList_initDisplay"
const detailBaseUrl = "https://www.shinsei.e-aichi.jp/pref-aichi-police-u/inquiry/inquiryList_detailList__"
const logFolderName = 'log'
const filterKeyword = 'Tosan'
const displayNumber = 50

// const { readCustomerData } = require('./utils')

// List of accounts
const testAccounts = ['luthien5921@gmail.com', 'giathanh010101@gmail.com', 'piechipiechipeach@gmail.com', 'piechipiechipeach@gmail.com', 'piechipeach@gmail.com', 'nqkhanhtoan@gmail.com']
const accounts = [
   // TEST
   { username: 'luthien5921@gmail.com', password: 'aichi@5921' },       
   { username: 'giathanh010101@gmail.com', password: 'aichi@5921'},   
   { username: 'piechipiechipeach@gmail.com', password: 'aichi@5921'},     
   { username: 'piechipeach@gmail.com', password: 'aichi@5921'},     
   { username: 'nqkhanhtoan@gmail.com', password: 'aichi@5921'},     
   // TOSAN anh Khoi
   // { username: 'benhosong@gmail.com', password: 'hoahong1234' },
   // { username: 'ngthanh96.04@gmail.com', password: 'hoahong1234' },
   // { username: 'trminh94.05@gmail.com', password: 'hoahong1234' },
   // { username: 'ngtam94.24@gmail.com', password: 'hoahong1234' },
   // { username: 'mg06p6@gmail.com', password: 'hoahong1234' },
   // { username: 'tthanh050206@gmail.com', password: 'hoahong1234' },
   // { username: 'ble79037@gmail.com', password: 'hoahong1234' },
   // { username: 'thoainhatvy@gmail.com', password: 'hoahong1234' },
   // { username: 'dieptram78@gmail.com', password: 'hoahong1234' },
   // { username: 'vuvananh488@gmail.com', password: 'hoahong1234' },
   // { username: 'truongbui0425@gmail.com', password: 'hoahong1234' },
   // { username: 'tanvuongvo76@gmail.com', password: 'hoahong1234' },
   // TOSAN chi Truc
   // { username: 'dieptram78@gmail.com', password: 'hoahong1234' },
   // { username: 'davidalaba00000@gmail.com', password: 'hoahong1234' },
   // { username: 'ble79037@gmail.com', password: 'hoahong1234' },
   // { username: 'benemmai380@gmail.com', password: 'hoahong1234' },
   // TOSAN chi Tra
   // { username: 'Jennygreen270295@gmail.com', password: 'hoahong1234' },
   // { username: 'Nickpown0411@gmail.com', password: 'hoahong1234' },
   // { username: 'Jamebrown0206@gmail.com', password: 'hoahong1234' },
];

const infoFake = {
   lastName: ['Nguyen', 'Tran', 'Le', 'Vo', 'Pham', 'Hoang', 'Huynh', 'Phan', 'Vu', 'Dang'],
   firstName: ['Thuan Thien', 'Le Ly', 'Hong Thi', 'Khanh Van', 'Thuy Duong', 'Hoai Nam', 'Phuong Thao', 'Hoan Nhung', 'Nhat Tan', 'Thi Thanh', 'Thanh Thao', 'Thanh Nguyen'],
   dateBirth: ['20010302', '19940505', '19970224', '20030606', '19920101', '19950101', '19940224', '19940606', '19950101', '20000303', '19950409', '20000312', '20010905'],
   // gender: ['男性', '女性'],
   gender: ['M', 'F'],
   phoneNumber: ['0801234567', '0809876543', '0805678912', '0802468135', '0803692584', '0801234567', '0809876543', '0805678912', '0802468135', '0803692584'],
   phoneNumberHash: ['080-1234-5673', '080-9876-5435', '080-5678-9121', '080-2468-1355', '080-3692-5840', '080-1234-5673', '080-9876-5435', '080-5678-9121', '080-2468-1355', '080-3692-5840'],
   nation: ['151'],
   country: ['150'],
   schoolName: ['Katana', 'Samurai', 'Ninja'],
   prefacture: ['愛知県'],
   dateGrad: ['20231010', '20230910', '20231110', '20230828', '20231017', '20231010', '20230910', '20231110', '20230828', '20230917'],
   examinNumber: ['124369', '987654', '543219', '135792', '246813', '124369', '987654', '543219', '135792', '246813'],
}

const { load } = require('csv-load-sync');
const customerData = load('./data/customers.csv');
// for (cust of customerData) {
//    cust.used = false
// }
// console.log(customerData)

// for (cust of customerData) {
//    console.log(cust.firstName, cust.firstName.length)
//    console.log(cust.lastName, cust.lastName.length)
//    console.log(cust.dateBirth, cust.dateBirth.length)
//    console.log(cust.gender, cust.gender.length)
//    console.log(cust.nation, cust.nation.length)
//    console.log(cust.country, cust.country.length)
//    console.log(cust.phoneNumberHash, cust.phoneNumberHash.length)
//    break
// }



// exports
module.exports = {
   mainUrl,
   logInUrl,
   inqueryUrl,
   detailBaseUrl,
   accounts,
   testAccounts,
   logFolderName,
   filterKeyword,
   displayNumber,
   infoFake,
   customerData,
}
