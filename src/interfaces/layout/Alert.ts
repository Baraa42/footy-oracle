export enum AlertType {
  SUCCESS = "success",
  INFO = "info",
  ERROR = "error",
}

export interface Alert {
  show: boolean;
  type: AlertType | string;
  title: string;
  message: string;
}
