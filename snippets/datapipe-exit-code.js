// === Save data to OSF via DataPipe (https://pipe.jspsych.org) ===
// Paste this into the "Begin JS Routine" tab of a JS code component in the
// last routine of your experiment. Replace the placeholder below with the
// experiment ID of your own DataPipe experiment (see README).
const DATAPIPE_EXPERIMENT_ID = 'YOUR_DATAPIPE_ID';

// Do not offer the results file as a download in the participant's browser
psychoJS._saveResults = false;

const filename = psychoJS._experiment._experimentName + '_' + psychoJS._experiment._datetime + '.csv';
const trialsData = psychoJS._experiment._trialsData;

// Quote a value if it contains a comma, a quote or a line break
function csvSafe(val) {
  if (val === undefined || val === null) return '';
  const str = val.toString();
  return /[",\r\n]/.test(str) ? '"' + str.replace(/"/g, '""') + '"' : str;
}

if (!trialsData || trialsData.length === 0) {
  console.warn('No trial data found; nothing to upload.');
  quitPsychoJS();
} else {
  // Rows can have different columns, so collect every column name
  const headers = [];
  for (const row of trialsData)
    for (const key of Object.keys(row))
      if (!headers.includes(key)) headers.push(key);

  const csvContent = [headers.join(',')]
    .concat(trialsData.map(row => headers.map(h => csvSafe(row[h])).join(',')))
    .join('\n');

  console.log('Uploading data to DataPipe...');
  fetch('https://pipe.jspsych.org/api/data/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': '*/*'
    },
    body: JSON.stringify({
      experimentID: DATAPIPE_EXPERIMENT_ID,
      filename: filename,
      data: csvContent
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log('Upload finished:', result);
    quitPsychoJS();
  })
  .catch(error => {
    console.error('Upload failed:', error);
    quitPsychoJS();
  });
}
