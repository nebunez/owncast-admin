import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { STATUS, fetchData, FETCH_INTERVAL, SERVER_CONFIG } from './apis';

import { ServerConfigState } from '../types';

interface StreamDetails {
  videoCodec: string;
  videoBitrate: number;
  audioCodec: String;
  audioBitrate: number;
  encoder: string;
  framerate: number;
  width: number;
  height: number;
}

interface Broadcaster {
  remoteAddr: string;
  time: string;
  streamDetails: StreamDetails;
}

interface ServerStatusState {
  broadcastActive: boolean;
  broadcaster: Broadcaster;
  online: boolean;
  viewerCount: number;
  sessionMaxViewerCount: number;
  sessionPeakViewerCount: number;
  overallPeakViewerCount: number;
  disableUpgradeChecks: boolean;
  versionNumber: string;
}

interface ServerStatus extends ServerStatusState {
  serverConfig: ServerConfigState;
}

const initialServerConfigState: ServerConfigState = {
  instanceDetails: {
    name: "",
    title: "",
    summary: "",
    logo: "",
    version: "",
    nsfw: false
  },
  ffmpegPath: "",
  streamKey: '',
  webServerPort: 0,
  rtmpServerPort: 0,
  yp: {
    enabled: false,
  },
  s3: { enabled: false },
  videoSettings: {
    videoQualityVariants: [
      {
        audioPassthrough: false,
        videoPassthrough: false,
        videoBitrate: 0,
        audioBitrate: 0,
        framerate: 0,
        encoderPreset: ""
      }
    ],
    segmentLengthSeconds: 0,
    numberOfPlaylistItems: 0
  }
};

const initialServerStatusState: ServerStatusState = {
  broadcastActive: false,
  broadcaster: null,
  online: false,
  viewerCount: 0,
  sessionMaxViewerCount: 0,
  sessionPeakViewerCount: 0,
  overallPeakViewerCount: 0,
  disableUpgradeChecks: true,
  versionNumber: '0.0.0',
};

const initialServerStatusContext: ServerStatus = {
  serverConfig: initialServerConfigState,
  ...initialServerStatusState,
}

export const ServerStatusContext = React.createContext(initialServerStatusContext);

const ServerStatusProvider = ({ children }) => {
  const [status, setStatus] = useState(initialServerStatusState);
  const [config, setConfig] = useState(initialServerConfigState);

  const getStatus = async () => {
    try {
      const result = await fetchData(STATUS);
      setStatus({ ...result });

    } catch (error) {
      // todo
    }
  };
  const getConfig = async () => {
    try {
      const result = await fetchData(SERVER_CONFIG);
      setConfig(result);
    } catch (error) {
      // todo
    }
  };


  useEffect(() => {
    let getStatusIntervalId: NodeJS.Timeout = null;

    getStatus();
    getStatusIntervalId = setInterval(getStatus, FETCH_INTERVAL);

    getConfig();

    // returned function will be called on component unmount
    return () => {
      clearInterval(getStatusIntervalId);
    }
  }, [])

  const providerValue = {
      ...status,
      serverConfig: config,
  } as ServerStatus;
  return (
    <ServerStatusContext.Provider value={providerValue}>
      {children}
    </ServerStatusContext.Provider>
  );
}

ServerStatusProvider.propTypes = {
  children: PropTypes.element.isRequired,
};

export default ServerStatusProvider;
