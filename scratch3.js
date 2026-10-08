const fs = require('fs');
const file = 'c:/Users/admin/Desktop/IELTS-WEB_APP/IELTS Mock Test 001 - 90 Minutes/Answer Keys/listening_answers.json';
let data = JSON.parse(fs.readFileSync(file, 'utf8'));

data['L01-Q01'] = {
  correct: 'Thompson',
  acceptable: ['thompson']
};

data['L01-Q02'] = {
  correct: '9210',
  acceptable: ['9210']
};

data['L01-Q03'] = {
  correct: '15th',
  acceptable: ['15', '15th']
};

data['L01-Q04'] = {
  correct: 'Ocean',
  acceptable: ['ocean']
};

data['L01-Q05'] = {
  correct: 'B',
  acceptable: ['B. Their anniversary', 'B', 'Their anniversary']
};

fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
console.log('Updated listening_answers.json successfully');
