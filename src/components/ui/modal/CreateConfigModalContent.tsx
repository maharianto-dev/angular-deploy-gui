export default function CreateConfigModalContent() {
  return (
    <div className="form-control w-full max-w-xs">
      <label className="label">
        <span className="label-text">What is your name?</span>
        <span className="label-text-alt">Alt label</span>
      </label>
      <input
        type="text"
        placeholder="Type here"
        className="input input-bordered w-full max-w-xs"
      />
      <label className="label">
        <span className="label-text-alt">Alt label</span>
        <span className="label-text-alt">Alt label</span>
      </label>
    </div>
  );
}
