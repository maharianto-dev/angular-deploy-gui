import { ModalSelectionEnum } from "../../../enums/ModalSelection.enum";

export default function CheckConfigResultModalContent(props) {
  const { configResultMessage, onModalSelection } = props;

  function doModalSelection (selection) {
    onModalSelection(selection)
  }

  return (
    <>
      <p className="py-4 text-primary-content">{configResultMessage}</p>
      <div className="modal-action">
        <label
          htmlFor="my-global-modal"
          className="btn btn-primary"
          onClick={() => doModalSelection(ModalSelectionEnum.YES)}
        >
          Yes
        </label>
        <label
          htmlFor="my-global-modal"
          className="btn btn-primary"
          onClick={() => doModalSelection(ModalSelectionEnum.NO)}
        >
          No
        </label>
      </div>
    </>
  );
}
