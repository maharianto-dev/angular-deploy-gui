import { useState } from "react";

export default function PathSetup(props) {
  const { onHandlePathSetupChange, isRunningAngularCommand } = props;

  const [fePath, setFePath] = useState("");
  const [serverPath, setServerPath] = useState("");

  const handleInputPathChange = (event, type) => {
    if (type === "fepath") {
      setFePath(event.target.value);
    } else if (type === "serverpath") {
      setServerPath(event.target.value);
    }
    onHandlePathSetupChange(event.target.value, type);
  };

  return (
    <>
      <div className="form-control w-full max-w-screen-2xl">
        <label className="label">
          <span className="label-text text-primary-content">
            Frontend Path *
          </span>
          <span className="label-text-alt text-primary-content">
            Full path to your frontend directory (Mandatory)
          </span>
        </label>
        <input
          type="text"
          placeholder="Full path to your frontend directory (e.g: C:\my-frontend-code-path or /home/my-frontend-code-path)"
          className="input input-bordered w-full max-w-screen-2xl bg-neutral text-primary-content"
          onChange={(e) => handleInputPathChange(e, "fepath")}
          disabled={isRunningAngularCommand}
        />
      </div>
      <div className="form-control w-full max-w-screen-2xl">
        <label className="label">
          <span className="label-text text-primary-content">Server Path</span>
          <span className="label-text-alt text-primary-content">
            Full path to your server directory (leave empty to disable auto
            deployment to server directory)
          </span>
        </label>
        <input
          type="text"
          placeholder="Full path to your server directory (e.g: C:\nginx\html or /home/nginx/html)"
          className="input input-bordered w-full max-w-screen-2xl bg-neutral text-primary-content"
          onChange={(e) => handleInputPathChange(e, "serverpath")}
          disabled={isRunningAngularCommand}
        />
      </div>
    </>
  );
}
