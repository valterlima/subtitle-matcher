var options = {
	moviesDir: 'files/movies/',
	subtitlesDir: 'files/subtitles/',
	outputDir: 'files/output/',
	renameSubtitle: true,
	moveFiles: false
}
var Matcher = require('./lib/subtitle-matcher.js');

Matcher.run(options);