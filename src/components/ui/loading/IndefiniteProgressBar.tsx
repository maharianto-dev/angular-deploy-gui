export default function IndefiniteProgressBar() {
  return (
    <>
      <div className="stats shadow mt-4 w-full max-w-screen-2xl">
        <div className="stat bg-neutral text-primary-content">
          <div className="stat-title">Running Angular Command</div>
          <div className="stat-value">
            <progress className="progress progress-warning w-full"></progress>
          </div>
          <div className="stat-desc">
            The app might seem not responding when running angular command
          </div>
        </div>
      </div>
    </>
  );
}
