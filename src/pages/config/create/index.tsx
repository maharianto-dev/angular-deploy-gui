import { invoke } from "@tauri-apps/api/tauri";
import { useEffect, useState } from "react";
import CommandExecution from "../../../components/ui/command-execution/CommandExecution";
import PathSetup from "../../../components/ui/path-setup/PathSetup";
import ToastWrapper from "../../../components/ui/toast/ToastWrapper";
import { ToastSeverityEnum } from "../../../enums/ToastSeverity.enum";
import { SetPathCommandStruct } from "../../../models/TauriCommands.model";
import {
  NoDataOrWithDataStruct,
  SetPathResultReturnStruct,
} from "../../../models/TauriReturns.model";
import { ToastListModel } from "../../../models/ToastList.model";
import { AppService } from "../../../services/App.service";

export default function CreateConfig() {
  const [fePath, setFePath] = useState(null);
  const [serverPath, setServerPath] = useState(null);
  const [toastList, setToastList] = useState([] as ToastListModel[]);
  const [projectList, setProjectList] = useState([] as String[]);
  const [selectedFePath, setSelectedFePath] = useState(null);
  const [selectedServerPath, setSelectedServerPath] = useState(null);
  const [isNxDir, setIsNxDir] = useState(false);
  const [isRunningAngularCommand, setIsRunningAngularCommand] = useState(false);

  // useEffect(() => {
  //   console.log(fePath);
  // }, [fePath]);
  // useEffect(() => {
  //   console.log(serverPath);
  // }, [serverPath]);

  useEffect(() => {
    AppService.setProjectList(projectList, true);
  }, [projectList]);

  const handlePathSetupChange = (value, type) => {
    if (type === "fepath") {
      setFePath(value);
    } else if (type === "serverpath") {
      setServerPath(value);
    }
  };

  const handleSetPathButtonClick = (event) => {
    setProjectList([]);
    //fe path is set
    if (fePath !== "") {
      // server path
      if (serverPath === "") {
        setToastList((prevToastList) => [
          ...prevToastList,
          {
            id: Math.random() * ToastSeverityEnum.WARNING,
            message:
              "Server dir path is not set, automatic deployment to server WILL NOT run",
            severity: ToastSeverityEnum.WARNING,
          } as ToastListModel,
        ]);
      }
      setPath();
    } else {
      setToastList([
        ...toastList,
        {
          id: Math.random() * ToastSeverityEnum.ERROR,
          message: "Frontend dir path is mandatory",
          severity: ToastSeverityEnum.ERROR,
        } as ToastListModel,
      ]);
    }
  };

  async function setPath() {
    const configToSend = {
      fe_path: fePath,
      server_path: serverPath,
    } as SetPathCommandStruct;
    const result = (await invoke("set_path", {
      config: configToSend,
    })) as NoDataOrWithDataStruct<SetPathResultReturnStruct>;

    if (result.NoData != null) {
      if (result.NoData.command_result) {
        setToastList((prevToastList) => [
          ...prevToastList,
          {
            id: Math.random() * ToastSeverityEnum.INFO,
            message: result.NoData.command_message,
            severity: ToastSeverityEnum.INFO,
          } as ToastListModel,
        ]);
      } else {
        setToastList((prevToastList) => [
          ...prevToastList,
          {
            id: Math.random() * ToastSeverityEnum.ERROR,
            message: result.NoData.command_message,
            severity: ToastSeverityEnum.ERROR,
          } as ToastListModel,
        ]);
      }
    } else if (result.WithData != null) {
      if (result.WithData.command_result) {
        setToastList((prevToastList) => [
          ...prevToastList,
          {
            id: Math.random() * ToastSeverityEnum.INFO,
            message: result.WithData.command_message,
            severity: ToastSeverityEnum.INFO,
          } as ToastListModel,
        ]);

        if (result.WithData.command_data != null) {
          let allProjectList = [...result.WithData.command_data?.json_value];
          setProjectList([...allProjectList]);
          setSelectedFePath(fePath);
          setSelectedServerPath(serverPath);
          setIsNxDir(result?.WithData?.command_data?.is_nx_dir);
        }
      } else {
        setToastList((prevToastList) => [
          ...prevToastList,
          {
            id: Math.random() * ToastSeverityEnum.ERROR,
            message: result.WithData.command_message,
            severity: ToastSeverityEnum.ERROR,
          } as ToastListModel,
        ]);
      }
    }
  }

  return (
    <>
      <PathSetup
        onHandlePathSetupChange={handlePathSetupChange}
        isRunningAngularCommand={isRunningAngularCommand}
      ></PathSetup>
      <div className="mt-4">
        <button
          className="btn btn-primary text-primary-content"
          onClick={handleSetPathButtonClick}
          disabled={isRunningAngularCommand}
        >
          Set Path
        </button>
      </div>
      {projectList.length > 0 && (
        <CommandExecution
          projectList={projectList}
          fePath={fePath}
          serverPath={serverPath}
          setParentToastList={setToastList}
          selectedFePath={selectedFePath}
          isNxDir={isNxDir}
          onChildRunningAngularCommand={setIsRunningAngularCommand}
          selectedServerPath={selectedServerPath}
        ></CommandExecution>
      )}
      <ToastWrapper toastList={toastList}></ToastWrapper>
    </>
  );
}
