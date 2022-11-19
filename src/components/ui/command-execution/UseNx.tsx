import { useEffect, useState } from "react";
import { AngularCommandCustomisationEnum } from "../../../enums/AngularCommandCustomisation.enum";
import SkipNxCache from "./SkipNxCache";

export default function UseNx(props) {
  const {
    onHandleUseNxChange,
    onHandleSkipNxCacheChange,
    useNxSelection,
    isRunningAngularCommand,
  } = props;
  const [useNx, setUseNx] = useState(useNxSelection);

  useEffect(() => {
    setUseNx(useNxSelection);
  }, [useNxSelection]);

  const handleUseNxSelectionChange = (event): void => {
    onHandleUseNxChange(event, AngularCommandCustomisationEnum.NX);
  };

  return (
    <>
      <div className="divider divide-primary-content"></div>

      <div className="card border-2 border-primary overflow-y-auto h-2/4 max-h-[75%] w-full max-w-screen-2xl bg-neutral shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-primary-content">Setup</h2>
          <div className="divider divide-primary-content"></div>
          <div className="form-control w-full max-w-screen-2xl">
            <label className="label cursor-pointer">
              <span className="label-text text-primary-content">
                Use nx (use nx instead of ng)
              </span>
              <input
                id="checkbox-use-nx"
                type="checkbox"
                className="checkbox checkbox-info"
                disabled={isRunningAngularCommand}
                onChange={handleUseNxSelectionChange}
              />
            </label>
          </div>
          <SkipNxCache
            onHandleSkipNxCacheChange={onHandleSkipNxCacheChange}
            isRunningAngularCommand={isRunningAngularCommand}
          ></SkipNxCache>
        </div>
      </div>
    </>
  );
}
