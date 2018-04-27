/* eslint no-magic-numbers: 0 */

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const BPromise = require('bluebird');
const ytdl = require('ytdl-core');
const BYTE_TO_MEGABYTE = 1024 * 1024;
const SPECIAL_CHAR_WHITELIST_REGEX = /[^\w\s]/gi;
const {checkURL} = require('./url-gate');

class Loader extends EventEmitter {
  constructor (downloadPath, logger) {
    super();

    this.downloadPath = downloadPath;
    this.logger = logger;
    this.downloadOptions = {quality: 'highestaudio'};
  }

  loadTrack (trackUrl) {
    return this._validateUrl(trackUrl)
        .then(
            () => {
              return this._loadInfo(trackUrl);
            }
        )
        .then(
            (trackInfo) => {
              return this._download(trackUrl, trackInfo);
            }
        );
  }

  _validateUrl (url) {
    return new BPromise((resolve, reject) => {
      if (checkURL(url) && ytdl.validateURL(url)) {
        resolve(url);
      } else {
        reject();
      }
    });
  }

  _loadInfo (url) {
    return new BPromise((resolve, reject) => {
      ytdl.getInfo(url, this.downloadOptions, (err, info) => {
        if (err) {
          reject(err);
        } else {
          resolve(info);
        }
      });
    });
  }

  _download (url, info) {
    return new BPromise((resolve, reject) => {
      const {title} = info;
      const sanitizedTitle = title.replace(SPECIAL_CHAR_WHITELIST_REGEX, '');
      const destination = path.join(this.downloadPath, `${sanitizedTitle}.mp3`);
      const stream = ytdl.downloadFromInfo(info, this.downloadOptions);
      let hasError = false;
      let startTime = 0;

      this.logger.info(`Starting to download "${title}" into file "${destination}"`);

      stream.pipe(fs.createWriteStream(destination));

      stream.on('error', (err) => {
        this.logger.error(`Error loading "${title}"!`, err);

        hasError = true;
        reject(err);
      });

      stream.once('response', () => {
        startTime = Date.now();
      });

      stream.on('progress', (chunkLength, downloaded, total) => {
        const progress = downloaded / total;
        const duration = (Date.now() - startTime) / 60000;

        const data = {
          title,
          duration: duration.toFixed(2),
          percent: `${(progress * 100).toFixed(2)}`,
          size: `${(downloaded / BYTE_TO_MEGABYTE).toFixed(2)}`,
          estimatedTimeLeft: `${(duration / progress - duration).toFixed(2)}`
        };

        this.logger.info(`Loading "${title}" since ${duration} minutes - ${data.percent}% (${data.size}MB)...
        \nEstimated time left: ${data.estimatedTimeLeft}`, data);

        this.emit('download-progress', data);
      });

      stream.on('end', () => {
        if (hasError) {
          this.logger.error(`Failed to load "${title}", waiting for my next chance!`);
        } else {
          this.logger.info(`Finished loading "${title}"`);

          resolve(destination);
        }
      });
    });
  }
}

module.exports = Loader;