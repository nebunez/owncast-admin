// Updating a variant will post ALL the variants in an array as an update to the API.

// todo : add DELETE option
import React, { useContext, useState } from 'react';
import { Typography, Table, Modal, Button } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { ServerStatusContext } from '../../../utils/server-status-context';
import { UpdateArgs, VideoVariant } from '../../../types/config-section';
import VideoVariantForm from './video-variant-form';
import { API_VIDEO_VARIANTS, DEFAULT_VARIANT_STATE, SUCCESS_STATES, RESET_TIMEOUT,postConfigUpdateToAPI } from './constants';

const { Title } = Typography;

export default function CurrentVariantsTable() {
  const [displayModal, setDisplayModal] = useState(false);
  const [modalProcessing, setModalProcessing] = useState(false);
  const [editId, setEditId] = useState(0);

  // current data inside modal
  const [modalDataState, setModalDataState] = useState(DEFAULT_VARIANT_STATE);
  
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitStatusMessage, setSubmitStatusMessage] = useState('');

  const serverStatusData = useContext(ServerStatusContext);
  const { serverConfig, setFieldInConfigState } = serverStatusData || {};
  const { videoSettings } = serverConfig || {};
  const { videoQualityVariants } = videoSettings || {};

  let resetTimer = null;

  if (!videoSettings) {
    return null;
  }

  const resetStates = () => {
    setSubmitStatus(null);
    setSubmitStatusMessage('');
    resetTimer = null;
    clearTimeout(resetTimer);
  }

  const handleModalCancel = () => {
    setDisplayModal(false);
    setEditId(-1);
    setModalDataState(DEFAULT_VARIANT_STATE);
  }

  // posts all the variants at once as an array obj
  const postUpdateToAPI = async (postValue: any) => {
    await postConfigUpdateToAPI({
      apiPath: API_VIDEO_VARIANTS,
      data: { value: postValue },
      onSuccess: () => {
        setFieldInConfigState({ fieldName: 'videoQualityVariants', value: postValue, path: 'videoSettings' });

        // close modal
        setModalProcessing(false);
        handleModalCancel();

        setSubmitStatus('success');
        setSubmitStatusMessage('Variants updated.');
        resetTimer = setTimeout(resetStates, RESET_TIMEOUT);
      },
      onError: (message: string) => {
        setSubmitStatus('error');
        setSubmitStatusMessage(message);
        resetTimer = setTimeout(resetStates, RESET_TIMEOUT);
      },
    });
  };

  // on Ok, send all of dataState to api
  // show loading
  // close modal when api is done
  const handleModalOk = () => {
    setModalProcessing(true);
    
    const postData = [
      ...videoQualityVariants,
    ];
    if (editId === -1) {
      postData.push(modalDataState);
    } else {
      postData.splice(editId, 1, modalDataState);
    }
    postUpdateToAPI(postData);
  }

  const handleUpdateField = ({ fieldName, value }: UpdateArgs) => {
    setModalDataState({
      ...modalDataState,
      [fieldName]: value,
    });
  }

  const {
    icon: newStatusIcon = null,
    message: newStatusMessage = '',
  } = SUCCESS_STATES[submitStatus] || {};
  
  const videoQualityColumns: ColumnsType<VideoVariant>  = [
    {
      title: "#",
      dataIndex: "key",
      key: "key"
    },
    {
      title: "Video bitrate",
      dataIndex: "videoBitrate",
      key: "videoBitrate",
      render: (bitrate: number) =>
        !bitrate ? "Same as source" : `${bitrate} kbps`,
    },

    {
      title: "Encoder preset",
      dataIndex: "encoderPreset",
      key: "encoderPreset",
      render: (preset: string) =>
        !preset ? "n/a" : preset,
    },
    {
      title: '',
      dataIndex: '',
      key: 'edit',
      render: (data: VideoVariant) => (
        <Button type="primary" size="small" onClick={() => {
          const index = data.key - 1;
          setEditId(index);
          setModalDataState(videoQualityVariants[index]);
          setDisplayModal(true);
        }}>
          Edit
        </Button>
      ),
    },
  ];

  const statusMessage = (
    <div className={`status-message ${submitStatus || ''}`}>
      {newStatusIcon} {newStatusMessage} {submitStatusMessage}
    </div>
  );

  const videoQualityVariantData = videoQualityVariants.map((variant, index) => ({ key: index + 1, ...variant }));

  return (
    <>
      <Title level={3}>Current Variants</Title>
      
      {statusMessage}

      <Table
        pagination={false}
        size="small"
        columns={videoQualityColumns}
        dataSource={videoQualityVariantData}
      />

      <Modal
        title="Edit Video Variant Details"
        visible={displayModal}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={modalProcessing}
      >
        <VideoVariantForm
          dataState={{...modalDataState}}
          onUpdateField={handleUpdateField}
        />
        
        {statusMessage}
      </Modal>
      <br />
      <Button type="primary" onClick={() => {
          setEditId(-1);
          setModalDataState(DEFAULT_VARIANT_STATE);
          setDisplayModal(true);
        }}>
        Add a new variant
      </Button>

    </>
  );
}