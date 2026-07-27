const pdfParse = require('pdf-parse');
const fs = require('fs');

async function run() {
  const path = '/Users/manasvyas/Desktop/avasthi/server/uploads/pdfFile-1785157412074-599382535.pdf';
  const dataBuffer = fs.readFileSync(path);
  const parsed = await pdfParse(dataBuffer);
  let pdfText = parsed.text;

  let questions = [];
  const lines = pdfText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let curQ = null;
  let curOpts = [];
  let curCorrectIdx = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Question pattern: Q1., 1., Q.1, Question 1:
    const qMatch = line.match(/^(?:Q|Question|Ques)?\.?\s*\d+\s*[\.\:\-\)]\s*(.+)/i) || line.match(/^\d+\s*[\.\:\-\)]\s*(.+)/i);
    if (qMatch) {
      if (curQ && curOpts.length >= 2) {
        questions.push({
          questionText: curQ,
          options: curOpts.slice(0, 4),
          correctOptionIndex: curCorrectIdx
        });
      }
      curQ = qMatch[1];
      curOpts = [];
      curCorrectIdx = 0;
      continue;
    }

    // Option pattern: (A), A), A., (1), 1)
    const optMatch = line.match(/^(?:\(?([A-D1-4])[\)\.]\s*|\b([A-D1-4])[\)\.]\s*)(.+)/i);
    if (optMatch && curQ) {
      curOpts.push(optMatch[3].trim());
      continue;
    }

    // Inline multiple options: (A) Opt1 (B) Opt2
    if (curQ && (line.includes('(A)') || line.includes('A)') || line.includes('(1)'))) {
      const parts = line.split(/(?:\([A-D1-4]\)|[A-D1-4][\)\.])/).map(p => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        curOpts.push(...parts);
        continue;
      }
    }

    // Parse correct answer line: e.g. Ans: A, Answer: B, Correct Option: C
    const ansMatch = line.match(/(?:Ans|Answer|Correct)[^A-Za-z0-9]*\b([A-D1-4])\b/i);
    if (ansMatch && curQ) {
      const char = ansMatch[1].toUpperCase();
      if (['A', '1'].includes(char)) curCorrectIdx = 0;
      else if (['B', '2'].includes(char)) curCorrectIdx = 1;
      else if (['C', '3'].includes(char)) curCorrectIdx = 2;
      else if (['D', '4'].includes(char)) curCorrectIdx = 3;
      continue;
    }

    // Append line to question text if options not started
    if (curQ && curOpts.length === 0 && line.length > 3) {
      curQ += ' ' + line;
    }
  }

  if (curQ && curOpts.length >= 2) {
    questions.push({
      questionText: curQ,
      options: curOpts.slice(0, 4),
      correctOptionIndex: curCorrectIdx
    });
  }

  console.log(`Parsed ${questions.length} questions!`);
  if (questions.length === 0) {
     console.log("Here are the first 30 lines of the PDF:");
     console.log(lines.slice(0, 30));
  } else {
     console.log("First question:", questions[0]);
  }
}

run();
