(function () {
  const checkURL = (str) => {
    return str.indexOf('http') === 0;
  };

  const {ipcRenderer, remote, clipboard} = require('electron');
  const {Menu, MenuItem} = remote;
  const $presentation = document.getElementById('presentation');
  const $streamInput = document.getElementById('ipt-stream');
  const $loadButton = document.getElementById('btn-load');
  // const $versionInfo = document.getElementById('version-info');
  const $downloadInfo = document.getElementById('download-info-text');
  const $downloadProgress = document.getElementById('download-info-progress');
  const $listButton = document.getElementById('btn-add-list');
  const $listDownloadButton = document.getElementById('btn-load-list');
  const downloads = new Set();
  const contextMenu = new Menu();
  contextMenu.append(new MenuItem({label: 'Paste URL', click () {
    const cContent = clipboard.readText();

      if (checkURL(cContent)) {
        $streamInput.value = cContent;

        $loadButton.removeAttribute('disabled');
        $listButton.removeAttribute('disabled');
      }
  }}));

  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    contextMenu.popup();
  });

  $loadButton.setAttribute('disabled', true);
  $listButton.setAttribute('disabled', true);

  // $versionInfo.textContent = remote.app.getVersion();


  $streamInput.oninput = ({target}) => {
    const isDisabled = !target || !target.value;

    if (isDisabled) {
      $loadButton.setAttribute('disabled', isDisabled);
      $listButton.setAttribute('disabled', isDisabled);
    } else {
      $loadButton.removeAttribute('disabled');
      $listButton.removeAttribute('disabled');
    }
  };

  $loadButton.onclick = () => {
    const url = $streamInput.value;

    if (!url) {
      return false;
    } else if (!checkURL(url)) {
      //TODO show error!
      return false;
    }

    ipcRenderer.send('load-track', url);

    ipcRenderer.on('download-progress', (sender, dataStr) => {
      try {
        const {title, duration, percent, size} = JSON.parse(dataStr);

        $downloadInfo.textContent = `Downloading "${title}" (${duration} min.)`;

        $downloadProgress.setAttribute('value', percent);
        $downloadProgress.setAttribute('data-label', `${percent}% / ${size}MB`);
      } catch (err) {
        $downloadInfo.textContent = err;
      }
    });

    ipcRenderer.on('download-ready', (sender, filePath) => {
      $downloadInfo.textContent = `"${filePath}" downloaded`;
    });

    ipcRenderer.on('download-error', (sender, err) => {
      $downloadInfo.textContent = `Error loading audio track - ${err}`;
    });
  };

  $listButton.onclick = () => {
    const trackURL = $streamInput.value;

    if (checkURL(trackURL)) {
      downloads.add(trackURL);
      const $downloadList = document.getElementById('download-list');
      const $listEntry = document.createElement('li');

      $listEntry.textContent = trackURL;

      $downloadList.appendChild($listEntry);
    }
  };

  $listDownloadButton.onclick = () => {
    if (downloads.size !== 0) {
      for (const download of downloads.entries()) {
        //TODO fill download queue!
      }
    }
  }
})();