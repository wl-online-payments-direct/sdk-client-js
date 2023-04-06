export interface Metadata {
  readonly screenSize: string;
  readonly platformIdentifier: string;
  readonly sdkIdentifier: string;
  readonly sdkCreator: string;
}

export interface BrowserData {
  readonly javaScriptEnabled: true;
  readonly colorDepth: number;
  readonly screenHeight: number;
  readonly screenWidth: number;
  readonly innerHeight: number;
  readonly innerWidth: number;
}

export interface DeviceInformation {
  readonly timezoneOffsetUtcMinutes: number;
  readonly locale: string;
  readonly browserData: BrowserData;
}
