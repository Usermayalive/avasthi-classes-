const fs = require('fs');
const pdfParse = require('pdf-parse');
const krutidev = require('@anthro-ai/krutidev-unicode');

async function run() {
  const dataBuffer = fs.readFileSync('server/uploads/pdfFile-1785338440394-694189707.pdf');
  const parsed = await pdfParse(dataBuffer);
  let pdfText = parsed.text;
  
  pdfText = krutidev(pdfText);

  const ansMap = {};
  
  // The word Answerkey might be scrambled, so let's just look for 'answerkey' OR 'Answerkey' OR whatever it translates to.
  // Actually, better yet, we can just match ALL occurrences of (Q.xx \n Ans) or (फण्xx \n Ans) near the end of the text.
  // Or we can just search the last 2000 characters for the pattern.
  const answerSection = pdfText.slice(-3000);
  
  // Match Q.1 or फण्1 followed by a number/letter
  const matches = [...answerSection.matchAll(/(?:Q|Question|Ques|प्रश्न|प्र|फण्)\.?\s*(\d+)\s+([A-E1-5अबसदयहकखगघच])/gi)];
  matches.forEach(m => {
    ansMap[m[1]] = m[2].toUpperCase();
  });
  
  console.log(ansMap);
}
run();
