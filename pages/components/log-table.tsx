import React from "react";
import { Table, Tag, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import Linkify from "react-linkify";
import { SortOrder } from "antd/lib/table/interface";
import format from 'date-fns/format'

import { Log } from '../../types';

const { Title } = Typography;

function renderColumnLevel(text: string, entry: Log) {
  let color = 'black';

  if (entry.level === "warning") {
    color = "orange";
  } else if (entry.level === 'error') {
    color = "red";
  }

  return <Tag color={color}>{text}</Tag>;
}

function renderMessage(text: string) {
  return (
    <Linkify>{text}</Linkify>
  )
}

interface LogTableProps {
  logs: Log[],
  pageSize: number
}

export default function LogTable({ logs, pageSize }: LogTableProps) {
  if (!logs.length) {
    return null;
  }
  const columns: ColumnsType<Log> = [
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
      filters: [
        {
          text: "Info",
          value: "info",
        },
        {
          text: "Warning",
          value: "warning",
        },
        {
          text: "Error",
          value: "Error",
        },
      ],
      onFilter: (level, row) => level === row.level,
      render: renderColumnLevel,
    },
    {
      title: "Timestamp",
      dataIndex: "time",
      key: "time",
      render: (timestamp) => {
        const dateObject = new Date(timestamp);
        return format(dateObject, 'p P');
      },
      sorter: (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
      sortDirections: ["descend", "ascend"] as SortOrder[],
      defaultSortOrder: "descend" as SortOrder,
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      render: renderMessage,
    },
  ];

  return (
    <div className="logs-section">
      <Title level={2}>Logs</Title>
      <Table
        size="middle"
        dataSource={logs}
        columns={columns}
        rowKey={(row) => row.time}
        pagination={{ pageSize: pageSize || 20 }}
      />
    </div>
  );
}
