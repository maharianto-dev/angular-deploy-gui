import { ToastSeverityEnum } from "../enums/ToastSeverity.enum";

export interface ToastListModel {
  id: number;
  severity: ToastSeverityEnum;
  message: string;
}
