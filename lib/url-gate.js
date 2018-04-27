const YOUTUBE_URL_PREFIX_LIST = ['https://www.youtube.com/', 'https://youtu.be/'];

module.exports = {
  checkURL (url) {
    let isValid = false;

    for (const prefix of YOUTUBE_URL_PREFIX_LIST) {
      if (url.indexOf(prefix) === 0) {
        isValid = true;
      }
    }

    return isValid;
  }
};