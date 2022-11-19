export default function SuccessDeployToServerMessage(props) {
  const { successfulAppList, selectedServerPath } = props;

  return (
    <>
      {(selectedServerPath == null || selectedServerPath === "") && (
        <p>
          Deployment to server directory not run because no Server Path is
          supplied
        </p>
      )}
      {selectedServerPath != null && selectedServerPath !== "" && (
        <p>{`${successfulAppList.join(
          ", "
        )} deployed successfully to ${selectedServerPath}`}</p>
      )}
    </>
  );
}
