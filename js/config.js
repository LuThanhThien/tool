const mainUrl = "https://www.shinsei.e-aichi.jp/pref-aichi-police-u/offer/offerList_initDisplay"
const logInUrl = "https://www.shinsei.e-aichi.jp/pref-aichi-police-u/profile/userLogin"
const inqueryUrl = "https://www.shinsei.e-aichi.jp/pref-aichi-police-u/inquiry/inquiryList_initDisplay"
const detailBaseUrl = "https://www.shinsei.e-aichi.jp/pref-aichi-police-u/inquiry/inquiryList_detailList__"
const logFolderName = 'log'
const filterKeyword = 'Tosan'
const displayNumber = 50

// List of accounts
const accounts = [
   { username: 'luthien5921@gmail.com', password: 'aichi@5921' },       // test
   { username: 'giathanh010101@gmail.com', password: 'aichi@5921'},     // test
   { username: 'benhosong@gmail.com', password: 'hoahong1234' },
   { username: 'ngthanh96.04@gmail.com', password: 'hoahong1234' },
   { username: 'trminh94.05@gmail.com', password: 'hoahong1234' },
   { username: 'ngtam94.24@gmail.com', password: 'hoahong1234' },
   { username: 'mg06p6@gmail.com', password: 'hoahong1234' },
   { username: 'tthanh050206@gmail.com', password: 'hoahong1234' },
   { username: 'ble79037@gmail.com', password: 'hoahong1234' },
   { username: 'thoainhatvy@gmail.com', password: 'hoahong1234' },
   { username: 'dieptram78@gmail.com', password: 'hoahong1234' },
   { username: 'vuvananh488@gmail.com', password: 'hoahong1234' },
   // { username: 'truongbui0425@gmail.com', password: 'hoahong1234' },
   // { username: 'tanvuongvo76@gmail.com', password: 'hoahong1234' },
   
]


const idsTosan = {
   okBtn: '', lastName: 'Pham', firstName: 'Thuy', dateBirth: '19950101', nation: 'Ninja', country: '愛知県', gender: '女性', phoneNumber: '0903692584',  checkBox: '202310917', confirmBtn1: '246813', confirmBtn1: '',
}

const idsHirabari = {
   okBtn: '', lastName: 'Pham', firstName: 'Thuy', dateBirth: '19950101', nation: 'Ninja', country: '愛知県', gender: '女性', phoneNumber: '0903692584',  checkBox: '202310917', confirmBtn1: '246813', confirmBtn1: '',
}

const infoFake = {
   lastName: ['Nguyen', 'Tran', 'Le', 'Vo', 'Pham'],
   firstName: ['Thien', 'Le Ly', 'Thi', 'Van', 'Thuy', 'Nam', 'Thao', 'Nhung', 'Tan'],
   dateBirth: ['20010302', '19940505', '19970224', '20030606', '19920101', '19950101', '19940224', '19940606', '19950101', '20000303'],
   gender: ['男性', '女性'],
   phoneNumber: ['0801234567', '0809876543', '0805678912', '0802468135', '0803692584', '0801234567', '0809876543', '0805678912', '0802468135', '0803692584'],
   phoneNumberHash: ['080-1234-5673', '080-9876-5435', '080-5678-9121', '080-2468-1355', '080-3692-5840', '080-1234-5673', '080-9876-5435', '080-5678-9121', '080-2468-1355', '080-3692-5840'],
   nation: ['151'],
   country: ['151'],
   schoolName: ['Katana', 'Samurai', 'Ninja'],
   prefacture: ['愛知県'],
   dateGrad: ['20231010', '20230910', '20231110', '20230828', '20231017', '20231010', '20230910', '20231110', '20230828', '20230917'],
   examinNumber: ['124369', '987654', '543219', '135792', '246813', '124369', '987654', '543219', '135792', '246813'],
}

// exports
module.exports = {
   mainUrl,
   logInUrl,
   inqueryUrl,
   detailBaseUrl,
   accounts,
   logFolderName,
   filterKeyword,
   displayNumber,
   idsTosan,
   idsHirabari,
   infoFake,
};
