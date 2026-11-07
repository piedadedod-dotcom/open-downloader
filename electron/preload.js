const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('downloader', {
  getYtDlpVersion: () => ipcRenderer.invoke('yt-dlp:version'),
  analyzeVideo: (url) => ipcRenderer.invoke('video:analyze', url),
  downloadVideo: (url, formatId, title, options, metadata) =>
    ipcRenderer.invoke('video:download', url, formatId, title, options, metadata),
  downloadPlaylist: (url, formatId, options, entries, mode) =>
    ipcRenderer.invoke(
      'video:download-playlist',
      url,
      formatId,
      options,
      entries,
      mode,
    ),
  cancelDownload: (id) => ipcRenderer.invoke('video:cancel', id),
  setDownloadsPaused: (paused) => ipcRenderer.invoke('downloads:pause', paused),
  getDownloadQueue: () => ipcRenderer.invoke('downloads:get-queue'),
  getDownloadHistory: () => ipcRenderer.invoke('downloads:get-history'),
  showDownloadedItem: (id) => ipcRenderer.invoke('downloads:show-item', id),
  openDownloadsFolder: () => ipcRenderer.invoke('downloads:open-folder'),
  openBrowserSearch: (query) => ipcRenderer.invoke('browser:open-search', query),
  getPreferences: () => ipcRenderer.invoke('preferences:get'),
  chooseDownloadDirectory: () =>
    ipcRenderer.invoke('preferences:choose-directory'),
  chooseCookiesFile: () =>
    ipcRenderer.invoke('preferences:choose-cookies-file'),
  savePreferences: (preferences) =>
    ipcRenderer.invoke('preferences:save', preferences),
  onDownloadQueueUpdated: (callback) => {
    const listener = (_event, queue) => callback(queue)
    ipcRenderer.on('download-queue-updated', listener)
    return () => ipcRenderer.removeListener('download-queue-updated', listener)
  },
  onDownloadHistoryUpdated: (callback) => {
    const listener = (_event, history) => callback(history)
    ipcRenderer.on('download-history-updated', listener)
    return () => ipcRenderer.removeListener('download-history-updated', listener)
  },
  onGlobalShortcutLink: (callback) => {
    const listener = (_event, url) => callback(url)
    ipcRenderer.on('global-shortcut-link', listener)
    return () => ipcRenderer.removeListener('global-shortcut-link', listener)
  },
  onBrowserVideoSelected: (callback) => {
    const listener = (_event, url) => callback(url)
    ipcRenderer.on('browser-video-selected', listener)
    return () => ipcRenderer.removeListener('browser-video-selected', listener)
  },
  onBrowserSearchError: (callback) => {
    const listener = (_event, message) => callback(message)
    ipcRenderer.on('browser-search-error', listener)
    return () => ipcRenderer.removeListener('browser-search-error', listener)
  },
  onPreferencesUpdated: (callback) => {
    const listener = (_event, preferences) => callback(preferences)
    ipcRenderer.on('preferences-updated', listener)
    return () => ipcRenderer.removeListener('preferences-updated', listener)
  },
  onClipboardLinkDetected: (callback) => {
    const listener = (_event, url) => callback(url)
    ipcRenderer.on('clipboard-link-detected', listener)
    return () => ipcRenderer.removeListener('clipboard-link-detected', listener)
  },
  onDownloadProgress: (callback) => {
    const listener = (_event, percent) => callback(percent)
    ipcRenderer.on('download-progress', listener)
    return () => ipcRenderer.removeListener('download-progress', listener)
  },
})
