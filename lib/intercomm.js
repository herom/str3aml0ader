class Intercomm {
  constructor (ipcMain, loader, logger) {
    this.loader = loader;
    this.logger = logger;

    this._registerChannel(ipcMain);
  }

  _registerChannel (ipcMain) {
    ipcMain.on('load-track', (event, trackURL) => {
      this.logger.log(`Trying to load ${trackURL}`);

      const {sender} = event;
      const progressProxy = (data) => {
        this.logger.log(data);

        sender.send('download-progress', JSON.stringify(data));
      };

      this.loader.addListener('download-progress', progressProxy);

      this.loader.loadTrack(trackURL)
          .then((filePath) => sender.send('download-ready', filePath)
              .catch((err) => {
                this.logger.error(`Error loading track @"${trackURL}"`, err);

                sender.send('download-error', err);
              })
              .finally(() => this.loader.removeListener('download-progress', progressProxy));
    });
  }
}

module.exports = Intercomm;
