import { Table, Typography } from "antd";

import { KeyValueTableData } from '../../types';

const { Title } = Typography;

interface KeyValueTableProps {
  title: string, 
  data: KeyValueTableData[],
};

export default function KeyValueTable({ title, data }: KeyValueTableProps) {
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
    },
  ];

  return (
    <>
      <Title level={2}>{title}</Title>
      <Table pagination={false} columns={columns} dataSource={data} rowKey="name" />
    </>
  );
}
