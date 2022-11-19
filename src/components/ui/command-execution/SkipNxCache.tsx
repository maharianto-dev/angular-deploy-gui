import { AngularCommandCustomisationEnum } from "../../../enums/AngularCommandCustomisation.enum";

export default function SkipNxCache(props) {
  const { onHandleSkipNxCacheChange, isRunningAngularCommand } = props;

  const handleSkipNxCacheSelectionChange = (event): void => {
    onHandleSkipNxCacheChange(
      event,
      AngularCommandCustomisationEnum.SKIPNXCACHE
    );
  };

  return (
    <>
      <div className="divider divide-primary-content"></div>
      <div className="form-control w-full max-w-screen-2xl">
        <label className="label cursor-pointer">
          <span className="label-text text-primary-content">
            Skip nx cache (use --skip-nx-cache flag)
          </span>
          <input
            id="checkbox-skip-nx-cache"
            type="checkbox"
            className="checkbox checkbox-info"
            disabled={isRunningAngularCommand}
            onChange={handleSkipNxCacheSelectionChange}
          />
        </label>
      </div>
    </>
  );
}
