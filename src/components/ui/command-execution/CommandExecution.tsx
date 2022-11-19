import { invoke } from "@tauri-apps/api/tauri";
import { useEffect, useState } from "react";
import { AngularCommandCustomisationEnum } from "../../../enums/AngularCommandCustomisation.enum";
import { ToastSeverityEnum } from "../../../enums/ToastSeverity.enum";
import { AppSelectionConfigStruct } from "../../../models/Config.model";
import {
  RunCommandStruct,
  SaveAppSelectionCommandStruct,
} from "../../../models/TauriCommands.model";
import {
  CommandResultStruct,
  NoDataOrWithDataStruct,
} from "../../../models/TauriReturns.model";
import { ToastListModel } from "../../../models/ToastList.model";
import IndefiniteProgressBar from "../loading/IndefiniteProgressBar";
import RunCommandActionAndResult from "./RunCommandActionAndResult";
import UseNx from "./UseNx";

export default function CommandExecution(props) {
  const {
    projectList,
    fePath,
    serverPath,
    setParentToastList,
    selectedFePath,
    isNxDir,
    onChildRunningAngularCommand,
    selectedServerPath
  } = props;

  const [useNx, setUseNx] = useState(false);
  const [skipNxCache, setSkipNxCache] = useState(false);
  const [selectedApp, setSelectedApp] = useState([]);
  const [isRunCommandOk, setIsRunCommandOk] = useState(false);
  const [isShowRunCommandResult, setIsShowRunCommandResult] = useState(false);
  const [isRunningAngularCommand, setIsRunningAngularCommand] = useState(false);
  const [successfulAppList, setSuccessfulAppList] = useState([]);

  useEffect(() => {
    setUseNx(false);
    setSkipNxCache(false);
  }, [isNxDir]);

  const handleAppSelectionChange = (event, value: string): void => {
    let data = [...selectedApp];
    if ((event.target as HTMLInputElement).checked) {
      data = [...data, value];
    } else {
      const index = data.findIndex((el) => el === value);
      if (index > -1) {
        data.splice(index, 1);
      }
    }
    setSelectedApp([...data]);
  };

  const handleCustomisationSelectionChange = (
    event,
    type: AngularCommandCustomisationEnum,
    overwriteValue?: boolean
  ): void => {
    doHandleCustomisationSelectionChange(type, overwriteValue, event);
  };

  const doHandleCustomisationSelectionChange = (
    type: AngularCommandCustomisationEnum,
    overwriteValue?: boolean,
    event?
  ) => {
    if (overwriteValue == null) {
      if (type === AngularCommandCustomisationEnum.NX) {
        setUseNx((event.target as HTMLInputElement).checked);
      } else if (type === AngularCommandCustomisationEnum.SKIPNXCACHE) {
        setSkipNxCache((event.target as HTMLInputElement).checked);
      }
    } else {
      if (isNxDir) {
        if (type === AngularCommandCustomisationEnum.NX) {
          (
            document.getElementById("checkbox-use-nx") as HTMLInputElement
          ).checked = false;
          setUseNx(overwriteValue);
        } else if (type === AngularCommandCustomisationEnum.SKIPNXCACHE) {
          (
            document.getElementById(
              "checkbox-skip-nx-cache"
            ) as HTMLInputElement
          ).checked = false;
          setSkipNxCache(overwriteValue);
        }
      }
    }
  };

  const handleRunButtonClick = (): void => {
    const data = {
      fe_path: fePath,
      server_path: serverPath,
      selected_app: selectedApp,
      use_nx: useNx,
      skip_nx_cache: skipNxCache,
      is_nx_dir: isNxDir,
    } as RunCommandStruct;

    setIsShowRunCommandResult(false);
    setIsRunCommandOk(false);

    doRunCommand(data);
  };

  const clearAllAppCheckedSelection = (): void => {
    projectList.forEach((el) => {
      (document.getElementById(`checkbox-${el}`) as HTMLInputElement).checked =
        false;
    });
  };

  const clearAppSelectionAndNxSettings = (): void => {
    clearAllAppCheckedSelection();
    setSelectedApp([]);
    doHandleCustomisationSelectionChange(
      AngularCommandCustomisationEnum.NX,
      false
    );
    doHandleCustomisationSelectionChange(
      AngularCommandCustomisationEnum.SKIPNXCACHE,
      false
    );
  };

  const doRunCommand = async (data: RunCommandStruct): Promise<void> => {
    setIsRunningAngularCommand(true);
    onChildRunningAngularCommand(true);

    const result = (await invoke("run_angular_command", {
      runCommand: data,
    })) as CommandResultStruct<null>;

    setIsShowRunCommandResult(true);
    setIsRunCommandOk(result?.command_result || false);
    setIsRunningAngularCommand(false);
    onChildRunningAngularCommand(false);

    if (result.command_result === true) {
      setParentToastList((prevToastList) => [
        ...prevToastList,
        {
          id: Math.random() * ToastSeverityEnum.SUCCESS,
          message: result.command_message,
          severity: ToastSeverityEnum.SUCCESS,
        } as ToastListModel,
      ]);
      setSuccessfulAppList([...selectedApp]);
      clearAppSelectionAndNxSettings();
    } else {
      setParentToastList((prevToastList) => [
        ...prevToastList,
        {
          id: Math.random() * ToastSeverityEnum.ERROR,
          message: result.command_message,
          severity: ToastSeverityEnum.ERROR,
        } as ToastListModel,
      ]);
    }
  };

  const handleSaveAppSelectionConfig = async (event): Promise<void> => {
    const body = {
      fe_path: selectedFePath,
      app_selection: selectedApp,
    } as SaveAppSelectionCommandStruct;
    const result = (await invoke("save_app_selection_config", {
      saveAppCommand: body,
    })) as CommandResultStruct<null>;
    if (result.command_result === true) {
      setParentToastList((prevToastList) => [
        ...prevToastList,
        {
          id: Math.random() * ToastSeverityEnum.SUCCESS,
          message: result.command_message,
          severity: ToastSeverityEnum.SUCCESS,
        } as ToastListModel,
      ]);
    } else {
      setParentToastList((prevToastList) => [
        ...prevToastList,
        {
          id: Math.random() * ToastSeverityEnum.ERROR,
          message: result.command_message,
          severity: ToastSeverityEnum.ERROR,
        } as ToastListModel,
      ]);
    }
  };

  const doSetCheckedStatusForSelectedApp = (
    selectedAppFromConfig: String[]
  ): void => {
    clearAllAppCheckedSelection();
    if (selectedAppFromConfig.every((el) => projectList.includes(el))) {
      selectedAppFromConfig.forEach((el) => {
        (
          document.getElementById(`checkbox-${el}`) as HTMLInputElement
        ).checked = true;
      });
    } else {
      setParentToastList((prevToastList) => [
        ...prevToastList,
        {
          id: Math.random() * ToastSeverityEnum.WARNING,
          message: `App selection config data does not match with current frontend dir. Clearing all selection`,
          severity: ToastSeverityEnum.WARNING,
        } as ToastListModel,
      ]);
    }
  };

  const handleLoadAppSelectionConfig = async (event): Promise<void> => {
    setSelectedApp([]);
    doSetCheckedStatusForSelectedApp([]);
    const result = (await invoke("load_app_selection_config", {
      fePath: selectedFePath,
    })) as NoDataOrWithDataStruct<AppSelectionConfigStruct>;
    if (result?.WithData != null) {
      if (result.WithData.command_result === true) {
        setParentToastList((prevToastList) => [
          ...prevToastList,
          {
            id: Math.random() * ToastSeverityEnum.SUCCESS,
            message: result?.WithData.command_message,
            severity: ToastSeverityEnum.SUCCESS,
          } as ToastListModel,
        ]);
        if (
          result?.WithData?.command_data?.app_names.every((el) =>
            projectList.includes(el)
          )
        ) {
          setSelectedApp([...result?.WithData?.command_data?.app_names]);
        } else {
          setSelectedApp([]);
        }
        doSetCheckedStatusForSelectedApp([
          ...result?.WithData?.command_data?.app_names,
        ]);
      } else {
        setParentToastList((prevToastList) => [
          ...prevToastList,
          {
            id: Math.random() * ToastSeverityEnum.ERROR,
            message: result.WithData.command_message,
            severity: ToastSeverityEnum.ERROR,
          } as ToastListModel,
        ]);
      }
    } else if (result?.NoData != null) {
      if (result?.NoData.command_result === true) {
        setParentToastList((prevToastList) => [
          ...prevToastList,
          {
            id: Math.random() * ToastSeverityEnum.SUCCESS,
            message: result?.NoData.command_message,
            severity: ToastSeverityEnum.SUCCESS,
          } as ToastListModel,
        ]);
      } else {
        setParentToastList((prevToastList) => [
          ...prevToastList,
          {
            id: Math.random() * ToastSeverityEnum.ERROR,
            message: result?.NoData.command_message,
            severity: ToastSeverityEnum.ERROR,
          } as ToastListModel,
        ]);
      }
    }
  };

  return (
    <>
      <div className="divider divide-primary-content"></div>
      <div className="card border-2 border-primary overflow-y-auto h-2/4 max-h-[75%] w-full max-w-screen-2xl bg-neutral shadow-xl">
        <div className="card-body">
          <div className="flex">
            <h2 className="card-title text-primary-content">
              Application List
            </h2>
            <div className="ml-auto">
              <button
                className="btn btn-primary text-primary-content"
                onClick={handleSaveAppSelectionConfig}
                disabled={isRunningAngularCommand}
              >
                Save Selection
              </button>
              &nbsp;
              <button
                className="btn btn-primary text-primary-content"
                onClick={handleLoadAppSelectionConfig}
                disabled={isRunningAngularCommand}
              >
                Load Selection
              </button>
            </div>
          </div>
          <div className="divider divide-primary-content"></div>
          {projectList.map((row, index) => {
            return (
              <div
                key={index}
                className={`form-control w-full max-w-screen-2xl ${
                  !(index % 2) ? "rounded-md bg-primary" : null
                }`}
              >
                <label className="label cursor-pointer">
                  <span className={`label-text text text-primary-content`}>
                    {row}
                  </span>
                  <input
                    id={`checkbox-${row}`}
                    type="checkbox"
                    className={`checkbox ${
                      index % 2 ? "checkbox-info" : "checkbox-info"
                    }`}
                    disabled={isRunningAngularCommand}
                    onChange={(e) => handleAppSelectionChange(e, row)}
                  />
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {isNxDir && (
        <UseNx
          onHandleUseNxChange={handleCustomisationSelectionChange}
          onHandleSkipNxCacheChange={handleCustomisationSelectionChange}
          useNxSelection={useNx}
          isRunningAngularCommand={isRunningAngularCommand}
        ></UseNx>
      )}

      {isRunningAngularCommand && (
        <IndefiniteProgressBar></IndefiniteProgressBar>
      )}
      {!isRunningAngularCommand && (
        <RunCommandActionAndResult
          selectedApp={selectedApp}
          onHandleRunButtonClick={handleRunButtonClick}
          isShowRunCommandResult={isShowRunCommandResult}
          isRunCommandOk={isRunCommandOk}
          onHandleShowRunCommandResult={setIsShowRunCommandResult}
          selectedFePath={selectedFePath}
          selectedServerPath={selectedServerPath}
          successfulAppList={successfulAppList}
        ></RunCommandActionAndResult>
      )}
    </>
  );
}
