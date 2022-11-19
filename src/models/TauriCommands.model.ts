export interface SetPathCommandStruct {
  fe_path: string;
  server_path: string;
}

export interface RunCommandStruct {
  fe_path: string;
  server_path: string;
  selected_app: String[];
  use_nx: boolean;
  skip_nx_cache: boolean;
  is_nx_dir: boolean;
}

export interface SaveAppSelectionCommandStruct {
  fe_path: string;
  app_selection: String[];
}
