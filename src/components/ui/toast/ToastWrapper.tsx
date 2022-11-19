import { useEffect, useState } from "react";
import { ToastSeverityEnum } from "../../../enums/ToastSeverity.enum";
import { ToastListModel } from "../../../models/ToastList.model";

export default function ToastWrapper(props) {
  const { toastList } = props;

  const [list, setList] = useState(toastList);

  useEffect(() => {
    setList([...toastList]);
  }, [toastList]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (toastList.length && list.length) {
        deleteToast(toastList[0].id);
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [toastList, list]);

  const deleteToast = (id) => {
    const listItemIndex = list.findIndex((e) => e.id === id);
    const toastListItem = toastList.findIndex((e) => e.id === id);
    list.splice(listItemIndex, 1);
    toastList.splice(toastListItem, 1);
    setList([...list]);
  };

  return (
    <div className="toast toast-top toast-end">
      {(list as ToastListModel[]).map((item, ii) => {
        if (item.severity === ToastSeverityEnum.INFO) {
          return (
            <div key={ii} className="alert alert-info">
              <div>
                <span>{item.message}</span>
              </div>
            </div>
          );
        } else if (item.severity === ToastSeverityEnum.ERROR) {
          return (
            <div key={ii} className="alert alert-error">
              <div>
                <span>{item.message}</span>
              </div>
            </div>
          );
        } else if (item.severity === ToastSeverityEnum.SUCCESS) {
          return (
            <div key={ii} className="alert alert-success">
              <div>
                <span>{item.message}</span>
              </div>
            </div>
          );
        } else if (item.severity === ToastSeverityEnum.WARNING) {
          return (
            <div key={ii} className="alert alert-warning">
              <div>
                <span>{item.message}</span>
              </div>
            </div>
          );
        }
      })}
    </div>
  );
}
