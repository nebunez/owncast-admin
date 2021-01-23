// Custom component for AntDesign Button that makes an api call, then displays a confirmation icon upon 
import React, { useState, useEffect } from "react";
import { Button, Tooltip } from "antd";
import { EyeOutlined, EyeInvisibleOutlined, CheckCircleFilled, ExclamationCircleFilled } from "@ant-design/icons";
import {
  PostData,
  ChatMessageVizResponse,
  fetchData,
  UPDATE_CHAT_MESSGAE_VIZ
} from "../../utils/apis";
import { Message, OUTCOME_TIMEOUT } from "../chat";
import { isEmptyObject } from "../../utils/format";

interface MessageToggleProps {
  isVisible: boolean;
  message: Message;
  setMessage: (message: Message) => void,
};

export default function MessageVisiblityToggle({ isVisible, message, setMessage }: MessageToggleProps) {
  if (!message || isEmptyObject(message)) {
    return null;
  }

  let outcomeTimeout: NodeJS.Timeout = null;
  const [outcome, setOutcome] = useState(0);

  const { id: messageId } = message;

  const resetOutcome = () => {
    outcomeTimeout = setTimeout(() => { setOutcome(0)}, OUTCOME_TIMEOUT);
  };

  useEffect(() => {
    return () => {
      clearTimeout(outcomeTimeout);
    };
  });


  const updateChatMessage = async () => {
    clearTimeout(outcomeTimeout);
    setOutcome(0);

    const postData: PostData = {
      auth: true,
      method: 'POST',
      data: {
        visible: !isVisible,
        idArray: [messageId],
      }
    };

    const result: ChatMessageVizResponse = await fetchData(UPDATE_CHAT_MESSGAE_VIZ, postData);

    if (result.success && result.message === "changed") {
      setMessage({ ...message, visible: !isVisible });
      setOutcome(1);
    } else {
      setMessage({ ...message, visible: isVisible });
      setOutcome(-1);
    }
    resetOutcome();
  }


  let outcomeIcon = <CheckCircleFilled style={{ color: 'transparent' }} />;
  if (outcome) {
    outcomeIcon = outcome > 0 ? 
    <CheckCircleFilled style={{ color: 'var(--ant-success)' }} /> :
    <ExclamationCircleFilled style={{ color: 'var(--ant-warning)' }} />;
  }

  const toolTipMessage = `Click to ${isVisible ? 'hide' : 'show'} this message`;
  return (
    <div className={`toggle-switch ${isVisible ? '' : 'hidden'}`}>
      <span className="outcome-icon">{outcomeIcon}</span>
      <Tooltip title={toolTipMessage} placement="topRight">
        <Button
          shape="circle"
          size="small"
          type="text"
          icon={ isVisible ? <EyeOutlined /> : <EyeInvisibleOutlined /> }
          onClick={updateChatMessage}
        />
      </Tooltip>
    </div>
  );
}