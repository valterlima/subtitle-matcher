module.exports = function(options){
  var fs = require('fs');
  var async = require('async');
  var stringSimilarity = require('string-similarity');
  var movieFormats = ['mkv', 'mp4', 'avi'];
  var subtitleFormats = ['srt', 'txt', 'sub'];
  
  var config = {
    moviesDir : options.moviesDir || 'files/movies/',
    subtitlesDir : options.subtitlesDir || 'files/subtitles/',
    outputDir : options.outputDir || 'files/output/',
    renameSubtitle : typeof options.renameSubtitle !== 'undefined' ? options.renameSubtitle : true,
    moveFiles : typeof options.moveFiles !== 'undefined' ? options.moveFiles : true
  }

  var module = {};

  module.run = function(){
    async.parallel(
      [
        readMovies,
        readSubtitles
      ],  
      function getMatches(err, results){
        var match;
        var matches = results[0].map(function(movie){
          match = stringSimilarity.findBestMatch(movie, results[1]);
          return {
            movieFileName: movie, 
            subtitleFileName: match.bestMatch.target,
            rating: match.bestMatch.rating
          };
        });

        (function moveFiles(matches){
          var subtitleFileName;
          console.log(' --- RESULTS --- ');
          matches.forEach(function(item){
            console.log('Movie: ', item.movieFileName);
            console.log('Subtitle: ', item.subtitleFileName);
            console.log('Rating: ', item.rating);

            if (config.renameSubtitle){
              newSubtitleFilename = subtitleRenamer(item.movieFileName, item.subtitleFileName);
              console.log('Renamed Subtitle:', item.subtitleFileName, newSubtitleFilename)
            }
            else{
              newSubtitleFilename = item.subtitleFileName;
            }

            if (config.moveFiles){
              fs.rename(config.moviesDir + item.movieFileName, config.outputDir + item.movieFileName);
              fs.rename(config.subtitlesDir + item.subtitleFileName, config.outputDir + newSubtitleFilename);
            }

            console.log('');
          })
        })(matches);
      }
    );

    function readMovies(callback){
      fs.readdir(config.moviesDir, function(err, files){
        if (err) {
          return callback(err, []);
        }

        if (files){
          var movies = files.map(function(file){
            var extension = getExtension(file);
            if (movieFormats.indexOf(extension) >= 0){
              return file;
            }
          });
          callback(null, movies);
        }
      });
    } 

    function readSubtitles(callback){
      fs.readdir(config.subtitlesDir, function(err, files){
        if (err) {
          return callback(err, []);
        }
        if (files){
          var subtitles = files.map(function(file){
            var extension = getExtension(file);
            if (subtitleFormats.indexOf(extension) >= 0){
              return file;
            }
          });
          callback(null, subtitles);
        }
      });
    }
  }

  function subtitleRenamer(movie, subtitle){
    var subtitleExt = getExtension(subtitle);
    var movieExt = getExtension(movie);

    var newSubtitleFilename = movie.replace('.' + movieExt, '.' + subtitleExt);
    return newSubtitleFilename;
  }

  function getExtension(filename){
    var temp = filename.split('.');
    return temp[temp.length-1];
  }

  return module;
}