export interface CheckConfigFileReturnStruct {
  is_found: boolean;
  message: string;
}

export interface CommandResultStruct<T> {
  command_result: boolean;
  command_message: string;
  command_data: T;
}

export interface NoDataOrWithDataStruct<T> {
  NoData?: CommandResultStruct<T>;
  WithData?: CommandResultStruct<T>;
}

export interface SetPathResultReturnStruct {
  is_nx_dir: boolean;
  json_value: String[];
}
