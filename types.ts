export interface ChatMessageVizData {
  visible: boolean;
  idArray: string[];
}

export interface ChatMessageVizResponse {
  message: string;
  success: boolean;
}

export interface PostData {
  auth: boolean;
  method: string;
  data: ChatMessageVizData;
}

export interface SocialHandle {
  platform: string;
  url: string;
}

export interface VideoQualityVariant {
  audioPassthrough: boolean;
  videoPassthrough: boolean;
  videoBitrate: number;
  audioBitrate: number;
  framerate: number;
  encoderPreset: string;
}

export interface VideoSettings {
  videoQualityVariants: VideoQualityVariant[];
  segmentLengthSeconds: number;
  numberOfPlaylistItems: number;
}

interface InstanceDetails {
  name: string;
  title: string;
  summary: string;
  logo: string;
  tags?: string[];
  version: string;
  nsfw: boolean;
  socialHandles?: SocialHandle[];
  extraPageContent?: string;
}

interface S3 {
  enabled: boolean;
  endpoint?: string;
  servingEndpoint?: string;
  accessKey?: string;
  secret?: string;
  bucket?: string;
  region?: string;
  acl?: string;
}

interface YP {
  enabled: boolean;
  instanceURL?: string;
}

export interface ServerConfigState {
  instanceDetails: InstanceDetails;
  ffmpegPath: string;
  streamKey: string;
  webServerPort: number;
  rtmpServerPort: number;
  s3: S3;
  videoSettings: VideoSettings;
  yp: YP;
}

export interface Log {
  message: string;
  level: string;
  time: string;
}

export interface TimedValue {
  time: string;
  value: number;
}

export interface KeyValueTableData {
  name: string;
  value: string | number;
}
