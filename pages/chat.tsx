import React, { useState, useEffect } from "react";
import { Table, Typography, Tooltip, Button } from "antd";
import { CheckCircleFilled, ExclamationCircleFilled } from "@ant-design/icons";
import classNames from 'classnames';
import { ColumnsType } from 'antd/es/table';
import { ColumnFilterItem } from 'antd/es/table/interface';
import format from 'date-fns/format'

import { ChatMessageVizData, ChatMessageVizResponse, PostData } from '../types';

import {
  CHAT_HISTORY,
  FETCH_INTERVAL,
  UPDATE_CHAT_MESSGAE_VIZ,
  fetchData,
} from "../utils/apis";
import { isEmptyObject } from "../utils/format";
import MessageVisiblityToggle from "./components/message-visiblity-toggle";

const { Title } = Typography;

export interface Message {
  author: string;
  body: string;
  id: string;
  key: string;
  name: string;
  timestamp: string;
  type: string;
  visible: boolean;
}

function createUserNameFilters(messages: Message[]) {
  const filtered: ColumnFilterItem[] = messages.reduce((acc, curItem) => {
    const curAuthor = curItem.author;
    if (!acc.some(item => item.text === curAuthor)) {
      acc.push({ text: curAuthor, value: curAuthor });
    }
    return acc;
  }, [] as ColumnFilterItem[]);

  // sort by value
  return filtered.sort((a, b) => {
    // ignore upper and lowercase if our values are of type 'string'
    const valueA = (typeof a.value === 'string')
      ? a.value.toUpperCase()
      : a.value;
    const valueB = (typeof b.value === 'string')
      ? b.value.toUpperCase()
      : b.value;

    if (valueA < valueB) {
      return -1;
    }
    if (valueA > valueB) {
      return 1;
    }
    // values must be equal
    return 0;
  });
}
export const OUTCOME_TIMEOUT = 3000;

export default function Chat() {
  const [messages, setMessages] = useState([] as Message[]);
  const [selectedRowKeys, setSelectedRows] = useState([] as string[]);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkOutcome, setBulkOutcome] = useState(null as React.ReactNode);
  const [bulkAction, setBulkAction] = useState('');
  let outcomeTimeout = null as NodeJS.Timeout;
  let chatReloadInterval = null as NodeJS.Timeout;

  const getInfo = async () => {
    try {
      const result: Message[] = await fetchData(CHAT_HISTORY, { auth: true });
      if (isEmptyObject(result)) {
        setMessages([]);
      } else {
        setMessages(result);
      }
    } catch (error) {
      console.log("==== error", error);
    }
  };

  useEffect(() => {
    getInfo();

    chatReloadInterval = setInterval(() => {
      getInfo();
    }, FETCH_INTERVAL);

    return () => {
      clearTimeout(outcomeTimeout);
      clearTimeout(chatReloadInterval);
    };
  }, []);

  const nameFilters = createUserNameFilters(messages);

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: string[]) => {
      setSelectedRows(selectedKeys);
    },
  };

  const updateMessage = message => {		
    const messageIndex = messages.findIndex(m => m.id === message.id);	
    messages.splice(messageIndex, 1, message)		
    setMessages([...messages]);		
  };

  const resetBulkOutcome = () => {
    outcomeTimeout = setTimeout(() => {
      setBulkOutcome(null);
      setBulkAction('');
    }, OUTCOME_TIMEOUT);
  };
  const handleSubmitBulk = async (bulkVisibility: boolean) => {
    setBulkProcessing(true);

    const postData: PostData = {
      auth: true,
      method: 'POST',
      data: {
        visible: bulkVisibility,
        idArray: selectedRowKeys,
      }
    }
    const result: ChatMessageVizResponse = await fetchData(UPDATE_CHAT_MESSGAE_VIZ, postData);

    if (result.success && result.message === "changed") {
      setBulkOutcome(<CheckCircleFilled />);
      resetBulkOutcome();

      // update messages
      const updatedList = [...messages];
      selectedRowKeys.map(key => {
        const messageIndex = updatedList.findIndex(m => m.id === key);
        const newMessage: Message = {...messages[messageIndex], visible: bulkVisibility };
        updatedList.splice(messageIndex, 1, newMessage);
        return null;
      });
      setMessages(updatedList);
      setSelectedRows([]);
    } else {
      setBulkOutcome(<ExclamationCircleFilled />);
      resetBulkOutcome();
    }
    setBulkProcessing(false);
  }
  const handleSubmitBulkShow = () => {
    setBulkAction('show');
    handleSubmitBulk(true);
  }
  const handleSubmitBulkHide = () => {
    setBulkAction('hide');
    handleSubmitBulk(false);
  }

  const chatColumns: ColumnsType<Message> = [
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      className: 'timestamp-col',
      defaultSortOrder: 'descend',
      render: (timestamp) => {
        const dateObject = new Date(timestamp);
        return format(dateObject, 'PP pp');
      },
      sorter: (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      width: 90,
    },
    {
      title: 'User',
      dataIndex: 'author',
      key: 'author',
      className: 'name-col',
      filters: nameFilters,
      onFilter: (value, record) => record.author === value,
      sorter: (a, b) => a.author.localeCompare(b.author),
      sortDirections: ['ascend', 'descend'],
      ellipsis: true,
      render: author => (
        <Tooltip placement="topLeft" title={author}>
          {author}
        </Tooltip>
      ),
      width: 110,
    },
    {
      title: 'Message',
      dataIndex: 'body',
      key: 'body',
      className: 'message-col',
      width: 320,
      render: body => (
        <div
          className="message-contents"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: body }}
        />
      )
    },
    {
      title: '',
      dataIndex: 'visible',
      key: 'visible',
      className: 'toggle-col',
      filters: [{ text: 'Visible messages', value: true }, { text: 'Hidden messages', value: false }],
      onFilter: (value, record) => record.visible === value,
      render: (visible, record) => (
        <MessageVisiblityToggle
          isVisible={visible}
          message={record}
          setMessage={updateMessage}
        />
      ),
      width: 30,
    },
  ];

  const bulkDivClasses = classNames({
    'bulk-editor': true,
    active: selectedRowKeys.length,
  });

  /** TODO: Find documentation for the error below,
   * and document here with an eslint-disable comment
  */
  return (
    <div className="chat-messages">
      <Title level={2}>Chat Messages</Title>
      <p>Manage the messages from viewers that show up on your stream.</p>
      <div className={bulkDivClasses}>
        <span className="label">Check multiple messages to change their visibility to: </span>

        <Button
          type="primary"
          size="small"
          shape="round"
          className="button"
          loading={bulkAction === 'show' && bulkProcessing}
          icon={bulkAction === 'show' && bulkOutcome}
          disabled={!selectedRowKeys.length || (bulkAction && bulkAction !== 'show')}
          onClick={handleSubmitBulkShow}
        >
          Show
        </Button>
        <Button
          type="primary"
          size="small"
          shape="round"
          className="button"
          loading={bulkAction === 'hide' && bulkProcessing}
          icon={bulkAction === 'hide' && bulkOutcome}
          disabled={!selectedRowKeys.length || (bulkAction && bulkAction !== 'hide')}
          onClick={handleSubmitBulkHide}
        >
          Hide
        </Button>
      </div>
      <Table
        size="small"
        className="messages-table"
        pagination={{ pageSize: 100 }}
        scroll={{ y: 540 }}
        rowClassName={(record: ChatMessageVizData) => !record.visible ? 'hidden' : ''}
        dataSource={messages}
        columns={chatColumns}
        rowKey={(record: Message) => record.id}
        rowSelection={rowSelection}
      />
  </div>)
}
