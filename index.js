const options = {
  moviesDir: 'files/movies/',
  subtitlesDir: 'files/subtitles/',
  outputDir: 'files/output/',
  renameSubtitle: true,
  moveFiles: false,
};
const Matcher = require('./lib/subtitle-matcher.js')(options);

Matcher.run();
