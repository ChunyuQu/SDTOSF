# SDTOSF: run a PsychoPy experiment online with GitHub Pages and OSF

This repository is a worked example of running a [PsychoPy](https://www.psychopy.org/) Builder experiment in the browser **for free**:

- **GitHub Pages** hosts the experiment (instead of Pavlovia).
- **[DataPipe](https://pipe.jspsych.org/)** receives each participant's data when the experiment ends.
- **[OSF](https://osf.io/)** stores the data files.

```
Participant's browser ──► GitHub Pages (PsychoJS experiment)
                               │  at the end: POST CSV
                               ▼
                           DataPipe ──► OSF project (one .csv per session)
```

The example task is a motion-duration reproduction task built with random-dot kinematograms (RDKs). You can use it as it is, or follow the same steps for your own experiment.

## Contents

```
SDTOSF/
├── index.html                                  # redirects to experiment/
├── experiment/
│   ├── duration_reproduction.psyexp            # PsychoPy Builder source (edit this)
│   ├── index.html                              # exported by Builder (File → Export HTML)
│   ├── duration_reproduction.js                # exported
│   ├── duration_reproduction-legacy-browsers.js  # exported
│   ├── conditions.csv                          # trial list: TimeDur (s), Coherence1 (0–1), TrialType
│   ├── dots.js                                 # RDK class that draws the moving dots on a canvas
│   ├── images/                                 # credit card (calibration), instructions, touch button
│   └── lib/                                    # PsychoJS 2023.2.3, so nothing depends on Pavlovia
└── snippets/
    └── datapipe-exit-code.js                   # data-saving code to reuse in your own experiments
```

Builder exports the online files next to the `.psyexp`, so the whole experiment lives in `experiment/`. The `index.html` at the top level only forwards visitors to `experiment/`, and keeps any URL parameters.

## The example task

1. **Screen calibration**: the participant resizes a credit-card image until it matches a real card, using the arrow keys, then presses space. This gives a scale factor, so stimulus sizes and speeds can be set in centimetres.
2. **Instructions**.
3. **Trials**, in blocks of 54 (the first block is practice; press `S` to start each block):
   - 0.5 s blank, 0.5 s noise mask (random dots)
   - **Stimulus**: dots move coherently for `TimeDur` seconds
   - 0.5 s noise mask, 0.5 s blank, 0.5 s cue (`T`)
   - **Response**: hold the **↓ arrow key** for as long as the stimulus lasted. The dots turn green and move while the key is held.
   - **Feedback** on the reproduced duration: within ±5 %, 5–30 % early/late, or more than 30 % early/late.
4. **Exit**: the data are uploaded to DataPipe and the experiment closes.

Besides the standard PsychoPy columns, the data file has `keyDuration` (reproduced duration, ms; `9999` = no response), `FeedbackID_T` (0 = no response, 1 = far too early … 3 = correct … 5 = far too late), `direction` (motion direction, degrees) and `Block_id`.

`conditions.csv` only has 3 rows, which makes it a short demo. Add rows (or repeat the loop) for a real study.

## Tutorial: put it online

### 1. Get a copy

Fork this repository on GitHub, or create a new repository and upload the files. The repository has to be **public** for GitHub Pages to work on a free account.

### 2. Set up OSF and DataPipe

1. On [OSF](https://osf.io/), create a project and a component for the data (for example `data`).
2. In OSF, go to *Settings → Personal access tokens* and create a token with the `osf.full_write` scope.
3. Log in to [DataPipe](https://pipe.jspsych.org/) with your OSF account and enter the token under *Account*.
4. Create a new experiment in DataPipe: choose your OSF project and the data component.
5. On the experiment page, switch on **Enable data collection**, and copy the **Experiment ID**.

### 3. Paste the experiment ID into the code

Open `experiment/duration_reproduction.psyexp` in PsychoPy, go to the `exit` routine and open the code component `code_3` (*Begin JS Routine*). Replace the placeholder:

```js
const DATAPIPE_EXPERIMENT_ID = 'YOUR_DATAPIPE_ID';
```

Then export again with *File → Export HTML*. Builder rewrites `index.html`, `duration_reproduction.js` and `duration_reproduction-legacy-browsers.js`.

If you do not have PsychoPy installed, you can make the same change by hand in `duration_reproduction.js` and `duration_reproduction-legacy-browsers.js` (search for `YOUR_DATAPIPE_ID`). But the next Builder export will overwrite those files, so change the `.psyexp` as well.

### 4. Turn on GitHub Pages

In your repository on GitHub: *Settings → Pages → Build and deployment*. Set *Source* to **Deploy from a branch**, then select branch `main` and folder `/ (root)`. After a minute or two the experiment is online at

```
https://<your-github-username>.github.io/<repository-name>/
```

That is the link you send to participants. It forwards to `.../<repository-name>/experiment/`.

### 5. Test it

Run through the whole experiment once and check that a new `.csv` file shows up in your OSF data component. If it does not:

- Open the browser console (F12) on the last screen. You should see `Upload finished:` followed by DataPipe's reply; an error message there usually explains the problem.
- Check that data collection is switched on in DataPipe and that the experiment ID is correct.
- After you push a change, GitHub Pages can take a few minutes to update. Hard-refresh the page (Ctrl+F5) to make sure the browser is not running a cached copy.

## Using this setup for your own experiment

1. Add a final routine to your Builder experiment (for example `exit`). Give it a text component such as *"Please wait while we save your results..."* that has no fixed duration.
2. Add a code component to that routine and set *Code Type* to **JS**. Paste the contents of `snippets/datapipe-exit-code.js` into *Begin JS Routine* and fill in your experiment ID.
3. Export to HTML. Copy the PsychoJS `lib/` folder next to `index.html`, if the export did not create it. Then follow steps 4–5 above.

How the saving code works:

- It sets `psychoJS._saveResults = false`, so PsychoJS does not offer participants a CSV download at the end.
- It builds a CSV from all trial rows, quoting values that contain commas, quotes or line breaks.
- It sends the CSV to DataPipe, then closes the experiment.

Only participants who reach the final routine are saved. If someone quits early with `Esc` or closes the tab, nothing is uploaded.

## Notes

- The experiment uses PsychoJS 2023.2.3. If you export from a newer PsychoPy version, use the `lib/` files from that version.
- Anyone who has your DataPipe experiment ID can send data to your OSF project. Switch off data collection in DataPipe when the study is not running.

## License

[MIT](LICENSE)
