import { useEffect, useState } from "react";

export default function Modal(props) {
  const { message } = props;

  return (
    <>
      <input type="checkbox" id="my-global-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box relative bg-neutral">
          {message}
        </div>
      </div>
    </>
  );
}
