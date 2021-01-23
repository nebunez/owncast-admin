import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Table, Typography } from "antd";
import { ColumnsType } from 'antd/es/table';
import { getGithubRelease } from "../utils/apis";

const { Title } = Typography;

interface Asset {
  /* eslint-disable camelcase */
  name: string;
  size: string;
  browser_download_url: string;
  /* eslint-enable camelcase */
}

interface AssetTableProps {
  assets: Asset[];
}

function AssetTable({assets}: AssetTableProps) {
  const columns: ColumnsType<Asset> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, entry) =>
        <a href={entry.browser_download_url}>{text}</a>,
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      render: (text) => (`${(text/1024/1024).toFixed(2)} MB`),
    },
  ];

  return <Table dataSource={assets} columns={columns} rowKey="id" size="large" pagination={false} />
}

interface Release {
  /* eslint-disable camelcase */
  html_url: string;
  name: string;
  created_at: Date;
  body: string;
  assets: Asset[];
  /* eslint-enable camelcase */
}

const initialRelease: Release = {
  html_url: "",
  name: "",
  created_at: null,
  body: "",
  assets: [],
}

export default function Upgrade() {
  const [release, setRelease] = useState(initialRelease);

  const getRelease = async () => {
    try {
      const result = await getGithubRelease();
      setRelease(result);
    } catch (error) {
      console.log("==== error", error);
    }
  };

  useEffect(() => {
    getRelease();
  }, []);

  if (!release) {
    return null;
  }

  return (
    <div>
      <Title level={2}>
        <a href={release.html_url}>{release.name}</a>
      </Title>
      <Title level={5}>{new Date(release.created_at).toDateString()}</Title>
      <ReactMarkdown>{release.body}</ReactMarkdown><h3>Downloads</h3>
      <AssetTable assets={release.assets} />
    </div>
  );
}

