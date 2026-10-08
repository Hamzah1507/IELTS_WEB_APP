const fs = require('fs');
const file = 'c:/Users/admin/Desktop/IELTS-WEB_APP/IELTS Mock Test 001 - 90 Minutes/listening.json';
let data = JSON.parse(fs.readFileSync(file, 'utf8'));

data[0].type = 'form_completion';
data[0].question = 'Booking agent: Sarah __________';
data[0].instruction = 'NO MORE THAN TWO WORDS';
delete data[0].options;

data[1].type = 'form_completion';
data[1].question = "Customer's mobile number: 077-843-__________";
data[1].instruction = 'A NUMBER';
delete data[1].options;

data[2].type = 'form_completion';
data[2].question = 'Arrival date: __________ August';
data[2].instruction = 'A NUMBER';
delete data[2].options;

data[3].type = 'form_completion';
data[3].question = 'Accommodation: __________ View Suite';
data[3].instruction = 'ONE WORD';
delete data[3].options;

data[4].type = 'multiple_choice';
data[4].question = 'Why does Mark want to celebrate the trip?';
data[4].options = [
  "A. His wife's birthday",
  "B. Their anniversary",
  "C. His retirement",
  "D. A work achievement"
];
delete data[4].instruction;

fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
console.log('Updated listening.json successfully');
