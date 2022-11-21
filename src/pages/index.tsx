import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import {
  CheckConfigFileReturnStruct,
  CommandResultStruct,
} from "../models/TauriReturns.model";
import { useRouter } from "next/router";
import Modal from "../components/ui/modal/Modal";
import CheckConfigResultModalContent from "../components/ui/modal/CheckConfigResultModalContent";
import ToastWrapper from "../components/ui/toast/ToastWrapper";
import { ToastListModel } from "../models/ToastList.model";
import { ModalSelectionEnum } from "../enums/ModalSelection.enum";
import { ToastSeverityEnum } from "../enums/ToastSeverity.enum";

function App() {
  const router = useRouter();

  const [configResultMessage, setConfigResultMessage] = useState("");
  const [modalSelection, setModalSelection] = useState();
  const [toastList, setToastList] = useState([] as ToastListModel[]);

  useEffect(() => {
    initConfig();
    document.addEventListener('contextmenu', event => event.preventDefault());
  }, []);

  useEffect(() => {
    if (modalSelection === ModalSelectionEnum.YES) {
      // setToastList([
      //   ...toastList,
      //   {
      //     id: Math.random() * ToastSeverityEnum.INFO,
      //     message: "Create config file",
      //     severity: ToastSeverityEnum.INFO,
      //   } as ToastListModel,
      // ]);

      router.push("/config/create");
    } else if (modalSelection === ModalSelectionEnum.NO) {
      // setToastList([
      //   ...toastList,
      //   {
      //     id: Math.random() * ToastSeverityEnum.INFO,
      //     message: "Config file not created",
      //     severity: ToastSeverityEnum.INFO,
      //   } as ToastListModel,
      // ]);
      router.push("/config/create");
    }
    setModalSelection(null);
  }, [modalSelection]);

  const handleModalSelection = useCallback((selection) => {
    setModalSelection(selection);
  }, []);

  async function initConfig() {
    const result = (await invoke(
      "init_config"
    )) as CommandResultStruct<CheckConfigFileReturnStruct>;
    if (result.command_result) {
      // if (result?.command_data?.is_found) {
      //   router.push("/config/create");
      // } else {
      //   setConfigResultMessage(result?.command_data?.message);
      //   (
      //     document.getElementById("my-global-modal") as HTMLInputElement
      //   ).checked = true;
      // }
      router.push("/config/create");
    }
  }

  return (
    <>
      <Modal
        message={
          <>
            <CheckConfigResultModalContent
              configResultMessage={configResultMessage}
              onModalSelection={handleModalSelection}
            ></CheckConfigResultModalContent>
            <p className="text-error">Feature is still in development</p>
            <p className="text-error">Selecting both will result in config file not being created</p>
          </>
        }
      ></Modal>

      <ToastWrapper toastList={toastList}></ToastWrapper>
    </>
  );
}

export default App;

// TODO:
// 1. save and load from config file
// 2. support for nx and ng
// 3. smarter way to get output path of an app
// 4. save log file to homedir/log/angular-deploy-gui.log //DONE 20221116
// 5. tauri app config (default size, icon, name)