/* eslint strict:0 */

module.exports = function Matcher(options) {
  'use strict';
  const fs = require('fs');
  const async = require('async');
  const stringSimilarity = require('string-similarity');
  const movieFormats = ['mkv', 'mp4', 'avi'];
  const subtitleFormats = ['srt', 'txt', 'sub'];

  const config = {
    moviesDir: options.moviesDir || 'files/movies/',
    subtitlesDir: options.subtitlesDir || 'files/subtitles/',
    outputDir: options.outputDir || 'files/output/',
    renameSubtitle: typeof options.renameSubtitle !== 'undefined' ? options.renameSubtitle : true,
    moveFiles: typeof options.moveFiles !== 'undefined' ? options.moveFiles : true,
  };

  function getExtension(filename) {
    const temp = filename.split('.');
    return temp[temp.length - 1];
  }

  function readMovies(callback) {
    fs.readdir(config.moviesDir, (err, files) => {
      if (err) {
        return callback(err, []);
      }

      let movies;
      if (files) {
        movies = files.map((file) => {
          const extension = getExtension(file);
          if (movieFormats.indexOf(extension) >= 0) {
            return file;
          }
          return false;
        });
      }
      return callback(null, movies);
    });
  }

  function readSubtitles(callback) {
    fs.readdir(config.subtitlesDir, (err, files) => {
      if (err) {
        return callback(err, []);
      }
      if (files) {
        const subtitles = files.map((file) => {
          const extension = getExtension(file);
          if (subtitleFormats.indexOf(extension) >= 0) {
            return file;
          }
          return false;
        });
        return callback(null, subtitles);
      }
      return callback('error');
    });
  }

  function subtitleRenamer(movie, subtitle) {
    const subtitleExt = getExtension(subtitle);
    const movieExt = getExtension(movie);

    const newSubtitleFilename = movie.replace(`.${movieExt}`, `.${subtitleExt}`);
    return newSubtitleFilename;
  }


  const module = {};

  module.run = function run() {
    async.parallel(
      [
        readMovies,
        readSubtitles,
      ],
      (err, results) => {
        const matches = results[0].map((movie) => {
          const match = stringSimilarity.findBestMatch(movie, results[1]);
          return {
            movieFileName: movie,
            subtitleFileName: match.bestMatch.target,
            rating: match.bestMatch.rating,
          };
        });

        console.log(' --- RESULTS --- ');
        matches.forEach((item) => {
          console.log('Movie: ', item.movieFileName);
          console.log('Subtitle: ', item.subtitleFileName);
          console.log('Rating: ', item.rating);
          let newSubtitleFilename = item.subtitleFileName;

          if (config.renameSubtitle) {
            newSubtitleFilename = subtitleRenamer(item.movieFileName, item.subtitleFileName);
            console.log('Renamed Subtitle:', item.subtitleFileName, newSubtitleFilename);
          }

          if (config.moveFiles) {
            fs.rename(
              config.moviesDir + item.movieFileName,
              config.outputDir + item.movieFileName);
            fs.rename(
              config.subtitlesDir + item.subtitleFileName,
              config.outputDir + newSubtitleFilename);
          }

          console.log('');
        });
      }
    );
  };

  return module;
};
