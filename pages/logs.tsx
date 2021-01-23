import React, { useState, useEffect } from "react";
import LogTable from "./components/log-table";

import {
  LOGS_ALL,
  fetchData,
} from "../utils/apis";

const FETCH_INTERVAL = 5 * 1000; // 5 sec

export interface Log {
  message: string;
  level: string;
  time: string;
}

export default function Logs() {
  const [logs, setLogs] = useState([] as Log[]);

  const getInfo = async () => {
    try {
      const result: Log[] = await fetchData(LOGS_ALL);
      setLogs(result);
    } catch (error) {
      console.log("==== error", error);
    }
  };

  useEffect(() => {
    let getStatusIntervalId: NodeJS.Timeout = null;

    setInterval(getInfo, FETCH_INTERVAL);
    getInfo();

    getStatusIntervalId = setInterval(getInfo, FETCH_INTERVAL);
    // returned function will be called on component unmount
    return () => {
      clearInterval(getStatusIntervalId);
    };
  }, []);

  return <LogTable logs={logs} pageSize={20}/>;  
}

