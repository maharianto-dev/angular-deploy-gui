import React, { useCallback, useState } from "react";
import { ToastListModel } from "../../../models/ToastList.model";
import Footer from "../footer/Footer";
import Header from "../header/Header";
import CheckConfigResultModalContent from "../modal/CheckConfigResultModalContent";
import Modal from "../modal/Modal";
import ToastWrapper from "../toast/ToastWrapper";

export default function Layout(props) {
  const { children } = props;

  return (
    <>
      <div className="min-h-screen layout bg-neutral">
        <div className="sticky bottom-[100vh] ">
          <Header></Header>
        </div>
        <div className="p-4 grow">{children}</div>
        <div className="sticky top-[100vh]">
          <Footer></Footer>
        </div>
      </div>
    </>
  );
}
