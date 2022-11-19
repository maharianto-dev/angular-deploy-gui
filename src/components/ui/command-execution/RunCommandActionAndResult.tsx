import SuccessDeployToServerMessage from "./SuccessDeployToServerMessage";

export default function RunCommandActionAndResult(props) {
  const {
    selectedApp,
    onHandleRunButtonClick,
    isShowRunCommandResult,
    isRunCommandOk,
    onHandleShowRunCommandResult,
    selectedFePath,
    selectedServerPath,
    successfulAppList,
  } = props;

  return (
    <>
      {selectedApp.length > 0 && (
        <div className="mt-4">
          <button className="btn btn-primary" onClick={onHandleRunButtonClick}>
            Run
          </button>
          {!isShowRunCommandResult && (
            <p className="text-primary-content">
              The app might seem not responding when running angular command
            </p>
          )}
        </div>
      )}

      {isShowRunCommandResult && (
        <div
          className={`mt-4 card w-full max-w-screen-2xl ${
            isRunCommandOk ? "bg-success" : "bg-error"
          } text-primary-content`}
        >
          <div className="card-actions justify-end mr-2 mt-2">
            <button
              className="btn btn-square btn-sm"
              onClick={() => onHandleShowRunCommandResult(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="card-body pt-1">
            {isRunCommandOk && (
              <>
                <p>Angular app(s) build and deploy success</p>
                <p>Built angular apps in {selectedFePath}</p>
                <SuccessDeployToServerMessage
                  successfulAppList={successfulAppList}
                  selectedServerPath={selectedServerPath}
                ></SuccessDeployToServerMessage>
              </>
            )}
            {!isRunCommandOk && (
              <p>{`Error building and deploying angular app(s). Please check your log at ${'"<home dir>/angular-deploy-gui/log"'}`}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
